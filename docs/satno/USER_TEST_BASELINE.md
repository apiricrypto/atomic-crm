# SATNO CRM initial user-test baseline

Created on 2026-09-27 for the current SATNO integration work. This is a new
acceptance document, not a recovered historical artifact or a production sign-off.

## Test target

The first user test covers the existing CRM baseline only:

1. Persian login and password-recovery screens.
2. Contacts: list, create, edit and view.
3. Companies: list, create, edit and view.
4. Deals: list, pipeline movement and edit.
5. Tasks: list, filter, create and contact association.
6. Desktop and mobile RTL layout for the interactions above.

Project, costing, procurement, finance, inventory, staff/RBAC, SMS OTP, tender
and Bale lead intelligence are outside this first test until their source
artifacts and acceptance contracts are recovered or newly approved.

## Two separate acceptance levels

### A. Demo/component baseline

The FakeRest demo is suitable for navigation, Persian copy, RTL layout and
interaction review. Its data is seeded/in-memory or browser-local. FakeRest login
does not validate a real password, password reset sends no email, and this level
does not prove database persistence or security.

Acceptance:

- Persian is the default regardless of browser language; no French selector or
  French-only package is present.
- The target pages can be opened and their main create/edit/filter interactions
  complete without runtime errors.
- Desktop and mobile direction, portals and keyboard navigation are RTL-aware.
- Display formatting never changes a stored monetary value or silently converts
  Rial to Toman.

### B. Real Supabase acceptance

This is the gate for a usable test deployment. It must use a disposable test
project or local Supabase stack, never production credentials or production data.

Acceptance:

- A user can sign up or sign in, sign out and recover/reset a password.
- Contact, company, deal and task writes survive reload and a new session.
- Relationship changes remain correct (company/contact/deal/task references).
- Unauthorized rows/actions are rejected by RLS and role checks.
- Desktop and mobile E2E specs pass against the same database state.
- No service-role or provider secret is shipped to the browser or committed.

## Evidence recorded for the combined branch

- 45 browser tests passed for Persian/RTL/direction/money behavior.
- 76 baseline browser tests passed and one existing test was skipped for contacts,
  deals, tasks and the FakeRest/Supabase-filter adapter.
- TypeScript, production build, targeted ESLint and Prettier passed.
- GitHub Actions, real Supabase persistence/RLS and the full E2E suite are not yet
  accepted. The current execution environment has no Docker runtime, so it cannot
  start the repository's local Supabase/Postgres stack.

## Release rule

Passing the demo baseline permits a visual user preview only. A production or
real-data deployment requires the Supabase acceptance level plus explicit approval
for merge and deployment.
