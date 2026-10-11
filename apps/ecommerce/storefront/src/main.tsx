import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StorefrontPage } from "@cxsun/ecommerce-web/modules/storefront";
import "@cxsun/ui/styles.css";
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={new QueryClient()}>
    <StorefrontPage />
  </QueryClientProvider>
);
