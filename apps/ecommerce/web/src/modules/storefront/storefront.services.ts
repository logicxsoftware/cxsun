import type { StoreConfig, StoreConfigInput, StoreQuote } from "./storefront.types";
export function createStorefrontGateway(
  request: <T>(
    path: string,
    method?: "GET" | "POST" | "PUT" | "DELETE",
    body?: unknown
  ) => Promise<T>
) {
  return {
    config: () =>
      request<{ config: StoreConfig; permissions: { manage: boolean; quotes: boolean } }>(
        "/ecommerce/storefront/config"
      ),
    save: (input: StoreConfigInput) =>
      request<StoreConfig>("/ecommerce/storefront/config", "PUT", input),
    quotes: () => request<StoreQuote[]>("/ecommerce/storefront/quotes"),
    status: (uuid: string, status: StoreQuote["status"]) =>
      request("/ecommerce/storefront/quotes/" + encodeURIComponent(uuid) + "/status", "PUT", {
        status
      })
  };
}
export type StorefrontGateway = ReturnType<typeof createStorefrontGateway>;
