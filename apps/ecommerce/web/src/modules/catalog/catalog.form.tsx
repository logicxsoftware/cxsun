import { useState } from "react";
import { Button } from "@cxsun/ui/components/button";
import { Input } from "@cxsun/ui/components/input";
import { Textarea } from "@cxsun/ui/components/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@cxsun/ui/components/dialog";
import { WorkspaceLookup } from "@cxsun/ui/workspace/lookup";
import { WorkspaceSwitchCard } from "@cxsun/ui/workspace/status";
import {
  WorkspaceFormBanner,
  WorkspaceFormField,
  WorkspaceFormGrid
} from "@cxsun/ui/workspace/upsert";
import { catalogSchema } from "./catalog.schema";
import type { CatalogInput, CatalogLookups, CatalogRecord } from "./catalog.types";
export function CatalogForm({
  record,
  lookups,
  loading,
  error,
  onCancel,
  onSubmit
}: {
  record: CatalogRecord | null;
  lookups: CatalogLookups;
  loading: boolean;
  error: string;
  onCancel: () => void;
  onSubmit: (input: CatalogInput) => void;
}) {
  const [form, setForm] = useState<CatalogInput>(() =>
    record
      ? {
          productId: record.productId,
          title: record.title,
          slug: record.slug,
          sku: record.sku,
          description: record.description,
          price: record.price,
          compareAtPrice: record.compareAtPrice,
          currency: record.currency,
          imageUrl: record.imageUrl,
          imageAlt: record.imageAlt,
          seoTitle: record.seoTitle,
          seoDescription: record.seoDescription,
          published: record.published,
          featured: record.featured
        }
      : {
          productId: 0,
          title: "",
          slug: "",
          sku: "",
          description: "",
          price: 0,
          compareAtPrice: null,
          currency: "INR",
          imageUrl: "",
          imageAlt: "",
          seoTitle: "",
          seoDescription: "",
          published: false,
          featured: false
        }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  function field<Key extends keyof CatalogInput>(key: Key, value: CatalogInput[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }
  const selected = lookups.products.find((product) => product.id === form.productId);
  function text(
    key:
      | "title"
      | "slug"
      | "sku"
      | "currency"
      | "imageUrl"
      | "imageAlt"
      | "seoTitle"
      | "seoDescription",
    label: string,
    required = false
  ) {
    return (
      <WorkspaceFormField label={label} required={required}>
        <Input
          aria-label={label}
          aria-invalid={!!errors[key]}
          value={form[key]}
          onChange={(event) => field(key, event.target.value)}
          disabled={loading}
        />
        <FieldError message={errors[key]} />
      </WorkspaceFormField>
    );
  }
  return (
    <Dialog open onOpenChange={(open) => !open && !loading && onCancel()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{record ? "Edit catalog entry" : "New catalog entry"}</DialogTitle>
          <DialogDescription>
            Select an existing Core product. Its category, unit, and tax remain managed in Core.
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            const result = catalogSchema.safeParse(form);
            if (!result.success) {
              const next: Record<string, string> = {};
              for (const issue of result.error.issues) next[String(issue.path[0])] = issue.message;
              setErrors(next);
              return;
            }
            onSubmit(result.data);
          }}
          className="space-y-5"
        >
          {error ? (
            <WorkspaceFormBanner title="Unable to save catalog entry">{error}</WorkspaceFormBanner>
          ) : null}
          <WorkspaceFormGrid>
            <WorkspaceFormField label="Core product" required>
              <WorkspaceLookup
                allowTextValue={false}
                required
                disabled={loading}
                invalid={!!errors.productId}
                options={lookups.products
                  .filter(
                    (product) =>
                      (product.active && product.name.trim() !== "-") ||
                      product.id === form.productId
                  )
                  .map((product) => ({
                    value: String(product.id),
                    label: product.name,
                    description: product.categoryName ?? "Uncategorised"
                  }))}
                value={form.productId ? String(form.productId) : ""}
                showAllOptionsOnFocus
                onValueChange={(value) => field("productId", value ? Number(value) : 0)}
              />
              <FieldError message={errors.productId} />
            </WorkspaceFormField>
            <WorkspaceFormField label="Core category">
              <p className="py-2 text-sm">
                {selected?.categoryName ?? "No category selected in Core"}
              </p>
              <p className="text-xs text-muted-foreground">
                Unit: {selected?.unitName ?? "—"} · Tax: {selected?.taxRate ?? "—"}%
              </p>
            </WorkspaceFormField>
            {text("title", "Storefront title", true)}
            {text("slug", "Slug", true)}
            {text("sku", "SKU", true)}
            {text("currency", "Currency", true)}
            <WorkspaceFormField label="Selling price" required>
              <Input
                aria-label="Selling price"
                type="number"
                min="0"
                step="0.01"
                value={Number.isFinite(form.price) ? form.price : ""}
                aria-invalid={!!errors.price}
                onChange={(event) =>
                  field(
                    "price",
                    event.target.value === "" ? Number.NaN : Number(event.target.value)
                  )
                }
              />
              <FieldError message={errors.price} />
            </WorkspaceFormField>
            <WorkspaceFormField label="Compare-at price">
              <Input
                aria-label="Compare-at price"
                type="number"
                min="0"
                step="0.01"
                value={form.compareAtPrice ?? ""}
                aria-invalid={!!errors.compareAtPrice}
                onChange={(event) =>
                  field(
                    "compareAtPrice",
                    event.target.value === "" ? null : Number(event.target.value)
                  )
                }
              />
              <FieldError message={errors.compareAtPrice} />
            </WorkspaceFormField>
            {text("imageUrl", "Image URL")}
            {text("imageAlt", "Image alternative text", !!form.imageUrl)}
            {text("seoTitle", "SEO title")}
            {text("seoDescription", "SEO description")}
          </WorkspaceFormGrid>
          <WorkspaceFormField label="Description">
            <Textarea
              aria-label="Description"
              value={form.description}
              onChange={(event) => field("description", event.target.value)}
            />
            <FieldError message={errors.description} />
          </WorkspaceFormField>
          <WorkspaceFormGrid>
            <CatalogToggle
              checked={form.published}
              label="Published"
              disabled={record?.status === "inactive" || loading}
              onCheckedChange={(value) => field("published", value)}
            />
            <CatalogToggle
              checked={form.featured}
              label="Featured"
              disabled={loading}
              onCheckedChange={(value) => field("featured", value)}
            />
          </WorkspaceFormGrid>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" disabled={loading} onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save catalog entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
function FieldError({ message }: { message: string | undefined }) {
  return message ? (
    <p className="text-sm text-destructive" role="alert">
      {message}
    </p>
  ) : null;
}

function CatalogToggle({
  checked,
  label,
  disabled,
  onCheckedChange
}: {
  checked: boolean;
  label: string;
  disabled: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <div
      role="button"
      aria-label={`${label} card`}
      aria-pressed={checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={(event) => {
        if (
          !disabled &&
          !(
            event.target instanceof Element &&
            event.target.closest('button, input, [role="switch"]')
          )
        )
          onCheckedChange(!checked);
      }}
      onKeyDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !disabled &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          onCheckedChange(!checked);
        }
      }}
    >
      <WorkspaceSwitchCard
        checked={checked}
        label={label}
        ariaLabel={label}
        className="h-11"
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}
