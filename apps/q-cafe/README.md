# Q Cafe import status

This directory contains an external Q Cafe source import. It is not yet a CXSUN application. The import includes a React web workspace, a standalone SQLite API with nine migrations and tests, Docker files, and a Tauri Windows shell.

## Adoption gaps

| Area | Current import | Work needed for CXSUN adoption |
| --- | --- | --- |
| Web workspace | The web source uses retired `@codexsun/ui` imports and `@codexsun/devkit-ito`, which is absent here. Its direct build fails on missing imports and TypeScript errors. | Move to `@cxsun/ui`, resolve the topology feature through a current public contract, and split business screens into owned frontend modules. |
| Root tooling | The root has no Q Cafe scripts, lockfile entry, app registration, or boundary-check rule. Q Cafe package names use the retired `@codexsun/*` scope. | Add current package names, root scripts and lockfile entries, Platform composition, and boundary checks as one integration change. |
| API ownership | One `server.mjs` and one `store.mjs` own all restaurant actions and tables. Routes use a separate JSON response shape. | Split restaurant entities into API leaf modules with fixed contracts, owned migrations, services, repositories, and exports. |
| Identity and data | The API uses an operator key, PIN sessions, and a local SQLite database. It does not use Platform tenant sessions or tenant database selection. | Choose an explicit deployment model and enforce Platform identity, permissions, and tenant scope before using the shared desk. |
| Desktop build | Tauri expects a web build, a bundled Node executable, and a print-service executable. The root desktop scripts and print-service source are absent. | Add reproducible packaging from source. Generate binaries during packaging and keep them outside Git. |
| Docker runtime | The Dockerfile installs the whole root and starts the root `dev` command. | Add an app-specific production entry point that follows the root dependency and build rules. |
| Naming and docs | Environment keys use `QCAFE_*`, and the imported release notes refer to unavailable root commands. | Migrate internal keys to `CXSUN_*` when integrating, and update operations instructions after the runtime is wired. |

The API has useful domain behavior, including orders, POS billing, kitchen state, stock adjustments, bookings, staff PINs, activity records, and SQLite migrations. Its existing tests can run from the repository root:

```powershell
node --test apps/q-cafe/api/src/access-flow.test.mjs apps/q-cafe/api/src/backup.test.mjs apps/q-cafe/api/src/staff-auth.test.mjs apps/q-cafe/api/src/store.test.mjs
```

Do not deploy or register this import as a CXSUN tenant app yet. The web build fails, and the desktop packaging inputs are incomplete. The local `.local/` folder contains private operator credentials and restaurant data. Keep it outside Git and preserve it when cleaning generated files.
