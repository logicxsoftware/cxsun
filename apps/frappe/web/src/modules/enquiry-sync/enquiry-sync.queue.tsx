import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@cxsun/ui/components/button";
import { WorkspacePage } from "@cxsun/ui/workspace/page";
import { WorkspacePagination } from "@cxsun/ui/workspace/pagination";
import { buildShowingLabel, formatDateTime } from "@cxsun/ui/workspace/utils";
import {
  getEnquiryBackfill,
  getSyncQueue,
  retrySyncEvent,
  startEnquiryBackfill
} from "./enquiry-sync.services";
import type { EnquiryImportJob, SyncQueueStatus } from "./enquiry-sync.types";

const statuses: SyncQueueStatus[] = ["all", "pending", "processing", "retry", "failed", "synced"];
const pageSize = 25;
const queueKey = ["frappe", "enquiry-sync", "queue"] as const;

export function FrappeEnquirySyncWorkspace() {
  const [status, setStatus] = useState<SyncQueueStatus>("all");
  const [page, setPage] = useState(1);
  const [backfillJobId, setBackfillJobId] = useState<number | null>(null);
  const client = useQueryClient();
  const queue = useQuery({
    queryKey: [...queueKey, status, page],
    queryFn: () => getSyncQueue(status, page, pageSize),
    refetchInterval: 5000
  });
  const backfill = useQuery<EnquiryImportJob>({
    queryKey: ["frappe", "enquiry-backfill", backfillJobId],
    queryFn: () => getEnquiryBackfill(backfillJobId!),
    enabled: backfillJobId !== null,
    refetchInterval: (query) =>
      ["pending", "running"].includes(query.state.data?.status ?? "") ? 3000 : false
  });
  const startBackfill = useMutation({
    mutationFn: startEnquiryBackfill,
    onSuccess: (job) => {
      setBackfillJobId(job.jobId);
      toast.success("Enquiry backfill queued");
    },
    onError: (error) => toast.error("Could not start backfill", { description: error.message })
  });
  const retry = useMutation({
    mutationFn: retrySyncEvent,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: queueKey });
      toast.success("Sync event queued again");
    },
    onError: (error) => toast.error("Could not retry sync", { description: error.message })
  });
  const total = queue.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <WorkspacePage
      title="Enquiry sync queue"
      description="CRM saves enquiries locally. This queue sends changes to Frappe in the background."
      technicalName="page.frappe.enquiry-sync"
      actions={
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={
              startBackfill.isPending ||
              ["pending", "running"].includes(backfill.data?.status ?? "")
            }
            onClick={() => startBackfill.mutate()}
          >
            Import existing Frappe enquiries
          </Button>
          <Button type="button" variant="outline" onClick={() => void queue.refetch()}>
            <RefreshCw className="size-4" /> Refresh
          </Button>
        </div>
      }
    >
      {backfill.data ? (
        <p role="status" className="mb-3 text-sm">
          Import {backfill.data.status}: {backfill.data.progress?.created ?? 0} created,{" "}
          {backfill.data.progress?.skipped ?? 0} skipped, {backfill.data.progress?.failed ?? 0}{" "}
          failed.
          {backfill.data.errorMessage ? ` ${backfill.data.errorMessage}` : ""}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2" aria-label="Sync status filter">
        {statuses.map((option) => (
          <Button
            key={option}
            type="button"
            size="sm"
            variant={status === option ? "default" : "outline"}
            onClick={() => {
              setStatus(option);
              setPage(1);
            }}
          >
            {option === "all" ? "All" : option[0]!.toUpperCase() + option.slice(1)}
          </Button>
        ))}
      </div>
      {queue.error ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {queue.error.message}
        </p>
      ) : null}
      <div className="mt-4 overflow-x-auto rounded-md border bg-card shadow-sm">
        <table className="w-full min-w-[950px] text-left text-sm">
          <thead className="border-b bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Queued</th>
              <th className="px-4 py-3">Enquiry</th>
              <th className="px-4 py-3">Change</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Attempts</th>
              <th className="px-4 py-3">Frappe ID / error</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {(queue.data?.items ?? []).map((event) => (
              <tr key={event.id} className="border-b last:border-b-0">
                <td className="whitespace-nowrap px-4 py-3">{formatDateTime(event.createdAt)}</td>
                <td className="px-4 py-3">
                  <a
                    className="font-medium underline-offset-2 hover:underline"
                    href={`/app/crm/enquiries/${event.enquiryId}`}
                  >
                    #{event.enquiryNo} {event.title}
                  </a>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {event.eventType.replaceAll("-", " ")}
                </td>
                <td className="capitalize px-4 py-3">{event.status}</td>
                <td className="px-4 py-3 tabular-nums">{event.attempts}</td>
                <td className="max-w-80 break-words px-4 py-3 text-muted-foreground">
                  {event.lastError || event.remoteName || "—"}
                </td>
                <td className="px-4 py-3">
                  {event.status === "failed" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={retry.isPending}
                      onClick={() => retry.mutate(event.id)}
                    >
                      Retry
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
            {!queue.isLoading && !queue.data?.items.length ? (
              <tr>
                <td className="px-4 py-8 text-center text-muted-foreground" colSpan={7}>
                  No sync events found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <WorkspacePagination
        className="mt-3"
        page={page}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[pageSize]}
        showingLabel={buildShowingLabel(page, pageSize, total)}
        singularLabel="sync event"
        totalCount={total}
        totalPages={totalPages}
        onNextPage={() => setPage((value) => Math.min(totalPages, value + 1))}
        onPageChange={setPage}
        onPreviousPage={() => setPage((value) => Math.max(1, value - 1))}
      />
    </WorkspacePage>
  );
}
