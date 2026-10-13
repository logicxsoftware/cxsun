import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { registerContractRoute } from "@cxsun/framework/http";
import { CrmContactService } from "./contact.service.js";
import type { CrmContactLookupName } from "./contact.types.js";

const base = "/crm/contacts";
const response = z.unknown();
const idParams = z.object({ id: z.string().regex(/^\d+$/u) });
const addressParams = idParams.extend({ addressId: z.string().regex(/^\d+$/u) });
const searchQuery = z.object({ search: z.string().trim().optional() });
const body = z.unknown();
const lookups: readonly (readonly [CrmContactLookupName, string])[] = [
  ["contact-types", "/core/common/contacts/contact-types"],
  ["contact-groups", "/core/common/contacts/contact-groups"],
  ["address-types", "/core/common/contacts/address-types"],
  ["bank-names", "/core/common/contacts/bank-names"],
  ["countries", "/core/common/location/countries"],
  ["states", "/core/common/location/states"],
  ["districts", "/core/common/location/districts"],
  ["cities", "/core/common/location/cities"],
  ["pincodes", "/core/common/location/pincodes"]
] as const;

export function registerCrmContactRoutes(
  app: FastifyInstance,
  authorize: (request: FastifyRequest) => Promise<void>
) {
  const service = new CrmContactService(app);
  const preHandler = async (request: FastifyRequest) => authorize(request);
  registerContractRoute(app, {
    handler: ({ query, request }) =>
      service.forward(
        request,
        "GET",
        `${CORE_CONTACTS}${query.search ? `?search=${encodeURIComponent(query.search)}` : ""}`
      ),
    method: "GET",
    preHandler,
    schemas: { querystring: searchQuery, response },
    url: base
  });
  registerContractRoute(app, {
    handler: ({ body: input, request }) => service.forward(request, "POST", CORE_CONTACTS, input),
    method: "POST",
    preHandler,
    schemas: { body, response },
    url: base
  });
  registerContractRoute(app, {
    handler: ({ request }) => service.forward(request, "GET", `${CORE_CONTACTS}/next-code`),
    method: "GET",
    preHandler,
    schemas: { response },
    url: `${base}/next-code`
  });
  registerContractRoute(app, {
    handler: ({ params, request }) =>
      service.forward(request, "GET", `${CORE_CONTACTS}/${params.id}`),
    method: "GET",
    preHandler,
    schemas: { params: idParams, response },
    url: `${base}/:id`
  });
  registerContractRoute(app, {
    handler: ({ body: input, params, request }) =>
      service.forward(request, "PUT", `${CORE_CONTACTS}/${params.id}`, input),
    method: "PUT",
    preHandler,
    schemas: { body, params: idParams, response },
    url: `${base}/:id`
  });
  registerContractRoute(app, {
    handler: ({ body: input, params, request }) =>
      service.forward(request, "POST", `${CORE_CONTACTS}/${params.id}/addresses`, input),
    method: "POST",
    preHandler,
    schemas: { body, params: idParams, response },
    url: `${base}/:id/addresses`
  });
  registerContractRoute(app, {
    handler: ({ body: input, params, request }) =>
      service.forward(
        request,
        "PUT",
        `${CORE_CONTACTS}/${params.id}/addresses/${params.addressId}`,
        input
      ),
    method: "PUT",
    preHandler,
    schemas: { body, params: addressParams, response },
    url: `${base}/:id/addresses/:addressId`
  });
  for (const [action, method] of [
    ["activate", "POST"],
    ["deactivate", "POST"],
    ["force", "DELETE"]
  ] as const) {
    registerContractRoute(app, {
      handler: ({ params, request }) =>
        service.forward(request, method, `${CORE_CONTACTS}/${params.id}/${action}`),
      method,
      preHandler,
      schemas: { params: idParams, response },
      url: `${base}/:id/${action}`
    });
  }
  registerContractRoute(app, {
    handler: async ({ request }) => {
      const entries = await Promise.all(
        lookups.map(
          async ([key, corePath]) => [key, await service.forward(request, "GET", corePath)] as const
        )
      );
      return Object.fromEntries(entries);
    },
    method: "GET",
    preHandler,
    schemas: { response },
    url: `${base}/lookups`
  });
  for (const [name, corePath] of lookups) {
    registerContractRoute(app, {
      handler: ({ body: input, request }) => service.forward(request, "POST", corePath, input),
      method: "POST",
      preHandler,
      schemas: { body, response },
      url: `${base}/lookups/${name}`
    });
  }
}

const CORE_CONTACTS = "/core/master/contacts";
