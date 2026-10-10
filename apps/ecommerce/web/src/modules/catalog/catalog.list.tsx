import { WorkspaceTable } from "@cxsun/ui/workspace/table";
import { WorkspaceStatusBadge } from "@cxsun/ui/workspace/status";
import { WorkspaceRowActions } from "@cxsun/ui/workspace/row-actions";
import type { CatalogCapabilities, CatalogRecord } from "./catalog.types";
export function CatalogList({
  records,
  loading,
  permissions,
  onView,
  onEdit,
  onStatus,
  onRemove
}: {
  records: CatalogRecord[];
  loading: boolean;
  permissions: CatalogCapabilities;
  onView: (record: CatalogRecord) => void;
  onEdit: (record: CatalogRecord) => void;
  onStatus: (record: CatalogRecord) => void;
  onRemove: (record: CatalogRecord) => void;
}) {
  return (
    <WorkspaceTable
      data={records}
      isLoading={loading}
      emptyState="No catalog entries found. Add an existing Core product to get started."
      onRowClick={onView}
      columns={[
        {
          accessorKey: "title",
          header: "Title",
          cell: ({ row }) => (
            <div>
              <p className="font-medium">{row.original.title}</p>
              <p className="text-xs text-muted-foreground">
                {row.original.product.name} · {row.original.sku}
              </p>
            </div>
          )
        },
        {
          id: "category",
          header: "Core category",
          accessorFn: (record) => record.product.categoryName ?? "Uncategorised"
        },
        {
          accessorKey: "price",
          header: "Price",
          cell: ({ row }) => `${row.original.currency} ${row.original.price.toFixed(2)}`
        },
        {
          accessorKey: "published",
          header: "Publication",
          cell: ({ row }) => (
            <WorkspaceStatusBadge
              label={
                row.original.available
                  ? "Available"
                  : row.original.published
                    ? "Unavailable parent"
                    : "Draft"
              }
              tone={row.original.available ? "success" : "neutral"}
            />
          )
        },
        {
          accessorKey: "status",
          header: "Status",
          cell: ({ row }) => (
            <WorkspaceStatusBadge
              label={row.original.status === "active" ? "Active" : "Inactive"}
              tone={row.original.status === "active" ? "success" : "neutral"}
            />
          )
        },
        {
          id: "actions",
          header: "Actions",
          enableSorting: false,
          cell: ({ row }) => (
            <div onClick={(event) => event.stopPropagation()}>
              <WorkspaceRowActions
                title={row.original.title}
                onView={() => onView(row.original)}
                {...(permissions.edit ? { onEdit: () => onEdit(row.original) } : {})}
                isSuspended={row.original.status !== "active"}
                {...(permissions.status
                  ? {
                      onDelete: () => onStatus(row.original),
                      onRestore: () => onStatus(row.original)
                    }
                  : {})}
                actions={
                  permissions.remove &&
                  row.original.status === "inactive" &&
                  !row.original.published
                    ? [
                        {
                          id: "force-delete",
                          label: "Force delete",
                          tone: "destructive",
                          onSelect: () => onRemove(row.original)
                        }
                      ]
                    : []
                }
              />
            </div>
          )
        }
      ]}
    />
  );
}
