# IMPORTANT AGENT INSTRUCTIONS & MANDATORY WORKFLOW RULES
# File: important_agent.md / important_agent.ml

## 1. PURPOSE & ROLES
- `AGENTS.md` is the general repository entry point that controls the entire CODEXSUN monorepo for the Team Lead (TL) and team members who work across all applications.
- **This file (`important_agent.md` / `important_agent.ml`) defines THIS developer's specific scope and rules.**
- The developer's assigned role is strictly **Ecommerce**.
- While the TL works on all platform applications, any agent assisting this developer must operate strictly within the Ecommerce application.

---

## 2. STRICT APPLICATION SCOPE: ECOMMERCE ONLY
- **Target Application**: Work exclusively on the **Ecommerce** domain:
  - Frontend Web / Admin Desk: `apps/ecommerce/web/`
  - Backend API: `apps/ecommerce/api/`
  - Public Storefront: Port 7030 / `apps/ecommerce/web/src/modules/storefront/`
- **STRICT PROHIBITION**: **DO NOT TOUCH** any other application in this monorepo:
  - Do NOT modify `apps/platform/`
  - Do NOT modify `apps/core/`
  - Do NOT modify `apps/zetro/`
  - Do NOT modify `apps/q-cafe/`
  - Do NOT modify `apps/auditor/`
  - Do NOT modify `apps/crm/`
  - Do NOT modify `apps/task-manager/`
  - Do NOT modify shared root configs unless strictly instructed.
  - Keep all changes strictly isolated to Ecommerce to prevent any merge conflicts with the TL.

---

## 3. NON-DESTRUCTIVE FILE VERSIONING METHODOLOGY (THE "navbar -> navbar1..n" PATTERN)
Whenever any UI component, screen, or layout file needs to be updated or modified:

1. **DO NOT DIRECTLY OVERWRITE THE EXISTING FILE**:
   - For example, if `navbar.tsx` (or `navbar.ts`) needs an update, do NOT directly rewrite or overwrite `navbar.tsx`.
2. **CREATE A NEW VERSIONED FILE**:
   - Create a new file with an incremented number suffix: `navbar1.tsx`, `navbar2.tsx`, ..., `navbarN.tsx`.
3. **MIGRATE OLD + NEW LOGIC**:
   - Bring forward the working logic from the previous file into the new file.
   - Implement the new features, styling, or improvements cleanly in the new file.
4. **UPDATE IMPORTS & ROUTES**:
   - Update the route configuration, index export, or parent component import to use the new file (e.g. switch import from `navbar` to `navbar1`).
5. **VERIFY AND TEST**:
   - Verify that the application builds, routes load correctly, and no regressions are introduced.
   - The original file remains completely intact as a guaranteed safe rollback and historical reference.
6. **DO NOT WORRY ABOUT CREATING NEW FILES**:
   - Creating new versioned files is the intended, mandatory methodology. Never hesitate to create new files to maintain safety and backward compatibility.

---

## 4. CHECKLIST FOR EVERY AGENT BEFORE COMMITTING/FINISHING WORK
- [ ] Did I verify `important_agent.ml` / `important_agent.md` first?
- [ ] Are all modified files exclusively inside `apps/ecommerce/`?
- [ ] For UI component updates, was a new file (`component1..n.tsx`) created instead of destructively overwriting the existing component?
- [ ] Are the routes and imports updated to point to the new versioned component?
- [ ] Is the application compiling and functioning without errors?
