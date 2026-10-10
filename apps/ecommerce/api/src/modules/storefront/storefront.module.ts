import type { FastifyInstance, FastifyRequest } from "fastify";
import { defineModule } from "@cxsun/framework/modules";
import { registerStorefrontRoutes } from "./storefront.routes.js";
import type { StorefrontAdminContext, StorefrontPublicContext } from "./storefront.types.js";
// Read-only public merchandising, singleton settings, and append-only quote intake.
// Products are managed in Catalog; payment/order lifecycles and vendor onboarding are separate future modules.
export const ecommerceStorefrontModule = defineModule<{
  app: FastifyInstance;
  publicContext: (request: FastifyRequest) => Promise<StorefrontPublicContext>;
  adminContext: (request: FastifyRequest) => Promise<StorefrontAdminContext>;
}>({
  key: "ecommerce.storefront",
  label: "Storefront",
  register: ({ app, publicContext, adminContext }) =>
    registerStorefrontRoutes(app, publicContext, adminContext)
});
