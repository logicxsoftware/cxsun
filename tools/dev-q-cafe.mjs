#!/usr/bin/env node

import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { loadDevEnv, requiredDevPort } from "./dev-runtime-env.mjs";

const root = resolve(import.meta.dirname, "..");
const env = loadDevEnv(root);
if ((process.env.CXSUN_TENANCY_MODE ?? env.CXSUN_TENANCY_MODE) !== "single") {
  throw new Error("Q Cafe development requires CXSUN_TENANCY_MODE=single.");
}
const apiPort = requiredDevPort(
  process.env.CXSUN_Q_CAFE_API_PORT ?? env.CXSUN_Q_CAFE_API_PORT,
  "CXSUN_Q_CAFE_API_PORT"
);
const webPort = requiredDevPort(
  process.env.CXSUN_Q_CAFE_WEB_PORT ?? env.CXSUN_Q_CAFE_WEB_PORT,
  "CXSUN_Q_CAFE_WEB_PORT"
);
const healthUrls = [
  `http://127.0.0.1:${apiPort}/health`,
  `http://127.0.0.1:${webPort}/q-cafe/`
];

for (let attempt = 0; attempt < 10; attempt += 1) {
  const healthy = await Promise.all(healthUrls.map(isHealthy));
  if (healthy.every(Boolean)) {
    console.log("Q Cafe API and web are already running; reusing them.");
    process.exit(0);
  }
  if (healthy.every((value) => !value)) break;
  await new Promise((resolveWait) => setTimeout(resolveWait, 500));
}

const healthy = await Promise.all(healthUrls.map(isHealthy));
if (healthy.some(Boolean)) {
  throw new Error("Only one Q Cafe service is running. Restore the existing development stack before opening Tauri.");
}

const child = spawn(process.execPath, ["tools/dev-stack.mjs", "--q-cafe-only"], {
  cwd: root,
  env: process.env,
  stdio: "inherit"
});
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => child.kill(signal));
}
child.once("exit", (code) => {
  process.exitCode = code ?? 1;
});

async function isHealthy(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1_000) });
    return response.ok;
  } catch {
    return false;
  }
}
