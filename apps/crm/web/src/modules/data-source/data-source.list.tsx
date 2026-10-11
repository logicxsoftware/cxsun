import { Fragment } from "react";
import { DatabaseIcon, ServerIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@cxsun/ui/components/radio-group";
import { WorkspaceStatusBadge } from "@cxsun/ui/workspace/status";
import type { CrmDataSourceProvider } from "./data-source.types";

const moduleGroups = [
  {
    label: "Enquiries and reporting",
    modules: [
      {
        key: "enquiries",
        label: "Enquiries",
        description: "Enquiry lists, details, My Job, My Calls, overview counts, reports, comments, jobs and estimates.",
        frappeAvailable: true
      }
    ]
  },
  {
    label: "Contacts",
    modules: [
      {
        key: "contacts",
        label: "Contact",
        description: "The Core contact list and contact editing workflow.",
        frappeAvailable: false
      },
      {
        key: "contact-360",
        label: "Contact 360",
        description: "Profiles, communication, relationships, preferences, notes and documents.",
        frappeAvailable: false
      }
    ]
  },
  {
    label: "CRM masters",
    modules: [
      {
        key: "masters",
        label: "List In, Status and Priority",
        description: "Standalone CRM master lists and their edit actions.",
        frappeAvailable: false
      }
    ]
  }
] as const;

export function CrmDataSourceList({
  busy,
  frappeReady,
  provider,
  onChange
}: {
  busy: boolean;
  frappeReady: boolean;
  provider: CrmDataSourceProvider | null;
  onChange: (provider: CrmDataSourceProvider) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/35 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-semibold">Module</th>
            <th className="px-4 py-3 font-semibold">Purpose</th>
            <th className="w-44 px-4 py-3 text-center font-semibold">Local MariaDB</th>
            <th className="w-44 px-4 py-3 text-center font-semibold">Frappe Live</th>
          </tr>
        </thead>
        <tbody>
          {moduleGroups.map((group) => (
            <Fragment key={group.label}>
              <tr className="border-b bg-muted/20">
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground" colSpan={4}>
                  {group.label}
                </th>
              </tr>
              {group.modules.map((module) => (
                <tr className="border-b last:border-b-0 hover:bg-muted/20" key={module.key}>
                  <td className="px-4 py-4">
                    <strong className="font-medium">{module.label}</strong>
                    <div className="pt-1">
                      <WorkspaceStatusBadge
                        label={module.frappeAvailable && provider === "frappe" ? "Live from Frappe" : "Local"}
                        tone={module.frappeAvailable && provider === "frappe" ? "info" : "success"}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">{module.description}</td>
                  <td colSpan={2} className="px-4 py-4">
                    {module.frappeAvailable ? (
                      <RadioGroup
                        aria-label={`${module.label} data source`}
                        className="grid grid-cols-2 gap-4"
                        disabled={busy || provider === null}
                        onValueChange={(value) => onChange(value as CrmDataSourceProvider)}
                        value={provider ?? "local"}
                      >
                        <SourceOption icon={DatabaseIcon} label="Local" value="local" />
                        <SourceOption disabled={!frappeReady} icon={ServerIcon} label="Frappe" value="frappe" />
                      </RadioGroup>
                    ) : (
                      <RadioGroup
                        aria-label={`${module.label} data source`}
                        className="grid grid-cols-2 gap-4"
                        value="local"
                      >
                        <SourceOption icon={DatabaseIcon} label="Local" value="local" />
                        <SourceOption disabled icon={ServerIcon} label="Frappe" value="frappe" />
                      </RadioGroup>
                    )}
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
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
