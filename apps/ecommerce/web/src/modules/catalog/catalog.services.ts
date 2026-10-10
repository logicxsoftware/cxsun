import type { CatalogActivity, CatalogInput, CatalogLookups, CatalogRecord } from "./catalog.types";
export type CatalogRequest = <T>(
  path: string,
  method?: "GET" | "POST" | "PUT" | "DELETE",
  body?: unknown
) => Promise<T>;
export function createCatalogGateway(request: CatalogRequest) {
  return {
    list: () => request<CatalogRecord[]>("/ecommerce/catalog"),
    lookups: () => request<CatalogLookups>("/ecommerce/catalog/lookups"),
    get: (uuid: string) => request<CatalogRecord>(`/ecommerce/catalog/${encodeURIComponent(uuid)}`),
    activity: (uuid: string) =>
      request<CatalogActivity[]>(`/ecommerce/catalog/${encodeURIComponent(uuid)}/activity`),
    create: (input: CatalogInput) => request<CatalogRecord>("/ecommerce/catalog", "POST", input),
    update: (uuid: string, input: CatalogInput) =>
      request<CatalogRecord>(`/ecommerce/catalog/${encodeURIComponent(uuid)}`, "PUT", input),
    activate: (uuid: string) =>
      request<CatalogRecord>(`/ecommerce/catalog/${encodeURIComponent(uuid)}/activate`, "POST"),
    deactivate: (uuid: string) =>
      request<CatalogRecord>(`/ecommerce/catalog/${encodeURIComponent(uuid)}/deactivate`, "POST"),
    remove: (uuid: string) =>
      request<CatalogRecord>(`/ecommerce/catalog/${encodeURIComponent(uuid)}/force`, "DELETE")
  };
}
export type CatalogGateway = ReturnType<typeof createCatalogGateway>;
