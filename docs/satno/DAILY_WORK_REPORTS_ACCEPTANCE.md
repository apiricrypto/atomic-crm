# SATNO Daily Work Reports acceptance contract

Status: reviewable foundation. FakeRest UI tests are not real database or RLS
evidence. No migration is generated or applied by this package.

## Product boundary

Each enabled staff account may record at most one report per work date. A report
contains completed work, minutes worked, blockers and next steps. It is an
accountability record, not a timesheet for payroll, an invoice, a project cost,
an inventory movement or a financial transaction.

- The author can create, read, update and delete their own reports.
- Administrator and manager roles can read every staff report for oversight.
- Administrator and manager roles cannot change or delete another author's
  report. Review/approval workflow is intentionally outside this first package.
- A disabled account has no current staff identity and cannot access reports.
- `sales_id + work_date` is unique and minutes are constrained to 0–1,440.
- `sales_id` is populated from the authenticated user and cannot be reassigned
  through an update allowed by RLS.

## Automated evidence in this package

- Persian/RTL list and create surfaces render at 390×844 without document-level
  overflow.
- A manager-style list can show multiple staff reports, while the edit action is
  rendered only for the current report owner.
- The client permission matrix permits known daily-report actions for every
  enabled staff role and denies unknown actions.
- The declarative schema parses and defines the ownership, manager visibility,
  unique-day and duration constraints.

## Real Supabase gate (not satisfied here)

Generate and review a migration from the declarative schema, then execute it in
a disposable Supabase stack. Using distinct authenticated sessions, prove:

1. an author can create one report for today and cannot create a second report
   for the same date;
2. an author cannot insert a report for another `sales_id`, reassign ownership,
   or read/update/delete another author's report;
3. a manager and administrator can list all reports but cannot update or delete
   reports they do not own;
4. a viewer can manage only their own reports despite being read-only for other
   business resources;
5. anonymous and disabled sessions cannot read or write reports; and
6. invalid blank achievements or minutes outside 0–1,440 are rejected.

Do not weaken these policies to match FakeRest behavior. If the generated
migration differs from the reviewed declarative policy, GitHub schema and this
contract take precedence until the discrepancy is resolved.
