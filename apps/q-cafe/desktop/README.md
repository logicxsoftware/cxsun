# Q Cafe Windows application

The React frontend is developed in a browser and packaged into a Tauri Windows application. The web and Windows builds use the same Q Cafe screens and PIN flow. Tauri adds local data-folder selection, SQLite backup and API startup, licensing, updates, and Windows receipt printing.

## Development

Run commands from the repository root:

```powershell
npm.cmd run dev:q-cafe
npm.cmd run dev:q-cafe:windows
```

`dev:q-cafe` starts only the Q Cafe API and Vite frontend. Open `http://127.0.0.1:5180/q-cafe/` for browser development. `dev:q-cafe:windows` runs the Tauri host against that same Vite URL. Tauri starts the two services through its `beforeDevCommand`. Development requires `CXSUN_TENANCY_MODE=single` in the root `.env`.

The browser build uses the `/q-cafe/` base path for the Platform proxy. The desktop build uses `/` so Tauri can load packaged assets from its own origin. The frontend calls the loopback API at `127.0.0.1:4180` in Tauri. In a release build, Rust extracts the API source and migrations, starts the bundled Node runtime, and keeps the API's operator token private to the process. Staff still sign in with their Q Cafe PIN or username.

## Packaging

Run `npm.cmd run build:q-cafe:windows` from the repository root. It builds the desktop frontend, Rust host, and Rust print service, then requests both NSIS and MSI installers. It stages the current Windows Node executable under root `dist`. Tauri builds the print service from `src-tauri/src/bin/q-cafe-print-service.rs` and bundles it alongside the host.

The installer carries `node.exe`, the print-service executable, and its installer script. Generated executables stay outside Git; the print-service Rust source is tracked. Q Cafe's release number is `1.0.38` in `version.json`, Tauri configuration, and Cargo metadata; npm workspace package versions follow the CXSUN root version.

The update command now looks for `qcafe-update.json` in the current CXSUN GitHub release. Publish a matching update manifest and installer asset before enabling update checks for customers. `CXSUN_Q_CAFE_UPDATE_MANIFEST_URL` can select a different trusted feed.

## Local data

On the first release launch, Q Cafe asks for a durable data folder. The SQLite database, images, backups, and API log live there. The Rust host keeps the selected folder in the user's application settings and makes a daily SQLite backup before API startup. Installing a new application version does not replace this data folder.
