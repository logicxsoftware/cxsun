import { useDeferredValue, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";
import { Button } from "@cxsun/ui/components/button";
import { Input } from "@cxsun/ui/components/input";
import { WorkspacePage } from "@cxsun/ui/workspace/page";
import { WorkspaceTable } from "@cxsun/ui/workspace/table";
import { crmRequest } from "../../crm-request";
import type { EnquiryScope } from "./enquiry.filters";

type LiveRecord = {
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
type LivePage = {
  source: "frappe";
  page: number;
  pageSize: number;
  hasMore: boolean;
  items: LiveRecord[];
};

const columns: ColumnDef<LiveRecord>[] = [
  { id: "name", accessorKey: "name", header: "Frappe ID" },
  { id: "title", accessorKey: "title", header: "Enquiry" },
  {
    id: "details",
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => (
      <span className="block max-w-80 truncate" title={row.original.details}>
        {row.original.details || "—"}
      </span>
    )
  },
  {
    id: "customer",
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => row.original.customer ?? "—"
  },
  {
    id: "mobile",
    accessorKey: "mobile",
    header: "Mobile",
    cell: ({ row }) => row.original.mobile ?? "—"
  },
  {
    id: "group",
    accessorKey: "group",
    header: "List in",
    cell: ({ row }) => row.original.group ?? "—"
  },
  {
    id: "dueDate",
    accessorKey: "dueDate",
    header: "Due date",
    cell: ({ row }) => row.original.dueDate ?? "—"
  },
  {
    id: "creator",
    accessorKey: "creator",
    header: "Creator",
    cell: ({ row }) => row.original.creator ?? "—"
  },
  {
    id: "assignee",
    accessorKey: "assignee",
    header: "Assignee",
    cell: ({ row }) => row.original.assignee ?? "—"
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => row.original.status ?? "—"
  }
];

export function FrappeLiveEnquiries({ scope }: { scope: EnquiryScope }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const query = useQuery({
    queryKey: ["crm", "enquiries", "frappe-live", scope, page, deferredSearch, status],
    queryFn: () => {
      const params = new URLSearchParams({
        scope,
        page: String(page),
        pageSize: "50",
        search: deferredSearch
      });
      if (status) params.set("status", status);
      return crmRequest<LivePage>(`/crm/enquiries/live?${params}`);
    }
  });
  return (
    <WorkspacePage
      title="Frappe Live enquiries"
      description="Enquiries are read directly from Frappe. Changes made in Frappe appear on refresh."
      technicalName="page.crm.enquiries.frappe-live"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Input
          className="max-w-sm"
          aria-label="Search live enquiries by title"
          placeholder="Search enquiry title"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <Input
          className="max-w-xs"
          aria-label="Filter live enquiries by status"
          placeholder="Exact Frappe status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
        />
        <Button variant="outline" onClick={() => void query.refetch()}>
          Refresh
        </Button>
      </div>
      {query.error ? (
        <p role="alert" className="text-sm text-destructive">
          {query.error.message}
        </p>
      ) : null}
      <WorkspaceTable
        columns={columns}
        data={query.data?.items ?? []}
        emptyState="No live enquiries found."
        isLoading={query.isLoading}
        minWidth="1000px"
      />
      <div className="flex items-center gap-2 text-sm">
        <span>Page {page}</span>
        <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        <Button variant="outline" disabled={!query.data?.hasMore} onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>
    </WorkspacePage>
  );
}
