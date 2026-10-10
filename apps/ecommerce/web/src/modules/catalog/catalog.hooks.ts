import { useQuery } from "@tanstack/react-query";
import type { CatalogGateway } from "./catalog.services";
export const catalogQueryKey = ["ecommerce", "catalog"] as const;
export function useCatalog(gateway: CatalogGateway) {
  return useQuery({ queryKey: catalogQueryKey, queryFn: gateway.list });
}
export function useCatalogLookups(gateway: CatalogGateway) {
  return useQuery({ queryKey: [...catalogQueryKey, "lookups"], queryFn: gateway.lookups });
}
export function useCatalogActivity(gateway: CatalogGateway, uuid: string | null) {
  return useQuery({
    queryKey: [...catalogQueryKey, "activity", uuid],
    queryFn: () => gateway.activity(uuid!),
    enabled: uuid !== null
  });
}
