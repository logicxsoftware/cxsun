import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';

const qCafeVersion = JSON.parse(readFileSync(resolve(import.meta.dirname, '../version.json'), 'utf8')).version;

export default defineConfig(({ mode }) => {
  const runtime = loadEnv(mode, resolve(import.meta.dirname, '../../..'), '');
  const apiPort = Number(runtime.CXSUN_Q_CAFE_API_PORT);
  const webPort = Number(runtime.CXSUN_Q_CAFE_WEB_PORT);
  if (!Number.isInteger(apiPort) || !Number.isInteger(webPort)) {
    throw new Error('CXSUN_Q_CAFE_API_PORT and CXSUN_Q_CAFE_WEB_PORT must be set in the root environment.');
  }
  return {
    base: mode === 'desktop' ? '/' : '/q-cafe/',
    build: { outDir: '../../../dist/apps/q-cafe/web', emptyOutDir: true },
    cacheDir: '../../../node_modules/.vite/q-cafe-web',
    define: { __QCAFE_VERSION__: JSON.stringify(qCafeVersion) },
    plugins: [react(), tailwind()],
    server: {
      host: '127.0.0.1',
      port: webPort,
      strictPort: true,
      proxy: { '/api/v1/q-cafe': `http://127.0.0.1:${apiPort}` },
    },
  };
});
