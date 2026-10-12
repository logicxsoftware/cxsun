import { createHrmsOverviewGateway } from "@cxsun/hrms-web/modules/overview/gateway";
import { apiGet } from "../../shared/api/platform-api";
export const hrmsOverviewGateway = createHrmsOverviewGateway(<T>(path: string) =>
  apiGet<T>(path, "tenant")
);
