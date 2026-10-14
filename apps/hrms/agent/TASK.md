# CXSUN HRMS Tasks

Track delivery against [PLAN.md](./PLAN.md). Check an item only after its code and verification are complete. Keep this file current as work ships.

## Phase 0 - Existing foundation

- [x] 0.1 Register HRMS in Platform app composition and tenant navigation.
- [x] 0.2 Add the tenant-scoped employee module with employee code and optional existing-user mapping.
- [x] 0.3 Add employee list, details, separate create/edit pages, lifecycle actions, and activity history.
- [x] 0.4 Add the tenant-scoped manual attendance module with present, absent, leave, and holiday records.
- [x] 0.5 Add attendance list filters, create/edit/delete actions, and activity history.
- [x] 0.6 Connect employee and attendance summaries to the HRMS overview.
- [x] 0.7 Add tenant migrations, repeatable permissions, and Platform API/web composition for the current modules.

## Phase 1 - Employee and organization foundations

- [ ] 1.1 Define Department and Designation module contracts, permissions, fields, and lifecycle rules.
- [ ] 1.2 Implement separate Department backend and frontend leaves.
- [ ] 1.3 Implement separate Designation backend and frontend leaves.
- [ ] 1.4 Plan and run a tenant-safe migration from employee department/designation text to master references.
- [ ] 1.5 Add employee manager/reporting relation using public employee IDs.
- [ ] 1.6 Validate manager existence, tenant scope, self-reporting, and circular reporting in the backend.
- [ ] 1.7 Preserve employee code uniqueness, optional user mapping, activity history, and deletion blockers.
- [ ] 1.8 Add focused API, migration, relationship, permission, and tenant-isolation verification.
- [ ] 1.9 Add Platform routes, permissions, menus, and employee form lookups.
- [ ] 1.10 Update `apps/hrms/README.md` with the shipped organization and employee behavior.
- [ ] 1.11 Define and persist employment start/end dates and valid status transitions.
- [ ] 1.12 On employment end, close device-ID mappings and future shift assignments without deleting history.

## Phase 2 - Shifts, holidays, and attendance rules

- [ ] 2.1 Define the first shift and holiday requirements, including tenant-local time and overnight shifts.
- [ ] 2.2 Implement a separate Shift module for shift records and effective-dated employee assignments.
- [ ] 2.3 Implement a separate Holiday module for dates and applicable tenant or employee groups.
- [ ] 2.4 Extend attendance with half-day status and status-specific validation.
- [ ] 2.5 Reject future attendance dates and invalid check-in/out ranges using tenant-local time.
- [ ] 2.6 Enforce one final attendance record per employee and work date.
- [ ] 2.7 Use shift and holiday data to calculate scheduled and unmarked employees.
- [ ] 2.8 Add date, employee, and status filters and a simple monthly attendance view.
- [ ] 2.9 Preserve manual corrections with actor, timestamp, and reason.
- [ ] 2.10 Define status-specific check-in/out rules and how leave, holidays, inactive employees, and non-working days affect attendance.
- [ ] 2.11 Update overview attendance counts and links from attendance-owned queries.
- [ ] 2.12 Verify migration reruns, permissions, tenant isolation, calculations, and composed browser flows.
- [ ] 2.13 Update `apps/hrms/README.md` with shift, holiday, and attendance behavior.

## Phase 3 - ZKTeco attendance logs

### Device and integration gate

- [ ] 3.1 Record the customer's exact ZKTeco model, firmware, network location, time zone, and device time settings.
- [ ] 3.2 Confirm the model's supported attendance protocol, connector placement, SDK license terms, and any existing ZKTeco middleware.
- [ ] 3.3 Document the selected model-specific connection and recovery design before implementation.

### Device registry and connector

- [ ] 3.4 Define a tenant-scoped device registry and its create, update, disable, health, and audit permissions.
- [ ] 3.5 Implement a separate Attendance Devices module and admin page.
- [ ] 3.6 Issue a server-side credential bound to one tenant and registered device. Support authorized rotation and revocation.
- [ ] 3.7 Run the connector on the tenant LAN or approved middleware and use authenticated TLS to deliver logs.
- [ ] 3.8 Keep credentials out of browser code, responses, and logs. Do not expose device management ports publicly.
- [ ] 3.9 Show device status, last successful sync, queued event count, and last error.

### Punch logs and attendance processing

- [ ] 3.10 Define immutable punch-log and processing-exception contracts.
- [ ] 3.11 Implement a separate Punch Logs module for received events, deduplication, review, and processing history.
- [ ] 3.12 Persist source device, source event ID or stable fingerprint, original event time, time zone, punch direction, and received time.
- [ ] 3.13 Add a durable queue and sync cursor. Acknowledge only after database commit. Recover after restart and replay without loss or duplication.
- [ ] 3.14 Add effective-dated device-user/badge ID mappings to employee public IDs.
- [ ] 3.15 Add review flows for unmapped, ambiguous, invalid, duplicate, missing, or out-of-order events.
- [ ] 3.16 Deactivate mappings on employee separation. Do not import biometric templates, face images, or fingerprint data.
- [ ] 3.17 Process reviewed events with shift and holiday rules. Require preview and reason before changing a manually corrected or approved result.
- [ ] 3.18 Verify tenant-bound credentials, forged tenant rejection, duplicate replay, offline recovery, clock drift, mapping history, and recalculation safety.
- [ ] 3.19 Verify one customer-confirmed device model end to end before adding another adapter.
- [ ] 3.20 Update the overview and `apps/hrms/README.md` with device health and attendance-source behavior.
- [ ] 3.21 Define raw punch-log retention, export permissions, and deletion rules before production rollout.

## Phase 4 - Leave requests and approvals

- [ ] 4.1 Confirm whether leave balances are required for the first release. Keep them out if policy does not require them.
- [ ] 4.2 Define Leave Type, Leave Request, Approval, and optional Balance Ledger module contracts.
- [ ] 4.3 Implement separate Leave Type and Leave Request backend/frontend leaves.
- [ ] 4.4 Add employee self-service for own leave requests and request history.
- [ ] 4.5 Add manager approval queues scoped by stored reporting relationships and permissions.
- [ ] 4.6 Validate date order, overlap, partial days, status transitions, and approver authority in the backend.
- [ ] 4.7 If balances are required, add an auditable ledger and concurrency-safe allocation checks.
- [ ] 4.8 Connect approved leave to attendance and the overview without creating duplicate leave records.
- [ ] 4.9 Verify employee and manager data scope, concurrent approval, repeated actions, audit history, and tenant isolation.
- [ ] 4.10 Add Platform routes, permissions, menus, and `apps/hrms/README.md` documentation.
- [ ] 4.11 Define how approved leave affects daily attendance and how HR corrects conflicting records.

## Phase 5 - Final integration and release checks

- [ ] 5.1 Confirm each module owns its routes, permissions, migrations, seeds, UI, and activity history.
- [ ] 5.2 Confirm no duplicate HR business CRUD exists in Platform or another module.
- [ ] 5.3 Confirm all tenant migrations and permission seeds are repeatable and preserve tenant configuration.
- [ ] 5.4 Verify employee, attendance, device, punch-log, and leave access in two tenant contexts.
- [ ] 5.5 Verify the overview links to filtered, module-owned records and handles empty and error states.
- [ ] 5.6 Verify date display, responsive pages, permission denial, and authenticated API behavior.
- [ ] 5.7 Update HRMS setup and user documentation. Remove any stale scaffold or planned-feature claims.
- [ ] 5.8 Review the final app menu and expose only completed, permission-protected modules.
