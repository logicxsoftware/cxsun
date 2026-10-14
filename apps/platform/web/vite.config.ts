import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolink from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import {
  platformWebAllowedHosts,
  requireEnvNumber,
  requireEnvValue,
  resolvePlatformRuntime
} from "@cxsun/framework/env";

const configDir = fileURLToPath(new URL(".", import.meta.url));
const rootPackage = JSON.parse(
  readFileSync(resolve(configDir, "../../../package.json"), "utf8")
) as { version: string };

export default defineConfig(({ command, mode }) => {
  const runtimeEnv = loadEnv(mode, resolve(configDir, "../../.."), "");

  return {
    build: {
      chunkSizeWarningLimit: 450,
      emptyOutDir: true,
      outDir: "../../../dist/apps/platform/web"
    },
    cacheDir: "../../../node_modules/.vite/platform-web",
    envDir: "../../..",
    define: {
      __APP_VERSION__: JSON.stringify(rootPackage.version),
      __CXSUN_ECOMMERCE_WEB_PORT__: JSON.stringify(Number(runtimeEnv.CXSUN_ECOMMERCE_WEB_PORT))
    },
    optimizeDeps: {
      exclude: [
        "@cxsun/codexsun-web",
        "@codexsun/blog/web",
        "@cxsun/billing-web",
        "@cxsun/core-web",
        "@cxsun/crm-web",
        "@cxsun/frappe-web",
        "@cxsun/zetro-web",
        "@cxsun/docs-web",
        "@cxsun/hrms-web",
        "@cxsun/notes-web",
        "@cxsun/chat-web"
      ],
      include: [
        "react-markdown",
        "remark-gfm",
        "rehype-highlight",
        "rehype-slug",
        "rehype-autolink-headings",
        "lowlight",
        "style-to-js",
        "style-to-object",
        "@mdx-js/react",
        "react-is",
        "use-sync-external-store/shim",
        "use-sync-external-store/shim/index.js",
        "use-sync-external-store/shim/with-selector",
        "use-sync-external-store/shim/with-selector.js"
      ]
    },
    plugins: [
      {
        enforce: "pre",
        ...mdx({
          providerImportSource: "@mdx-js/react",
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeSlug, [rehypeAutolink, { behavior: "wrap" }], rehypeHighlight]
        })
      },
      tailwindcss(),
      react({ include: /\.(jsx|tsx|md|mdx)$/ })
    ],
    resolve: {
      alias: {
        "@cxsun/ui/workspace/column-filter": resolve(
          configDir,
          "../../../packages/ui/src/workspace/column-filter.tsx"
        ),
        "@cxsun/hrms-web/modules/employee": resolve(
          configDir,
          "../../hrms/web/src/modules/employee/index.ts"
        ),
        "@cxsun/hrms-web/modules/attendance": resolve(
          configDir,
          "../../hrms/web/src/modules/attendance/index.ts"
        ),
        "@cxsun/ui/workspace/row-actions": resolve(
          configDir,
          "../../../packages/ui/src/workspace/row-actions.tsx"
        ),
        "@cxsun/codexsun-web": resolve(configDir, "../../codexsun/web/src/index.ts"),
        "@cxsun/docs-web/modules/overview/gateway": resolve(
          configDir,
          "../../docs/web/src/modules/overview/overview.services.ts"
        ),
        "@cxsun/docs-web/modules/overview": resolve(
          configDir,
          "../../docs/web/src/modules/overview/index.ts"
        ),
        "@cxsun/docs-web/modules/knowledge": resolve(
          configDir,
          "../../docs/web/src/modules/knowledge/index.ts"
        ),
        "@cxsun/docs-content": resolve(configDir, "../../docs/content"),
        "@cxsun/core-web/modules/master/contact/workspace": resolve(
          configDir,
          "../../core/web/src/modules/master/contact/contact.workspace.tsx"
        ),
        "@cxsun/crm-web/modules/enquiry/services": resolve(
          configDir,
          "../../crm/web/src/modules/enquiry/enquiry.services.ts"
        ),
        "@cxsun/crm-web/modules/enquiry/hooks": resolve(
          configDir,
          "../../crm/web/src/modules/enquiry/enquiry.hooks.ts"
        ),
        "@cxsun/crm-web/modules/call-log": resolve(
          configDir,
          "../../crm/web/src/modules/call-log/index.ts"
        ),
        "@cxsun/ui/layouts/application-layout": resolve(
          configDir,
          "../../../packages/ui/src/layouts/application-layout.tsx"
        ),
        "@cxsun/ui/workspace/lookup": resolve(
          configDir,
          "../../../packages/ui/src/workspace/lookup.tsx"
        ),
        "@cxsun/billing-web/modules/reports": resolve(
          configDir,
          "../../billing/web/src/modules/reports/index.ts"
        ),
        "@cxsun/billing-web/modules/quotation": resolve(
          configDir,
          "../../billing/web/src/modules/quotation/index.ts"
        ),
        "@cxsun/billing-web/modules/sales": resolve(
          configDir,
          "../../billing/web/src/modules/sales/index.ts"
        ),
        "@cxsun/billing-web/modules/purchase": resolve(
          configDir,
          "../../billing/web/src/modules/purchase/index.ts"
        ),
        "@cxsun/billing-web/modules/export-sales": resolve(
          configDir,
          "../../billing/web/src/modules/export-sales/index.ts"
        ),
        "@cxsun/billing-web/modules/receipt": resolve(
          configDir,
          "../../billing/web/src/modules/receipt/index.ts"
        ),
        "@cxsun/billing-web/modules/payment": resolve(
          configDir,
          "../../billing/web/src/modules/payment/index.ts"
        ),
        "@cxsun/crm-web/modules/enquiry": resolve(
          configDir,
          "../../crm/web/src/modules/enquiry/index.ts"
        ),
        "@cxsun/crm-web/modules/data-source": resolve(
          configDir,
          "../../crm/web/src/modules/data-source/index.ts"
        ),
        "@cxsun/ecommerce-web/modules/pages": resolve(
          configDir,
          "../../ecommerce/web/src/modules/ecommerce-composition/ecommerce-composition.pages.tsx"
        ),
        "@cxsun/ecommerce-web/modules/overview/gateway": resolve(
          configDir,
          "../../ecommerce/web/src/modules/overview/overview.services.ts"
        ),
        "@cxsun/ecommerce-web/modules/overview": resolve(
          configDir,
          "../../ecommerce/web/src/modules/overview/index.ts"
        ),
        "@cxsun/crm-web/modules/reports": resolve(
          configDir,
          "../../crm/web/src/modules/reports/index.ts"
        ),
        "@cxsun/frappe-web/modules/export": resolve(
          configDir,
          "../../frappe/web/src/modules/export/index.ts"
        ),
        "@cxsun/frappe-web/modules/live-sync": resolve(
          configDir,
          "../../frappe/web/src/modules/live-sync/index.ts"
        ),
        "@cxsun/zetro-web/modules/provider": resolve(
          configDir,
          "../../zetro/web/src/modules/provider/index.ts"
        ),
        "@cxsun/zetro-web/modules/admin": resolve(
          configDir,
          "../../zetro/web/src/modules/admin/index.ts"
        ),
        "@cxsun/zetro-web/modules/chat": resolve(
          configDir,
          "../../zetro/web/src/modules/chat/index.ts"
        ),
        "@cxsun/core-web/modules/master/contact": resolve(
          configDir,
          "../../core/web/src/modules/master/contact/index.ts"
        ),
        "@cxsun/chat-web/modules/chat": resolve(
          configDir,
          "../../chat/web/src/modules/chat/index.ts"
        ),
        "@cxsun/chat-web": resolve(configDir, "../../chat/web/src/index.ts")
      },
      preserveSymlinks: true
    },
    ...(command === "serve" ? { server: platformDevelopmentServer(runtimeEnv) } : {})
  };
});

function platformDevelopmentServer(runtimeEnv: Record<string, string | undefined>) {
  const platformRuntime = resolvePlatformRuntime({
    NODE_ENV: requireEnvValue(runtimeEnv.NODE_ENV, "NODE_ENV"),
    PLATFORM_API_PORT: requireEnvNumber(runtimeEnv.PLATFORM_API_PORT, "PLATFORM_API_PORT")
  });
  const proxy = {
    ws: true,
    changeOrigin: false,
    target: platformRuntime.apiUrl
  };

  return {
    allowedHosts: platformWebAllowedHosts(
      requireEnvValue(runtimeEnv.PLATFORM_WEB_ORIGIN, "PLATFORM_WEB_ORIGIN")
    ),
    headers: {
      "Permissions-Policy": "unload=*"
    },
    host: platformRuntime.webBindHost,
    port: requireEnvNumber(runtimeEnv.PLATFORM_WEB_PORT, "PLATFORM_WEB_PORT"),
    proxy: {
      "/q-cafe": {
        changeOrigin: false,
        target: `http://127.0.0.1:${requireEnvNumber(runtimeEnv.CXSUN_Q_CAFE_WEB_PORT, "CXSUN_Q_CAFE_WEB_PORT")}`
      },
      "/api/app/codexsun/socket.io": {
        ...proxy,
        rewrite: (path: string) => path.replace(/^\/api\/app/u, "")
      },
      "/api/app": proxy,
      "/api/billing": {
        ...proxy,
        rewrite: (path: string) => path.replace(/^\/api\/billing/u, "") || "/"
      },
      "/api/core": {
        ...proxy,
        rewrite: (path: string) => path.replace(/^\/api\/core/u, "") || "/"
      },
      "/api/project-manager": {
        ...proxy,
        rewrite: (path: string) =>
          `/project-manager${path.replace(/^\/api\/project-manager/u, "") || "/"}`
      },
      "/api/zuno": {
        ...proxy,
        rewrite: (path: string) => `/zuno${path.replace(/^\/api\/zuno/u, "") || "/"}`
      },
      "/api/platform": {
        ...proxy,
        rewrite: (path: string) => path.replace(/^\/api\/platform/u, "") || "/"
      }
    }
  };
}
