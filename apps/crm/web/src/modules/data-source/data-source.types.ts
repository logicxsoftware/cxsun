export type CrmDataSourceProvider = "local" | "frappe";

export type CrmEnquiryDataSource = { provider: CrmDataSourceProvider };

export type CrmFrappeConnection = {
  configured: boolean;
  enabled: boolean;
  source: "tenant" | "environment";
  baseUrl: string | null;
  verificationStatus: "unverified" | "verified" | "failed";
};
