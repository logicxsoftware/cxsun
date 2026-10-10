import type { FastifyInstance, FastifyRequest } from "fastify";
import { defineModule } from "@cxsun/framework/modules";
import { registerCatalogRoutes } from "./catalog.routes.js";
import type { CatalogContext } from "./catalog.types.js";
export const ecommerceCatalogModule = defineModule<{
  app: FastifyInstance;
  context: (request: FastifyRequest) => Promise<CatalogContext>;
}>({
  key: "ecommerce.catalog",
  label: "Ecommerce Catalog",
  register: ({ app, context }) => registerCatalogRoutes(app, context)
});
