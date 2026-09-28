# SATNO Procurement — acceptance contract

This contract defines the first reversible Procurement UI increment. It does
not implement supplier payments, accounts payable, inventory receipts, or a
production database migration.

## Accounting boundaries

- A procurement commitment is an operational obligation linked to exactly one
  project cost item. It is not an actual cost, payment, invoice, or transaction.
- Draft, active (`approved`/`ordered`), received, and cancelled amounts are
  reported separately. They must not be summed into one financial total.
- Receiving a commitment changes its procurement state only. It must not create
  an actual project cost or payment implicitly.
- Project, cost item, and commitment currencies must match through a composite
  foreign key. No implicit currency or Rial/Toman conversion is allowed.
- A supplier is an existing Company record. Procurement must not create or
  mutate raw Lead records.

## Accepted in this increment

- Declarative `procurement_commitments` schema with amount/status/date checks,
  project-cost provenance, supplier relation, RLS policies, grants, indexes,
  and owner trigger.
- Typed records, deterministic FakeRest demo data, and mutually exclusive total
  calculation.
- Persian-first responsive Procurement list showing reference, project,
  supplier, state, amount, and expected date.
- A clear UI warning that commitments are not payments or actual costs.

## Required before database deployment

- Generate the migration from `supabase/schemas` in a Docker-capable local
  Supabase environment; do not apply this declarative draft directly.
- Run schema reset/diff and the real Supabase/RLS acceptance contract from
  Draft PR #18.
- Add transactional create/edit commands with permission checks when Staff RBAC
  is introduced.
- Define separate receipt, invoice, payable, payment, and inventory posting
  workflows before any automatic financial posting is allowed.
- Verify persisted Supabase rows and cross-project/cross-currency rejection.

## Test evidence expected

- Unit coverage proving procurement states remain mutually exclusive.
- Chromium mobile rendering in Persian/RTL with no document overflow.
- TypeScript, production build, ESLint, Prettier, and `git diff --check`.
- Separate reporting of FakeRest UI evidence and real database evidence.
