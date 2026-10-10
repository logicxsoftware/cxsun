import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";
import { WorkspaceTable } from "@cxsun/ui/workspace/table";
import { WorkspaceRowActions } from "@cxsun/ui/workspace/row-actions";
import { CrmStatusBadge, prioritySwatch } from "../../crm-colors";
import { enquiryTableText } from "./enquiry.table-text";
import type { LiveEnquiryRecord } from "./enquiry.types";

export function LiveEnquiryList({
  records,
  visibleColumns,
  userColumnMode,
  showActions,
  loading,
  onShow
}: {
  records: LiveEnquiryRecord[];
  visibleColumns: Record<string, boolean>;
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
      cell: ({ row }) => (
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
      cell: ({ row }) => row.original.dueDate ?? "—"
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
