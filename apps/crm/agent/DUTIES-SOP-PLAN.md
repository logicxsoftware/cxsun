# CRM Duties, SOP, and Reporting Plan

## Goal

Add local CRM modules for reusable procedures, employee duties, completion
reports, and report search. The tenant CRM database is the only business-data
source. Web and mobile clients use the same CRM API and permissions.

## Reference Model Reviewed

The TechMedia implementation in `D:\workspace\techmedia` reads the following
Frappe records:

| Reference record | Fields used                                               | Current relationship                                                                                  |
| ---------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| SOP Assigned     | `user`, `sop_item`, `index`                               | Assigns an SOP Item to the employee linked to the signed-in user and orders the employee's duty list. |
| SOP Item         | `name`, `sop_name`, `department`, `frequency`, `steps`    | Supplies the display name, department, recurrence, and procedure instructions.                        |
| SOP Reporting    | `name`, `sop_item`, `date`, `actions`, `creation`, `user` | Records an employee's submitted completion actions for an assigned SOP Item.                          |

The reference app lists assignments for the signed-in employee, joins each
assignment to its SOP Item, and attaches reports for the same employee and item.
It lets an employee submit an actions text and uses the current local date. The
mobile app shows the latest report on each duty and recent updates from the last
three days. The TechMedia code does not read a parent SOP DocType. The SOP parent
in this plan is a CRM-owned grouping model, not a direct copy of a source record.
The reference does not expose SOP authoring, full assignment administration,
explicit completion status, evidence attachments, report idempotency, or
filtered report history. The CRM design below covers those gaps as local
business behavior. TechMedia also maps an unknown frequency to Daily. CRM must
validate allowed frequencies and surface invalid data instead of silently
changing it.

## Ownership and Module Boundaries

Keep each persisted entity in its own CRM backend and frontend leaf module.

| CRM module      | Owned records and behavior                                                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SOP             | Procedure identity, purpose, owner, lifecycle, and revision policy.                                                                                             |
| SOP Item        | Ordered instruction within an SOP, department, frequency, required evidence guidance, and immutable published revisions.                                        |
| Duty Assignment | Assignment of a published SOP Item revision to a user or team, display order, active period, recurrence, and assignment history.                                |
| Duty Report     | Immutable employee submission against one active assignment and SOP Item revision.                                                                              |
| Duty Reporting  | Read-only report search, history, completion summaries, and export contracts. It queries Duty Report through its public API and does not own a duplicate table. |

Composition may order module registration, migration, seed, navigation, and
public route aggregation. It must not own entity SQL, validation, permissions,
CRUD, or report definitions. A report reads through the owning module's fixed
contract. Do not read, import, synchronize, or cache Frappe data.

## Local Data Model

Use tenant-scoped tables with stable public IDs, lifecycle status, actor and
timestamp fields, foreign keys, and indexes that support list filters.

1. `crm_sops`: stable SOP identity, code, title, purpose, owner reference,
   status, and created/updated audit fields.
2. `crm_sop_items`: SOP parent, stable item code, title, department, frequency,
   display order, status, and created/updated audit fields.
3. `crm_sop_item_revisions`: item reference, revision number, instructions,
   evidence guidance, publication status, effective dates, author, and immutable
   snapshot fields. Published revisions cannot be edited in place.
4. `crm_duty_assignments`: revision reference, assignee user or team, display
   order, recurrence, start/end dates, active status, assigning actor, and
   timestamps. Deactivate or supersede assignments instead of erasing history.
5. `crm_duty_reports`: assignment and revision references, assignee, performed
   date, actions, optional result and issue details, idempotency key, submitted
   actor, and timestamps. Reports remain immutable; corrections use a linked
   correction record or audited correction event.

Do not store duplicate SOP name, department, steps, frequency, or assignee
labels as authoritative report data. Report reads may return snapshots from the
referenced published revision and public user contract. Preserve a small
revision snapshot on a report only when it is needed to retain historical
meaning after later revisions.

## Business Rules

- Only active published SOP Item revisions can receive new assignments.
- A user can list and report only their own active duties unless a dedicated
  supervisor permission grants team or all-duty access.
- An assignment must resolve to exactly one user or one team. Team membership
  and assignment-time eligibility must use the owning public user/team contract.
- Reporting validates assignment ownership, active dates, recurrence window,
  revision, required fields, and idempotency before saving.
- Define whether a duty can be reported more than once per recurrence period.
  Reject duplicates by a database unique key and return the original result on
  retry.
- Reports include the reporting date and server creation time. Store dates in
  the agreed API format and display dates as `DD-MM-YYYY`; display date-times as
  `DD-MM-YYYY HH:mm`.
- Record assignment, publication, deactivation, and report actions in the shared
  CRM Activity contract with actor and stable record IDs.
- Avoid hard delete for SOPs, revisions, assignments, and reports that have
  downstream references or history.

## API and UI Contracts

Each module owns strict Zod route schemas, service rules, repository operations,
types, permissions, and query invalidation. Use fixed routes and public IDs.

- SOP and SOP Item workspaces: searchable lists, filters, create/edit drafts,
  publish a revision, deactivate, and view revision history.
- Duty Assignment workspace: assign a published SOP Item revision to users or
  teams, order duties, set active dates and recurrence, and review assignment
  history.
- My Duties: list active assignments with SOP title, department, frequency,
  instructions, due/report state, and a clear report action.
- Duty Report form: select the reporting date, enter completed actions, record
  an issue where required, attach evidence through the CRM Attachment contract
  when enabled, and submit with an idempotency key.
- Duty Reporting: searchable, sortable, paginated history with filters for date
  range, employee/team, SOP, department, frequency, result, and status. Provide
  summary totals only where the counting rules are defined and tested.
- Mobile: show the same signed-in employee's assigned duties, SOP steps, report
  form, saved report state, and retry behavior through the same API contracts.
- Empty, loading, permission denied, validation, offline, duplicate retry, and
  server error states must be explicit on web and mobile.

## Permissions and Audit

Define CRM permissions before implementation:

- `crm.sop.view`, `crm.sop.create`, `crm.sop.update`, `crm.sop.publish`, and
  `crm.sop.deactivate`.
- `crm.duty.assign`, `crm.duty.view.own`, `crm.duty.view.team`,
  `crm.duty.view.all`, and `crm.duty.manage`.
- `crm.duty-report.create.own`, `crm.duty-report.view.own`,
  `crm.duty-report.view.team`, and `crm.duty-report.view.all`.
- `crm.duty-report.export` only after the same permission-scoped filters and
  audit requirements are implemented.

Enforce every permission and record-scope check in the API service. UI hiding is
not authorization. Audit publication, assignment changes, report submission,
correction, and export with actor, action, timestamp, and source record IDs.

## Delivery Phases

### Phase A: Rules and Contracts

- Approve SOP ownership, allowed frequencies, recurrence windows, completion
  outcomes, evidence requirements, team assignment behavior, and correction
  policy.
- Define stable public IDs, table ownership, permission names, route contracts,
  activity actions, and migration/seed order.
- Confirm user and team lookup contracts with Core before implementation.

### Phase B: SOP Catalog

- Build SOP and SOP Item backend and frontend modules with revision history.
- Add permission checks, publish/deactivate lifecycle, search, and safe delete
  blockers.
- Test fresh install, upgrade, revision immutability, and ownership boundaries.

### Phase C: Duty Assignment and My Duties

- Build Duty Assignment and signed-in employee duty list for web and mobile.
- Add assignment order, effective dates, recurrence, user/team validation, and
  assignment history.
- Test own/team/all access and inactive or superseded assignments.

### Phase D: Duty Reports

- Build immutable, retry-safe Duty Report submission tied to an assignment and
  exact SOP Item revision.
- Add report confirmation and immediate refresh in web and mobile.
- Test duplicate requests, stale assignments, recurrence limits, revisions,
  server dates, and restart persistence.

### Phase E: Duty Reporting

- Build the filtered report history and summary views through the Duty Report
  public contract.
- Verify row-level permission scope, pagination, date filters, totals, and export
  audit behavior.
- Compare report totals with direct owner-module records in test databases.

## Acceptance Criteria

- CRM owns all SOP and duty persistence locally. No Frappe or external CRM read,
  queue, sync, or cache is part of the feature.
- A supervisor can publish a revision, assign it, and see assignment history.
- An employee can read assigned instructions and submit one valid report for
  the allowed recurrence window.
- Repeated network submission does not create duplicate reports.
- Later SOP edits do not change the instructions referenced by prior reports.
- Authorized supervisors can filter reports without seeing records beyond their
  scope.
- Web and mobile display and mutate the same saved records.
- Fresh and upgrade migrations, tenant isolation, API permissions, module
  boundaries, report totals, and mobile retry flows pass their checks.
