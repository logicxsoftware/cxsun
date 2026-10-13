import type { QueueJobRecord } from "./queue-manager.types.js";

type QueueJobProcessor = (
  job: QueueJobRecord,
  report: (result: Record<string, unknown>) => Promise<void>
) => Promise<Record<string, unknown>>;

const processors = new Map<string, QueueJobProcessor>();

export function registerQueueJobProcessor(jobName: string, processor: QueueJobProcessor) {
  processors.set(jobName, processor);
}

export function queueJobProcessor(jobName: string) {
  return processors.get(jobName);
}

export const queueManagerWorker = {
  backends: ["database", "bullmq-redis"],
  jobs: [
    "client-artifact.prepare",
    "crm.enquiry.frappe-sync",
    "crm.call-log.frappe-sync",
    "database-maintenance.run",
    "frappe.enquiries.import",
    "frappe.call-logs.import",
    "mail.send",
    "mail.sync",
    "mail.system-send",
    "queue.probe"
  ],
  queues: ["crm", "maintenance", "mail", "reports", "system"]
} as const;

export function queueJobCanRunInline(job: QueueJobRecord) {
  return job.status === "pending" || job.status === "failed";
}

export async function processQueueManagerJob(
  job: QueueJobRecord,
  run: (id: number) => Promise<unknown>
) {
  if (!queueJobCanRunInline(job)) {
    return { processed: false, reason: "job-not-runnable", status: job.status };
  }
  await run(job.id);
  return { jobId: job.id, processed: true };
}
