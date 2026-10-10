import { useQuery } from "@tanstack/react-query";
import type { StorefrontGateway } from "./storefront.services";
export const storefrontKey = ["ecommerce", "storefront"] as const;
export function useStorefrontConfig(gateway: StorefrontGateway) {
  return useQuery({
    queryKey: [...storefrontKey, "config"],
    queryFn: gateway.config,
    retry: false
  });
}
export function useStorefrontQuotes(gateway: StorefrontGateway, enabled: boolean) {
  return useQuery({
    queryKey: [...storefrontKey, "quotes"],
    queryFn: gateway.quotes,
    enabled,
    retry: false
  });
}
