# Q Cafe in the CXSUN workspace

Q Cafe keeps its React frontend, SQLite API, PIN sign-in, and Tauri desktop source. The CXSUN Platform registers it as a tenant app and opens its frontend at `/app/q-cafe`. The tenant must sign in to Platform to use the launcher. Q Cafe then asks for its own cashier PIN or username. Platform authentication does not replace Q Cafe's staff roles or PIN checks.

## Local development

Set these values in the root `.env` (the root `.env.example` documents them):

```dotenv
CXSUN_TENANCY_MODE=single
CXSUN_Q_CAFE_API_PORT=4180
CXSUN_Q_CAFE_WEB_PORT=5180
CXSUN_Q_CAFE_DATABASE_PATH=apps/q-cafe/.local/q-cafe.sqlite
CXSUN_Q_CAFE_IMAGE_DIRECTORY=apps/q-cafe/.local/images
```

Run `npm run dev` from the repository root. This starts the Platform API and web server, Q Cafe API and web server, and the other workspace frontends. Open the Platform app launcher and select **Q Cafe**, or open `/app/q-cafe` after Platform sign-in. The Platform web server forwards `/q-cafe/` to the Q Cafe Vite frontend and `/api/v1/q-cafe` to its loopback API. `npm run dev:q-cafe:api` and `npm run dev:q-cafe:web` start its services separately.

The Q Cafe API's internal operator token is generated when its local service starts. PIN sign-in and staff permission checks remain in the Q Cafe API. Existing `.local/` data is preserved. Do not remove the SQLite file or use a bootstrap PIN against an existing restaurant database.

## Build and checks

`npm run build:q-cafe` builds the browser frontend into `dist/apps/q-cafe/web`; `npm run build:q-cafe:desktop` builds the Tauri asset variant with a root base path. The Windows build commands are in the [desktop README](desktop/README.md). Q Cafe's own release version remains in `version.json`; the three npm workspace package versions follow the root CXSUN version. Run `npm test -w @cxsun/q-cafe-api` for API tests and `npm run typecheck -w @cxsun/q-cafe-web` for frontend types.

## Deployment boundary

This adapter is for a single tenant. Q Cafe currently uses one SQLite database and does not select storage by Platform tenant. The development supervisor therefore starts Q Cafe only with `CXSUN_TENANCY_MODE=single`; the Q Cafe API refuses to start otherwise. Do not expose this shared database to a multi-tenant deployment. Hosted routing, persistent storage, and independent Q Cafe API process supervision still need a production deployment configuration.
