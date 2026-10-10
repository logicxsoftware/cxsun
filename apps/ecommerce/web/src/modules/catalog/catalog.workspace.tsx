import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@cxsun/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@cxsun/ui/components/dialog";
import { WorkspacePage } from "@cxsun/ui/workspace/page";
import { WorkspaceFilters } from "@cxsun/ui/workspace/filters";
import { WorkspaceLookup } from "@cxsun/ui/workspace/lookup";
import { WorkspacePagination } from "@cxsun/ui/workspace/pagination";
import { buildShowingLabel } from "@cxsun/ui/workspace/utils";
import { WorkspaceFormBanner } from "@cxsun/ui/workspace/upsert";
import { CatalogForm } from "./catalog.form";
import { CatalogList } from "./catalog.list";
import {
  catalogQueryKey,
  useCatalog,
  useCatalogLookups,
  useCatalogActivity
} from "./catalog.hooks";
import type { CatalogGateway } from "./catalog.services";
import type { CatalogInput, CatalogRecord } from "./catalog.types";
export function EcommerceCatalogWorkspace({ gateway }: { gateway: CatalogGateway }) {
  const client = useQueryClient();
  const query = useCatalog(gateway);
  const lookups = useCatalogLookups(gateway);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(25);
  const [editing, setEditing] = useState<CatalogRecord | null | undefined>();
  const [viewing, setViewing] = useState<CatalogRecord | null>(null);
  const [action, setAction] = useState<{ record: CatalogRecord; remove: boolean } | null>(null);
  const activity = useCatalogActivity(gateway, viewing?.uuid ?? null);
  const save = useMutation({
    mutationFn: (input: CatalogInput) =>
      editing ? gateway.update(editing.uuid, input) : gateway.create(input),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: catalogQueryKey });
      setEditing(undefined);
    }
  });
  const lifecycle = useMutation({
    mutationFn: (value: { record: CatalogRecord; remove: boolean }) =>
      value.remove
        ? gateway.remove(value.record.uuid)
        : value.record.status === "active"
          ? gateway.deactivate(value.record.uuid)
          : gateway.activate(value.record.uuid),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: catalogQueryKey });
      setAction(null);
      setViewing(null);
    }
  });
  const filtered = useMemo(
    () =>
      (query.data ?? []).filter(
        (record) =>
          (status === "all" ||
            record.status === status ||
            (status === "published" && record.published) ||
            (status === "draft" && !record.published)) &&
          (!category || record.product.categoryId === Number(category)) &&
          [
            record.title,
            record.sku,
            record.slug,
            record.product.name,
            record.product.categoryName ?? ""
          ].some((value) => value.toLowerCase().includes(search.toLowerCase().trim()))
      ),
    [query.data, search, status, category]
  );
  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const current = Math.min(page, pages);
  function edit(record: CatalogRecord | null) {
    save.reset();
    setEditing(record);
  }
  function pending(record: CatalogRecord, remove = false) {
    lifecycle.reset();
    setAction({ record, remove });
  }
  return (
    <WorkspacePage
      title="Catalog"
      description="Extend existing Core products for Ecommerce. Product categories remain linked to Core."
      technicalName="page.ecommerce.catalog.list"
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            Refresh
          </Button>
          <Button disabled={!lookups.data?.permissions.create} onClick={() => edit(null)}>
            New catalog entry
          </Button>
        </div>
      }
    >
      {query.error || lookups.error ? (
        <WorkspaceFormBanner title="Unable to load catalog">
          {(query.error ?? lookups.error)?.message}
        </WorkspaceFormBanner>
      ) : null}
      <WorkspaceFilters
        searchValue={search}
        searchPlaceholder="Search title, product, category, or SKU"
        onSearchValueChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        filterValue={status}
        onFilterValueChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        filterOptions={[
          { id: "all", label: "All entries" },
          { id: "active", label: "Active" },
          { id: "inactive", label: "Inactive" },
          { id: "published", label: "Published" },
          { id: "draft", label: "Draft" }
        ]}
      />
      <div className="mb-3 max-w-sm">
        <WorkspaceLookup
          allowTextValue={false}
          placeholder="Filter by Core category"
          value={category}
          options={(lookups.data?.categories ?? []).map((item) => ({
            value: String(item.id),
            label: item.name
          }))}
          onValueChange={(value) => {
            setCategory(value);
            setPage(1);
          }}
        />
      </div>
      <CatalogList
        permissions={
          lookups.data?.permissions ?? { create: false, edit: false, status: false, remove: false }
        }
        records={filtered.slice((current - 1) * size, current * size)}
        loading={query.isPending}
        onView={setViewing}
        onEdit={edit}
        onStatus={(record) => pending(record)}
        onRemove={(record) => pending(record, true)}
      />
      <WorkspacePagination
        page={current}
        rowsPerPage={size}
        showingLabel={buildShowingLabel(current, size, filtered.length)}
        singularLabel="catalog entry"
        totalCount={filtered.length}
        totalPages={pages}
        onPageChange={setPage}
        onNextPage={() => setPage(Math.min(pages, current + 1))}
        onPreviousPage={() => setPage(Math.max(1, current - 1))}
        onRowsPerPageChange={(value) => {
          setSize(value);
          setPage(1);
        }}
      />
      {editing !== undefined && lookups.data ? (
        <CatalogForm
          key={editing?.uuid ?? "new"}
          record={editing}
          lookups={lookups.data}
          loading={save.isPending}
          error={save.error?.message ?? ""}
          onCancel={() => {
            setEditing(undefined);
            save.reset();
          }}
          onSubmit={(input) => save.mutate(input)}
        />
      ) : null}
      <Dialog open={viewing !== null} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewing?.title ?? "Catalog details"}</DialogTitle>
            <DialogDescription>
              Storefront metadata linked to an existing Core product.
            </DialogDescription>
          </DialogHeader>
          {viewing ? (
            <div className="space-y-4">
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Core product", viewing.product.name],
                  ["Core category", viewing.product.categoryName ?? "Uncategorised"],
                  ["SKU", viewing.sku],
                  ["Slug", viewing.slug],
                  ["Price", `${viewing.currency} ${viewing.price.toFixed(2)}`],
                  ["Compare-at price", viewing.compareAtPrice?.toFixed(2) ?? "—"],
                  ["Status", viewing.status],
                  [
                    "Publication",
                    viewing.available
                      ? "Available"
                      : viewing.published
                        ? "Unavailable parent"
                        : "Draft"
                  ],
                  ["Featured", viewing.featured ? "Yes" : "No"],
                  ["SEO title", viewing.seoTitle || "—"],
                  ["SEO description", viewing.seoDescription || "—"],
                  ["Created", viewing.createdAt],
                  ["Updated", viewing.updatedAt]
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="whitespace-pre-wrap text-sm">{viewing.description}</p>
              {viewing.imageUrl ? (
                <a
                  className="text-sm underline"
                  href={viewing.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {viewing.imageAlt || "View product image"}
                </a>
              ) : null}
              <h3 className="font-medium">Activity</h3>
              {activity.error ? (
                <WorkspaceFormBanner title="Unable to load activity">
                  {activity.error.message}
                </WorkspaceFormBanner>
              ) : activity.isPending ? (
                <p role="status">Loading activity…</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {activity.data?.map((event) => (
                    <li key={event.uuid}>
                      {event.summary}
                      <p className="text-xs text-muted-foreground">
                        {event.actorEmail} · {event.createdAt}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              {lookups.data?.permissions.edit ? (
                <Button
                  onClick={() => {
                    setViewing(null);
                    edit(viewing);
                  }}
                >
                  Edit entry
                </Button>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
      <Dialog
        open={action !== null}
        onOpenChange={(open) => !open && !lifecycle.isPending && setAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action?.remove
                ? "Permanently delete catalog entry?"
                : action?.record.status === "active"
                  ? "Suspend catalog entry?"
                  : "Reactivate catalog entry?"}
            </DialogTitle>
            <DialogDescription>
              {action?.remove
                ? "The Ecommerce entry will be removed. Its Core product and category remain available."
                : "Suspending an entry also unpublishes it. Reactivating keeps it as a draft."}
            </DialogDescription>
          </DialogHeader>
          {lifecycle.error ? (
            <WorkspaceFormBanner title="Action failed">
              {lifecycle.error.message}
            </WorkspaceFormBanner>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={lifecycle.isPending}
              onClick={() => setAction(null)}
            >
              Cancel
            </Button>
            <Button
              disabled={lifecycle.isPending}
              onClick={() => action && lifecycle.mutate(action)}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </WorkspacePage>
  );
}
