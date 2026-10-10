import { AppError } from "@cxsun/framework/errors";
import type { Kysely } from "kysely";
import { FrappeConnectionRepository } from "./connection.repository.js";
import { requestFrappe } from "./connection.service.js";
import { aggregateFrappeEnquiries } from "./connection.aggregate-enquiries.js";
import type { FrappeDatabase, FrappeSettings } from "./connection.types.js";

const fields = [
  "name",
  "title",
  "enquiry_details",
  "customer",
  "mobile",
  "date",
  "due_date",
  "group",
  "user_employee",
  "assigned_to_employee",
  "priority",
  "status",
  "status_details",
  "creation",
  "modified"
];

type RemoteEnquiry = Record<string, string | null> & { name: string };

export type LiveEnquiryQuery = {
  scope: "all" | "assigned" | "created";
  page: number;
  pageSize: number;
  search: string;
  status?: string | undefined;
  group?: string | undefined;
  creator?: string | undefined;
  assignee?: string | undefined;
  fromDate?: string | undefined;
  toDate?: string | undefined;
};

export async function listLiveFrappeEnquiries(
  database: Kysely<FrappeDatabase>,
  defaults: FrappeSettings,
  encryptionSecret: string,
  query: LiveEnquiryQuery,
  employeeCode: string | null,
  canViewAll: boolean
) {
  const repository = new FrappeConnectionRepository(database);
  if ((await repository.provider("crm.enquiries")) !== "frappe")
    throw AppError.conflict("CRM Enquiries is set to Local.");
  const saved = await repository.credentials(encryptionSecret);
  if (!saved || saved.row.verification_status !== "verified" || !saved.settings.enabled)
    throw AppError.conflict("The live Frappe connection is not verified and enabled.");
  const filters: Array<[string, string, string]> = [];
  if (query.scope !== "all" || !canViewAll) {
    if (!employeeCode)
      throw AppError.forbidden("Map this CRM user to a Frappe employee to view live enquiries.");
    if (query.scope !== "all")
      filters.push([
        query.scope === "assigned" ? "assigned_to_employee" : "user_employee",
        "=",
        employeeCode
      ]);
  }
  if (query.search) filters.push(["title", "like", `%${query.search}%`]);
  if (query.status)
    filters.push([
      "status",
      query.status === "none" ? "is" : "=",
      query.status === "none" ? "not set" : query.status
    ]);
  if (query.group)
    filters.push([
      "group",
      query.group === "none" ? "is" : "=",
      query.group === "none" ? "not set" : query.group
    ]);
  if (query.creator)
    filters.push([
      "user_employee",
      query.creator === "none" ? "is" : "=",
      query.creator === "none" ? "not set" : query.creator
    ]);
  if (query.assignee)
    filters.push([
      "assigned_to_employee",
      query.assignee === "none" ? "is" : "=",
      query.assignee === "none" ? "not set" : query.assignee
    ]);
  if (query.fromDate) filters.push(["date", ">=", query.fromDate]);
  if (query.toDate) filters.push(["date", "<=", query.toDate]);
  const params = new URLSearchParams({
    fields: JSON.stringify(fields),
    filters: JSON.stringify(filters),
    limit_start: String((query.page - 1) * query.pageSize),
    limit_page_length: String(query.pageSize + 1),
    order_by: "creation desc"
  });
  if (query.scope === "all" && !canViewAll)
    params.set(
      "or_filters",
      JSON.stringify([
        ["assigned_to_employee", "=", employeeCode],
        ["user_employee", "=", employeeCode]
      ])
    );
  const [response, groupedStatuses] = await Promise.all([
    requestFrappe<{ data?: RemoteEnquiry[] }>(
      `/api/resource/Enquiry?${params}`,
      "GET",
      saved.settings ?? defaults
    ),
    aggregateFrappeEnquiries(
      saved.settings ?? defaults,
      ["status"],
      filters.filter((filter) => filter[0] !== "status"),
      employeeCode,
      canViewAll
    )
  ]);
  if (!Array.isArray(response.data))
    throw new AppError({
      code: "FRAPPE_RESPONSE_INVALID",
      message: "Frappe did not return an enquiry list.",
      statusCode: 502
    });
  const remote = response.data;
  const statusCounts = groupedStatuses.map((row) => ({
    code: row.status ? String(row.status) : "none",
    count: row.count
  }));
  const total = query.status
    ? (statusCounts.find((row) => row.code === query.status)?.count ?? 0)
    : statusCounts.reduce((sum, row) => sum + row.count, 0);
  return {
    source: "frappe" as const,
    page: query.page,
    pageSize: query.pageSize,
    hasMore: remote.length > query.pageSize,
    total,
    statusCounts,
    items: remote.slice(0, query.pageSize).map((item) => ({
      name: item.name,
      title: item.title || item.name,
      details: item.enquiry_details || "",
      customer: item.customer || null,
      mobile: item.mobile || null,
      date: item.date || null,
      dueDate: item.due_date || null,
      group: item.group || null,
      creator: item.user_employee || null,
      assignee: item.assigned_to_employee || null,
      priority: item.priority || null,
      status: item.status || null,
      statusDetails: item.status_details || null,
      createdAt: item.creation || null,
      modifiedAt: item.modified || null
    }))
  };
}
