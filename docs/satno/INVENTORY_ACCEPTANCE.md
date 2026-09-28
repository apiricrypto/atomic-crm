# SATNO Inventory foundation acceptance contract

This increment establishes reviewable locations, stock items, and explicit
quantity movements. It does not value inventory, post accounting entries, or
apply the draft schema to a database.

## Invariants

- Stock on hand is derived only from explicit receipts, issues, and adjustments.
- Marking a procurement commitment as received never creates a stock receipt.
- A project issue may reference one project; a procurement receipt may reference
  one procurement commitment. A movement cannot reference both.
- Adjustments have no procurement or project source and remain auditable through
  their unique reference.
- Quantity is always positive; movement type determines its sign.
- Inventory quantities are not project actual costs, payables, payments, or
  financial transactions.
- Reorder status is advisory. Negative balances are surfaced rather than hidden.
- Units are never converted or summed across different items.

## Scope of this package

- Read-only, Persian-first responsive inventory dashboard.
- FakeRest locations, items, and movements for deterministic UI tests only.
- SQL schema, RLS, grants, indexes, and movement ownership trigger for review.
- Unit tests for balance derivation and negative-stock visibility.

## Deployment gate

Before applying SQL to a real Supabase instance, validate the assembled schema
in an isolated database, exercise authenticated RLS with at least two users, and
decide whether stock must be prevented from going negative through a transactional
server-side operation. FakeRest success is not database or concurrency evidence.
