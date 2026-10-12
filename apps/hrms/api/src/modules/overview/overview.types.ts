export const hrmsOverviewPermissions = ["hrms.overview.view"] as const;
export type HrmsOverviewPermission = (typeof hrmsOverviewPermissions)[number];

export type HrmsOverview = {
  actorEmail: string;
  appKey: "hrms";
  checkedAt: string;
  label: string;
  tenantCode: string;
  tenantName: string;
};

export type HrmsOverviewRequestContext = {
  actorEmail: string;
  authorize: (permission: HrmsOverviewPermission) => Promise<void>;
  tenant: { code: string; name: string };
};

// Tenant runtime tables written by the permission seed.
export type HrmsPermissionDatabase = {
  app_permissions: { id: number; key: string };
  app_role_permissions: { id: number; permission_id: number; role_id: number };
  app_roles: { id: number; key: string };
};
