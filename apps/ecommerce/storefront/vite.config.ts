import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
const root = fileURLToPath(new URL("../../..", import.meta.url));
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, "");
  const port = Number(env.CXSUN_STOREFRONT_WEB_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("CXSUN_STOREFRONT_WEB_PORT is required");
  const apiPort = Number(env.PLATFORM_API_PORT);
  if (!Number.isInteger(apiPort) || apiPort < 1) throw new Error("PLATFORM_API_PORT is required");
  return {
    plugins: [react(), tailwindcss()],
    envDir: root,
    cacheDir: resolve(root, "node_modules/.vite/ecommerce-storefront"),
    define: { __CXSUN_PLATFORM_WEB_PORT__: JSON.stringify(Number(env.PLATFORM_WEB_PORT)) },
    build: { outDir: resolve(root, "dist/apps/ecommerce/storefront"), emptyOutDir: true },
    server: {
      host: "127.0.0.1",
      port,
      strictPort: true,
      proxy: {
        "/api/platform": {
          target: `http://127.0.0.1:${apiPort}`,
          changeOrigin: false,
          rewrite: (path) => path.replace(/^\/api\/platform/, "")
        }
      }
    }
  };
});
