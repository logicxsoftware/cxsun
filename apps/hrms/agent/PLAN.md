# CXSUN HRMS Plan

**App key:** `hrms`  
**Status:** Core employee, overview, and manual attendance foundation exists

## Goal and scope

Deliver the HR workflows needed to manage employees, record attendance, connect one supported ZKTeco time clock, and process leave requests. Keep the app inside the existing Platform tenant, identity, permission, navigation, and UI contracts.

This plan covers Overview, Employees, Departments, Designations, Attendance, Shifts, Holidays, Attendance Devices, Punch Logs, Leave Types, Leave Requests, and conditional Leave Balances. Payroll, recruitment, expenses, performance, training, and other HR products are out of scope.

## Module ownership and current state

| Module | Status | Owns |
| --- | --- | --- |
| Overview | Implemented | Read-only workforce and attendance summary with links to owned workflows |
| Employees | Implemented; needs organization lookups | Employee code, employment record, optional tenant-user link, lifecycle, and activity |
| Departments | Planned | Department records and their lifecycle |
| Designations | Planned | Designation records and their lifecycle |
| Attendance | Implemented; needs rules and device input | One daily attendance result per employee and date, manual corrections, and activity |
| Shifts | Planned | Shift definitions and effective-dated employee assignments |
| Holidays | Planned | Non-working dates used by attendance calculations |
| Attendance Devices | Planned | Registered ZKTeco device configuration, authentication, health, and employee device-ID mapping |
| Punch Logs | Planned | Immutable received punch events, deduplication, mapping exceptions, and reviewed processing into Attendance |
| Leave Types | Planned | Leave categories and policy settings |
| Leave Requests | Planned | Employee requests and approval decisions |
| Leave Balances | Conditional | Auditable balance ledger when balance enforcement is required |

Employees currently have a searchable list, separate new and edit pages, details, lifecycle actions, activity history, permissions, unique employee codes, and optional mapping to an existing tenant user. Attendance currently supports manual present, absent, leave, or holiday records, optional check-in/out, date and status filters, and activity history. The overview shows employee and attendance totals, a seven-day chart, and recent attendance.

## Requirements by module

### Employees and Organization Masters

- Keep employee code unique within the tenant. Keep employee-to-user mapping optional and unique.
- Do not create tenant users, credentials, roles, or permissions when saving an employee.
- Add Department and Designation as separate module-owned masters. Replace current employee text values through a reviewed migration that preserves existing data.
- Add an optional manager relation using the employee's public ID. Reject self-reporting and invalid relationships in the service.
- Keep employment status separate from soft deletion. Store employment start and end dates, and block invalid status/date combinations.
- Record important employment changes in activity history. When employment ends, close device-ID mappings and remove the employee from future attendance schedules.

### Shifts and Holidays

- Add a separate Shift module with a name, start and end times, work days, and effective-dated employee assignments.
- Support overnight shifts and tenant-local calendar dates.
- Add Holiday as a separate module with tenant dates and clear assignment rules required to calculate scheduled work days.
- Keep shifts and holidays independently editable. Attendance reads them through public module contracts.

### Attendance

- Keep manual attendance as the first entry path. Add half-day status and validate fields by status.
- Allow at most one final daily attendance record per employee and work date.
- Define which statuses require check-in/out and how approved leave, holidays, inactive employment, and non-working days affect a daily record.
- Reject future dates and invalid check-in/out ranges. Use tenant-local dates for validation, filtering, and summaries.
- Add employee, date, and status filters and a simple monthly view.
- Preserve manual corrections with actor, time, reason, and source. Device reprocessing must not silently replace a reviewed result.

### Attendance Devices and Punch Logs

- Start with one customer-confirmed ZKTeco model and firmware. Add other models only through separately reviewed adapters.
- Before implementation, confirm model, firmware, site network, device time zone, supported protocol, SDK terms, and whether a ZKTeco middleware product is already in use.
- Use only a connection mode that the confirmed model supports. Run a connector on the tenant LAN or approved middleware. Send records to Platform over authenticated TLS. Keep device management ports off the public internet.
- Register each device against one tenant. Bind connector credentials to that tenant and device. Resolve tenant scope from the credential and registry, never from a payload field.
- Allow an authorized administrator to revoke or rotate a connector credential without losing device history. Record credential changes without storing the secret.
- Store model, serial number, location, time zone, protocol, status, and last successful sync. Keep credentials server-side and redact them from logs.
- Map each device user or badge ID to an employee public ID. Keep mappings unique, effective-dated, and auditable. Require staff review for missing or ambiguous mappings. Do not match by name.
- Deactivate mappings when employment ends. Do not provision biometric profiles or store face images, fingerprints, or biometric templates.
- Keep punch logs immutable. Store source device, source event ID or stable fingerprint, original event time, device time zone, punch direction, and received time.
- Use a durable sync queue and cursor. Acknowledge a log only after the tenant API stores it. Retry and replay after network or service restarts without loss or duplicates.
- Quarantine invalid, unmapped, duplicate, missing, or out-of-order punches. Show connection state, last sync, queued events, and errors.
- Convert reviewed logs to daily attendance using employee mapping, shift, and holiday rules. Require a preview and reason when recalculation changes an existing result.

### Leave

- Add separate Leave Type and Leave Request modules. Keep approval decisions in the Leave Request lifecycle and activity history.
- Let employees see and manage their own requests. Give managers a queue limited to their authorized reporting scope.
- Validate dates, overlaps, partial days, and approver authority in the backend.
- Add balances only when the product requires them. If enabled, store balance changes in an auditable ledger and prevent concurrent overspending.
- Show approved leave in attendance and the HRMS overview without changing the source request.

### Overview

- Keep the overview read-only. Read counts and summaries through the modules that own the source records.
- Show active employees, marked and unmarked scheduled employees, attendance status totals, recent records, and pending leave approvals when available.
- Exclude non-working days from missing-attendance counts. Link each summary to its relevant filtered module view.

## Platform and data rules

- Store business data in the selected tenant database. Do not add redundant tenant columns where database selection provides isolation.
- Give each entity its own backend and frontend leaf. Platform composes modules but does not own HR business rules or CRUD.
- Use typed routes, server-side permissions, tenant activation checks, public IDs, migrations, repeatable seeds, and module-owned activity history.
- Never trust employee IDs, device IDs, tenant IDs, event times, or permissions supplied by a browser or device without validating them against the authenticated tenant and stored records.
- Use shared `@cxsun/ui` components. Store machine-readable dates and display dates as `DD-MM-YYYY` and date-times as `DD-MM-YYYY HH:mm`.
- Keep personal data out of logs. Do not collect biometric data through this integration.

## Delivery phases

1. Finish employee foundations with Department, Designation, and manager lookups.
2. Add shifts, holidays, and attendance validation and reporting.
3. Add one model-specific ZKTeco connector, device registry, punch log intake, mapping, review, and recovery.
4. Add leave requests and scoped approvals. Add balances only if required.
5. Update the overview from these owned modules and complete composed tenant verification.

## Completion criteria

A phase is complete when its migrations and seeds are safe to rerun, API permissions and tenant isolation are verified, user flows work in the Platform-composed app, audit history is present, and `apps/hrms/README.md` matches the shipped behavior. Do not expose a menu item before its route, permission, and page are ready.

## ZKTeco references

Confirm the exact device documentation and SDK terms for the selected model before coding. ZKTeco lists different communication options across devices.

- [PUSH SDK](https://www.zkteco.com/en/PUSHSDK)
- [SDK downloads](https://www.zkteco.com/en/SDK)
- [Standalone device communication options](https://www.zkteco.com/en/Standalone_Device)
