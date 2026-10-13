import { useDeferredValue, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@cxsun/ui/components/button";
import { WorkspaceFilters } from "@cxsun/ui/workspace/filters";
import { WorkspacePage } from "@cxsun/ui/workspace/page";
import { WorkspaceSelect } from "@cxsun/ui/workspace/select";
import { CallLogForm } from "./call-log.form";
import { useCallLogs, useCallLogOptions } from "./call-log.hooks";
import { CallLogList, callLogColumns } from "./call-log.list";
import {
  createCallLog,
  getCallLogImport,
  retryCallLogSync,
  startCallLogImport
} from "./call-log.services";
import type { CallLogFilters } from "./call-log.types";

export function CallLogWorkspace() {
  const client = useQueryClient();
  const [filters, setFilters] = useState<CallLogFilters>({
    page: 1,
    pageSize: 50,
    search: "",
    type: "",
    status: ""
  });
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState(false);
  const [importJobId, setImportJobId] = useState<number | null>(null);
  const query = useCallLogs(useDeferredValue(filters));
  const options = useCallLogOptions();
  const importJob = useQuery({
    queryKey: ["crm", "call-logs", "import", importJobId],
    queryFn: () => getCallLogImport(importJobId!),
    enabled: importJobId !== null,
    refetchInterval: (query) =>
      ["pending", "running"].includes(query.state.data?.status ?? "") ? 3000 : false
  });
  const startImport = useMutation({
    mutationFn: startCallLogImport,
    onSuccess: (job) => {
      setImportJobId(job.jobId);
      toast.success("Call log import queued");
    },
    onError: (error) => toast.error("Could not import call logs", { description: error.message })
  });
  const loadError = query.error ?? options.error;
  const save = useMutation({
    mutationFn: createCallLog,
    onSuccess: async (record) => {
      await client.invalidateQueries({ queryKey: ["crm", "call-logs"] });
      toast.success("Call logged", { description: record.name });
      setOpen(false);
    }
  });
  const retry = useMutation({
    mutationFn: retryCallLogSync,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["crm", "call-logs"] });
      toast.success("Call log sync queued again");
    },
    onError: (error) => toast.error("Could not retry sync", { description: error.message })
  });
  const update = (patch: Partial<CallLogFilters>) =>
    setFilters((current) => ({ ...current, ...patch, page: patch.page ?? 1 }));
  return (
    <WorkspacePage title="" technicalName="page.crm.call-logs.list" className="pt-0 lg:pt-0">
      <WorkspaceFilters
        searchValue={filters.search}
        searchPlaceholder="Search call logs or phone number"
        onSearchValueChange={(search) => update({ search })}
        filterValue={filters.type || "all"}
        onFilterValueChange={(type) => update({ type: type === "all" ? "" : type })}
        filterOptions={[
          { id: "all", label: "All call types" },
          ...(options.data?.types ?? []).map((type) => ({ id: type, label: type }))
        ]}
        columnOptions={callLogColumns.map((column) => ({
          ...column,
          checked: visibleColumns[column.id] !== false,
          onCheckedChange: (checked: boolean) =>
            setVisibleColumns((current) => ({ ...current, [column.id]: checked }))
        }))}
        onShowAllColumns={() => setVisibleColumns({})}
        toolbarAction={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-8"
              disabled={
                startImport.isPending ||
                ["pending", "running"].includes(importJob.data?.status ?? "")
              }
              onClick={() => startImport.mutate()}
            >
              <Download className="size-4" /> Import Frappe logs
            </Button>
            <div className="w-44">
              <WorkspaceSelect
                ariaLabel="Filter by status"
                value={filters.status || "all"}
                options={[
                  { value: "all", label: "All statuses" },
                  ...(options.data?.statuses ?? []).map((status) => ({
                    value: status,
                    label: status
                  }))
                ]}
                onValueChange={(status) => update({ status: status === "all" ? "" : status })}
              />
            </div>
            <Button
              type="button"
              className="h-8"
              disabled={!options.data}
              onClick={() => setOpen(true)}
            >
              <Plus className="size-4" /> Log a Call
            </Button>
          </div>
        }
      />
      {loadError ? (
        <p role="alert" className="text-sm text-destructive">
          {loadError.message}
        </p>
      ) : null}
      {importJob.data ? (
        <p role="status" className="text-sm text-muted-foreground">
          Import {importJob.data.status}: {importJob.data.progress?.created ?? 0} created,{" "}
          {importJob.data.progress?.skipped ?? 0} skipped, {importJob.data.progress?.failed ?? 0}{" "}
          failed.
          {importJob.data.errorMessage ? ` ${importJob.data.errorMessage}` : ""}
        </p>
      ) : null}
      <CallLogList
        records={query.data?.items ?? []}
        loading={query.isLoading}
        visibleColumns={visibleColumns}
        onRetry={(eventId) => retry.mutate(eventId)}
      />
      <div className="flex items-center justify-end gap-3 text-sm">
        <span>Page {filters.page}</span>
        <Button
          type="button"
          variant="outline"
          disabled={filters.page === 1}
          onClick={() => update({ page: filters.page - 1 })}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!query.data?.hasMore}
          onClick={() => update({ page: filters.page + 1 })}
        >
          Next
        </Button>
      </div>
      <CallLogForm
        open={open}
        loading={save.isPending}
        error={save.error?.message ?? ""}
        types={options.data?.types ?? []}
        statuses={options.data?.statuses ?? []}
        onCancel={() => {
          save.reset();
          setOpen(false);
        }}
        onSubmit={(value) => save.mutate(value)}
      />
    </WorkspacePage>
  );
}
