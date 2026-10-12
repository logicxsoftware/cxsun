import { createDocsOverviewGateway } from "@cxsun/docs-web/modules/overview/gateway";
import { apiGet } from "../../shared/api/platform-api";
export const docsOverviewGateway = createDocsOverviewGateway(<T>(path: string) =>
  apiGet<T>(path, "tenant")
);
