# SATNO Finance foundation acceptance contract

This increment establishes reviewable receivable, payable, and transaction
ledgers. It does not create a general ledger, post accounting entries, or apply
the draft schema to a database.

## Invariants

- A project contract value is a commercial snapshot, not a receivable.
- A procurement commitment is an operational commitment, not a payable,
  payment, or actual cost.
- Settlement is derived only from explicit transactions linked to exactly one
  receivable or payable.
- Receivable transactions are inflows; payable transactions are outflows.
- A transaction and its source obligation must use the same ISO currency.
- Overpayment can make an obligation fully settled but never gives it a
  negative outstanding balance.
- Cancelled obligations do not contribute to outstanding or overdue totals.
- Summaries remain separated by currency; values are never converted or added
  across currencies.

## Scope of this package

- Read-only, Persian-first responsive finance dashboard.
- FakeRest records for deterministic UI and browser tests only.
- SQL schema, RLS, grants, indexes, and ownership triggers for review only.
- Unit tests for settlement and anti-double-counting behavior.

## Deployment gate

Before applying the SQL to a real Supabase instance, validate the assembled
schema in an isolated database, exercise authenticated RLS with at least two
users, and obtain explicit migration approval. FakeRest success is not evidence
that the real database or policies are ready for production.
