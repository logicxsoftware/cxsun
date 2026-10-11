import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";
import { BellRing } from "lucide-react";
import { WorkspaceTable } from "@cxsun/ui/workspace/table";
import { WorkspaceRowActions } from "@cxsun/ui/workspace/row-actions";
import { CrmStatusBadge, prioritySwatch } from "../../crm-colors";
import { EnquiryInlineFilter } from "./enquiry.inline-filter";
import { enquiryTableText } from "./enquiry.table-text";
import { formatListDueDate } from "./enquiry.view-utils";
import type { EnquiryColumnFilters, LiveEnquiryRecord } from "./enquiry.types";

const filterColumns: Record<string, { key: keyof EnquiryColumnFilters; label: string }> = {
  customer: { key: "customer", label: "Customer" },
  details: { key: "details", label: "Enquiry details" },
  listIn: { key: "listIn", label: "List in" },
  dueDate: { key: "dueDate", label: "Due date" },
  priority: { key: "priority", label: "Priority" },
  creator: { key: "creator", label: "Creator" },
  assignedTo: { key: "assignedTo", label: "Assigned to" },
  status: { key: "status", label: "Status" }
};

export function LiveEnquiryList({
  records,
  visibleColumns,
  showInlineFilters,
  columnFilters,
  onColumnFilterChange,
  onHideInlineFilters,
  userColumnMode,
  showActions,
  loading,
  onShow
}: {
  records: LiveEnquiryRecord[];
  visibleColumns: Record<string, boolean>;
  showInlineFilters: boolean;
  columnFilters: EnquiryColumnFilters;
  onColumnFilterChange: (column: keyof EnquiryColumnFilters, value: string) => void;
  onHideInlineFilters: () => void;
  userColumnMode: "creator" | "allocatedTo" | "both";
  showActions: boolean;
  loading: boolean;
  onShow: (record: LiveEnquiryRecord) => void;
}) {
  const columns: ColumnDef<LiveEnquiryRecord>[] = [
    {
      id: "enquiryNo",
      accessorKey: "name",
      header: "ID",
      cell: ({ row }) => (
        <button
          className="cursor-pointer font-medium text-foreground hover:underline"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onShow(row.original);
          }}
        >
          {row.original.name}
        </button>
      )
    },
    {
      id: "customer",
      header: "Customer",
      accessorFn: (record) => record.customer ?? record.mobile ?? "",
      cell: ({ row }) => row.original.customer ?? row.original.mobile ?? "—"
    },
    {
      id: "details",
      accessorKey: "title",
      header: "Enquiry details",
      cell: ({ row }) =>
        colorCode(row.original.status ?? "") === "new" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
            <BellRing className="size-3.5" /> New call
          </span>
        ) : (
          <button
            className="block max-w-80 cursor-pointer truncate text-left font-medium text-foreground hover:underline"
            title={enquiryTableText(row.original.details || row.original.title)}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onShow(row.original);
            }}
          >
            {enquiryTableText(row.original.title) || "—"}
          </button>
        )
    },
    {
      id: "listIn",
      accessorKey: "group",
      header: "List in",
      cell: ({ row }) => row.original.group ?? "—"
    },
    {
      id: "dueDate",
      accessorKey: "dueDate",
      header: "Due date",
      cell: ({ row }) => formatListDueDate(row.original.dueDate)
    },
    {
      id: "priority",
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.original.priority ?? "";
        return (
          <span
            className={`inline-block size-3 rounded-full ${prioritySwatch(colorCode(priority))}`}
            title={`${priority || "Unknown"} priority`}
          >
            <span className="sr-only">{priority || "Unknown"} priority</span>
          </span>
        );
      }
    },
    {
      id: "creator",
      accessorKey: "creator",
      header: "Creator",
      cell: ({ row }) => row.original.creator ?? "—"
    },
    {
      id: "assignedTo",
      accessorKey: "assignee",
      header: userColumnMode === "allocatedTo" ? "Allocated to" : "Assigned to",
      cell: ({ row }) => row.original.assignee ?? "—"
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <CrmStatusBadge
          code={colorCode(row.original.status ?? "")}
          label={row.original.status || "—"}
        />
      )
    },
    {
      id: "actions",
      header: "Action",
      enableSorting: false,
      cell: ({ row }) => (
        <div
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <WorkspaceRowActions
            title={`Enquiry ${row.original.name}`}
            onView={() => onShow(row.original)}
          />
        </div>
      )
    }
  ];
  return (
    <WorkspaceTable
      columns={columns.filter((column) => {
        if (column.id === "creator" && userColumnMode === "allocatedTo") return false;
        if (column.id === "assignedTo" && userColumnMode === "creator") return false;
        if (column.id === "actions") return showActions;
        return column.id === "enquiryNo" || visibleColumns[column.id ?? ""] !== false;
      })}
      data={records}
      {...(showInlineFilters
        ? {
            filterRow: (columnId: string) => {
              const filter = filterColumns[columnId];
              return filter ? (
                <EnquiryInlineFilter
                  label={filter.label}
                  value={columnFilters[filter.key] ?? ""}
                  onChange={(value) => onColumnFilterChange(filter.key, value)}
                  onHide={onHideInlineFilters}
                />
              ) : null;
            }
          }
        : {})}
      emptyState="No enquiries found."
      isLoading={loading}
      minWidth="1020px"
      onRowClick={onShow}
    />
  );
}

function colorCode(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}
