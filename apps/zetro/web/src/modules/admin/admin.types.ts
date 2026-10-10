export type ZetroTenantOption = {
  uuid: string;
  tenantName: string;
  tenantCode: string;
  enabledModuleKeys: string[];
};

export type ZetroQueryPattern = {
  uuid: string;
  serial_no: number;
  intent_key: string | null;
  question_pattern: string;
  query_pattern: string;
  limitation: string;
  extra: string;
  status: "active" | "draft" | "retired";
};

export type ZetroInteractionLog = {
  id: number;
  uuid: string;
  pattern_uuid: string | null;
  actor_email: string;
  prompt_text: string;
  response_text: string | null;
  intent: string;
  skill_decision: string | null;
  outcome: string;
  created_at: string;
};

export type ZetroPatternDraft = {
  serialNo: number;
  questionPattern: string;
  queryPattern: string;
  limitation: string;
  extra: string;
};

export const zetroCapabilities = [
  "billing.customer-outstanding.read",
  "billing.daily-summary.read",
  "billing.monthly-summary.read",
  "billing.aged-sales.read"
] as const;

export const zetroCapabilityLabels: Record<(typeof zetroCapabilities)[number], string> = {
  "billing.customer-outstanding.read": "Customer balance",
  "billing.daily-summary.read": "Today's report",
  "billing.monthly-summary.read": "This month's totals",
  "billing.aged-sales.read": "Long outstanding sales"
};

export type ZetroGrantChange = {
  roleKey: string;
  capabilityKey: (typeof zetroCapabilities)[number];
  status: "active" | "revoked";
  reason: string;
};

export type ZetroGrant = {
  role_key: string;
  capability_key: string;
  status: "active" | "revoked";
  approved_by: string;
  reason: string;
};

export type ZetroRole = { role_key: string; label: string };
