import type { ShopGateway } from "./shop.types";
export function createShopGateway(
  request: <T>(path: string, body?: unknown) => Promise<T>
): ShopGateway {
  return {
    load: () => request("/public/ecommerce/storefront"),
    quote: (input) => request("/public/ecommerce/quotes", input)
  };
}
