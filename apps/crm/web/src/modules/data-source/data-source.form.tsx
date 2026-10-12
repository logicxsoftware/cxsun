import { DatabaseIcon, ServerIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@cxsun/ui/components/radio-group";
import { crmDataSourceProviderSchema } from "./data-source.schema";
import type { CrmDataSourceProvider } from "./data-source.types";

export function CrmDataSourceForm({
  busy,
  frappeAvailable,
  frappeReady,
  label,
  onChange,
  provider
}: {
  busy: boolean;
  frappeAvailable: boolean;
  frappeReady: boolean;
  label: string;
  onChange: (provider: CrmDataSourceProvider) => void;
  provider: CrmDataSourceProvider | null;
}) {
  return (
    <RadioGroup
      aria-label={`${label} data source`}
      className="grid grid-cols-2 gap-4"
      disabled={busy || (frappeAvailable && provider === null)}
      onValueChange={(value) => {
        const parsed = crmDataSourceProviderSchema.safeParse(value);
        if (frappeAvailable && parsed.success) onChange(parsed.data);
      }}
      value={frappeAvailable ? (provider ?? "local") : "local"}
    >
      <SourceOption icon={DatabaseIcon} label="Local" value="local" />
      <SourceOption
        disabled={!frappeAvailable || !frappeReady}
        icon={ServerIcon}
        label="Frappe"
        value="frappe"
      />
    </RadioGroup>
  );
}

function SourceOption({
  disabled = false,
  icon: Icon,
  label,
  value
}: {
  disabled?: boolean;
  icon: typeof DatabaseIcon;
  label: string;
  value: CrmDataSourceProvider;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-2 transition-colors hover:bg-accent/60 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-45">
      <RadioGroupItem disabled={disabled} value={value} />
      <Icon className="size-4" />
      <span>{label}</span>
    </label>
  );
}
