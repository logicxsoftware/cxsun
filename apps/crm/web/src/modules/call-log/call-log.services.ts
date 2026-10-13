import { crmRequest } from "../../crm-request";
import type { CallLogFilters, CallLogInput, CallLogPage } from "./call-log.types";

export function listCallLogs(filters: CallLogFilters) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== "") query.set(key, String(value));
  }
  return crmRequest<CallLogPage>(`/crm/call-logs?${query}`);
}

export function listCallLogOptions() {
  return crmRequest<{ types: string[]; statuses: string[] }>("/crm/call-logs/options");
}

export function listCallLogUsers(search: string) {
  return crmRequest<Array<{ value: string; label: string }>>(
    `/crm/call-logs/users?${new URLSearchParams({ search })}`
  );
}

export function createCallLog(input: CallLogInput) {
  return crmRequest<{ name: string }>("/crm/call-logs", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export type CallLogImportJob = {
  jobId: number;
  status: string;
  progress: {
    scanned: number;
    created: number;
    skipped: number;
    failed: number;
    failures: Array<{ name: string; message: string }>;
  } | null;
  errorMessage: string | null;
};

export function startCallLogImport() {
  return crmRequest<{ jobId: number; status: string }>("/frappe/call-logs/backfill", {
    method: "POST",
    body: JSON.stringify({})
  });
}

export function getCallLogImport(jobId: number) {
  return crmRequest<CallLogImportJob>(`/frappe/call-logs/backfill/${jobId}`);
}

export function retryCallLogSync(eventId: number) {
  return crmRequest<{ id: number; status: "pending" }>(
    `/frappe/call-logs/sync-queue/${eventId}/retry`,
    {
      method: "POST",
      body: JSON.stringify({})
    }
  );
}
