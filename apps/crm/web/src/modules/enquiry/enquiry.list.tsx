import { useRef, type KeyboardEvent } from "react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";
import { BellRing } from "lucide-react";
import { Input } from "@cxsun/ui/components/input";
import { WorkspaceTable } from "@cxsun/ui/workspace/table";
import { WorkspaceRowActions } from "@cxsun/ui/workspace/row-actions";
import { CrmStatusBadge, prioritySwatch } from "../../crm-colors";
import { enquiryTableText } from "./enquiry.table-text";
import { formatListDueDate } from "./enquiry.view-utils";
import type { EnquiryColumnFilters, EnquiryLookup, EnquiryRecord } from "./enquiry.types";

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

export function EnquiryList({
  records,
  users,
  userColumnMode,
  showActions = true,
  visibleColumns,
  showInlineFilters,
  columnFilters,
  onColumnFilterChange,
  onHideInlineFilters,
  loading,
  onShow,
  onEdit,
  onOpenCall,
  openingCallId
}: {
  records: EnquiryRecord[];
  users: EnquiryLookup[];
  userColumnMode: "creator" | "allocatedTo" | "both";
  showActions?: boolean;
  visibleColumns: Record<string, boolean>;
  showInlineFilters: boolean;
  columnFilters: EnquiryColumnFilters;
  onColumnFilterChange: (column: keyof EnquiryColumnFilters, value: string) => void;
  onHideInlineFilters: () => void;
  loading: boolean;
  onShow: (record: EnquiryRecord) => void;
  onEdit: (record: EnquiryRecord) => void;
  onOpenCall: (record: EnquiryRecord) => void;
  openingCallId: number | null;
}) {
  const userNames = new Map(users.map((user) => [user.id, user.name]));
  const creatorNames = new Map<string, string>();
  for (const user of users) {
    if (user.email) creatorNames.set(user.email.toLowerCase(), user.name);
  }
  const creatorName = (record: EnquiryRecord) =>
    creatorNames.get(record.createdBy.toLowerCase()) ?? record.createdBy;
  const columns: ColumnDef<EnquiryRecord>[] = [
    {
      id: "enquiryNo",
      accessorKey: "enquiryNo",
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
          #{row.original.enquiryNo}
        </button>
      )
    },
    {
      id: "customer",
      header: "Customer",
      accessorFn: (record) => record.contactName ?? record.capturedName ?? "",
      cell: ({ row }) => row.original.contactName ?? row.original.capturedName ?? "—"
    },
    {
      id: "details",
      accessorKey: "title",
      header: "Enquiry details",
      cell: ({ row }) =>
        row.original.status === "new" ? (
          <button
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent disabled:cursor-wait"
            disabled={openingCallId === row.original.id}
            onClick={(event) => {
              event.stopPropagation();
              onOpenCall(row.original);
            }}
            title="Open this new call"
            type="button"
          >
            <BellRing className="size-3.5" /> New call
          </button>
        ) : (
          <button
            className="block max-w-80 cursor-pointer truncate text-left font-medium text-foreground hover:underline"
            title={enquiryTableText(row.original.description ?? row.original.title)}
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
      accessorKey: "listIn",
      header: "List in",
      cell: ({ row }) => row.original.listIn ?? "—"
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
      cell: ({ row }) => (
        <span
          className={`inline-block size-3 rounded-full ${prioritySwatch(row.original.priority)}`}
          title={`${row.original.priorityName} priority`}
        >
          <span className="sr-only">{row.original.priorityName} priority</span>
        </span>
      )
    },
    {
      id: "creator",
      header: "Creator",
      accessorFn: creatorName,
      cell: ({ row }) => creatorName(row.original)
    },
    {
      id: "assignedTo",
      header: userColumnMode === "allocatedTo" ? "Allocated to" : "Assigned to",
      accessorFn: (record) =>
        record.assignedUserId ? (userNames.get(record.assignedUserId) ?? "") : "",
      cell: ({ row }) =>
        row.original.assignedUserId
          ? (userNames.get(row.original.assignedUserId) ?? `#${row.original.assignedUserId}`)
          : "—"
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <CrmStatusBadge code={row.original.status} label={row.original.statusName} />
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
            title={`Enquiry #${row.original.enquiryNo}`}
            onEdit={() => onEdit(row.original)}
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
                <InlineFilterInput
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

function InlineFilterInput({
  label,
  value,
  onChange,
  onHide
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onHide: () => void;
}) {
  const escapeStep = useRef(0);

  function handleEscape(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    if (event.repeat) return;

    escapeStep.current += 1;
    if (escapeStep.current === 1) event.currentTarget.select();
    else if (escapeStep.current === 2) onChange("");
    else {
      escapeStep.current = 0;
      onHide();
    }
  }

  return (
    <Input
      aria-label={`Filter ${label}`}
      className="h-7 min-w-0 rounded-sm border-border/80 bg-white px-2 text-xs shadow-none"
      maxLength={191}
      value={value}
      onChange={(event) => {
        escapeStep.current = 0;
        onChange(event.target.value);
      }}
      onKeyDown={handleEscape}
    />
  );
}
