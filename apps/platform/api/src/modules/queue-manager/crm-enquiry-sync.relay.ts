import { sql, type Kysely } from "kysely";
import type { EnquiryDatabase } from "@cxsun/crm-api/enquiry-sync";
import type { FrappeDatabase } from "@cxsun/frappe-api";
import type { TenantDatabase } from "../../database/schema.js";
import { TenantRepository } from "../tenant/tenant.repository.js";
import { getTenantDatabase } from "../../database/tenant-database.js";
import type { QueueManagerService } from "./queue-manager.service.js";

export function startCrmEnquirySyncRelay(queue: QueueManagerService) {
  let running = false;
  const dispatch = async () => {
    if (running) return;
    running = true;
    try {
      const tenants = await new TenantRepository().list();
      for (const tenant of tenants) {
        if (tenant.status !== "active") continue;
        const database = getTenantDatabase(tenant) as unknown as Kysely<
          EnquiryDatabase & TenantDatabase & FrappeDatabase
        >;
        try {
          const enabled = await database
            .selectFrom("app_module_settings")
            .select("module_key")
            .where("module_key", "in", ["crm", "frappe"])
            .where("enabled", "=", true)
            .where("status", "=", "active")
            .execute();
          if (enabled.length !== 2) continue;
          const connection = await database
            .selectFrom("frappe_connection_settings")
            .select(["enabled", "verification_status"])
            .where("id", "=", 1)
            .executeTakeFirst();
          if (!connection?.enabled || connection.verification_status !== "verified") continue;
          const events = await database
            .selectFrom("crm_enquiry_sync_events")
            .select(["id", "actor_email", "correlation_id", "attempts"])
            .where("status", "in", ["pending", "retry"])
            .where(sql<boolean>`available_at <= UTC_TIMESTAMP()`)
            .orderBy("id")
            .limit(50)
            .execute();
          for (const event of events) {
            try {
              await queue.enqueue({
                actorEmail: event.actor_email,
                correlationId: event.correlation_id,
                idempotencyKey: `crm-enquiry-sync:${tenant.uuid}:${event.id}:${event.attempts}`,
                jobName: "crm.enquiry.frappe-sync",
                maxAttempts: 6,
                payload: { eventId: event.id, tenantDatabase: tenant.dbName },
                queueName: "crm",
                sourceModule: "crm.enquiry",
                tenantId: tenant.uuid
              });
            } catch (error) {
              console.warn("[crm-enquiry-sync] outbox dispatch deferred", {
                tenantId: tenant.uuid,
                eventId: event.id,
                message: error instanceof Error ? error.message : "Queue dispatch failed."
              });
            }
          }
        } catch (error) {
          // Tenants without the CRM sync migration are not eligible for outbox dispatch.
          if (tenant.enabledModuleKeys.includes("crm"))
            console.warn("[crm-enquiry-sync] tenant outbox scan deferred", {
              tenantId: tenant.uuid,
              message: error instanceof Error ? error.message : "Outbox scan failed."
            });
        }
      }
    } catch (error) {
      console.warn("[crm-enquiry-sync] relay pass deferred", error);
    } finally {
      running = false;
    }
  };
  const timer = setInterval(() => void dispatch(), 5000);
  timer.unref?.();
  void dispatch();
  return () => clearInterval(timer);
}
