import { createEcommerceOverviewGateway } from "@cxsun/ecommerce-web/modules/overview/gateway";
import { apiGet } from "../../shared/api/platform-api";
export const ecommerceOverviewGateway = createEcommerceOverviewGateway(<T>(path: string) =>
  apiGet<T>(path, "tenant")
);


declare const __CXSUN_ECOMMERCE_WEB_PORT__: number;
export function openEcommerceDesk() {
  if (!Number.isInteger(__CXSUN_ECOMMERCE_WEB_PORT__))
    throw new Error("Ecommerce frontend port is not configured");
  const url = new URL(window.location.href);
  url.port = String(__CXSUN_ECOMMERCE_WEB_PORT__);
  url.pathname = "/";
  url.search = "";
  const slot = sessionStorage.getItem("cxsun.auth.slot");
  url.hash = slot ? new URLSearchParams({ sessionSlot: slot }).toString() : "";
  window.location.assign(url.href);
}

declare const __CXSUN_STOREFRONT_WEB_PORT__: number;
export function openPublicStorefront() {
  const url = new URL(window.location.href);
  url.port = String(__CXSUN_STOREFRONT_WEB_PORT__);
  url.pathname = "/";
  url.search = "";
  url.hash = "";
  window.open(url.href, "_blank", "noopener,noreferrer");
}
