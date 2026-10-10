export type RemoteEnquiry = {
  name: string;
  title: string;
  mobile: string | null;
  date: string | null;
  status: string | null;
  priority: string | null;
  modifiedAt: string | null;
  localEnquiryId: number | null;
};

export type RemoteEnquiryPage = {
  hasMore: boolean;
  items: RemoteEnquiry[];
  page: number;
  pageSize: number;
};

export type EnquiryImportJob = {
  jobId: number;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  progress: {
    scanned: number;
    created: number;
    skipped: number;
    failed: number;
    failures: { name: string; message: string }[];
  } | null;
  errorMessage: string | null;
};

export type LocalEnquiry = {
  id: number;
  enquiryNo: number;
  title: string;
  status: string;
  updatedAt: string;
  remoteName: string | null;
  syncedAt: string | null;
};

export type LocalEnquiryPage = {
  counts: { total: number; synced: number; pending: number };
  items: LocalEnquiry[];
  page: number;
  pageSize: number;
  total: number;
};

export type FrappeConnectionState = {
  configured: boolean;
  enabled: boolean;
  baseUrl: string | null;
};
