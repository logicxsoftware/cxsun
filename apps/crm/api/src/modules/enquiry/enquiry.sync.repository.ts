import { randomUUID } from "node:crypto";
import { sql, type Kysely, type Transaction } from "kysely";
import type { EnquiryDatabase, EnquirySyncEventRow } from "./enquiry.types.js";

export type EnquirySyncEventType = EnquirySyncEventRow["event_type"];
export type EnquirySyncValidation = "valid" | "invalid" | "warning";

export class EnquirySyncRepository {
  constructor(private readonly database: Kysely<EnquiryDatabase>) {}

  async enqueue(
    input: {
      actorEmail: string;
      correlationId: string;
      entityId?: number | null;
      enquiryId: number;
      eventType: EnquirySyncEventType;
    },
    transaction?: Transaction<EnquiryDatabase>
  ) {
    const database = transaction ?? this.database;
    const idempotencyKey = [
      input.eventType,
      input.enquiryId,
      input.entityId ?? "record",
      randomUUID()
    ]
      .join(":")
      .slice(0, 191);
    const result = await database
      .insertInto("crm_enquiry_sync_events")
      .values({
        enquiry_id: input.enquiryId,
        event_type: input.eventType,
        entity_id: input.entityId ?? null,
        actor_email: input.actorEmail,
        correlation_id: input.correlationId,
        idempotency_key: idempotencyKey,
        status: "pending",
        available_at: sql`UTC_TIMESTAMP()`,
        remote_name: null,
        last_error: null,
        created_at: sql`UTC_TIMESTAMP()`,
        updated_at: sql`UTC_TIMESTAMP()`
      })
      .executeTakeFirstOrThrow();
    const eventId = Number(result.insertId);
    await database
      .insertInto("crm_enquiry_sync_validation")
      .values({
        event_id: eventId,
        validation_status: "valid",
        errors_json: JSON.stringify([]),
        checked_at: sql`UTC_TIMESTAMP()`
      })
      .execute();
    return eventId;
  }

  async listForEnquiry(enquiryId: number) {
    const events = await this.database
      .selectFrom("crm_enquiry_sync_events")
      .selectAll()
      .where("enquiry_id", "=", enquiryId)
      .orderBy("id", "desc")
      .limit(50)
      .execute();
    if (!events.length) return [];
    const validations = await this.database
      .selectFrom("crm_enquiry_sync_validation")
      .selectAll()
      .where(
        "event_id",
        "in",
        events.map((event) => event.id)
      )
      .orderBy("id", "desc")
      .execute();
    const latestValidation = new Map<number, (typeof validations)[number]>();
    for (const validation of validations) {
      if (!latestValidation.has(validation.event_id))
        latestValidation.set(validation.event_id, validation);
    }
    return events.map((event) => {
      const validation = latestValidation.get(event.id);
      return {
        id: String(event.id),
        eventType: event.event_type,
        status: event.status,
        attempts: event.attempts,
        remoteName: event.remote_name,
        lastError: event.last_error,
        createdAt: toIso(event.created_at),
        validation: validation
          ? {
              status: validation.validation_status,
              errors: parseErrors(validation.errors_json),
              checkedAt: toIso(validation.checked_at)
            }
          : null
      };
    });
  }

  latestEvent(enquiryId: number, actorEmail: string) {
    return this.database
      .selectFrom("crm_enquiry_sync_events")
      .selectAll()
      .where("enquiry_id", "=", enquiryId)
      .where("actor_email", "=", actorEmail)
      .orderBy("id", "desc")
      .executeTakeFirst();
  }

  getEvent(id: number) {
    return this.database
      .selectFrom("crm_enquiry_sync_events")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  async markProcessing(id: number) {
    await this.database
      .updateTable("crm_enquiry_sync_events")
      .set({ status: "processing", updated_at: sql`UTC_TIMESTAMP()` })
      .where("id", "=", id)
      .where("status", "in", ["pending", "retry"])
      .execute();
  }

  async markSynced(id: number, remoteName: string) {
    await this.database
      .updateTable("crm_enquiry_sync_events")
      .set({
        status: "synced",
        remote_name: remoteName,
        last_error: null,
        updated_at: sql`UTC_TIMESTAMP()`
      })
      .where("id", "=", id)
      .execute();
    await this.recordValidation(id, "valid", []);
  }

  async markFailed(id: number, attempt: number, message: string, validationErrors: string[] = []) {
    const retryable = !validationErrors.length && attempt < 5;
    const delay = Math.min(1800, 10 * 2 ** Math.min(attempt, 7));
    await this.database
      .updateTable("crm_enquiry_sync_events")
      .set({
        status: retryable ? "retry" : "failed",
        attempts: attempt + 1,
        last_error: message.slice(0, 4000),
        available_at: retryable
          ? sql`DATE_ADD(UTC_TIMESTAMP(), INTERVAL ${delay} SECOND)`
          : sql`UTC_TIMESTAMP()`,
        updated_at: sql`UTC_TIMESTAMP()`
      })
      .where("id", "=", id)
      .execute();
    await this.recordValidation(
      id,
      validationErrors.length ? "invalid" : "warning",
      validationErrors
    );
  }

  private async recordValidation(eventId: number, status: EnquirySyncValidation, errors: string[]) {
    await this.database
      .insertInto("crm_enquiry_sync_validation")
      .values({
        event_id: eventId,
        validation_status: status,
        errors_json: JSON.stringify(errors),
        checked_at: sql`UTC_TIMESTAMP()`
      })
      .execute();
  }
}

function toIso(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  const text = String(value).replace(" ", "T");
  return new Date(text.endsWith("Z") ? text : `${text}Z`).toISOString();
}

function parseErrors(value: unknown) {
  try {
    const parsed: unknown = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return ["Stored validation details could not be read."];
  }
}
