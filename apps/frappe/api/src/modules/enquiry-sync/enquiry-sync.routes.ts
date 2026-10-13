import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { EnquirySyncRepository } from "@cxsun/crm-api/enquiry-sync";
import { registerContractRoute } from "@cxsun/framework/http";
import type {} from "@cxsun/framework/api";
import type { EnquirySyncContext } from "./enquiry-sync.types.js";

const queueEventSchema = z.object({
  id: z.number().int().positive(),
  enquiryId: z.number().int().positive(),
  enquiryNo: z.number().int().positive(),
  title: z.string(),
  eventType: z.enum(["enquiry-upsert", "comment-add", "job-upsert", "estimate-upsert"]),
  status: z.enum(["pending", "processing", "retry", "failed", "synced"]),
  attempts: z.number().int().nonnegative(),
  remoteName: z.string().nullable(),
  lastError: z.string().nullable(),
  createdAt: z.string()
});

export function registerFrappeEnquirySyncRoutes(
  app: FastifyInstance,
  context: (request: FastifyRequest) => Promise<Pick<EnquirySyncContext, "database">>,
  backfill: {
    start: (request: FastifyRequest) => Promise<{ jobId: number; status: string }>;
    status: (
      request: FastifyRequest,
      jobId: number
    ) => Promise<{
      jobId: number;
      status: string;
      progress: import("./enquiry-sync.types.js").ImportProgress | null;
      errorMessage: string | null;
    }>;
  }
) {
  registerContractRoute(app, {
    method: "GET",
    url: "/frappe/enquiries/sync-queue",
    schemas: {
      querystring: z.object({
        status: z
          .enum(["all", "pending", "processing", "retry", "failed", "synced"])
          .default("all"),
        page: z.coerce.number().int().positive().default(1),
        pageSize: z.coerce.number().int().min(1).max(100).default(25)
      }),
      response: z.object({
        items: z.array(queueEventSchema),
        page: z.number().int().positive(),
        pageSize: z.number().int().positive(),
        total: z.number().int().nonnegative()
      })
    },
    handler: async ({ query, request }) =>
      new EnquirySyncRepository((await context(request)).database).listQueue(
        query.status,
        query.page,
        query.pageSize
      )
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/frappe/enquiries/sync-queue/:eventId/retry",
    schemas: {
      params: z.object({ eventId: z.coerce.number().int().positive() }),
      body: z.object({}).strict(),
      response: z.object({ id: z.number().int().positive(), status: z.literal("pending") })
    },
    handler: async ({ params, request }) =>
      new EnquirySyncRepository((await context(request)).database).retry(params.eventId)
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/frappe/enquiries/backfill",
    schemas: {
      body: z.object({}).strict(),
      response: z.object({ jobId: z.number().int().positive(), status: z.string() })
    },
    handler: async ({ request }) => {
      await context(request);
      return backfill.start(request);
    }
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/frappe/enquiries/backfill/:jobId",
    schemas: {
      params: z.object({ jobId: z.coerce.number().int().positive() }),
      response: z.object({
        jobId: z.number().int().positive(),
        status: z.string(),
        progress: z
          .object({
            scanned: z.number().int(),
            created: z.number().int(),
            skipped: z.number().int(),
            failed: z.number().int(),
            failures: z.array(z.object({ name: z.string(), message: z.string() }))
          })
          .nullable(),
        errorMessage: z.string().nullable()
      })
    },
    handler: async ({ params, request }) => {
      await context(request);
      return backfill.status(request, params.jobId);
    }
  });
}
