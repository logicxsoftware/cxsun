import { createLogicxErpOverviewGateway } from "@cxsun/logicx-erp-web/modules/overview/gateway";
import { apiGet } from "../../shared/api/platform-api";

export const logicxErpOverviewGateway = createLogicxErpOverviewGateway((path) =>
  apiGet(path, "tenant")
);
