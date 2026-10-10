import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TechmediaStorefront } from "./modules/shop";
import { createShopGateway } from "./modules/shop/shop.services";
import "@cxsun/ui/styles.css";
const gateway = createShopGateway(async <T,>(path: string, body?: unknown): Promise<T> => {
  const response = await fetch(`/api/platform${path}`, {
    method: body ? "POST" : "GET",
    credentials: "omit",
    ...(body ? { body: JSON.stringify(body), headers: { "Content-Type": "application/json" } } : {})
  });
  const result = await response.json();
  if (!response.ok || !result.success)
    throw new Error(result.error?.message ?? "The store could not be loaded.");
  return result.data as T;
});
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={new QueryClient()}>
    <TechmediaStorefront gateway={gateway} />
  </QueryClientProvider>
);
