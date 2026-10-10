import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { registerContractRoute } from "@cxsun/framework/http";
import type {} from "@cxsun/framework/api";
import type { FrappeSettings } from "../connection/index.js";
import { FrappeEnquirySyncService } from "./enquiry-sync.service.js";
import type { EnquirySyncContext } from "./enquiry-sync.types.js";

const importProgressSchema = z.object({
  scanned: z.number().int().nonnegative(),
  created: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  failures: z.array(z.object({ name: z.string(), message: z.string() }))
});
const importJobSchema = z.object({
  jobId: z.number().int().positive(),
  status: z.enum(["pending", "running", "completed", "failed", "cancelled"]),
  progress: importProgressSchema.nullable(),
  errorMessage: z.string().nullable()
});
export type EnquiryImportQueue = {
  start: (request: FastifyRequest, baseUrl: string) => Promise<z.infer<typeof importJobSchema>>;
  latest: (request: FastifyRequest) => Promise<z.infer<typeof importJobSchema> | null>;
  status: (request: FastifyRequest, jobId: number) => Promise<z.infer<typeof importJobSchema>>;
};

const remoteEnquirySchema = z.object({
  name: z.string(),
  title: z.string(),
  mobile: z.string().nullable(),
  date: z.string().nullable(),
  status: z.string().nullable(),
  priority: z.string().nullable(),
  modifiedAt: z.string().nullable(),
  localEnquiryId: z.number().int().positive().nullable()
});

export function registerFrappeEnquirySyncRoutes(
  app: FastifyInstance,
  context: (request: FastifyRequest) => Promise<EnquirySyncContext>,
  defaults: FrappeSettings,
  encryptionSecret: string,
  queue: EnquiryImportQueue
) {
  const service = async (request: FastifyRequest) =>
    new FrappeEnquirySyncService(await context(request), defaults, encryptionSecret);

  registerContractRoute(app, {
    method: "GET",
    url: "/frappe/enquiries/remote",
    schemas: {
      querystring: z.object({ page: z.coerce.number().int().positive().default(1) }),
      response: z.object({
        hasMore: z.boolean(),
        items: z.array(remoteEnquirySchema),
        page: z.number().int().positive(),
        pageSize: z.number().int().positive()
      })
    },
    handler: async ({ request, query }) => (await service(request)).preview(query.page)
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/frappe/enquiries/import",
    schemas: { body: z.object({}).strict(), response: importJobSchema },
    handler: async ({ request }) => {
      const sync = await service(request);
      return queue.start(request, await sync.connectionOrigin());
    }
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/frappe/enquiries/import",
    schemas: { response: importJobSchema.nullable() },
    handler: async ({ request }) => {
      await context(request);
      return queue.latest(request);
    }
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/frappe/enquiries/import/:jobId",
    schemas: {
      params: z.object({ jobId: z.coerce.number().int().positive() }),
      response: importJobSchema
    },
    handler: async ({ request, params }) => {
      await context(request);
      return queue.status(request, params.jobId);
    }
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/frappe/enquiries/pull",
    schemas: {
      body: z.object({ remoteName: z.string().trim().min(1).max(191) }),
      response: z.object({
        remoteName: z.string(),
        enquiryId: z.number().int().positive(),
        status: z.enum(["created", "updated"])
      })
    },
    handler: async ({ request, body }) => (await service(request)).pull(body.remoteName)
  });
}
