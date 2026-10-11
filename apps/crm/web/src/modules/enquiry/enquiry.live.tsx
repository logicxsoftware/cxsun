import { useDeferredValue, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@cxsun/ui/components/button";
import { WorkspaceFilters } from "@cxsun/ui/workspace/filters";
import { WorkspacePage } from "@cxsun/ui/workspace/page";
import { WorkspacePagination } from "@cxsun/ui/workspace/pagination";
import { buildShowingLabel } from "@cxsun/ui/workspace/utils";
import { crmRequest } from "../../crm-request";
import { enquiryFilterOptions, type EnquiryScope } from "./enquiry.filters";
import { LiveEnquiryList } from "./enquiry.live-list";
import { LiveEnquiryShow } from "./enquiry.live-show";
import type { EnquiryColumnFilters, EnquiryReportFilters, LiveEnquiryPage } from "./enquiry.types";

const columnOptions = [
  { id: "customer", label: "Customer" },
  { id: "details", label: "Enquiry details" },
  { id: "listIn", label: "List in" },
  { id: "dueDate", label: "Due date" },
  { id: "priority", label: "Priority" },
  { id: "creator", label: "Creator" },
  { id: "assignedTo", label: "Assigned to" },
  { id: "status", label: "Status" }
];

export function FrappeLiveEnquiries({
  scope,
  initialRecordName,
  onOpenEnquiry,
  onCloseEnquiry,
  reportFilters,
  onBackToReports,
  mobileFilter,
  onClearMobileFilter
}: {
  scope: EnquiryScope;
  initialRecordName?: string | undefined;
  onOpenEnquiry?: ((name: string) => void) | undefined;
  onCloseEnquiry?: (() => void) | undefined;
  reportFilters?: EnquiryReportFilters | undefined;
  onBackToReports?: (() => void) | undefined;
  mobileFilter?: { mobile: string; contactId: number | null } | undefined;
  onClearMobileFilter?: (() => void) | undefined;
}) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [search, setSearch] = useState("");
  const [showInlineFilters, setShowInlineFilters] = useState(false);
  const [columnFilters, setColumnFilters] = useState<EnquiryColumnFilters>({});
  const [status, setStatus] = useState(reportFilters?.filter ?? "all");
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({});
  const deferredSearch = useDeferredValue(search.trim());
  const deferredColumnFilters = useDeferredValue(columnFilters);
  const query = useQuery({
    enabled: !initialRecordName,
    queryKey: [
      "crm",
      "enquiries",
      "frappe-live",
      scope,
      page,
      rowsPerPage,
      deferredSearch,
      mobileFilter?.mobile,
      deferredColumnFilters,
      status,
      reportFilters
    ],
    queryFn: () => {
      const params = new URLSearchParams({
        scope,
        page: String(page),
        pageSize: String(rowsPerPage),
        search: deferredSearch,
        filter: status
      });
      if (mobileFilter?.mobile) params.set("mobile", mobileFilter.mobile);
      const searchParams: Record<keyof EnquiryColumnFilters, string> = {
        customer: "searchCustomer",
        details: "searchDetails",
        listIn: "searchListIn",
        dueDate: "searchDueDate",
        priority: "searchPriority",
        creator: "searchCreator",
        assignedTo: "searchAssignedTo",
        status: "searchStatus"
      };
      for (const [column, key] of Object.entries(searchParams)) {
        const value = deferredColumnFilters[column as keyof EnquiryColumnFilters]?.trim();
        if (value) params.set(key, value);
      }
      if (reportFilters?.group) params.set("group", reportFilters.group);
      if (reportFilters?.creatorEmployee)
        params.set("creatorEmployee", reportFilters.creatorEmployee);
      if (reportFilters?.assigneeEmployee)
        params.set("assigneeEmployee", reportFilters.assigneeEmployee);
      if (reportFilters?.fromDate) params.set("fromDate", reportFilters.fromDate);
      if (reportFilters?.toDate) params.set("toDate", reportFilters.toDate);
      return crmRequest<LiveEnquiryPage>(`/crm/enquiries?${params}`);
    }
  });
  const data = query.error ? undefined : query.data;
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const statusCounts = data?.statusCounts ?? [];
  const activeColumnFilters = Object.values(columnFilters).filter((value) => value?.trim()).length;
  const filterOptions = enquiryFilterOptions(
    statusCounts,
    statusCounts.map((item, index) => ({
      id: index + 1,
      code: item.code,
      name: item.code === "none" ? "No status" : item.code,
      status: "active" as const
    }))
  );
  const reportContext = reportFilters
    ? [
        reportFilters.fromDate && `From ${reportFilters.fromDate}`,
        reportFilters.toDate && `To ${reportFilters.toDate}`,
        reportFilters.group &&
          `List in: ${reportFilters.group === "none" ? "(no group)" : reportFilters.group}`,
        reportFilters.creatorEmployee && `Creator: ${reportFilters.creatorEmployee}`,
        reportFilters.assigneeEmployee &&
          `Assignee: ${reportFilters.assigneeEmployee === "none" ? "Unassigned" : reportFilters.assigneeEmployee}`,
        status !== "all" && `Status: ${status}`
      ]
        .filter(Boolean)
        .join(" · ")
    : "";
  useEffect(() => {
    if (data && page > totalPages) setPage(totalPages);
  }, [data, page, totalPages]);
  if (initialRecordName)
    return <LiveEnquiryShow name={initialRecordName} onBack={onCloseEnquiry} />;
  return (
    <WorkspacePage
      title=""
      className="pt-0 lg:pt-0"
      technicalName={`page.crm.${scope}.enquiries.list`}
    >
      {reportFilters ? (
        <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 px-4 py-2 text-sm">
          <span>Report results{reportContext ? ` · ${reportContext}` : ""}</span>
          <Button type="button" variant="outline" onClick={onBackToReports}>
            Back to reports
          </Button>
        </div>
      ) : null}
      {mobileFilter ? (
        <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 px-4 py-2 text-sm">
          <span>Enquiries for mobile {mobileFilter.mobile}</span>
          <Button type="button" variant="outline" onClick={onClearMobileFilter}>
            Clear mobile filter
          </Button>
        </div>
      ) : null}
      <WorkspaceFilters
        toolbarAction={
          <Button
            aria-label="Toggle column search filters"
            aria-pressed={showInlineFilters}
            className="h-8 min-w-8 gap-1 px-2"
            title="Toggle column search filters"
            type="button"
            variant={showInlineFilters ? "default" : "outline"}
            onClick={() => setShowInlineFilters((open) => !open)}
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            {activeColumnFilters > 0 ? (
              <span className="text-xs">{activeColumnFilters}</span>
            ) : null}
          </Button>
        }
        columnOptions={columnOptions
          .filter(
            (column) =>
              (column.id !== "creator" || scope !== "created") &&
              (column.id !== "assignedTo" || scope !== "assigned")
          )
          .map((column) => ({
            ...column,
            label:
              column.id === "assignedTo" && scope === "created" ? "Allocated to" : column.label,
            checked: visibleColumns[column.id] !== false,
            onCheckedChange: (checked) => {
              setVisibleColumns((current) => ({ ...current, [column.id]: checked }));
              if (!checked) {
                setColumnFilters((current) => {
                  const next = { ...current };
                  delete next[column.id as keyof EnquiryColumnFilters];
                  return next;
                });
                setPage(1);
              }
            }
          }))}
        onShowAllColumns={() => setVisibleColumns({})}
        searchPlaceholder="Search ID, details, phone, or customer"
        searchValue={search}
        onSearchValueChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        filterValue={status}
        showSelectedFilterChip
        onFilterValueChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        filterOptions={filterOptions}
      />
      {query.error ? (
        <p role="alert" className="text-sm text-destructive">
          {query.error.message}
        </p>
      ) : null}
      <LiveEnquiryList
        records={data?.items ?? []}
        showInlineFilters={showInlineFilters}
        columnFilters={columnFilters}
        onColumnFilterChange={(column, value) => {
          setColumnFilters((current) => ({ ...current, [column]: value }));
          setPage(1);
        }}
        onHideInlineFilters={() => setShowInlineFilters(false)}
        showActions={scope !== "assigned"}
        userColumnMode={
          scope === "assigned" ? "creator" : scope === "created" ? "allocatedTo" : "both"
        }
        visibleColumns={visibleColumns}
        loading={query.isLoading}
        onShow={(record) => onOpenEnquiry?.(record.name)}
      />
      {totalPages > 1 ? (
        <WorkspacePagination
          page={currentPage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[20, 50, 100]}
          showingLabel={buildShowingLabel(currentPage, rowsPerPage, total)}
          singularLabel="enquiry"
          totalCount={total}
          totalPages={totalPages}
          onNextPage={() => setPage((value) => Math.min(totalPages, value + 1))}
          onPageChange={setPage}
          onPreviousPage={() => setPage((value) => Math.max(1, value - 1))}
          onRowsPerPageChange={(value) => {
            setRowsPerPage(value);
            setPage(1);
          }}
        />
      ) : null}
    </WorkspacePage>
  );
}
