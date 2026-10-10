import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { registerContractRoute } from "@cxsun/framework/http";
import { CatalogService } from "./catalog.service.js";
import type { CatalogContext, CatalogPermission } from "./catalog.types.js";
const product = z.object({
  id: z.number().int(),
  uuid: z.string().length(8),
  name: z.string(),
  categoryId: z.number().int().nullable(),
  categoryName: z.string().nullable(),
  unitName: z.string().nullable(),
  taxRate: z.number().nullable(),
  active: z.boolean()
});
const category = z.object({ id: z.number().int(), name: z.string(), active: z.boolean() });
const fields = {
  productId: z.number().int().positive(),
  title: z.string().trim().min(1).max(191),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(191)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens."),
  description: z.string().trim().max(20000),
  sku: z.string().trim().min(1).max(100),
  price: z.number().min(0).max(9999999999999.99).multipleOf(0.01),
  compareAtPrice: z.number().min(0).max(9999999999999.99).multipleOf(0.01).nullable(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  imageUrl: z.union([
    z.literal(""),
    z
      .url()
      .max(2048)
      .refine((value) => /^https?:\/\//.test(value), "Use an HTTP or HTTPS image URL.")
  ]),
  imageAlt: z.string().trim().max(191),
  seoTitle: z.string().trim().max(191),
  seoDescription: z.string().trim().max(320),
  published: z.boolean(),
  featured: z.boolean()
};
const input = z
  .object(fields)
  .strict()
  .refine((value) => value.compareAtPrice === null || value.compareAtPrice >= value.price, {
    path: ["compareAtPrice"],
    message: "Compare-at price must be at least the selling price."
  })
  .refine((value) => !value.imageUrl || !!value.imageAlt, {
    path: ["imageAlt"],
    message: "Image alternative text is required when an image is supplied."
  });
const record = z.object({
  ...fields,
  id: z.number().int(),
  uuid: z.string().regex(/^[a-f0-9]{8}$/),
  status: z.enum(["active", "inactive"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  product,
  available: z.boolean()
});
const params = z.object({ uuid: z.string().regex(/^[a-f0-9]{8}$/) });
export function registerCatalogRoutes(
  app: FastifyInstance,
  context: (request: FastifyRequest) => Promise<CatalogContext>
) {
  async function service(request: FastifyRequest, permission: CatalogPermission) {
    const scope = await context(request);
    await scope.authorize(permission);
    return new CatalogService(scope);
  }
  registerContractRoute(app, {
    method: "GET",
    url: "/ecommerce/catalog/lookups",
    schemas: {
      response: z.object({
        products: z.array(product),
        categories: z.array(category),
        permissions: z.object({
          create: z.boolean(),
          edit: z.boolean(),
          status: z.boolean(),
          remove: z.boolean()
        })
      })
    },
    handler: async ({ request }) => (await service(request, "ecommerce.catalog.view")).lookups()
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/ecommerce/catalog",
    schemas: {
      querystring: z.object({
        search: z.string().trim().max(191).optional(),
        categoryId: z.coerce.number().int().positive().optional()
      }),
      response: z.array(record)
    },
    handler: async ({ request, query }) =>
      (await service(request, "ecommerce.catalog.view")).list(query.search, query.categoryId)
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/ecommerce/catalog/:uuid",
    schemas: { params, response: record },
    handler: async ({ request, params }) =>
      (await service(request, "ecommerce.catalog.view")).get(params.uuid)
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/ecommerce/catalog/:uuid/activity",
    schemas: {
      params,
      response: z.array(
        z.object({
          uuid: z.string(),
          action: z.string(),
          actorEmail: z.string(),
          summary: z.string(),
          createdAt: z.string()
        })
      )
    },
    handler: async ({ request, params }) =>
      (await service(request, "ecommerce.catalog.view")).activity(params.uuid)
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/ecommerce/catalog",
    schemas: { body: input, response: record },
    handler: async ({ request, body }) =>
      (await service(request, "ecommerce.catalog.create")).save(body)
  });
  registerContractRoute(app, {
    method: "PUT",
    url: "/ecommerce/catalog/:uuid",
    schemas: { params, body: input, response: record },
    handler: async ({ request, params, body }) =>
      (await service(request, "ecommerce.catalog.edit")).save(body, params.uuid)
  });
  for (const action of ["activate", "deactivate", "delete"] as const)
    registerContractRoute(app, {
      method: action === "delete" ? "DELETE" : "POST",
      url: `/ecommerce/catalog/:uuid/${action === "delete" ? "force" : action}`,
      schemas: { params, response: record },
      handler: async ({ request, params }) =>
        (
          await service(
            request,
            action === "delete" ? "ecommerce.catalog.delete" : "ecommerce.catalog.status"
          )
        ).lifecycle(params.uuid, action)
    });
}
