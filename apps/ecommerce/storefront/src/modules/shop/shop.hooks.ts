import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { BasketItem, ShopGateway, ShopProduct } from "./shop.types";
export function useShop(gateway: ShopGateway) {
  const query = useQuery({ queryKey: ["public-storefront"], queryFn: gateway.load, retry: false });
  const [basket, setBasket] = useState<BasketItem[]>([]);
  function add(product: ShopProduct, vendorUuid = product.offers[0]?.vendorUuid) {
    if (!vendorUuid) return;
    setBasket((items) => {
      const found = items.find(
        (i) => i.catalogUuid === product.uuid && i.vendorUuid === vendorUuid
      );
      return found
        ? items.map((i) => (i === found ? { ...i, quantity: Math.min(99, i.quantity + 1) } : i))
        : [...items, { catalogUuid: product.uuid, vendorUuid, quantity: 1 }];
    });
  }
  return { query, basket, setBasket, add };
}
