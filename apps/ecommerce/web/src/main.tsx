import { EcommerceStorefrontWorkspace, createStorefrontGateway } from "./modules/storefront";
declare const __CXSUN_STOREFRONT_WEB_PORT__: number;
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Package, LayoutGrid } from "lucide-react";
import { MainLayout } from "@cxsun/ui/layouts/main-layouts";
import { Button } from "@cxsun/ui/components/button";
import { EcommerceOverviewWorkspace } from "./modules/overview";
import { createEcommerceOverviewGateway } from "./modules/overview/overview.services";
import { EcommerceCatalogWorkspace, createCatalogGateway } from "./modules/catalog";
import "@cxsun/ui/styles.css";

declare const __CXSUN_PLATFORM_WEB_PORT__: number;
const platformUrl = new URL(window.location.href);
platformUrl.port = String(__CXSUN_PLATFORM_WEB_PORT__);
platformUrl.pathname = "/app/ecommerce/overview";
platformUrl.hash = "";
platformUrl.search = "";
const handoff = new URLSearchParams(window.location.hash.slice(1)).get("sessionSlot");
if (handoff && /^[0-9a-f]{32}$/u.test(handoff)) sessionStorage.setItem("cxsun.auth.slot", handoff);
history.replaceState(null, "", window.location.pathname + window.location.search);

async function request<T>(path: string, method = "GET", payload?: unknown): Promise<T> {
  const slot = sessionStorage.getItem("cxsun.auth.slot");
  const response = await fetch(`/api/platform${path}`, {
    method,
    credentials: "include",
    ...(payload !== undefined ? { body: JSON.stringify(payload) } : {}),
    headers: {
      ...(slot ? { "x-cxsun-session-slot": slot } : {}),
      ...(payload !== undefined ? { "Content-Type": "application/json" } : {})
    }
  });
  const body = await response.json();
  if (!response.ok || !body.success) throw new Error(body.error?.message ?? "Request failed");
  return body.data as T;
}
const gateway = createEcommerceOverviewGateway(request);
const storefrontGateway = createStorefrontGateway(request);
function openPublicStore() {
  const url = new URL(window.location.href);
  url.port = String(__CXSUN_STOREFRONT_WEB_PORT__);
  url.pathname = "/";
  url.search = "";
  url.hash = "";
  window.open(url.href, "_blank", "noopener,noreferrer");
}
const catalogGateway = createCatalogGateway(request);
function EcommerceDesk() {
  const [signedOut, setSignedOut] = useState(false);
  const [page, setPage] = useState(
    window.location.pathname === "/storefront"
      ? "Storefront"
      : window.location.pathname === "/catalog"
        ? "Catalog"
        : "Overview"
  );
  useEffect(() => {
    const update = () =>
      setPage(
        window.location.pathname === "/storefront"
          ? "Storefront"
          : window.location.pathname === "/catalog"
            ? "Catalog"
            : "Overview"
      );
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);
  function navigate(value: string) {
    history.pushState(
      null,
      "",
      value === "Storefront" ? "/storefront" : value === "Catalog" ? "/catalog" : "/"
    );
    setPage(value);
  }
  const session = useQuery({
    queryKey: ["ecommerce", "session"],
    retry: false,
    queryFn: () =>
      request<{ email: string; name?: string; authenticated: boolean }>("/auth/session")
  });
  if (session.isPending)
    return (
      <p className="p-6" role="status">
        Loading your workspace…
      </p>
    );
  if (signedOut || session.isError || !session.data?.authenticated)
    return (
      <main className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Ecommerce</h1>
        <p>Sign in through your tenant workspace to open Ecommerce.</p>
        <Button onClick={() => window.location.assign(platformUrl.href)}>
          Open tenant workspace
        </Button>
      </main>
    );
  return (
    <MainLayout
      applicationName="Ecommerce"
      workspaceTitle={page}
      statusLabel="Connected to Platform"
      user={{
        email: session.data.email,
        name: session.data.name ?? session.data.email,
        fallback: "EC"
      }}
      navigation={[
        {
          label: "Ecommerce",
          icon: Package,
          items: [
            { label: "Overview", icon: LayoutGrid, onSelect: () => navigate("Overview") },
            { label: "Catalog", icon: Package, onSelect: () => navigate("Catalog") },
            { label: "Storefront", icon: Package, onSelect: () => navigate("Storefront") }
          ]
        }
      ]}
      appItems={[
        {
          title: "Application",
          description: "Return to tenant apps",
          icon: LayoutGrid,
          url: new URL("/app/application/overview", platformUrl).href
        },
        { title: "Ecommerce", description: "Ecommerce desk", icon: Package, active: true }
      ]}
      onLogout={async () => {
        await request("/auth/logout", "POST");
        sessionStorage.removeItem("cxsun.auth.slot");
        setSignedOut(true);
      }}
    >
      {page === "Storefront" ? (
        <EcommerceStorefrontWorkspace gateway={storefrontGateway} onOpenStore={openPublicStore} />
      ) : page === "Catalog" ? (
        <EcommerceCatalogWorkspace gateway={catalogGateway} />
      ) : (
        <EcommerceOverviewWorkspace gateway={gateway} />
      )}
    </MainLayout>
  );
}
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={new QueryClient()}>
    <EcommerceDesk />
  </QueryClientProvider>
);
