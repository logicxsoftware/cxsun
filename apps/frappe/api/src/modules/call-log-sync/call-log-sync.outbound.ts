import { sql, type Kysely } from "kysely";
import { createHash } from "node:crypto";
import { AppError } from "@cxsun/framework/errors";
import { FrappeConnectionRepository, requestFrappe } from "../connection/index.js";
import type { FrappeDatabase } from "../connection/index.js";

type LocalCall = {
  id: number;
  uuid: string;
  remote_name: string | null;
  direction: string;
  from_number: string;
  to_number: string;
  call_status: string;
  duration_seconds: number;
  user_email: string | null;
  started_at: Date | string;
};
type Event = { id: number; call_log_id: number; status: string; attempts: number };

export async function processLocalCallLogSync(
  database: Kysely<FrappeDatabase>,
  eventId: number,
  secret: string
) {
  const eventResult =
    await sql<Event>`SELECT id, call_log_id, status, attempts FROM crm_call_log_sync_events WHERE id=${eventId}`.execute(
      database
    );
  const event = eventResult.rows[0];
  if (!event) throw AppError.notFound("Call log sync event was not found.");
  if (event.status === "synced") return { eventId, status: "synced" };
  const claim =
    await sql`UPDATE crm_call_log_sync_events SET status='processing', updated_at=UTC_TIMESTAMP()
    WHERE id=${eventId} AND status IN ('pending','retry')`.execute(database);
  if (Number(claim.numAffectedRows) !== 1)
    throw AppError.conflict("Call log sync is already in progress.");
  try {
    const credentials = await new FrappeConnectionRepository(database).credentials(secret);
    if (!credentials?.row.enabled || credentials.row.verification_status !== "verified")
      throw AppError.conflict("Verify the Frappe connection before syncing call logs.");
    const call = (
      await sql<LocalCall>`SELECT id, uuid, remote_name, direction, from_number, to_number,
      call_status, duration_seconds, user_email, started_at FROM crm_call_logs WHERE id=${event.call_log_id}`.execute(
        database
      )
    ).rows[0];
    if (!call) throw AppError.notFound("Local call log was not found.");
    let frappeUser: string | null = null;
    if (call.user_email) {
      const hash = createHash("sha256")
        .update(new URL(credentials.settings.baseUrl).origin.toLowerCase())
        .digest("hex");
      const mapping = await sql<{ frappe_user_id: string }>`SELECT mapping.frappe_user_id
        FROM frappe_user_mappings mapping INNER JOIN app_users user ON user.id=mapping.local_user_id
        WHERE LOWER(user.email)=LOWER(${call.user_email}) AND mapping.connection_hash=${hash}
        LIMIT 1`.execute(database);
      frappeUser = mapping.rows[0]?.frappe_user_id ?? null;
      if (!frappeUser)
        throw AppError.validation("Map the call user to a Frappe user before syncing.");
    }
    let remoteName = call.remote_name;
    const started = new Date(call.started_at).toISOString().slice(0, 19).replace("T", " ");
    if (!remoteName) {
      const query = new URLSearchParams({
        fields: JSON.stringify(["name", "from", "to", "start_time", "type", "status", "duration"]),
        filters: JSON.stringify([
          ["from", "=", call.from_number],
          ["to", "=", call.to_number],
          ["start_time", "=", started],
          ["type", "=", call.direction],
          ["status", "=", call.call_status],
          ["duration", "=", call.duration_seconds]
        ]),
        limit_page_length: "5"
      });
      const candidates = await requestFrappe<{
        data?: Array<{ name: string; start_time?: string }>;
      }>(`/api/resource/CRM%20Call%20Log?${query}`, "GET", credentials.settings);
      if (candidates.data?.length === 1) remoteName = candidates.data[0]!.name;
    }
    if (!remoteName) {
      const payload = {
        type: call.direction,
        from: call.from_number,
        to: call.to_number,
        status: call.call_status,
        duration: call.duration_seconds,
        start_time: started,
        ...(frappeUser
          ? { [call.direction === "Incoming" ? "receiver" : "caller"]: frappeUser }
          : {})
      };
      const response = await requestFrappe<{ data?: { name?: string } }>(
        "/api/resource/CRM%20Call%20Log",
        "POST",
        credentials.settings,
        payload
      );
      remoteName = response.data?.name ?? null;
      if (!remoteName) throw AppError.conflict("Frappe did not return the call log ID.");
    }
    await database.transaction().execute(async (transaction) => {
      await sql`UPDATE crm_call_logs SET remote_name=${remoteName} WHERE id=${call.id}`.execute(
        transaction
      );
      await sql`UPDATE crm_call_log_sync_events SET status='synced', remote_name=${remoteName},
        last_error=NULL, updated_at=UTC_TIMESTAMP() WHERE id=${eventId}`.execute(transaction);
    });
    return { eventId, status: "synced", remoteName };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Call log sync failed.";
    const attempts = event.attempts + 1;
    await sql`UPDATE crm_call_log_sync_events SET status=${attempts >= 6 ? "failed" : "retry"},
      attempts=${attempts}, last_error=${message},
      available_at=DATE_ADD(UTC_TIMESTAMP(), INTERVAL ${Math.min(60, 2 ** attempts)} SECOND),
      updated_at=UTC_TIMESTAMP() WHERE id=${eventId}`.execute(database);
    throw error;
  }
}
