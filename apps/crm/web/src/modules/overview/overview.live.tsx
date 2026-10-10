import { useQuery } from "@tanstack/react-query";
import { Button } from "@cxsun/ui/components/button";
import { Card } from "@cxsun/ui/components/card";
import { crmRequest } from "../../crm-request";

type Counts = {
  total: number;
  statusCounts: Array<{ code: string; count: number }>;
  priorityCounts: Array<{ code: string; count: number }>;
};
type Summary = { allCount: number; assigned: Counts; created: Counts };

export function LiveOverviewWorkspace({
  currentUserName,
  onOpenMyJob,
  onOpenMyCalls
}: {
  currentUserName: string;
  onOpenMyJob: () => void;
  onOpenMyCalls: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const summary = useQuery({
    queryKey: ["crm", "enquiries", "frappe-summary", today],
    queryFn: () => crmRequest<Summary>(`/crm/enquiries/live/summary?today=${today}`)
  });
  const data = summary.error ? undefined : summary.data;
  return (
    <section className="mx-auto max-w-6xl space-y-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Frappe Live overview</p>
          <h1 className="mt-1 text-3xl font-semibold">{currentUserName}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Current enquiry totals from the connected Frappe site.
          </p>
        </div>
        <Button variant="outline" onClick={() => void summary.refetch()}>
          Refresh
        </Button>
      </div>
      {summary.error ? (
        <p className="text-sm text-destructive" role="alert">
          {summary.error.message}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="All enquiries" value={data?.allCount} />
        <Metric label="Assigned to me" value={data?.assigned.total} />
        <Metric label="Created by me" value={data?.created.total} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <CountsCard title="Assigned to me" counts={data?.assigned} onOpen={onOpenMyJob} />
        <CountsCard title="Created by me" counts={data?.created} onOpen={onOpenMyCalls} />
      </div>
      {summary.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading live totals…</p>
      ) : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number | undefined }) {
  return (
    <Card className="border-l-2 border-l-blue-600 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <strong className="mt-1 block text-xl">{value ?? "—"}</strong>
    </Card>
  );
}

function CountsCard({
  title,
  counts,
  onOpen
}: {
  title: string;
  counts: Counts | undefined;
  onOpen: () => void;
}) {
  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">{title}</h2>
        <Button variant="outline" onClick={onOpen}>
          Open enquiries
        </Button>
      </div>
      <div>
        <h3 className="text-sm font-medium">By status</h3>
        {counts?.statusCounts.map((row) => (
          <Count key={row.code} label={row.code || "No status"} value={row.count} />
        ))}
      </div>
      <div>
        <h3 className="text-sm font-medium">By priority</h3>
        {counts?.priorityCounts.map((row) => (
          <Count key={row.code} label={row.code || "No priority"} value={row.count} />
        ))}
      </div>
    </Card>
  );
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between border-b py-2 text-sm">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
