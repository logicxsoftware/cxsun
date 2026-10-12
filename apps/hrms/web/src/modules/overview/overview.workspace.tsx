import { RefreshCw } from "lucide-react";
import { Button } from "@cxsun/ui/components/button";
import { Card } from "@cxsun/ui/components/card";
import { Skeleton } from "@cxsun/ui/components/skeleton";
import { WorkspaceFormBanner } from "@cxsun/ui/workspace/upsert";
import { formatDateTime } from "@cxsun/ui/workspace";
import { useHrmsOverview } from "./overview.hooks";
import type { HrmsOverviewGateway } from "./overview.services";
// Read-only application desk and static onboarding; business CRUD belongs in future owner leaves.
export function HrmsOverviewWorkspace({
  gateway,
  guide = false,
  onNavigate
}: {
  gateway: HrmsOverviewGateway;
  guide?: boolean;
  onNavigate?: (page: "hrms.overview" | "hrms.guide") => void;
}) {
  const overview = useHrmsOverview(gateway);
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{guide ? "Getting Started" : "HRMS Desk"}</h1>
          <p className="text-sm text-muted-foreground">
            Human Resource Management System · People, employment and workforce administration.
          </p>
        </div>
        {onNavigate && (
          <Button
            variant="outline"
            onClick={() => onNavigate(guide ? "hrms.overview" : "hrms.guide")}
          >
            {guide ? "Open overview" : "Getting started"}
          </Button>
        )}
      </div>
      {overview.isPending && <Skeleton className="h-24" />}
      {overview.isError && (
        <WorkspaceFormBanner title="HRMS could not be loaded">
          <p>{overview.error.message}</p>
          <Button
            disabled={overview.isFetching}
            variant="outline"
            onClick={() => void overview.refetch()}
          >
            <RefreshCw />
            Retry
          </Button>
        </WorkspaceFormBanner>
      )}
      {overview.isSuccess && (
        <>
          <Card className="p-5">
            <dl className="grid gap-4 md:grid-cols-3">
              <div>
                <dt className="text-sm text-muted-foreground">Tenant</dt>
                <dd>
                  {overview.data.tenantName} ({overview.data.tenantCode})
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Signed in as</dt>
                <dd>{overview.data.actorEmail}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Last checked</dt>
                <dd>{formatDateTime(overview.data.checkedAt)}</dd>
              </div>
            </dl>
          </Card>
          {guide ? (
            <Card className="p-5 space-y-4">
              <h2 className="font-semibold">Set up your workspace</h2>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Enable HRMS through Plan Access and confirm effective tenant Entitlements.</li>
                <li>
                  Run tenant seeding to register hrms.overview.view, then assign access through
                  tenant roles.
                </li>
                <li>
                  Open HRMS from the app launcher. Use Overview to confirm the active tenant and
                  user.
                </li>
              </ol>
              <h2 className="font-semibold">Next modules</h2>
              <p className="text-sm text-muted-foreground">
                Employee profiles, departments, attendance, leave, payroll and recruitment. These
                workflows are not included in this app foundation.
              </p>
            </Card>
          ) : (
            <Card className="p-5 space-y-2">
              <h2 className="font-semibold">Workspace ready</h2>
              <p className="text-sm text-muted-foreground">
                The app launcher, desk navigation and authenticated overview are connected. Open
                Getting Started for setup and planned modules.
              </p>
            </Card>
          )}
        </>
      )}
    </section>
  );
}
