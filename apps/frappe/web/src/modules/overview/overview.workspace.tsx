import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@cxsun/ui/components/button";
import { Card } from "@cxsun/ui/components/card";
import { WorkspacePage } from "@cxsun/ui/workspace/page";
import { useFrappeConnection, useFrappeOverview } from "./overview.hooks";
import { verifyFrappeConnection } from "./overview.services";

export function FrappeOverviewWorkspace() {
  const [verifiedUser, setVerifiedUser] = useState<string | null>(null);
  const connection = useFrappeConnection();
  const overview = useFrappeOverview(1, 1, "");
  const verify = useMutation({
    mutationFn: verifyFrappeConnection,
    onSuccess: (result) => {
      setVerifiedUser(result.user);
      toast.success("Frappe connection verified");
    },
    onError: (error) => toast.error("Connection check failed", { description: error.message })
  });
  const configured = connection.data?.configured && connection.data.enabled;
  const counts = overview.data?.counts;

  return (
    <WorkspacePage
      title="Frappe"
      description="Connection and outbound sync for local CRM enquiries."
      technicalName="page.frappe.overview"
      actions={
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            void connection.refetch();
            void overview.refetch();
          }}
          disabled={connection.isFetching || overview.isFetching}
        >
          <RefreshCw className="size-4" /> Refresh
        </Button>
      }
    >
      <Card className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Connection</h2>
          <p className="text-sm text-muted-foreground">
            {connection.isLoading
              ? "Checking configuration…"
              : !connection.data?.configured
                ? "Set up Application connection from the Frappe sidebar."
                : !connection.data.enabled
                  ? "Frappe sync is disabled."
                  : verifiedUser
                    ? `Verified as ${verifiedUser}`
                    : "Configured. Verify before syncing records."}
          </p>
          {connection.data?.baseUrl ? (
            <p className="truncate text-xs text-muted-foreground">{connection.data.baseUrl}</p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={!configured || verify.isPending}
          onClick={() => verify.mutate()}
        >
          {verify.isPending ? "Verifying…" : "Verify connection"}
        </Button>
      </Card>
      {connection.error || overview.error ? (
        <p role="alert" className="text-sm text-destructive">
          {connection.error?.message ?? overview.error?.message}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-3">
        <CountCard label="Local enquiries" value={counts?.total} />
        <CountCard label="Posted" value={counts?.synced} />
        <CountCard label="Not posted" value={counts?.pending} />
      </div>
    </WorkspacePage>
  );
}

function CountCard({ label, value }: { label: string; value: number | undefined }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value ?? "—"}</p>
    </Card>
  );
}
