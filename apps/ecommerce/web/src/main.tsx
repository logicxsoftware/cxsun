import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { StorefrontPage } from "./modules/storefront";
import "@cxsun/ui/styles.css";

declare const __CXSUN_PLATFORM_WEB_PORT__: number;

const pathname = window.location.pathname;
const isAdminRoute = pathname.startsWith("/app") || pathname.startsWith("/admin");

if (!isAdminRoute) {
  createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={new QueryClient()}>
      <StorefrontPage />
    </QueryClientProvider>
  );
} else {
  const platformUrl = new URL(window.location.href);
  platformUrl.port = String(__CXSUN_PLATFORM_WEB_PORT__);
  platformUrl.pathname = "/app/ecommerce";
  platformUrl.search = "";
  platformUrl.hash = "";
  window.location.replace(platformUrl.href);
}
