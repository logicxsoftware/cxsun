import { WorkspaceDetailTable, WorkspaceShowCard } from "@cxsun/ui/workspace/show";
import { formatDate, formatScheduleDate } from "./enquiry.view-utils";
import type { EnquiryRecord } from "./enquiry.types";

export function EnquiryCustomer({ record, mobile }: { record: EnquiryRecord; mobile: string | null }) {
  return (
    <WorkspaceShowCard title="Customer">
      <WorkspaceDetailTable
        rows={[
          ["Customer", record.contactName ?? record.capturedName ?? "—"],
          ["Mobile", mobile || "—"],
          ["Enquiry date", formatDate(record.enquiredAt)],
          ["Schedule date", formatScheduleDate(record.dueDate)]
        ]}
      />
    </WorkspaceShowCard>
  );
}
