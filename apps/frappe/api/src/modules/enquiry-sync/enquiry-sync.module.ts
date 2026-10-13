import type { FastifyInstance, FastifyRequest } from "fastify";
import { registerFrappeEnquirySyncRoutes } from "./enquiry-sync.routes.js";
import type { EnquirySyncContext } from "./enquiry-sync.types.js";

export const frappeEnquirySyncModule = {
  key: "frappe.enquiry-sync",
  register(
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
    registerFrappeEnquirySyncRoutes(app, context, backfill);
  }
};
