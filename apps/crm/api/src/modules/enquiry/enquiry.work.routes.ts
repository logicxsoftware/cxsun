import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { registerContractRoute } from "@cxsun/framework/http";
import { EnquiryRepository } from "./enquiry.repository.js";
import { EnquiryService } from "./enquiry.service.js";
import { EnquiryWorkRepository } from "./enquiry.work.repository.js";
import { EnquiryWorkService } from "./enquiry.work.service.js";
import type { EnquiryRequestContext } from "./enquiry.routes.js";
import { localViewChild, remoteViewActivity, remoteViewEstimate, remoteViewJob } from "./enquiry.view-model.js";

const id = z.coerce.number().int().positive();
const reference = z.string().trim().min(1).max(191);
const enquiryParams = z.object({ id: reference });
const childParams = z.object({ id: reference, childId: reference });
const localId = (value: string) => id.parse(value);
const frappeTime = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(new Date(value));
const jobInput = z.object({
  employeeUserId: reference,
  startAt: z.iso.datetime({ offset: true }),
  stopAt: z.iso.datetime({ offset: true }).nullable(),
  ratePerHour: z.number().finite().nonnegative().max(10000000),
  status: z.enum(["running", "completed", "cancelled"])
});
const jobRecord = jobInput.omit({ employeeUserId: true }).extend({
  id: reference,
  uuid: z.string(),
  enquiryId: reference,
  employeeUserId: reference.nullable(),
  employee: z.string(),
  durationSeconds: z.number().int().nonnegative(),
  totalCost: z.number().nonnegative(),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
});
const estimateInput = z.object({
  date: z.iso.date(),
  itemName: z.string().trim().min(1).max(255),
  supplierContactId: reference,
  price: z.number().finite().positive().max(999999999999.99)
});
const estimateRecord = estimateInput.extend({
  id: reference,
  uuid: z.string(),
  enquiryId: reference,
  supplierName: z.string(),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
});
const activityRecord = z.object({
  id: reference,
  uuid: z.string(),
  enquiryId: reference,
  action: z.string(),
  details: z.string(),
  createdBy: z.string(),
  createdAt: z.string()
});

export function registerEnquiryWorkRoutes(
  app: FastifyInstance,
  context: (request: FastifyRequest) => Promise<EnquiryRequestContext>
) {
  const service = async (request: FastifyRequest) => {
    const scope = await context(request);
    return {
      scope,
      work: new EnquiryWorkService(
        new EnquiryService(new EnquiryRepository(scope.database), scope.relations, scope),
        new EnquiryWorkRepository(scope.database),
        scope.relations
      )
    };
  };
  const isLocal = (scope: EnquiryRequestContext) => scope.remote.provider().then((value) => value === "local");
  const remoteJob = async (scope: EnquiryRequestContext, name: string, job: Awaited<ReturnType<EnquiryRequestContext["remote"]["startJob"]>>) => {
    const [record, options] = await Promise.all([scope.remote.get(name), scope.remote.options()]);
    return remoteViewJob(job, record, options);
  };
  const remoteEstimate = async (scope: EnquiryRequestContext, name: string, estimate: Awaited<ReturnType<EnquiryRequestContext["remote"]["estimates"]>>[number]) => {
    const [record, options] = await Promise.all([scope.remote.get(name), scope.remote.options()]);
    return remoteViewEstimate(estimate, record, options);
  };
  registerContractRoute(app, {
    method: "GET",
    url: "/crm/enquiries/:id/jobs",
    schemas: { params: enquiryParams, response: z.array(jobRecord) },
    handler: async ({ params, request }) => {
      const { scope, work } = await service(request);
      if (await isLocal(scope)) return (await work.listJobs(localId(params.id))).map((job) => ({ ...localViewChild(job), employeeUserId: job.employeeUserId === null ? null : String(job.employeeUserId) }));
      const [jobs, record, options] = await Promise.all([scope.remote.jobs(params.id), scope.remote.get(params.id), scope.remote.options()]);
      return jobs.map((job) => remoteViewJob(job, record, options));
    }
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/crm/enquiries/:id/jobs/start",
    schemas: { params: enquiryParams, response: jobRecord },
    handler: async ({ params, request }) => {
      const { scope, work } = await service(request);
      return (await isLocal(scope))
        ? (() => work.startJob(localId(params.id), scope.actorEmail).then((job) => ({ ...localViewChild(job), employeeUserId: job.employeeUserId === null ? null : String(job.employeeUserId) })))()
        : remoteJob(scope, params.id, await scope.remote.startJob(params.id));
    }
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/crm/enquiries/:id/jobs",
    schemas: { params: enquiryParams, body: jobInput, response: jobRecord },
    handler: async ({ params, body, request }) => {
      const { scope, work } = await service(request);
      if (await isLocal(scope)) {
        const job = await work.saveJob(localId(params.id), { ...body, employeeUserId: localId(body.employeeUserId) }, scope.actorEmail);
        return { ...localViewChild(job), employeeUserId: job.employeeUserId === null ? null : String(job.employeeUserId) };
      }
      return remoteJob(scope, params.id, await scope.remote.saveJob(params.id, {
        employee: body.employeeUserId,
        startTime: frappeTime(body.startAt),
        stopTime: body.stopAt ? frappeTime(body.stopAt) : null,
        ratePerHour: body.ratePerHour,
        status: body.status === "running" ? "Running" : body.status === "completed" ? "Completed" : "Cancelled"
      }));
    }
  });
  registerContractRoute(app, {
    method: "PUT",
    url: "/crm/enquiries/:id/jobs/:childId",
    schemas: { params: childParams, body: jobInput, response: jobRecord },
    handler: async ({ params, body, request }) => {
      const { scope, work } = await service(request);
      if (await isLocal(scope)) {
        const job = await work.saveJob(localId(params.id), { ...body, employeeUserId: localId(body.employeeUserId) }, scope.actorEmail, localId(params.childId));
        return { ...localViewChild(job), employeeUserId: job.employeeUserId === null ? null : String(job.employeeUserId) };
      }
      return remoteJob(scope, params.id, await scope.remote.saveJob(params.id, {
        employee: body.employeeUserId,
        startTime: frappeTime(body.startAt),
        stopTime: body.stopAt ? frappeTime(body.stopAt) : null,
        ratePerHour: body.ratePerHour,
        status: body.status === "running" ? "Running" : body.status === "completed" ? "Completed" : "Cancelled"
      }, params.childId));
    }
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/crm/enquiries/:id/jobs/:childId/stop",
    schemas: { params: childParams, response: jobRecord },
    handler: async ({ params, request }) => {
      const { scope, work } = await service(request);
      if (await isLocal(scope)) {
        const job = await work.stopJob(localId(params.id), localId(params.childId), scope.actorEmail);
        return { ...localViewChild(job), employeeUserId: job.employeeUserId === null ? null : String(job.employeeUserId) };
      }
      return remoteJob(scope, params.id, await scope.remote.stopJob(params.id, params.childId));
    }
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/crm/enquiries/:id/estimates",
    schemas: { params: enquiryParams, response: z.array(estimateRecord) },
    handler: async ({ params, request }) => {
      const { scope, work } = await service(request);
      if (await isLocal(scope)) return (await work.listEstimates(localId(params.id))).map((estimate) => ({ ...localViewChild(estimate), supplierContactId: String(estimate.supplierContactId) }));
      const [estimates, record, options] = await Promise.all([scope.remote.estimates(params.id), scope.remote.get(params.id), scope.remote.options()]);
      return estimates.map((estimate) => remoteViewEstimate(estimate, record, options));
    }
  });
  registerContractRoute(app, {
    method: "POST",
    url: "/crm/enquiries/:id/estimates",
    schemas: { params: enquiryParams, body: estimateInput, response: estimateRecord },
    handler: async ({ params, body, request }) => {
      const { scope, work } = await service(request);
      if (await isLocal(scope)) {
        const estimate = await work.saveEstimate(localId(params.id), { ...body, supplierContactId: localId(body.supplierContactId) }, scope.actorEmail);
        return { ...localViewChild(estimate), supplierContactId: String(estimate.supplierContactId) };
      }
      return remoteEstimate(scope, params.id, await scope.remote.saveEstimate(params.id, { date: body.date, itemName: body.itemName, supplier: body.supplierContactId, price: body.price }));
    }
  });
  registerContractRoute(app, {
    method: "PUT",
    url: "/crm/enquiries/:id/estimates/:childId",
    schemas: { params: childParams, body: estimateInput, response: estimateRecord },
    handler: async ({ params, body, request }) => {
      const { scope, work } = await service(request);
      if (await isLocal(scope)) {
        const estimate = await work.saveEstimate(localId(params.id), { ...body, supplierContactId: localId(body.supplierContactId) }, scope.actorEmail, localId(params.childId));
        return { ...localViewChild(estimate), supplierContactId: String(estimate.supplierContactId) };
      }
      return remoteEstimate(scope, params.id, await scope.remote.saveEstimate(params.id, { date: body.date, itemName: body.itemName, supplier: body.supplierContactId, price: body.price }, params.childId));
    }
  });
  registerContractRoute(app, {
    method: "GET",
    url: "/crm/enquiries/:id/activity",
    schemas: { params: enquiryParams, response: z.array(activityRecord) },
    handler: async ({ params, request }) => {
      const { scope, work } = await service(request);
      return (await isLocal(scope))
        ? (await work.listActivity(localId(params.id))).map(localViewChild)
        : remoteViewActivity(await scope.remote.get(params.id));
    }
  });
}
