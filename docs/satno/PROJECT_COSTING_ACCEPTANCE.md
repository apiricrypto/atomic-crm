# SATNO Project + Costing — acceptance contract

This contract defines the first reversible Project + Costing increment. It is
not a claim that procurement, finance, inventory, or a production database
migration is complete.

## Invariants

- Every project keeps one required `deal_id`; the database makes it unique so a
  won deal cannot create two delivery projects.
- `contract_amount` is a commercial snapshot, not a receivable, payment, or
  ledger transaction. Finance reports must not add it to deal revenue.
- A cost line stores planned and actual values side-by-side. Planned cost and
  actual cost are reported separately.
- Forecast cost is `sum(max(planned_amount, actual_amount))` per cost line. It
  must never be `sum(planned_amount + actual_amount)`.
- Project and cost-line currencies must match through a composite foreign key.
  No implicit Rial/Toman or foreign-exchange conversion is allowed.
- Raw leads cannot create projects. The required provenance is
  `Lead -> Deal -> Project`; conversion from a deal is a later command and must
  verify the configured won stage before insert.

## Accepted in this increment

- Declarative `projects` and `project_cost_items` schema with non-negative
  monetary constraints, provenance keys, authenticated RLS policies, grants,
  indexes, and owner triggers.
- Typed domain records and a deterministic costing calculator.
- Persian-first responsive project list showing contract value, planned cost,
  actual cost, and forecast margin with the stored currency.
- FakeRest demo records are clearly test/demo data and are not database
  acceptance evidence.

## Required before database deployment

- Generate the migration from `supabase/schemas` with the repository's local
  Supabase stack; do not hand-copy this draft into production.
- Run schema reset/diff and the real Supabase/RLS acceptance suite from PR #18.
- Add a transactional Deal-won conversion command that snapshots the amount
  and currency, rejects duplicate `deal_id`, and records the acting user.
- Verify create/update/delete authorization after Staff RBAC is introduced.
- Verify project list and costing against persisted Supabase rows, not FakeRest.

## Test evidence expected on each change

- Unit tests for planned/actual/forecast anti-double-counting semantics.
- Chromium mobile rendering in Persian/RTL with no document overflow.
- TypeScript, production build, ESLint, Prettier, and `git diff --check`.
- Separate reporting of FakeRest UI evidence and real database evidence.
