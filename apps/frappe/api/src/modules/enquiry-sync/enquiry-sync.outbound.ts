import { AppError } from "@cxsun/framework/errors";
import { EnquiryRepository, EnquirySyncRepository } from "@cxsun/crm-api/enquiry-sync";
import type { Kysely } from "kysely";
import { FrappeConnectionRepository } from "../connection/connection.repository.js";
import { requestFrappe } from "../connection/connection.service.js";
import type { FrappeDatabase } from "../connection/connection.types.js";

type SyncDatabase = FrappeDatabase & { app_users: { id: number; email: string; status: string } };

export async function processLocalEnquirySync(
  database: Kysely<FrappeDatabase>,
  eventId: number,
  encryptionSecret: string,
  employeeCodeForEmail: (email: string, baseUrl: string) => Promise<string | null>
) {
  const sync = new EnquirySyncRepository(database);
  const event = await sync.getEvent(eventId);
  if (!event) throw AppError.notFound("Local enquiry sync event was not found.");
  if (event.status === "synced")
    return { eventId, status: "synced", remoteName: event.remote_name };
  await sync.markProcessing(event.id);
  try {
    const connections = new FrappeConnectionRepository(database);
    const credentials = await connections.credentials(encryptionSecret);
    if (!credentials?.row.enabled || credentials.row.verification_status !== "verified")
      throw AppError.conflict("Enable and verify the Frappe connection before syncing enquiries.");
    const settings = credentials.settings;
    const local = await new EnquiryRepository(database).get(event.enquiry_id);
    if (!local) throw AppError.notFound("The local enquiry for this sync event no longer exists.");

    const link = await connections.get(local.id);
    let remoteName = link?.remote_name ?? null;
    if (event.event_type === "enquiry-upsert") {
      const problems: string[] = [];
      if (!local.capturedPhone || !/^\d{10}$/u.test(local.capturedPhone))
        problems.push("Mobile number must contain exactly 10 digits.");
      if (!local.description?.trim() && !local.title.trim())
        problems.push("Enquiry message is required.");
      const creator = remoteName
        ? null
        : await employeeCodeForEmail(local.createdBy, settings.baseUrl);
      if (!remoteName && !creator) problems.push("The creator has no Frappe Employee mapping.");
      let assignee: string | null = null;
      if (local.assignedUserId) {
        const user = await (database as unknown as Kysely<SyncDatabase>)
          .selectFrom("app_users")
          .select("email")
          .where("id", "=", local.assignedUserId)
          .executeTakeFirst();
        assignee = user ? await employeeCodeForEmail(user.email, settings.baseUrl) : null;
        if (!assignee) problems.push("The assigned user has no Frappe Employee mapping.");
      }
      if (problems.length) {
        await sync.markFailed(event.id, event.attempts, problems.join(" "), problems);
        throw AppError.validation(problems.join(" "));
      }
      const createMarker = `<!-- cxsun-sync:${event.uuid} -->`;
      if (!remoteName) {
        const candidates = await requestFrappe<{ data?: Array<{ name: string }> }>(
          `/api/resource/Enquiry?fields=${encodeURIComponent(JSON.stringify(["name"]))}&filters=${encodeURIComponent(
            JSON.stringify([
              ["mobile", "=", local.capturedPhone],
              ["date", "=", local.enquiredAt.slice(0, 10)],
              ["title", "=", local.title]
            ])
          )}&limit_page_length=20&order_by=modified desc`,
          "GET",
          settings
        );
        for (const candidate of candidates.data ?? []) {
          const detail = await requestFrappe<{
            data?: { name?: string; enquiry_messages?: Array<{ comment?: string }> };
          }>(`/api/resource/Enquiry/${encodeURIComponent(candidate.name)}`, "GET", settings);
          if (
            detail.data?.enquiry_messages?.some((message) =>
              message.comment?.includes(createMarker)
            )
          ) {
            remoteName = detail.data.name ?? candidate.name;
            await connections.save(local.id, remoteName);
            break;
          }
        }
      }
      const payload = {
        title: local.title,
        enquiry_details: local.description || local.title,
        mobile: local.capturedPhone,
        date: local.enquiredAt.slice(0, 10),
        due_date: local.dueDate,
        group: local.listIn,
        ...(creator ? { user_employee: creator } : {}),
        assigned_to_employee: assignee,
        priority: local.priorityName,
        status: local.statusName,
        status_details: local.closedReason,
        ...(remoteName
          ? {}
          : {
              enquiry_messages: [
                {
                  comment: `${escapeHtml(local.description || local.title)}${createMarker}`,
                  mode: "Comment"
                }
              ]
            })
      };
      if (remoteName) {
        await requestFrappe(
          `/api/resource/Enquiry/${encodeURIComponent(remoteName)}`,
          "PUT",
          settings,
          payload
        );
      } else {
        const response = await requestFrappe<{ data?: { name?: string } }>(
          "/api/resource/Enquiry",
          "POST",
          settings,
          payload
        );
        remoteName = response.data?.name ?? null;
        if (!remoteName) throw AppError.conflict("Frappe did not return the created enquiry ID.");
        await connections.save(local.id, remoteName);
      }
    } else if (event.event_type === "comment-add") {
      if (!remoteName) throw AppError.conflict("Sync the enquiry before posting its comments.");
      if (event.entity_id === null)
        throw AppError.validation("The comment sync event has no comment ID.");
      const comment = await database
        .selectFrom("crm_enquiry_comments")
        .selectAll()
        .where("id", "=", event.entity_id)
        .executeTakeFirst();
      if (!comment) throw AppError.notFound("The local comment for this sync event was not found.");
      const marker = `<!-- cxsun-sync:${event.uuid} -->`;
      const response = await requestFrappe<{
        data?: {
          enquiry_messages?: Array<{
            name?: string;
            comment?: string;
            mode?: string;
            parent_message?: string;
          }>;
        };
      }>(`/api/resource/Enquiry/${encodeURIComponent(remoteName)}`, "GET", settings);
      const messages = response.data?.enquiry_messages ?? [];
      let remoteMessage = messages.find((message) => message.comment?.includes(marker));
      if (!remoteMessage) {
        const body = comment.body_format === "plain" ? escapeHtml(comment.body) : comment.body;
        let parentMessage: string | null = null;
        if (comment.parent_id) {
          const parentEvent = await database
            .selectFrom("crm_enquiry_sync_events")
            .select("remote_name")
            .where("event_type", "=", "comment-add")
            .where("entity_id", "=", comment.parent_id)
            .where("status", "=", "synced")
            .executeTakeFirst();
          parentMessage = parentEvent?.remote_name ?? null;
          if (!parentMessage) throw AppError.conflict("Sync the parent comment before its reply.");
        }
        await requestFrappe(
          `/api/resource/Enquiry/${encodeURIComponent(remoteName)}`,
          "PUT",
          settings,
          {
            enquiry_messages: [
              ...messages.map((message) => ({
                ...(message.name ? { name: message.name } : {}),
                comment: message.comment || "",
                mode: message.mode || "Comment",
                ...(message.parent_message ? { parent_message: message.parent_message } : {})
              })),
              {
                comment: `${body}${marker}`,
                mode: parentMessage ? "Reply" : "Comment",
                ...(parentMessage ? { parent_message: parentMessage } : {})
              }
            ]
          }
        );
        const refreshed = await requestFrappe<{
          data?: { enquiry_messages?: Array<{ name?: string; comment?: string }> };
        }>(`/api/resource/Enquiry/${encodeURIComponent(remoteName)}`, "GET", settings);
        remoteMessage = refreshed.data?.enquiry_messages?.find((message) =>
          message.comment?.includes(marker)
        );
      }
      if (!remoteMessage?.name)
        throw AppError.conflict("Frappe did not return the synced comment ID.");
      await sync.markSynced(event.id, remoteMessage.name);
      return { eventId, status: "synced", remoteName, remoteCommentName: remoteMessage.name };
    } else if (event.event_type === "job-upsert") {
      if (!remoteName || event.entity_id === null)
        throw AppError.conflict("Sync the enquiry before syncing its job.");
      const job = await database
        .selectFrom("crm_enquiry_jobs")
        .selectAll()
        .where("id", "=", event.entity_id)
        .where("enquiry_id", "=", local.id)
        .executeTakeFirst();
      if (!job) throw AppError.notFound("The local job for this sync event was not found.");
      let employee = job.employee;
      if (job.employee_user_id) {
        const user = await (database as unknown as Kysely<SyncDatabase>)
          .selectFrom("app_users")
          .select("email")
          .where("id", "=", job.employee_user_id)
          .executeTakeFirst();
        employee = user ? ((await employeeCodeForEmail(user.email, settings.baseUrl)) ?? "") : "";
      }
      if (!employee)
        throw AppError.validation("Map the job employee to a Frappe Employee before syncing.");
      const hours = Math.max(0, Number(job.duration_seconds) / 3600);
      const payload = {
        enquiry: remoteName,
        employee,
        start_time: frappeTime(job.start_at),
        stop_time: job.stop_at ? frappeTime(job.stop_at) : null,
        employee_cost_per_hour: Number(job.rate_per_hour),
        status:
          job.status === "running"
            ? "Running"
            : job.status === "cancelled"
              ? "Cancelled"
              : "Completed",
        hours,
        total_cost: Number(job.total_cost)
      };
      const prior =
        event.remote_name ??
        (await latestSyncedChild(database, event.enquiry_id, event.event_type, event.entity_id));
      const response = await requestFrappe<{ data?: { name?: string } }>(
        prior
          ? `/api/resource/Job Execution/${encodeURIComponent(prior)}`
          : "/api/resource/Job Execution",
        prior ? "PUT" : "POST",
        settings,
        payload
      );
      const name = response.data?.name ?? prior;
      if (!name) throw AppError.conflict("Frappe did not return the synced job ID.");
      await sync.markSynced(event.id, name);
      return { eventId, status: "synced", remoteName, remoteJobName: name };
    } else if (event.event_type === "estimate-upsert") {
      if (!remoteName || event.entity_id === null)
        throw AppError.conflict("Sync the enquiry before syncing its estimate.");
      const estimate = await database
        .selectFrom("crm_enquiry_estimates")
        .selectAll()
        .where("id", "=", event.entity_id)
        .where("enquiry_id", "=", local.id)
        .executeTakeFirst();
      if (!estimate)
        throw AppError.notFound("The local estimate for this sync event was not found.");
      const suppliers = await requestFrappe<{
        data?: Array<{ name: string; supplier_name?: string }>;
      }>(
        `/api/resource/Supplier?fields=${encodeURIComponent(JSON.stringify(["name", "supplier_name"]))}&filters=${encodeURIComponent(JSON.stringify([["supplier_name", "=", estimate.supplier_name]]))}&limit_page_length=2`,
        "GET",
        settings
      );
      const supplier = suppliers.data?.[0]?.name;
      if (!supplier)
        throw AppError.validation(`Frappe Supplier “${estimate.supplier_name}” was not found.`);
      const payload = {
        enquiry: remoteName,
        date: dateOnly(estimate.estimate_date),
        item_name: estimate.item_name,
        supplier,
        price: Number(estimate.price)
      };
      const prior =
        event.remote_name ??
        (await latestSyncedChild(database, event.enquiry_id, event.event_type, event.entity_id));
      const response = await requestFrappe<{ data?: { name?: string } }>(
        prior ? `/api/resource/Estimate/${encodeURIComponent(prior)}` : "/api/resource/Estimate",
        prior ? "PUT" : "POST",
        settings,
        payload
      );
      const name = response.data?.name ?? prior;
      if (!name) throw AppError.conflict("Frappe did not return the synced estimate ID.");
      await sync.markSynced(event.id, name);
      return { eventId, status: "synced", remoteName, remoteEstimateName: name };
    }
    await sync.markSynced(event.id, remoteName ?? "");
    return { eventId, status: "synced", remoteName };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Frappe enquiry sync failed.";
    const latest = await sync.getEvent(eventId);
    if (latest?.status === "processing") {
      const validationErrors =
        error instanceof AppError && error.code === "VALIDATION_ERROR" ? [message] : [];
      await sync.markFailed(eventId, latest.attempts, message, validationErrors);
    }
    throw error;
  }
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/gu,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ??
      character
  );
}

async function latestSyncedChild(
  database: Kysely<FrappeDatabase>,
  enquiryId: number,
  eventType: "job-upsert" | "estimate-upsert",
  entityId: number
) {
  const previous = await database
    .selectFrom("crm_enquiry_sync_events")
    .select("remote_name")
    .where("enquiry_id", "=", enquiryId)
    .where("event_type", "=", eventType)
    .where("entity_id", "=", entityId)
    .where("status", "=", "synced")
    .orderBy("id", "desc")
    .executeTakeFirst();
  return previous?.remote_name ?? null;
}

function dateOnly(value: string | Date) {
  return value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10);
}

function frappeTime(value: string | Date) {
  const date =
    value instanceof Date
      ? value
      : new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(date);
}
