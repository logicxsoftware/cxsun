import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@cxsun/ui/components/button";
import { Input } from "@cxsun/ui/components/input";
import { WorkspacePage } from "@cxsun/ui/workspace/page";
import { crmRequest } from "../../crm-request";
import type { EnquiryReportFilters } from "../enquiry/index";
import type { ReportView } from "./reports.model";

type LiveRow = { group: string | null; status: string | null; count: number };
const views: Array<{ id: ReportView; label: string }> = [
  { id: "list-in", label: "List in wise" },
  { id: "creator", label: "Creator wise" },
  { id: "assignee", label: "Assignee wise" },
  { id: "status", label: "Status wise" }
];

export function LiveReportsWorkspace({
  onOpenEnquiries
}: {
  onOpenEnquiries: (filters: EnquiryReportFilters) => void;
}) {
  const [view, setView] = useState<ReportView>("list-in");
  const [draft, setDraft] = useState<EnquiryReportFilters>({});
  const [filters, setFilters] = useState<EnquiryReportFilters>({});
  const invalidDates = Boolean(draft.fromDate && draft.toDate && draft.fromDate > draft.toDate);
  const report = useQuery({
    queryKey: ["crm", "enquiries", "frappe-report", view, filters],
    queryFn: () => {
      const params = new URLSearchParams({ view });
      if (filters.fromDate) params.set("fromDate", filters.fromDate);
      if (filters.toDate) params.set("toDate", filters.toDate);
      if (filters.assigneeEmployee) params.set("assignee", filters.assigneeEmployee);
      return crmRequest<LiveRow[]>(`/crm/enquiries/live/reports?${params}`);
    }
  });
  const rows = report.error ? [] : (report.data ?? []);
  const statuses = [...new Set(rows.map((row) => row.status ?? "none"))].sort();
  const groups = new Map<string, Map<string, number>>();
  for (const row of rows) {
    const group = row.group ?? "none";
    const byStatus = groups.get(group) ?? new Map<string, number>();
    const status = row.status ?? "none";
    byStatus.set(status, (byStatus.get(status) ?? 0) + row.count);
    groups.set(group, byStatus);
  }
  const open = (group: string, status?: string) => {
    const next: EnquiryReportFilters = { ...filters, filter: status ?? "all" };
    if (view === "list-in") next.group = group;
    if (view === "creator") next.creatorEmployee = group;
    if (view === "assignee") next.assigneeEmployee = group;
    if (view === "status") next.filter = group;
    onOpenEnquiries(next);
  };
  return (
    <WorkspacePage
      title="Enquiry reports"
      description="Live counts from Frappe. Select a count to open its matching enquiries."
      technicalName="page.crm.reports.frappe"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2" aria-label="Enquiry report views">
          {views.map((item) => (
            <Button
              key={item.id}
              type="button"
              aria-pressed={view === item.id}
              variant={view === item.id ? "default" : "outline"}
              onClick={() => setView(item.id)}
            >
              {item.label}
            </Button>
          ))}
          <Button variant="outline" onClick={() => void report.refetch()}>
            Refresh
          </Button>
        </div>
        <div className="flex flex-wrap items-end gap-3 rounded-md border bg-card p-4">
          <label className="min-w-40 flex-1 text-sm text-muted-foreground">
            From date
            <Input
              className="mt-1"
              type="date"
              value={draft.fromDate ?? ""}
              onChange={(event) =>
                setDraft({ ...draft, fromDate: event.target.value || undefined })
              }
            />
          </label>
          <label className="min-w-40 flex-1 text-sm text-muted-foreground">
            To date
            <Input
              className="mt-1"
              type="date"
              value={draft.toDate ?? ""}
              onChange={(event) => setDraft({ ...draft, toDate: event.target.value || undefined })}
            />
          </label>
          <label className="min-w-52 flex-[2] text-sm text-muted-foreground">
            Frappe assignee employee code
            <Input
              className="mt-1"
              value={draft.assigneeEmployee ?? ""}
              onChange={(event) =>
                setDraft({ ...draft, assigneeEmployee: event.target.value || undefined })
              }
            />
          </label>
          <Button disabled={invalidDates} onClick={() => setFilters({ ...draft })}>
            Apply filters
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setDraft({});
              setFilters({});
            }}
          >
            Reset
          </Button>
        </div>
        {invalidDates ? (
          <p role="alert" className="text-sm text-destructive">
            From date must be on or before To date.
          </p>
        ) : null}
        {report.error ? (
          <p role="alert" className="text-sm text-destructive">
            {report.error.message}
          </p>
        ) : null}
        <div className="overflow-x-auto rounded-md border bg-card">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left">
                  {views.find((item) => item.id === view)?.label}
                </th>
                {view !== "status"
                  ? statuses.map((status) => (
                      <th className="px-4 py-3 text-right" key={status}>
                        {status === "none" ? "No status" : status}
                      </th>
                    ))
                  : null}
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {[...groups]
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([group, counts]) => (
                  <tr key={group} className="border-t">
                    <th className="px-4 py-3 text-left font-medium">
                      {group === "none"
                        ? view === "list-in"
                          ? "(no group)"
                          : view === "assignee"
                            ? "Unassigned"
                            : view === "status"
                              ? "No status"
                              : "No creator"
                        : group}
                    </th>
                    {view !== "status"
                      ? statuses.map((status) => (
                          <td className="px-4 py-3 text-right" key={status}>
                            {counts.get(status) ? (
                              <button
                                className="text-primary hover:underline"
                                onClick={() => open(group, status)}
                              >
                                {counts.get(status)}
                              </button>
                            ) : (
                              "—"
                            )}
                          </td>
                        ))
                      : null}
                    <td className="px-4 py-3 text-right">
                      <button
                        className="font-semibold text-primary hover:underline"
                        onClick={() => open(group)}
                      >
                        {[...counts.values()].reduce((total, count) => total + count, 0)}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {report.isLoading ? (
            <p className="p-4 text-sm text-muted-foreground">Loading live report…</p>
          ) : null}
          {!report.isLoading && !groups.size ? (
            <p className="p-4 text-sm text-muted-foreground">No enquiries match these filters.</p>
          ) : null}
        </div>
      </div>
    </WorkspacePage>
  );
}
