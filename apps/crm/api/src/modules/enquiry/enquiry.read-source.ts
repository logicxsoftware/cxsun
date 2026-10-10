import { AppError } from "@cxsun/framework/errors";
import type { EnquiryListOptions } from "./enquiry.types.js";
import { EnquiryService } from "./enquiry.service.js";

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

export type LiveEnquiryRecord = {
  name: string;
  title: string;
  details: string;
  customer: string | null;
  mobile: string | null;
  date: string | null;
  dueDate: string | null;
  group: string | null;
  creator: string | null;
  assignee: string | null;
  priority: string | null;
  status: string | null;
  statusDetails: string | null;
  createdAt: string | null;
  modifiedAt: string | null;
};

export type LiveEnquiryPage = {
  source: "frappe";
  page: number;
  pageSize: number;
  hasMore: boolean;
  total: number;
  statusCounts: Array<{ code: string; count: number }>;
  items: LiveEnquiryRecord[];
};

export type EnquiryRemoteSource = {
  provider(): Promise<"local" | "frappe">;
  list(query: LiveEnquiryQuery): Promise<LiveEnquiryPage>;
  report(query: {
    view: "list-in" | "creator" | "assignee" | "status";
    fromDate?: string | undefined;
    toDate?: string | undefined;
    assignee?: string | undefined;
  }): Promise<Array<{ group: string | null; status: string | null; count: number }>>;
  summary(
    today: string
  ): Promise<{ allCount: number; assigned: LiveScopeSummary; created: LiveScopeSummary }>;
};

export type LiveScopeSummary = {
  total: number;
  statusCounts: Array<{ code: string; count: number }>;
  priorityCounts: Array<{ code: string; count: number }>;
};

type ReadQuery = Omit<EnquiryListOptions, "actorEmail" | "actorUserId" | "canViewAll"> & {
  group?: string | undefined;
  creatorEmployee?: string | undefined;
  assigneeEmployee?: string | undefined;
  fromDate?: string | undefined;
  toDate?: string | undefined;
};

export class EnquiryReadService {
  constructor(
    private readonly local: EnquiryService,
    private readonly remote: EnquiryRemoteSource
  ) {}

  source() {
    return this.remote.provider();
  }

  async assertLocal() {
    if ((await this.source()) !== "local") {
      throw AppError.conflict(
        "This CRM enquiry action uses Local records. Select Local before continuing."
      );
    }
  }

  async list(query: ReadQuery) {
    if ((await this.source()) === "local") {
      if (
        query.group ||
        query.creatorEmployee ||
        query.assigneeEmployee ||
        query.fromDate ||
        query.toDate
      )
        throw AppError.validation("Frappe report filters cannot filter Local enquiries.");
      return { source: "local" as const, ...(await this.local.listPage(query)) };
    }
    if (query.listInId || query.createdBy || query.assignedUserId || query.fromAt || query.toAt) {
      throw AppError.validation("Local report IDs cannot filter Frappe enquiries.");
    }
    return this.remote.list({
      scope: query.scope,
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
      ...(query.filter === "all" ? {} : { status: query.filter }),
      ...(query.group ? { group: query.group } : {}),
      ...(query.creatorEmployee ? { creator: query.creatorEmployee } : {}),
      ...(query.assigneeEmployee ? { assignee: query.assigneeEmployee } : {}),
      ...(query.fromDate ? { fromDate: query.fromDate } : {}),
      ...(query.toDate ? { toDate: query.toDate } : {})
    });
  }
}
