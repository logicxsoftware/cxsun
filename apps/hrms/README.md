# HRMS

HRMS means **Human Resource Management System**. Its purpose is people and workforce administration.

## Implemented app foundation

- Separate `@cxsun/hrms-api` and `@cxsun/hrms-web` workspaces, versioned with the repository.
- Tenant launcher entry, app switching and default-landing selection.
- An app-owned desk with **Overview**, **Employees** and **Getting Started** side-menu entries.
- Authenticated, permission-checked overview showing the current tenant, signed-in user and last checked time. Loading, retry and access-error states use shared UI components.

| Contract                     | Value                                  |
| ---------------------------- | -------------------------------------- |
| App / entitlement key        | `hrms`                                 |
| Overview module / permission | `hrms.overview` / `hrms.overview.view` |
| Desk URL                     | `/app/hrms/overview`                   |
| Getting Started URL          | `/app/hrms/guide`                      |
| Employees URL                | `/app/hrms/employees`                  |
| New employee URL             | `/app/hrms/employees/new`              |
| Edit employee URL            | `/app/hrms/employees/{uuid}/edit`      |
| Browser employee API         | `/api/app/hrms/employees`              |
| Browser overview API         | `GET /api/app/hrms/overview`           |
| Module-owned API route       | `GET /hrms/overview`                   |

The desk uses Platform's existing `TenantMainLayout`, including top menu, sidebar, app header, workspace and status bar. The frontend is composed into Platform Web on its configured port; this foundation does not start an additional web server. Backend routes are composed through the app's public export in Platform API. No app has a separate login or stores browser tokens.

## Activation and access

1. Seed the Platform app registry so the app is available in Plan Access.
2. Enable `hrms` through Plan Access; use tenant Entitlements only for an explicit exception and confirm effective access.
3. Run tenant migrations to create the employee tables.
4. Run tenant seeding to register overview and employee permissions. The existing admin role receives the initial grants.
5. Assign other roles explicitly through tenant access management.
6. Sign in or reload tenant runtime context, then select HRMS in the app launcher.

The API resolves the active tenant and its isolated database from the authenticated session. It checks live `app_module_settings` activation and the overview permission. Browser tenant/database headers cannot select another tenant. A disabled app is hidden from app switching and its API rejects access. Permission seeds are deterministic and repeatable; rerunning them preserves deliberately disabled permissions and role grants.

## Ownership and database impact

Core remains owner of shared contacts and organisation. HRMS will own employment, attendance, leave and payroll records. Reuse public Core identity lookups; do not store staff salaries in Core or Platform auth tables.

The employee module owns `hrms_employees` and `hrms_employee_activity` in each tenant database.
Migration scope `hrms.employee`, batch 1, step 1 creates these tables after tenant identity and Core prerequisites.
Existing tenants need this migration before they open Employees. The migration does not alter existing Core or user tables.
Permission seeds run only for enabled HRMS tenants. They preserve disabled permissions and role grants.

The overview remains read-only and has no business table or CRUD lifecycle.

## Employees

Employees include a required employee code and name, plus email, phone, department, designation, joining date, notes and status.
Department and designation are text fields until their master modules exist.
Employee codes use uppercase letters, numbers, hyphens and underscores, with a maximum of 40 characters.
Codes are unique within each tenant database.

An employee can optionally map to an existing tenant user through `user_id`.
One user account can map to only one employee. New mappings require active users.
Existing mappings remain editable if the user becomes inactive.
Mapping does not create login credentials or grant roles and permissions.
The tenant user lifecycle checks the public HRMS dependency contract before user deletion.
The database foreign key also blocks deletion of a mapped user.

The Employees list follows the CRM enquiry layout with the shared sortable table, column visibility controls and inline column searches.
It provides global search, status filters, pagination, details and activity history.
New and edit open separate upsert pages. Direct links and browser reload load the selected employee from the API.
The app header provides New employee and form Save/Update actions. Cancel returns to the employee list.
Suspend and restore change employee status. They do not change user account access.
Delete moves an employee to Deleted employees. Restore from that list returns the employee as inactive.
Deleted employees retain their code and user mapping until permanent deletion or a later edit after restoration.
Force delete requires prior deletion and retains activity history.
No attendance, payroll or other employee-dependent records exist in this module yet.
Future dependent modules must add public deletion blockers before they register employee relationships.

The module uses `hrms.employee.view`, `hrms.employee.create`, `hrms.employee.update` and `hrms.employee.delete`.
Each API operation checks the matching permission and live HRMS activation.
Employee APIs use eight-character public UUIDs. Integer employee IDs remain database-internal.

## Planned modules

Department/position masters, attendance and shifts, leave requests and approvals, payroll and statutory exports, recruitment and onboarding.

These workflows remain planned. Employee business records are entered by users and are not seeded.

## Development and verification

Run commands from the repository root; use the root dependency installation and output directories:

```bash
npm run dev:api
npm run dev:web
npm run typecheck -w @cxsun/hrms-api
npm run typecheck -w @cxsun/hrms-web
node tools/check-module-boundaries.mjs hrms-api
node tools/check-module-boundaries.mjs hrms-web
npm run test:tenant-app-foundations
npm run test:e2e:hrms
npm run test:e2e:tenant-app-foundations
```

The E2E command requires the development Platform stack and an isolated `cxsun_dev_` master and tenant database. It verifies login, published launcher metadata, each overview, forged-header isolation, inactive module/permission rejection and repeatable permission seeding. It restores any temporary access changes. Root `npm run check`, `npm run dependencies:check` and `npm run build` remain the release gates.

The employee E2E test uses two temporary `cxsun_dev_hrms_*` databases and removes them after the test.
It checks repeated migrations, permission seeding, user validation, uniqueness races, lifecycle, audit history, isolation and persistence after reconnect.
It also checks module API authentication and permission gates with an injected test context.
It does not replace composed Platform login or browser verification.
