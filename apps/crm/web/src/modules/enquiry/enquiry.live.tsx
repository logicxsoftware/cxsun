import { useDeferredValue, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@cxsun/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@cxsun/ui/components/dialog";
import { WorkspaceFilters } from "@cxsun/ui/workspace/filters";
import { WorkspacePage } from "@cxsun/ui/workspace/page";
import { WorkspacePagination } from "@cxsun/ui/workspace/pagination";
import { buildShowingLabel } from "@cxsun/ui/workspace/utils";
import { crmRequest } from "../../crm-request";
import type { EnquiryScope } from "./enquiry.filters";
import { LiveEnquiryList } from "./enquiry.live-list";
import { enquiryTableText } from "./enquiry.table-text";
import type { EnquiryReportFilters, LiveEnquiryPage, LiveEnquiryRecord } from "./enquiry.types";

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
  reportFilters,
  onBackToReports
}: {
  scope: EnquiryScope;
  reportFilters?: EnquiryReportFilters | undefined;
  onBackToReports?: (() => void) | undefined;
}) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(reportFilters?.filter ?? "all");
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({});
  const [showing, setShowing] = useState<LiveEnquiryRecord | null>(null);
  const deferredSearch = useDeferredValue(search.trim());
  const query = useQuery({
    queryKey: [
      "crm",
      "enquiries",
      "frappe-live",
      scope,
      page,
      rowsPerPage,
      deferredSearch,
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
  const filterOptions = [
    {
      id: "all",
      label: "All calls",
      count: statusCounts.reduce((sum, item) => sum + item.count, 0)
    },
    ...statusCounts.map((item) => ({
      id: item.code,
      label: item.code === "none" ? "No status" : item.code,
      count: item.count
    }))
  ];
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
      <WorkspaceFilters
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
            onCheckedChange: (checked) =>
              setVisibleColumns((current) => ({ ...current, [column.id]: checked }))
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
        showActions={scope !== "assigned"}
        userColumnMode={
          scope === "assigned" ? "creator" : scope === "created" ? "allocatedTo" : "both"
        }
        visibleColumns={visibleColumns}
        loading={query.isLoading}
        onShow={setShowing}
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
      <LiveEnquiryDetail record={showing} onClose={() => setShowing(null)} />
    </WorkspacePage>
  );
}

function LiveEnquiryDetail({
  record,
  onClose
}: {
  record: LiveEnquiryRecord | null;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={record !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{record?.title || record?.name}</DialogTitle>
          <DialogDescription>{record?.name} · Frappe enquiry</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Detail label="Customer" value={record?.customer ?? record?.mobile} />
          <Detail label="Status" value={record?.status} />
          <Detail label="List in" value={record?.group} />
          <Detail label="Priority" value={record?.priority} />
          <Detail label="Creator" value={record?.creator} />
          <Detail label="Assigned to" value={record?.assignee} />
          <Detail label="Date" value={record?.date} />
          <Detail label="Due date" value={record?.dueDate} />
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Details</span>
          <p className="mt-1 whitespace-pre-wrap">{enquiryTableText(record?.details) || "—"}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}</span>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );
}
