import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { registerContractRoute } from "@cxsun/framework/http";

export type CallLogImportRoutes = {
  start: (request: FastifyRequest) => Promise<{ jobId: number; status: string }>;
  status: (
    request: FastifyRequest,
    jobId: number
  ) => Promise<{
    jobId: number;
    status: string;
    progress: import("./call-log-sync.types.js").CallLogImportProgress | null;
    errorMessage: string | null;
  }>;
  retry: (request: FastifyRequest, eventId: number) => Promise<{ id: number; status: "pending" }>;
};

export function registerCallLogImportRoutes(app: FastifyInstance, callbacks: CallLogImportRoutes) {
  registerContractRoute(app, {
    method: "POST",
    url: "/frappe/call-logs/sync-queue/:eventId/retry",
    schemas: {
      params: z.object({ eventId: z.coerce.number().int().positive() }),
      body: z.object({}).strict(),
      response: z.object({ id: z.number().int().positive(), status: z.literal("pending") })
    },
    handler: async ({ request, params }) => callbacks.retry(request, params.eventId)
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/frappe/call-logs/backfill",
    schemas: {
      body: z.object({}).strict(),
      response: z.object({ jobId: z.number().int().positive(), status: z.string() })
    },
    handler: async ({ request }) => callbacks.start(request)
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/frappe/call-logs/backfill/:jobId",
    schemas: {
      params: z.object({ jobId: z.coerce.number().int().positive() }),
      response: z.object({
        jobId: z.number().int().positive(),
        status: z.string(),
        errorMessage: z.string().nullable(),
        progress: z
          .object({
            scanned: z.number().int(),
            created: z.number().int(),
            skipped: z.number().int(),
            failed: z.number().int(),
            failures: z.array(z.object({ name: z.string(), message: z.string() }))
          })
          .nullable()
      })
    },
    handler: async ({ request, params }) => callbacks.status(request, params.jobId)
  });
}
