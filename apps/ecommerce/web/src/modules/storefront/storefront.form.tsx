import { useState } from "react";
import { Button } from "@cxsun/ui/components/button";
import { Input } from "@cxsun/ui/components/input";
import { WorkspaceFormField, WorkspaceFormGrid } from "@cxsun/ui/workspace/upsert";
import { WorkspaceSwitchCard } from "@cxsun/ui/workspace/status";
import { storeConfigSchema } from "./storefront.schema";
import type { StoreConfig, StoreConfigInput } from "./storefront.types";
export function StorefrontForm({
  config,
  disabled,
  busy,
  onSave
}: {
  config: StoreConfig;
  disabled: boolean;
  busy: boolean;
  onSave: (input: StoreConfigInput) => void;
}) {
  const { uuid: _, ...initial } = config;
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = storeConfigSchema.safeParse(form);
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message ?? "Check your settings");
          return;
        }
        setError("");
        onSave(parsed.data);
      }}
    >
      <WorkspaceFormGrid>
        {(
          [
            { key: "brandName", label: "Store name" },
            { key: "tagline", label: "Tagline" },
            { key: "location", label: "Location" },
            { key: "phone", label: "Phone" },
            { key: "email", label: "Email" },
            { key: "logoUrl", label: "Logo URL" },
            { key: "industryKey", label: "Industry key" },
            { key: "industryName", label: "Industry name" }
          ] as const
        ).map(({ key, label }) => (
          <WorkspaceFormField key={key} label={label}>
            <Input
              aria-label={label}
              value={form[key]}
              disabled={disabled || busy}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </WorkspaceFormField>
        ))}
      </WorkspaceFormGrid>
      <WorkspaceSwitchCard
        label="Public storefront"
        ariaLabel="Public storefront"
        checked={form.enabled}
        disabled={disabled || busy}
        onCheckedChange={(enabled) => setForm({ ...form, enabled })}
      />
      <p className="text-sm text-muted-foreground">
        Only published, active catalog entries with active Core products and categories are shown.
        Enable only after reviewing the catalog.
      </p>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      <Button disabled={disabled || busy}>{busy ? "Saving…" : "Save storefront settings"}</Button>
    </form>
  );
}
