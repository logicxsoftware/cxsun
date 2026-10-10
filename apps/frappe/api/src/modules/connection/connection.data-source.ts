import { AppError } from "@cxsun/framework/errors";
import type { EnquiryRemoteSource, LiveEnquiryQuery } from "@cxsun/crm-api";
import type { Kysely } from "kysely";
import { FrappeConnectionRepository } from "./connection.repository.js";
import { listLiveFrappeEnquiries } from "./connection.live-enquiries.js";
import type { FrappeDatabase, FrappeSettings } from "./connection.types.js";
import { aggregateFrappeEnquiries } from "./connection.aggregate-enquiries.js";

export class FrappeCrmEnquirySource implements EnquiryRemoteSource {
  private readonly repository: FrappeConnectionRepository;

  constructor(
    private readonly database: Kysely<FrappeDatabase>,
    private readonly settings: FrappeSettings,
    private readonly encryptionSecret: string,
    private readonly frappeEnabled: boolean,
    private readonly actorEmail: string,
    private readonly canViewAll: boolean,
    private readonly mappedEmployeeCode: (email: string, baseUrl: string) => Promise<string | null>
  ) {
    this.repository = new FrappeConnectionRepository(database);
  }

  provider() {
    return this.frappeEnabled
      ? this.repository.provider("crm.enquiries")
      : Promise.resolve("local" as const);
  }

  async list(query: LiveEnquiryQuery) {
    if (!this.frappeEnabled) throw AppError.forbidden("Frappe is not enabled for this tenant.");
    const connection = await this.repository.connection();
    const employee =
      query.scope === "all" && this.canViewAll
        ? null
        : await this.mappedEmployeeCode(this.actorEmail, connection?.base_url ?? "");
    return listLiveFrappeEnquiries(
      this.database,
      this.settings,
      this.encryptionSecret,
      query,
      employee,
      this.canViewAll
    );
  }

  async report(query: {
    view: "list-in" | "creator" | "assignee" | "status";
    fromDate?: string | undefined;
    toDate?: string | undefined;
    assignee?: string | undefined;
  }) {
    const settings = await this.verifiedSettings();
    const employee = await this.employeeCode(settings.baseUrl);
    const field = {
      "list-in": "group",
      creator: "user_employee",
      assignee: "assigned_to_employee",
      status: "status"
    }[query.view];
    const filters: Array<[string, string, string]> = [];
    if (query.fromDate) filters.push(["date", ">=", query.fromDate]);
    if (query.toDate) filters.push(["date", "<=", query.toDate]);
    if (query.assignee)
      filters.push([
        "assigned_to_employee",
        query.assignee === "none" ? "is" : "=",
        query.assignee === "none" ? "not set" : query.assignee
      ]);
    const rows = await aggregateFrappeEnquiries(
      settings,
      query.view === "status" ? ["status"] : [field, "status"],
      filters,
      employee,
      this.canViewAll
    );
    return rows.map((row) => ({
      group: row[field] ? String(row[field]) : null,
      status: row.status ? String(row.status) : null,
      count: row.count
    }));
  }

  async summary(_today: string) {
    const settings = await this.verifiedSettings();
    const employee = await this.employeeCode(settings.baseUrl);
    if (!employee)
      throw AppError.forbidden(
        "Map this CRM user to a Frappe employee to view personal live totals."
      );
    const grouped = async (
      field: "status" | "priority",
      filters: Array<[string, string, string]>
    ) => aggregateFrappeEnquiries(settings, [field], filters, employee, this.canViewAll);
    const [allStatuses, assignedStatuses, assignedPriorities, createdStatuses, createdPriorities] =
      await Promise.all([
        grouped("status", []),
        grouped("status", [["assigned_to_employee", "=", employee ?? ""]]),
        grouped("priority", [["assigned_to_employee", "=", employee ?? ""]]),
        grouped("status", [["user_employee", "=", employee ?? ""]]),
        grouped("priority", [["user_employee", "=", employee ?? ""]])
      ]);
    const scope = (statuses: typeof assignedStatuses, priorities: typeof assignedPriorities) => ({
      total: statuses.reduce((total, row) => total + row.count, 0),
      statusCounts: statuses.map((row) => ({ code: String(row.status ?? ""), count: row.count })),
      priorityCounts: priorities.map((row) => ({
        code: String(row.priority ?? ""),
        count: row.count
      }))
    });
    return {
      allCount: allStatuses.reduce((total, row) => total + row.count, 0),
      assigned: scope(assignedStatuses, assignedPriorities),
      created: scope(createdStatuses, createdPriorities)
    };
  }

  private async verifiedSettings() {
    if (!this.frappeEnabled || (await this.provider()) !== "frappe")
      throw AppError.conflict("CRM Enquiries is set to Local.");
    const saved = await this.repository.credentials(this.encryptionSecret);
    if (!saved || saved.row.verification_status !== "verified" || !saved.settings.enabled)
      throw AppError.conflict("The live Frappe connection is not verified and enabled.");
    return saved.settings;
  }

  private async employeeCode(baseUrl: string) {
    const employee = await this.mappedEmployeeCode(this.actorEmail, baseUrl);
    if (!employee && !this.canViewAll)
      throw AppError.forbidden("Map this CRM user to a Frappe employee to view live enquiries.");
    return employee;
  }
}
