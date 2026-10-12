import type { HrmsOverview, HrmsOverviewRequestContext } from "./overview.types.js";

export class HrmsOverviewService {
  constructor(private readonly context: HrmsOverviewRequestContext) {}

  getOverview(): HrmsOverview {
    return {
      actorEmail: this.context.actorEmail,
      appKey: "hrms",
      checkedAt: new Date().toISOString(),
      label: "HRMS",
      tenantCode: this.context.tenant.code,
      tenantName: this.context.tenant.name
    };
  }
}
