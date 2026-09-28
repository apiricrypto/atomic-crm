# Tender & Inquiry Intelligence acceptance contract

## Scope and evidence boundary

This package defines the first reviewable contract, declarative schema, access
boundary, and responsive Persian UI skeleton for Tender & Inquiry Intelligence.
It does not apply a migration, persist UI input, deploy a connector, log in to
SETAD, solve a CAPTCHA, or prove a live SETAD/Tender Radar integration.

The four product areas are:

1. **Radar Inbox** — quarantined Tender Radar leads already delivered through
   the server-side `ingest_leads` boundary;
2. **SETAD Interactive Search** — user-controlled browser navigation to the
   official inquiry or tender portal;
3. **Tender Pipeline** — documents, technical review, pricing, participation
   decision, and outcome;
4. **Saved Searches** — reusable user-owned filter profiles.

## Source priority and provenance

- Official SETAD data is authoritative. Tender Radar and third-party aggregators
  are complementary sources.
- An inquiry's official identity is its SETAD **Need No**. A tender's official
  identity is its SETAD **Tender No**. These fields never share storage with the
  aggregator record ID.
- `publish_date`, `document_deadline`, and `submission_deadline` are separate.
  No publication date is inferred to be a deadline.
- Verification status is one of `SETAD Verified`,
  `Pending SETAD Verification`, or `Data Conflict`.
- Deduplication prefers the type-correct official identifier, then the stable
  `(source, aggregator_record_id)` pair, then a reviewed deterministic
  fingerprint. A retry must not overwrite reviewed data.
- A raw Lead Inbox row never becomes a Company, Contact, Deal, Project, finance
  record, or inventory record. Import into `tender_opportunities` is an explicit
  guarded server-side operation with immutable provenance; it remains
  declarative and unexecuted against a real database.

## Tender Radar A/B contract

- The sender may classify records as `A`, `B`, or `C` and provide a score from
  0 through 100. Score and grade must be supplied together.
- Only reviewed A/B rows are import candidates. C rows may remain visible for
  context but are not imported by default.
- The shared scoring thresholds are not invented in this CRM package; they must
  be versioned with the Tender Radar sender contract before live activation.
- Connector tokens remain source-specific server secrets. No token may use a
  `VITE_` prefix or enter Git, browser storage, logs, screenshots, chat, request
  bodies, or database rows.

## Human review UI adapter

- The Radar Inbox recognizes only the versioned
  `satno.tender-radar.lead.v1` envelope and exposes an import action only for
  qualified A/B rows. C or malformed rows remain outside the import queue.
- The adapter copies only the RPC allow-list into an editable review draft.
  `source_snapshot`, scoring internals, arbitrary provider fields, and raw
  payload are never rendered or sent to the RPC.
- Grade and score are read-only sender assertions. Need No/Tender No candidates,
  the official URL, organizer, geography, publication date, document deadline,
  and submission deadline remain distinct review fields.
- Verification always starts as `pending_setad_verification`. Selecting
  `setad_verified` requires the type-correct official identifier, and the user
  must explicitly confirm the reviewed submission.
- The official eproc/etend page opens in the user's browser for manual review;
  the adapter never reads or stores the official session, login, OTP, cookie,
  or CAPTCHA.
- The Supabase provider calls only `import_tender_opportunity`. FakeRest throws
  a visible demo-mode error and never simulates a successful database write.
- Qualified Tender Radar leads no longer expose the generic Lead-to-Deal action
  in the Lead Inbox UI; they route to the Tender review workspace instead.

## SETAD human-in-the-loop boundary

- Inquiry search opens
  `https://eproc.setadiran.ir/eproc/entry.do` and uses Need No for official
  verification.
- Tender search opens
  `https://etend.setadiran.ir/etend/index.action` and uses Tender No for official
  verification.
- Login, OTP, cookies, session state, and CAPTCHA remain exclusively in the
  user's interactive browser session. They are never read, exported, solved,
  bypassed, automated, logged, committed, or copied into chat.
- The CRM may remember non-sensitive search filters, but not authenticated
  session material.
- No successful SETAD connection may be claimed until an authorized user has
  completed a disposable live-session acceptance run.

### Official observation capture

- The CRM search form is a manual checklist only. It does not inject filters
  into SETAD, submit a request to SETAD, inspect the opened tab, or reuse an
  authenticated browser session.
- After the authorized user completes the official search, the guarded
  `record_setad_verification(opportunity_id, verification)` RPC accepts only an
  allow-listed scalar transcription. A type-correct Need No or Tender No, the
  exact official portal URL, an official title, and an explicit result of
  `setad_verified` or `data_conflict` are required.
- Official observations are append-only in
  `tender_setad_verifications`. A conflict changes only the opportunity routing
  status; neither the quarantined Radar assertion nor the official observation
  is overwritten.
- The SETAD workspace reads those observations newest-first as a separate,
  read-only history. A `data_conflict` opportunity shows the latest official
  observation beside the original Tender Radar assertion, field by field,
  while retaining every earlier observation below.
- Conflict comparison is intentionally observational: it does not choose a
  winner, edit either source, or create an alternate persistence path. A
  reviewer may reopen the existing guarded observation dialog to append a new
  official check after another human-controlled SETAD session.
- A verified identifier is serialized and must not belong to another
  opportunity. Repeating the same verified observation for the same
  opportunity is idempotent.
- Audit metadata records only the verification row ID, status transition, and
  boolean change indicators. It does not copy titles, descriptions, geography,
  identifiers, credentials, cookies, OTP, CAPTCHA, tokens, sessions, or raw
  provider data.
- The current UI and SQL tests use synthetic records. They do not prove an
  authorized SETAD session, real official data, database transactionality, RLS,
  or concurrent deduplication.

## Filters and starter profiles

The UI contract covers domain (`renewable_energy` or `security_systems`),
province, city, keyword, opportunity type, trade, category, organizer,
publication range, deadline range, and status. Starter examples are synthetic:

- خورشیدی خوزستان
- UPS چهار استان هدف
- CCTV خوزستان و ایلام

Users are not limited to those examples.

## Security acceptance before persistence

Before any migration or write path is enabled, a disposable Supabase run must
prove:

1. RLS and grants deny anonymous access and deny direct authenticated imports;
2. managers see all permitted records while sales staff see unassigned or
   explicitly assigned records only;
3. import creates exactly one opportunity for a quarantined lead and preserves
   both aggregator and official provenance;
4. official Need No/Tender No uniqueness wins over fallback fingerprints;
5. pipeline updates cannot create Company, Contact, Deal, Project, finance, or
   inventory rows;
6. audit events are append-only and exclude raw payloads and all session or
   credential material;
7. mobile/desktop RTL behavior and all custom filters work with real data;
8. SETAD verification records conflicts without overwriting either source.

The SQL in `supabase/schemas` is declarative design input, not an applied
migration.

## Guarded Radar import function

`import_tender_opportunity(lead_id, review)` is the sole declared write path
from a reviewed Radar Inbox row into the Tender workspace. It is a
security-definer database function with an empty search path and these
invariants:

- the caller must be active `admin`, `manager`, or `sales` staff and must be
  allowed to see the assigned lead;
- the locked source row must be a qualified `tender_radar` lead;
- only A/B rows with a paired score are accepted; C remains quarantined;
- review JSON is allow-listed, so raw payload, credentials, cookies, OTP,
  CAPTCHA, tokens, and arbitrary provider fields cannot cross the boundary;
- official Need No/Tender No is checked first, source plus Radar record ID
  second, and the reviewed fallback fingerprint third;
- advisory transaction locks serialize every available identity dimension;
- a retry for the same Lead ID returns the original opportunity without
  changing reviewed data, while a collision from a different lead raises a
  conflict for human resolution;
- opportunity, initial pipeline row, and append-only audit event are created in
  one transaction; no Company, Contact, Deal, Project, finance, or inventory
  row is created;
- after import, the quarantined source lead is rejected by the generic
  Lead-to-Deal conversion RPC; any later core CRM transition must originate
  from an explicit, separately reviewed Tender Pipeline action.

This function is still declarative and unexecuted. A disposable real Supabase
test must prove transactionality, role/assignment denial, concurrent dedup,
rollback, grants, RLS visibility, and audit immutability before migration or
activation.
