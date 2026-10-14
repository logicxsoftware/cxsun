import type { FastifyInstance, FastifyRequest } from "fastify";
import { registerDesignationRoutes } from "./designation.routes.js";
import type { DesignationContext } from "./designation.types.js";

export const designationModule = {
  key: "hrms.designation",
  register: (
    app: FastifyInstance,
    context: (request: FastifyRequest) => Promise<DesignationContext>
  ) => registerDesignationRoutes(app, context)
};
