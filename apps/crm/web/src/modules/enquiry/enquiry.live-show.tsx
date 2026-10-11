import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowLeft,
  MessageCircle,
  MessageSquare,
  ReceiptText,
  Timer
} from "lucide-react";
import { Button } from "@cxsun/ui/components/button";
import { WorkspaceAnimatedTabs } from "@cxsun/ui/workspace/animated-tabs";
import { WorkspacePage } from "@cxsun/ui/workspace/page";
import {
  WorkspaceDetailTable,
  WorkspaceShowCard,
  WorkspaceShowLayout
} from "@cxsun/ui/workspace/show";
import { WorkspaceStatusBadge } from "@cxsun/ui/workspace/status";
import { CrmColorLabel, CrmStatusBadge } from "../../crm-colors";
import { crmRequest } from "../../crm-request";
import { enquiryTableText } from "./enquiry.table-text";
import { formatDate, formatDateTime, formatScheduleDate, whatsappUrl } from "./enquiry.view-utils";
import type { LiveEnquiryRecord } from "./enquiry.types";

type LiveTab = "comments" | "jobs" | "estimate" | "activity";

export function LiveEnquiryShow({
  name,
  onBack
}: {
  name: string;
  onBack?: (() => void) | undefined;
}) {
  const [activeTab, setActiveTab] = useState<LiveTab>("comments");
  const enquiry = useQuery({
    queryKey: ["crm", "enquiries", "frappe-live", "detail", name],
    queryFn: () => crmRequest<LiveEnquiryRecord>(`/crm/enquiries/live/${encodeURIComponent(name)}`)
  });
  const record = enquiry.data;
  const whatsApp = whatsappUrl(record?.mobile ?? null);
  const tabs = record ? liveTabs(record) : [];
  return (
    <WorkspacePage
      className="!w-full !max-w-none px-1 lg:px-2"
      technicalName="page.crm.enquiry.live.show"
      title={
        record
          ? [record.name, record.mobile, record.customer !== record.mobile ? record.customer : null]
              .filter(Boolean)
              .join(" · ")
          : name
      }
      actions={
        <div className="flex items-center gap-2">
          {onBack ? (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="size-4" /> Enquiries
            </Button>
          ) : null}
          {whatsApp ? (
            <Button asChild>
              <a
                href={whatsApp}
                rel="noopener noreferrer"
                style={{ backgroundColor: "#25d366", color: "#fff" }}
                target="_blank"
              >
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            </Button>
          ) : null}
        </div>
      }
    >
      {enquiry.error ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {enquiry.error.message}
          <Button
            className="ml-3"
            size="sm"
            variant="outline"
            onClick={() => void enquiry.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : null}
      {!record ? (
        !enquiry.error && <p className="text-sm text-muted-foreground">Loading enquiry…</p>
      ) : (
        <>
          <section className="rounded-md border border-border/70 bg-card/95 px-4 py-3 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="break-words text-lg font-semibold">
                  {enquiryTableText(record.details) ||
                    enquiryTableText(record.title) ||
                    record.name}
                </h2>
                {record.details &&
                record.title &&
                enquiryTableText(record.details) !== enquiryTableText(record.title) ? (
                  <p className="mt-1 break-words text-sm text-muted-foreground">
                    {enquiryTableText(record.title)}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <div className="flex flex-wrap gap-2">
                  <WorkspaceStatusBadge
                    label={`List in · ${record.group || "Unlisted"}`}
                    tone="info"
                    showIcon={false}
                  />
                  <CrmStatusBadge code={colorCode(record.status)} label={record.status || "—"} />
                  <span className="inline-flex h-6 items-center rounded-md border border-slate-200 bg-slate-50 px-2 text-[11px] font-medium text-slate-700">
                    <CrmColorLabel
                      kind="priority"
                      code={colorCode(record.priority)}
                      label={record.priority || "—"}
                    />
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Created by {record.creator || "—"} ·{" "}
                  {record.createdAt ? formatDateTime(record.createdAt) : "—"}
                </p>
              </div>
            </div>
          </section>
          <WorkspaceShowLayout className="xl:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="min-w-0 overflow-hidden rounded-md border border-border/70 bg-card/95 shadow-sm">
              <WorkspaceAnimatedTabs
                tabs={tabs}
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as LiveTab)}
                listClassName="px-3"
                contentClassName="mt-0 pb-0"
              />
            </div>
            <aside className="space-y-4 xl:sticky xl:top-4">
              <WorkspaceShowCard title="Properties">
                <WorkspaceDetailTable
                  rows={[
                    ["List in", record.group || "—"],
                    [
                      "Priority",
                      <CrmColorLabel
                        kind="priority"
                        code={colorCode(record.priority)}
                        label={record.priority || "—"}
                      />
                    ],
                    ["Assigned to", record.assignee || "Unassigned"],
                    ["Schedule date", formatScheduleDate(record.dueDate)],
                    [
                      "Status",
                      <CrmColorLabel
                        kind="status"
                        code={colorCode(record.status)}
                        label={record.status || "—"}
                      />
                    ],
                    ...(record.statusDetails
                      ? [["Status details", record.statusDetails] as [string, ReactNode]]
                      : []),
                    ["Updated", record.modifiedAt ? formatDateTime(record.modifiedAt) : "—"]
                  ]}
                />
              </WorkspaceShowCard>
              <WorkspaceShowCard title="Customer">
                <WorkspaceDetailTable
                  rows={[
                    ["Customer", record.customer || "—"],
                    ["Mobile", record.mobile || "—"],
                    ["Enquiry date", formatDate(record.date)],
                    ["Schedule date", formatScheduleDate(record.dueDate)]
                  ]}
                />
              </WorkspaceShowCard>
            </aside>
          </WorkspaceShowLayout>
        </>
      )}
    </WorkspacePage>
  );
}

function liveTabs(record: LiveEnquiryRecord) {
  const message = enquiryTableText(record.details);
  const unavailable = (label: string) => (
    <p className="min-h-72 p-4 text-sm text-muted-foreground">
      {label} are not available for Frappe Live enquiries yet.
    </p>
  );
  return [
    {
      value: "comments",
      label: <TabLabel icon={<MessageSquare className="size-4" />} label="Comments" />,
      content: message ? (
        <div className="min-h-72 p-4 text-sm">
          <p className="mb-3 text-xs text-muted-foreground">Enquiry message</p>
          <div className="rounded-md bg-muted/30 p-3">
            <p className="whitespace-pre-wrap break-words">{message}</p>
            <p className="mt-3 text-right text-xs text-muted-foreground">
              {record.creator || "—"} · {record.createdAt ? formatDateTime(record.createdAt) : "—"}
            </p>
          </div>
        </div>
      ) : (
        unavailable("Comments")
      )
    },
    {
      value: "jobs",
      label: <TabLabel icon={<Timer className="size-4" />} label="Jobs" />,
      content: unavailable("Jobs")
    },
    {
      value: "estimate",
      label: <TabLabel icon={<ReceiptText className="size-4" />} label="Estimate" />,
      content: unavailable("Estimates")
    },
    {
      value: "activity",
      label: <TabLabel icon={<Activity className="size-4" />} label="Activity" />,
      content: (
        <div className="min-h-72 space-y-3 p-4 text-sm">
          {record.modifiedAt ? <p>Updated · {formatDateTime(record.modifiedAt)}</p> : null}
          {record.createdAt ? <p>Created · {formatDateTime(record.createdAt)}</p> : null}
        </div>
      )
    }
  ];
}

function TabLabel({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      {icon}
      {label}
    </span>
  );
}

function colorCode(value: string | null) {
  return (value || "").trim().toLowerCase().replace(/\s+/g, "-");
}
