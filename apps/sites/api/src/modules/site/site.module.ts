import type { FastifyInstance, FastifyRequest } from "fastify";
import { registerSiteRoutes } from "./site.routes.js";
import type { SitesRequestContext } from "./site.types.js";

export const siteModule = {
  key: "sites.site",
  register(
    app: FastifyInstance,
    resolveContext: (request: FastifyRequest) => SitesRequestContext | Promise<SitesRequestContext>
  ) {
    registerSiteRoutes(app, resolveContext);
  }
};
