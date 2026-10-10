import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { registerContractRoute } from "@cxsun/framework/http";
import { StorefrontService } from "./storefront.service.js";
import { StorefrontRepository } from "./storefront.repository.js";
import type { StorefrontAdminContext, StorefrontPublicContext } from "./storefront.types.js";
const uuid = z.string().regex(/^[0-9a-f]{8}$/);
const url = z.union([
  z.literal(""),
  z
    .url()
    .max(2048)
    .refine((value) => /^https?:\/\//.test(value), "Use an HTTP or HTTPS URL.")
]);
const fields = {
  brandName: z.string().trim().min(1).max(191),
  tagline: z.string().trim().max(191),
  location: z.string().trim().max(191),
  phone: z.string().trim().max(32),
  email: z.union([z.literal(""), z.email().max(191)]),
  logoUrl: url,
  industryKey: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  industryName: z.string().trim().min(1).max(191),
  enabled: z.boolean()
};
const offer = z.object({
  uuid,
  vendorUuid: uuid,
  vendorName: z.string(),
  price: z.number().nullable(),
  compareAtPrice: z.number().nullable(),
  currency: z.string(),
  availability: z.literal("confirm_with_seller")
});
const product = z.object({
  uuid,
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  sku: z.string(),
  imageUrl: z.string(),
  imageAlt: z.string(),
  featured: z.boolean(),
  categoryName: z.string().nullable(),
  seoTitle: z.string(),
  seoDescription: z.string(),
  industryKey: z.string(),
  offers: z.array(offer)
});
const status = z.enum(["received", "reviewing", "closed"]);
const quoteItem = z.object({
  catalogUuid: uuid,
  vendorUuid: uuid,
  title: z.string(),
  quantity: z.number().int(),
  price: z.number().nullable(),
  currency: z.string()
});
export function registerStorefrontRoutes(
  app: FastifyInstance,
  publicContext: (request: FastifyRequest) => Promise<StorefrontPublicContext>,
  adminContext: (request: FastifyRequest) => Promise<StorefrontAdminContext>
) {
  registerContractRoute(app, {
    method: "GET",
    url: "/public/ecommerce/storefront",
    schemas: {
      response: z.object({
        store: z.object({
          brandName: z.string(),
          tagline: z.string(),
          location: z.string(),
          phone: z.string(),
          email: z.string(),
          logoUrl: z.string()
        }),
        industries: z.array(z.object({ key: z.string(), name: z.string() })),
        vendors: z.array(z.object({ uuid, name: z.string(), location: z.string() })),
        categories: z.array(z.object({ name: z.string(), count: z.number().int() })),
        products: z.array(product)
      })
    },
    handler: async ({ request, reply }) => {
      reply.header("Cache-Control", "no-store");
      return new StorefrontService(await publicContext(request)).bootstrap();
    }
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/public/ecommerce/quotes",
    bodyLimit: 32000,
    schemas: {
      body: z
        .object({
          requestKey: z.string().regex(/^[a-f0-9]{32}$/),
          name: z.string().trim().min(1).max(191),
          email: z.email().max(191),
          phone: z
            .string()
            .trim()
            .regex(/^[+\d][\d\s()-]{6,31}$/),
          notes: z.string().trim().max(2000),
          consent: z.literal(true),
          items: z
            .array(
              z
                .object({
                  catalogUuid: uuid,
                  vendorUuid: uuid,
                  quantity: z.number().int().min(1).max(99)
                })
                .strict()
            )
            .min(1)
            .max(50)
        })
        .strict(),
      response: z.object({
        reference: uuid,
        status: z.literal("received"),
        itemCount: z.number().int()
      })
    },
    handler: async ({ request, body, reply }) => {
      reply.header("Cache-Control", "no-store");
      return new StorefrontService(await publicContext(request)).quote(body);
    }
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/ecommerce/storefront/config",
    schemas: {
      response: z.object({
        config: z.object({ ...fields, uuid }),
        permissions: z.object({ manage: z.boolean(), quotes: z.boolean() })
      })
    },
    handler: async ({ request, reply }) => {
      reply.header("Cache-Control", "no-store");
      const context = await adminContext(request);
      await context.authorize("ecommerce.storefront.view");
      const can = async (
        permission: "ecommerce.storefront.manage" | "ecommerce.storefront.quotes"
      ) => {
        try {
          await context.authorize(permission);
          return true;
        } catch (error) {
          if (
            error &&
            typeof error === "object" &&
            "statusCode" in error &&
            error.statusCode === 403
          )
            return false;
          throw error;
        }
      };
      return {
        config: await new StorefrontRepository(context.database).config(),
        permissions: {
          manage: await can("ecommerce.storefront.manage"),
          quotes: await can("ecommerce.storefront.quotes")
        }
      };
    }
  });
  registerContractRoute(app, {
    method: "PUT",
    url: "/ecommerce/storefront/config",
    schemas: { body: z.object(fields).strict(), response: z.object({ ...fields, uuid }) },
    handler: async ({ request, body }) => {
      const context = await adminContext(request);
      await context.authorize("ecommerce.storefront.manage");
      return new StorefrontRepository(context.database).saveConfig(body, context.actorEmail);
    }
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/ecommerce/storefront/quotes",
    schemas: {
      response: z.array(
        z.object({
          uuid,
          name: z.string(),
          email: z.string(),
          phone: z.string(),
          notes: z.string(),
          status,
          createdAt: z.string(),
          items: z.array(quoteItem)
        })
      )
    },
    handler: async ({ request, reply }) => {
      reply.header("Cache-Control", "no-store");
      const context = await adminContext(request);
      await context.authorize("ecommerce.storefront.quotes");
      return new StorefrontRepository(context.database).quotes();
    }
  });
  registerContractRoute(app, {
    method: "PUT",
    url: "/ecommerce/storefront/quotes/:uuid/status",
    schemas: {
      params: z.object({ uuid }),
      body: z.object({ status }).strict(),
      response: z.object({ uuid, status })
    },
    handler: async ({ request, params, body }) => {
      const context = await adminContext(request);
      await context.authorize("ecommerce.storefront.quotes");
      return new StorefrontRepository(context.database).updateQuote(
        params.uuid,
        body.status,
        context.actorEmail
      );
    }
  });
}
