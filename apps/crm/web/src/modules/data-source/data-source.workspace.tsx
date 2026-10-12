import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@cxsun/ui/components/button";
import { Card } from "@cxsun/ui/components/card";
import { WorkspacePage } from "@cxsun/ui/workspace/page";
import { WorkspaceStatusBadge } from "@cxsun/ui/workspace/status";
import { crmDataSourceQueryKey, useCrmDataSource } from "./data-source.hooks";
import { CrmDataSourceList } from "./data-source.list";
import { saveCrmEnquiryDataSource } from "./data-source.services";
import { crmDataSourceProviderSchema } from "./data-source.schema";
import type { CrmDataSourceProvider } from "./data-source.types";

export function CrmDataSourceWorkspace({ frappeEnabled }: { frappeEnabled: boolean }) {
  const client = useQueryClient();
  const { source, connection } = useCrmDataSource(frappeEnabled);
  const save = useMutation({
    mutationFn: (provider: CrmDataSourceProvider) =>
      saveCrmEnquiryDataSource(crmDataSourceProviderSchema.parse(provider)),
    onSuccess: (_, provider) => {
      toast.success(
        `CRM enquiries now use ${provider === "frappe" ? "Frappe Live" : "Local MariaDB"}.`
      );
    },
    onError: (error) =>
      toast.error("Unable to change enquiry source", { description: error.message }),
    onSettled: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: crmDataSourceQueryKey }),
        client.invalidateQueries({ queryKey: ["crm"] }),
        client.invalidateQueries({ queryKey: ["frappe", "data-source"] })
      ]);
    }
  });
  const ready = Boolean(
    frappeEnabled &&
    connection.data?.configured &&
    connection.data.enabled &&
    connection.data.source === "tenant" &&
    connection.data.verificationStatus === "verified"
  );

  function change(provider: CrmDataSourceProvider) {
    if (provider !== source.data?.provider) save.mutate(provider);
  }

  return (
    <WorkspacePage
      title="Data Source"
      description="Choose where each CRM module reads and writes data. Local is available for every module."
      technicalName="page.crm.data-source"
    >
      <div className="grid gap-5">
        <Card
          title="Module data routing"
          description="Choose one source per supported module. Related views use the same selection."
        >
          {source.error ? (
            <p role="alert" className="px-4 pt-4 text-sm text-destructive">
              {source.error.message}
            </p>
          ) : null}
          <CrmDataSourceList
            busy={source.isLoading || save.isPending}
            frappeReady={ready}
            provider={source.data?.provider ?? null}
            onChange={change}
          />
          <p className="border-t px-4 py-3 text-sm text-muted-foreground">
            Contact, Contact 360 and standalone CRM masters stay Local until they have Frappe
            adapters. Their controls cannot select a source that does not exist.
          </p>
        </Card>
        <Card
          title="Frappe connection"
          description={
            connection.data?.baseUrl ?? "Connection settings are managed in the Frappe app."
          }
        >
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <WorkspaceStatusBadge
              label={ready ? "Verified" : frappeEnabled ? "Not ready" : "Frappe app disabled"}
              tone={ready ? "success" : "warning"}
            />
            {connection.error ? (
              <p role="alert" className="text-sm text-destructive">
                {connection.error.message}
              </p>
            ) : null}
            {frappeEnabled ? (
              <Button asChild variant="outline">
                <a href="/app/frappe/connection">Open connection settings</a>
              </Button>
            ) : null}
          </div>
        </Card>
      </div>
    </WorkspacePage>
  );
}
