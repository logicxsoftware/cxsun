import type { FastifyInstance, FastifyRequest } from "fastify";
import type { Kysely } from "kysely";
import { z } from "zod";
import { registerContractRoute } from "@cxsun/framework/http";
import { AppError } from "@cxsun/framework/errors";
import type {} from "@cxsun/framework/api";
import { EnquiryRepository } from "./enquiry.repository.js";
import { EnquirySyncRepository } from "./enquiry.sync.repository.js";
import { EnquiryService, type EnquiryRelations } from "./enquiry.service.js";
import { EnquiryReadService, type EnquiryRemoteSource } from "./enquiry.read-source.js";
import type { EnquiryDatabase } from "./enquiry.types.js";
import { registerEnquiryWorkRoutes } from "./enquiry.work.routes.js";
import { ListInService } from "../list-in/list-in.service.js";
import { ListInRepository } from "../list-in/list-in.repository.js";
import { StatusService } from "../status/status.service.js";
import { StatusRepository } from "../status/status.repository.js";
import { PriorityService } from "../priority/priority.service.js";
import { PriorityRepository } from "../priority/priority.repository.js";
import {
  localViewRecord,
  indiaDate,
  localViewComment,
  remoteViewComments,
  remoteViewScopeSummary,
  remoteViewRecord,
  type EnquiryViewInput
} from "./enquiry.view-model.js";

const nullableText = z.string().trim().nullable();
const inputSchema = z.object({
  title: z.string().trim().max(255).default(""),
  description: nullableText,
  contactId: z.number().int().positive().nullable(),
  capturedName: z.string().trim().max(191).nullable(),
  capturedEmail: z.email().max(191).nullable(),
  capturedPhone: z.string().trim().max(80).nullable(),
  source: z.string().trim().min(1).max(80),
  sourceReference: z.string().trim().max(191).nullable(),
  listInId: z.number().int().positive().nullable(),
  statusId: z.number().int().positive(),
  priorityId: z.number().int().positive(),
  assignedUserId: z.number().int().positive().nullable(),
  enquiredAt: z.string().datetime({ offset: true }),
  dueDate: z.iso.date().nullable(),
  closedReason: nullableText
});
const recordSchema = inputSchema.extend({
  enquiryNo: z.number().int().positive().max(2147483646),
  title: z.string().min(1).max(255),
  id: z.number().int().positive(),
  uuid: z.string(),
  contactName: nullableText,
  listIn: nullableText,
  status: z.string(),
  statusName: z.string(),
  priority: z.string(),
  priorityName: z.string(),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
});
const referenceSchema = z.string().trim().min(1).max(191);
const viewInputSchema = inputSchema
  .omit({
    listInId: true,
    statusId: true,
    priorityId: true,
    assignedUserId: true
  })
  .extend({
    listInId: referenceSchema.nullable(),
    statusId: referenceSchema,
    priorityId: referenceSchema,
    assignedUserId: referenceSchema.nullable()
  });
const viewRecordSchema = recordSchema
  .omit({
    id: true,
    enquiryNo: true,
    listInId: true,
    statusId: true,
    priorityId: true,
    assignedUserId: true
  })
  .extend({
    id: referenceSchema,
    enquiryNo: referenceSchema,
    listInId: referenceSchema.nullable(),
    statusId: referenceSchema,
    priorityId: referenceSchema,
    assignedUserId: referenceSchema.nullable(),
    assignedToName: nullableText
  });
const viewIdSchema = z.object({ id: referenceSchema });
const localId = (value: string) => {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) throw AppError.validation("Invalid Local enquiry ID.");
  return id;
};
const localInput = (input: EnquiryViewInput) => ({
  ...input,
  listInId: input.listInId === null ? null : localId(input.listInId),
  statusId: localId(input.statusId),
  priorityId: localId(input.priorityId),
  assignedUserId: input.assignedUserId === null ? null : localId(input.assignedUserId)
});
const alertIdSchema = z.object({ alertId: z.coerce.number().int().positive() });
const listQuerySchema = z.object({
  scope: z.enum(["all", "assigned", "created"]).default("all"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(100),
  search: z.string().trim().max(191).default(""),
  mobile: z
    .string()
    .regex(/^\d{7,15}$/)
    .optional(),
  contactId: z.coerce.number().int().positive().optional(),
  searchCustomer: z.string().trim().max(191).optional(),
  searchDetails: z.string().trim().max(191).optional(),
  searchListIn: z.string().trim().max(191).optional(),
  searchDueDate: z.string().trim().max(191).optional(),
  searchPriority: z.string().trim().max(191).optional(),
  searchCreator: z.string().trim().max(191).optional(),
  searchAssignedTo: z.string().trim().max(191).optional(),
  searchStatus: z.string().trim().max(191).optional(),
  filter: z.string().trim().max(80).default("all"),
  fromAt: z.iso.datetime({ offset: true }).optional(),
  toAt: z.iso.datetime({ offset: true }).optional(),
  listInId: z.string().trim().min(1).max(191).optional(),
  createdBy: z.string().trim().min(1).max(191).optional(),
  assignedUserId: z.string().trim().min(1).max(191).optional(),
  group: z.string().trim().min(1).max(191).optional(),
  creatorEmployee: z.string().trim().min(1).max(191).optional(),
  assigneeEmployee: z.string().trim().min(1).max(191).optional(),
  fromDate: z.iso.date().optional(),
  toDate: z.iso.date().optional()
});
const liveQuerySchema = z.object({
  scope: z.enum(["all", "assigned", "created"]).default("all"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().trim().max(191).default(""),
  mobile: z
    .string()
    .regex(/^\d{10}$/)
    .optional(),
  status: z.string().trim().max(80).optional(),
  fromDate: z.iso.date().optional(),
  toDate: z.iso.date().optional()
});
const liveRecordSchema = z.object({
  name: z.string(),
  title: z.string(),
  details: z.string(),
  customer: nullableText,
  mobile: nullableText,
  date: nullableText,
  dueDate: nullableText,
  group: nullableText,
  creator: nullableText,
  assignee: nullableText,
  priority: nullableText,
  status: nullableText,
  statusDetails: nullableText,
  createdAt: nullableText,
  modifiedAt: nullableText,
  creatorCode: nullableText.optional(),
  assigneeCode: nullableText.optional(),
  messages: z
    .array(
      z.object({
        name: z.string(),
        body: z.string(),
        parentName: nullableText,
        createdBy: nullableText,
        createdAt: nullableText
      })
    )
    .optional(),
  activity: z
    .array(
      z.object({
        name: z.string(),
        action: z.string(),
        details: z.string(),
        createdBy: z.string(),
        createdAt: z.string()
      })
    )
    .optional(),
  canDelete: z.boolean().optional()
});
const liveInputSchema = z.object({
  title: z.string().trim().max(255),
  details: z.string().trim().min(1).max(10000),
  customer: nullableText,
  mobile: z.string().regex(/^\d{10}$/, "Enter a 10-digit mobile number."),
  date: z.iso.date(),
  dueDate: z.iso.date().nullable(),
  group: nullableText,
  assigneeCode: nullableText,
  priority: z.string().trim().min(1).max(80),
  status: z.string().trim().min(1).max(80),
  statusDetails: nullableText
});
const liveOptionsSchema = z.object({
  groups: z.array(z.string()),
  statuses: z.array(z.string()),
  employees: z.array(z.object({ code: z.string(), name: z.string() })),
  customers: z.array(z.object({ code: z.string(), name: z.string() })),
  suppliers: z.array(z.object({ code: z.string(), name: z.string() }))
});
const liveEstimateInputSchema = z.object({
  date: z.iso.date(),
  itemName: z.string().trim().min(1).max(255),
  supplier: z.string().trim().min(1).max(191),
  price: z.number().positive()
});
const liveEstimateSchema = liveEstimateInputSchema.extend({ name: z.string() });
const liveJobSchema = z.object({
  name: z.string(),
  employee: z.string(),
  startTime: z.string(),
  stopTime: nullableText,
  status: z.string(),
  hours: z.number(),
  totalCost: z.number(),
  ratePerHour: z.number()
});
const jobTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/);
const liveJobInputSchema = z
  .object({
    employee: z.string().trim().min(1).max(191),
    startTime: jobTime,
    stopTime: jobTime.nullable(),
    ratePerHour: z.number().nonnegative(),
    status: z.enum(["Running", "Completed", "Cancelled"])
  })
  .refine(
    (job) => job.status === "Running" || Boolean(job.stopTime),
    "Stop time is required for a completed job."
  );
const livePageSchema = z.object({
  source: z.literal("frappe"),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  hasMore: z.boolean(),
  total: z.number().int().nonnegative(),
  statusCounts: z.array(z.object({ code: z.string(), count: z.number().int().nonnegative() })),
  items: z.array(liveRecordSchema)
});
const liveNameSchema = z.object({ name: z.string().trim().min(1).max(191) });
const reportQuerySchema = listQuerySchema
  .pick({
    fromAt: true,
    toAt: true,
    assignedUserId: true
  })
  .extend({ view: z.enum(["list-in", "creator", "assignee", "status"]).default("list-in") });
const reportRowSchema = z.object({
  listInId: referenceSchema.nullable(),
  listIn: nullableText,
  createdBy: z.string(),
  assignedUserId: referenceSchema.nullable(),
  status: z.string(),
  statusName: z.string(),
  count: z.number().int().nonnegative()
});
const pageSchema = z.object({
  items: z.array(recordSchema),
  total: z.number().int().nonnegative(),
  statusCounts: z.array(z.object({ code: z.string(), count: z.number().int().nonnegative() }))
});
const viewPageSchema = pageSchema.extend({ items: z.array(viewRecordSchema) });
const scopeSummarySchema = z.object({
  total: z.number().int().nonnegative(),
  active: z.number().int().nonnegative(),
  newCalls: z.number().int().nonnegative(),
  attention: z.number().int().nonnegative(),
  updated7: z.number().int().nonnegative(),
  updated30: z.number().int().nonnegative(),
  created7: z.number().int().nonnegative(),
  created30: z.number().int().nonnegative(),
  oldestActiveDays: z.number().int().nonnegative().nullable(),
  statusCounts: z.array(z.object({ code: z.string(), count: z.number().int().nonnegative() })),
  priorityCounts: z.array(z.object({ code: z.string(), count: z.number().int().nonnegative() }))
});
const commentSchema = z.object({
  id: z.number().int().positive(),
  uuid: z.string(),
  enquiryId: z.number().int().positive(),
  parentId: z.number().int().positive().nullable(),
  body: z.string(),
  bodyFormat: z.enum(["plain", "html"]),
  createdBy: z.string(),
  createdAt: z.string()
});
const commentInputSchema = z.object({
  body: z.string().trim().min(1).max(10000),
  bodyFormat: z.enum(["plain", "html"]).default("plain"),
  parentId: z.number().int().positive().nullable().default(null)
});
const viewCommentSchema = commentSchema.omit({ id: true, enquiryId: true, parentId: true }).extend({
  id: referenceSchema,
  enquiryId: referenceSchema,
  parentId: referenceSchema.nullable()
});
const viewCommentInputSchema = commentInputSchema.omit({ parentId: true }).extend({
  parentId: referenceSchema.nullable().default(null)
});

export type EnquiryRequestContext = {
  database: Kysely<EnquiryDatabase>;
  actorEmail: string;
  actorUserId: number | null;
  canViewAll: boolean;
  relations: EnquiryRelations;
  remote: EnquiryRemoteSource;
  listUsers: () => Promise<Array<{ id: number; name: string; email: string; status: string }>>;
  queueSyncEvent?: (event: { id: number; correlationId: string }) => Promise<void>;
  resolveLocalReference?: (
    kind: "list-in" | "status" | "priority",
    value: string
  ) => Promise<number>;
  resolveLocalAssignee?: (value: string | null) => Promise<number | null>;
  localEnquiryIdForRemote?: (name: string) => Promise<number | null>;
};

export function registerEnquiryRoutes(
  app: FastifyInstance,
  context: (request: FastifyRequest) => Promise<EnquiryRequestContext>
) {
  const service = async (request: FastifyRequest) => {
    const scope = await context(request);
    const enquiry = new EnquiryService(
      new EnquiryRepository(scope.database),
      scope.relations,
      scope
    );
    return { scope, enquiry, read: new EnquiryReadService(enquiry, scope.remote) };
  };
  const localService = async (request: FastifyRequest) => {
    const current = await service(request);
    await current.read.assertLocal();
    return current;
  };
  const queueLatestSync = async (
    current: Awaited<ReturnType<typeof service>>,
    enquiryId: number
  ) => {
    if (!current.scope.queueSyncEvent) return;
    const event = await new EnquirySyncRepository(current.scope.database).latestEvent(
      enquiryId,
      current.scope.actorEmail
    );
    if (event)
      await current.scope.queueSyncEvent({ id: event.id, correlationId: event.correlation_id });
  };
  const localInputForScope = async (scope: EnquiryRequestContext, input: EnquiryViewInput) => {
    if (!scope.resolveLocalReference || !scope.resolveLocalAssignee) return localInput(input);
    const [listInId, statusId, priorityId, assignedUserId] = await Promise.all([
      input.listInId === null ? null : scope.resolveLocalReference("list-in", input.listInId),
      scope.resolveLocalReference("status", input.statusId),
      scope.resolveLocalReference("priority", input.priorityId),
      scope.resolveLocalAssignee(input.assignedUserId)
    ]);
    return { ...input, listInId, statusId, priorityId, assignedUserId };
  };
  const localEnquiryId = async (scope: EnquiryRequestContext, value: string) => {
    if (/^\d+$/u.test(value)) return localId(value);
    const id = await scope.localEnquiryIdForRemote?.(value);
    if (!id)
      throw AppError.conflict("Import this Frappe enquiry into the local CRM before editing it.");
    return id;
  };
  registerContractRoute(app, {
    method: "POST",
    url: "/crm/enquiries/options/:kind",
    schemas: {
      params: z.object({ kind: z.enum(["list-in", "status", "priority"]) }),
      body: z.object({ name: z.string().trim().min(1).max(80) }),
      response: z.object({ id: referenceSchema, name: z.string(), code: z.string() })
    },
    handler: async ({ params, body, request }) => {
      const { scope, read } = await service(request);
      if ((await read.source()) === "frappe") {
        if (!scope.remote.createOption)
          throw new Error("The selected enquiry source cannot create options.");
        return scope.remote.createOption(params.kind, body.name);
      }
      const input = { name: body.name, sortOrder: 1000 };
      const record =
        params.kind === "list-in"
          ? await new ListInService(new ListInRepository(scope.database)).create(
              input,
              scope.actorEmail
            )
          : params.kind === "status"
            ? await new StatusService(new StatusRepository(scope.database)).create(
                input,
                scope.actorEmail
              )
            : await new PriorityService(new PriorityRepository(scope.database)).create(
                input,
                scope.actorEmail
              );
      return {
        id: String(record.id),
        name: record.name,
        code:
          "code" in record && typeof record.code === "string"
            ? record.code
            : record.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      };
    }
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/crm/enquiries/options",
    schemas: {
      response: z.object({
        lists: z.array(
          z.object({
            id: referenceSchema,
            name: z.string(),
            status: z.string(),
            code: z.string().optional()
          })
        ),
        statuses: z.array(
          z.object({
            id: referenceSchema,
            name: z.string(),
            status: z.string(),
            code: z.string().optional()
          })
        ),
        priorities: z.array(
          z.object({
            id: referenceSchema,
            name: z.string(),
            status: z.string(),
            code: z.string().optional()
          })
        ),
        users: z.array(
          z.object({
            id: referenceSchema,
            name: z.string(),
            email: z.string().optional(),
            status: z.string()
          })
        ),
        suppliers: z.array(z.object({ id: referenceSchema, name: z.string(), status: z.string() }))
      })
    },
    handler: async ({ request }) => {
      const { scope, read } = await service(request);
      if ((await read.source()) === "frappe") {
        const options = await scope.remote.options();
        return {
          lists: options.groups.map((name) => ({ id: name, name, status: "active" })),
          statuses: options.statuses.map((name) => ({
            id: name,
            name,
            code: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            status: "active"
          })),
          priorities: ["Normal", "Urgent"].map((name) => ({
            id: name,
            name,
            code: name.toLowerCase(),
            status: "active"
          })),
          users: options.employees.map((employee) => ({
            id: employee.code,
            name: employee.name,
            status: "active"
          })),
          suppliers: options.suppliers.map((supplier) => ({
            id: supplier.code,
            name: supplier.name,
            status: "active"
          }))
        };
      }
      const [lists, statuses, priorities, users] = await Promise.all([
        scope.database.selectFrom("crm_enquiry_lists").select(["id", "name", "status"]).execute(),
        scope.database
          .selectFrom("crm_enquiry_statuses")
          .select(["id", "name", "code", "status"])
          .execute(),
        scope.database
          .selectFrom("crm_enquiry_priorities")
          .select(["id", "name", "code", "status"])
          .execute(),
        scope.listUsers()
      ]);
      return {
        lists: lists.map((item) => ({ ...item, id: String(item.id) })),
        statuses: statuses.map((item) => ({ ...item, id: String(item.id) })),
        priorities: priorities.map((item) => ({ ...item, id: String(item.id) })),
        users: users.map((item) => ({ ...item, id: String(item.id) })),
        suppliers: []
      };
    }
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/crm/enquiries/source",
    schemas: { response: z.object({ provider: z.enum(["local", "frappe"]) }) },
    handler: async ({ request }) => ({ provider: await (await service(request)).read.source() })
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/crm/enquiries/live",
    schemas: { querystring: liveQuerySchema, response: livePageSchema },
    handler: async ({ query, request }) => {
      const { scope } = await service(request);
      return scope.remote.list(query);
    }
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/crm/enquiries/live/options",
    schemas: { response: liveOptionsSchema },
    handler: async ({ request }) => (await service(request)).scope.remote.options()
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/crm/enquiries/live",
    schemas: { body: liveInputSchema, response: liveRecordSchema },
    handler: async ({ body, request }) => (await service(request)).scope.remote.create(body)
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/crm/enquiries/live/:name",
    schemas: { params: liveNameSchema, response: liveRecordSchema },
    handler: async ({ params, request }) => (await service(request)).scope.remote.get(params.name)
  });
  registerContractRoute(app, {
    method: "PATCH",
    url: "/crm/enquiries/live/:name",
    schemas: {
      params: liveNameSchema,
      body: liveInputSchema.partial().refine((value) => Object.keys(value).length > 0),
      response: liveRecordSchema
    },
    handler: async ({ params, body, request }) =>
      (await service(request)).scope.remote.update(params.name, body)
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/crm/enquiries/live/:name/messages",
    schemas: {
      params: liveNameSchema,
      body: z.object({ body: z.string().trim().min(1).max(10000), parentName: nullableText }),
      response: liveRecordSchema
    },
    handler: async ({ params, body, request }) =>
      (await service(request)).scope.remote.addMessage(params.name, body.body, body.parentName)
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/crm/enquiries/live/:name/messages/:messageName/suspend",
    schemas: {
      params: liveNameSchema.extend({ messageName: z.string().trim().min(1).max(191) }),
      response: liveRecordSchema
    },
    handler: async ({ params, request }) =>
      (await service(request)).scope.remote.suspendMessage(params.name, params.messageName)
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/crm/enquiries/live/:name/open-new-call",
    schemas: { params: liveNameSchema, response: liveRecordSchema },
    handler: async ({ params, request }) =>
      (await service(request)).scope.remote.openNewCall(params.name)
  });
  registerContractRoute(app, {
    method: "DELETE",
    url: "/crm/enquiries/live/:name",
    schemas: { params: liveNameSchema, response: z.object({ deleted: z.literal(true) }) },
    handler: async ({ params, request }) =>
      (await service(request)).scope.remote.delete(params.name)
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/crm/enquiries/live/:name/jobs",
    schemas: { params: liveNameSchema, response: z.array(liveJobSchema) },
    handler: async ({ params, request }) => (await service(request)).scope.remote.jobs(params.name)
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/crm/enquiries/live/:name/jobs/start",
    schemas: { params: liveNameSchema, response: liveJobSchema },
    handler: async ({ params, request }) =>
      (await service(request)).scope.remote.startJob(params.name)
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/crm/enquiries/live/:name/jobs/:jobName/stop",
    schemas: {
      params: liveNameSchema.extend({ jobName: z.string().trim().min(1).max(191) }),
      response: liveJobSchema
    },
    handler: async ({ params, request }) =>
      (await service(request)).scope.remote.stopJob(params.name, params.jobName)
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/crm/enquiries/live/:name/jobs",
    schemas: { params: liveNameSchema, body: liveJobInputSchema, response: liveJobSchema },
    handler: async ({ params, body, request }) =>
      (await service(request)).scope.remote.saveJob(params.name, body)
  });
  registerContractRoute(app, {
    method: "PUT",
    url: "/crm/enquiries/live/:name/jobs/:jobName",
    schemas: {
      params: liveNameSchema.extend({ jobName: z.string().trim().min(1).max(191) }),
      body: liveJobInputSchema,
      response: liveJobSchema
    },
    handler: async ({ params, body, request }) =>
      (await service(request)).scope.remote.saveJob(params.name, body, params.jobName)
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/crm/enquiries/live/:name/estimates",
    schemas: { params: liveNameSchema, response: z.array(liveEstimateSchema) },
    handler: async ({ params, request }) =>
      (await service(request)).scope.remote.estimates(params.name)
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/crm/enquiries/live/:name/estimates",
    schemas: {
      params: liveNameSchema,
      body: liveEstimateInputSchema,
      response: liveEstimateSchema
    },
    handler: async ({ params, body, request }) =>
      (await service(request)).scope.remote.saveEstimate(params.name, body)
  });
  registerContractRoute(app, {
    method: "PUT",
    url: "/crm/enquiries/live/:name/estimates/:estimateName",
    schemas: {
      params: liveNameSchema.extend({ estimateName: z.string().trim().min(1).max(191) }),
      body: liveEstimateInputSchema,
      response: liveEstimateSchema
    },
    handler: async ({ params, body, request }) =>
      (await service(request)).scope.remote.saveEstimate(params.name, body, params.estimateName)
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/crm/enquiries",
    schemas: {
      querystring: listQuerySchema,
      response: viewPageSchema
    },
    handler: async ({ query, request }) => (await service(request)).read.list(query)
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/crm/enquiries/reports",
    schemas: { querystring: reportQuerySchema, response: z.array(reportRowSchema) },
    handler: async ({ query, request }) => {
      const current = await service(request);
      if ((await current.read.source()) === "local") {
        const rows = await current.enquiry.report(query);
        return rows.map((row) => ({
          ...row,
          listInId: row.listInId === null ? null : String(row.listInId),
          assignedUserId: row.assignedUserId === null ? null : String(row.assignedUserId)
        }));
      }
      const rows = await current.scope.remote.report({
        view: query.view,
        ...(query.fromAt ? { fromDate: indiaDate(query.fromAt) } : {}),
        ...(query.toAt
          ? { toDate: indiaDate(new Date(new Date(query.toAt).getTime() - 1).toISOString()) }
          : {}),
        ...(query.assignedUserId && query.assignedUserId !== "none"
          ? { assignee: query.assignedUserId }
          : {})
      });
      return rows.map((row) => {
        const status = row.status?.toLowerCase().replace(/[^a-z0-9]+/g, "-") ?? "none";
        return {
          listInId: query.view === "list-in" ? row.group : null,
          listIn: query.view === "list-in" ? row.group : null,
          createdBy: query.view === "creator" ? (row.group ?? "—") : "—",
          assignedUserId: query.view === "assignee" ? row.group : null,
          status,
          statusName: row.status ?? "Unspecified",
          count: row.count
        };
      });
    }
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/crm/enquiries/live/reports",
    schemas: {
      querystring: z.object({
        view: z.enum(["list-in", "creator", "assignee", "status"]),
        fromDate: z.iso.date().optional(),
        toDate: z.iso.date().optional(),
        assignee: z.string().trim().min(1).max(191).optional()
      }),
      response: z.array(
        z.object({
          group: nullableText,
          status: nullableText,
          count: z.number().int().nonnegative()
        })
      )
    },
    handler: async ({ query, request }) => (await service(request)).scope.remote.report(query)
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/crm/enquiries/live/summary",
    schemas: {
      querystring: z.object({ today: z.iso.date() }),
      response: z.object({
        allCount: z.number().int().nonnegative(),
        assigned: z.object({
          total: z.number().int().nonnegative(),
          statusCounts: scopeSummarySchema.shape.statusCounts,
          priorityCounts: scopeSummarySchema.shape.priorityCounts
        }),
        created: z.object({
          total: z.number().int().nonnegative(),
          statusCounts: scopeSummarySchema.shape.statusCounts,
          priorityCounts: scopeSummarySchema.shape.priorityCounts
        })
      })
    },
    handler: async ({ query, request }) =>
      (await service(request)).scope.remote.summary(query.today)
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/crm/enquiries/overview-activity",
    schemas: { response: z.object({ commentsByYou30Days: z.number().int().nonnegative() }) },
    handler: async ({ request }) => {
      const current = await service(request);
      return (await current.read.source()) === "local"
        ? current.enquiry.overviewActivity(current.scope.actorEmail)
        : { commentsByYou30Days: 0 };
    }
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/crm/enquiries/attention",
    schemas: {
      querystring: z.object({ today: z.iso.date() }),
      response: z.object({
        assignments: z.array(
          z.object({
            id: z.number().int().positive(),
            enquiryId: z.number().int().positive(),
            enquiryNo: z.number().int().positive(),
            title: z.string(),
            createdAt: z.string()
          })
        ),
        due: z.array(recordSchema)
      })
    },
    handler: async ({ query, request }) => {
      const current = await service(request);
      if ((await current.read.source()) === "local") return current.enquiry.attention(query.today);
      return { assignments: [], due: [] };
    }
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/crm/enquiries/summary",
    schemas: {
      querystring: z.object({ today: z.iso.date() }),
      response: z.object({
        allCount: z.number().int().nonnegative(),
        assigned: scopeSummarySchema,
        created: scopeSummarySchema
      })
    },
    handler: async ({ query, request }) => {
      const current = await service(request);
      if ((await current.read.source()) === "local") return current.enquiry.summary(query.today);
      const summary = await current.scope.remote.summary(query.today);
      return {
        allCount: summary.allCount,
        assigned: remoteViewScopeSummary(summary.assigned),
        created: remoteViewScopeSummary(summary.created)
      };
    }
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/crm/enquiries/alerts/:alertId/read",
    schemas: {
      params: alertIdSchema,
      response: z.object({ read: z.boolean() })
    },
    handler: async ({ params, request }) =>
      (await localService(request)).enquiry.readAlert(params.alertId)
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/crm/enquiries/:id/sync-status",
    schemas: {
      params: viewIdSchema,
      response: z.array(
        z.object({
          id: referenceSchema,
          eventType: z.enum(["enquiry-upsert", "comment-add", "job-upsert", "estimate-upsert"]),
          status: z.enum(["pending", "processing", "synced", "retry", "failed"]),
          attempts: z.number().int().nonnegative(),
          remoteName: nullableText,
          lastError: nullableText,
          createdAt: z.string(),
          validation: z
            .object({
              status: z.enum(["valid", "invalid", "warning"]),
              errors: z.array(z.string()),
              checkedAt: z.string()
            })
            .nullable()
        })
      )
    },
    handler: async ({ params, request }) => {
      const current = await service(request);
      const id = await localEnquiryId(current.scope, params.id);
      await current.enquiry.get(id);
      return new EnquirySyncRepository(current.scope.database).listForEnquiry(id);
    }
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/crm/enquiries/:id",
    schemas: { params: viewIdSchema, response: viewRecordSchema },
    handler: async ({ params, request }) => {
      const current = await service(request);
      const localIdValue = /^\d+$/u.test(params.id)
        ? localId(params.id)
        : await current.scope.localEnquiryIdForRemote?.(params.id);
      return localIdValue
        ? localViewRecord(await current.enquiry.get(localIdValue))
        : (await current.read.source()) === "local"
          ? localViewRecord(await current.enquiry.get(localId(params.id)))
          : remoteViewRecord(await current.scope.remote.get(params.id));
    }
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/crm/enquiries",
    schemas: { body: viewInputSchema, response: viewRecordSchema },
    handler: async ({ body, request }) => {
      const current = await service(request);
      const input =
        (await current.read.source()) === "local"
          ? localInput(body)
          : await localInputForScope(current.scope, body);
      const saved = await current.enquiry.create(input, current.scope.actorEmail);
      await queueLatestSync(current, saved.id);
      return localViewRecord(saved);
    }
  });
  registerContractRoute(app, {
    method: "PUT",
    url: "/crm/enquiries/:id",
    schemas: { body: viewInputSchema, params: viewIdSchema, response: viewRecordSchema },
    handler: async ({ body, params, request }) => {
      const current = await service(request);
      const id = await localEnquiryId(current.scope, params.id);
      const input =
        (await current.read.source()) === "local"
          ? localInput(body)
          : await localInputForScope(current.scope, body);
      const saved = await current.enquiry.update(id, input, current.scope.actorEmail);
      await queueLatestSync(current, id);
      return localViewRecord(saved);
    }
  });
  registerContractRoute(app, {
    method: "PATCH",
    url: "/crm/enquiries/:id/properties",
    schemas: {
      body: viewInputSchema
        .pick({
          listInId: true,
          priorityId: true,
          assignedUserId: true,
          dueDate: true,
          statusId: true,
          closedReason: true
        })
        .partial()
        .refine((value) => Object.keys(value).length > 0),
      params: viewIdSchema,
      response: viewRecordSchema
    },
    handler: async ({ body, params, request }) => {
      const current = await service(request);
      {
        const id = await localEnquiryId(current.scope, params.id);
        const isLocal = (await current.read.source()) === "local";
        const patch = {
          ...(body.listInId !== undefined
            ? {
                listInId:
                  body.listInId === null
                    ? null
                    : isLocal
                      ? localId(body.listInId)
                      : await current.scope.resolveLocalReference!("list-in", body.listInId)
              }
            : {}),
          ...(body.priorityId !== undefined
            ? {
                priorityId: isLocal
                  ? localId(body.priorityId)
                  : await current.scope.resolveLocalReference!("priority", body.priorityId)
              }
            : {}),
          ...(body.assignedUserId !== undefined
            ? {
                assignedUserId: isLocal
                  ? body.assignedUserId === null
                    ? null
                    : localId(body.assignedUserId)
                  : await current.scope.resolveLocalAssignee!(body.assignedUserId)
              }
            : {}),
          ...(body.statusId !== undefined
            ? {
                statusId: isLocal
                  ? localId(body.statusId)
                  : await current.scope.resolveLocalReference!("status", body.statusId)
              }
            : {}),
          ...(body.dueDate !== undefined ? { dueDate: body.dueDate } : {}),
          ...(body.closedReason !== undefined ? { closedReason: body.closedReason } : {})
        };
        const saved = await current.enquiry.updateProperties(id, patch, current.scope.actorEmail);
        await queueLatestSync(current, id);
        return localViewRecord(saved);
      }
    }
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/crm/enquiries/:id/open-new-call",
    schemas: { params: viewIdSchema, response: viewRecordSchema },
    handler: async ({ params, request }) => {
      const current = await service(request);
      const id = await localEnquiryId(current.scope, params.id);
      const saved = await current.enquiry.openNewCall(id, current.scope.actorEmail);
      await queueLatestSync(current, id);
      return localViewRecord(saved);
    }
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/crm/enquiries/:id/comments",
    schemas: { params: viewIdSchema, response: z.array(viewCommentSchema) },
    handler: async ({ params, request }) => {
      const current = await service(request);
      const id = /^\d+$/u.test(params.id)
        ? localId(params.id)
        : await current.scope.localEnquiryIdForRemote?.(params.id);
      return id
        ? (await current.enquiry.listComments(id)).map(localViewComment)
        : (await current.read.source()) === "local"
          ? (await current.enquiry.listComments(localId(params.id))).map(localViewComment)
          : remoteViewComments(await current.scope.remote.get(params.id));
    }
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/crm/enquiries/:id/comments",
    schemas: { params: viewIdSchema, body: viewCommentInputSchema, response: viewCommentSchema },
    handler: async ({ params, body, request }) => {
      const current = await service(request);
      {
        const enquiryId = await localEnquiryId(current.scope, params.id);
        const saved = await current.enquiry.addComment(
          enquiryId,
          body.body,
          body.parentId === null ? null : localId(body.parentId),
          current.scope.actorEmail,
          body.bodyFormat
        );
        await queueLatestSync(current, enquiryId);
        return localViewComment(saved);
      }
    }
  });
  registerEnquiryWorkRoutes(app, async (request) => {
    const current = await service(request);
    return current.scope;
  });
}
