# Lead Inbox acceptance contract

## Scope

This package introduces a quarantined lead inbox and an explicit, atomic path
from a qualified lead to Company, optional Contact, and Deal. It does not ingest
from Tender Radar or Bale Market yet, and it does not create Projects, inventory
movements, receivables, payables, or financial transactions.

## Invariants

- Raw lead payloads stay in `lead_inbox.raw_payload`; the UI never renders them
  and conversion never copies them into core CRM records.
- `(source, source_record_id)` is unique so retries from a connector are
  idempotent.
- Connector credentials and ingestion belong in a future server-side adapter;
  they must never be exposed to the browser.
- A user must explicitly review normalized fields and mark a lead `qualified`
  before conversion.
- Conversion is one database transaction and records provenance in
  `lead_conversions`. A lead can be converted once and converted leads are
  immutable.
- Conversion creates the Deal in `opportunity`, not `won`. Deal-won to Project
  remains a separate explicit workflow, which prevents financial double count.
- Admins and managers may triage all leads. Sales staff may access unassigned
  leads or leads assigned to them. Finance and viewer roles have no lead access.
- Authenticated clients cannot directly insert or delete leads or write a
  conversion record. Ingestion uses the server/service role; conversion uses the
  guarded `convert_lead_to_deal` RPC.

## Evidence boundaries

The browser/component and in-memory conversion tests use the FakeRest data
provider with synthetic records. They demonstrate responsive UI, quarantine,
role checks, deterministic triage, and conversion behavior without claiming a
real database run.

A real Supabase acceptance run remains required before deployment. It must use a
disposable database and prove:

1. service-role ingestion accepts one source record and rejects an idempotency
   duplicate;
2. RLS hides leads from finance/viewer users and hides another salesperson's
   assigned lead;
3. direct authenticated insert/delete and unrestricted field updates fail;
4. an unqualified lead cannot convert;
5. a qualified visible lead converts exactly once, producing one company, zero
   or one contact, one opportunity-stage deal, and one provenance record;
6. any failure rolls back every target record and leaves the lead unconverted;
7. no raw payload or unreviewed estimated amount appears in the created core
   records;
8. Project and finance/inventory tables remain unchanged.

## Deferred connector contract

Tender Radar and Bale Market adapters must normalize source data server-side,
retain the untouched provider payload only in quarantine, provide stable source
record IDs, retry safely, and write an auditable ingestion timestamp. Provider
credentials, rate limits, consent, and data-retention rules require a separate
reviewable package.
