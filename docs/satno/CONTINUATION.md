# SATNO CRM continuation — 2026-09-27

This is the existing SATNO CRM project, not a new project or automation.
Repository: `apiricrypto/atomic-crm`. Integration branch: `satno-development`.
GitHub refs and code take precedence over historical progress summaries.
Do not merge into `satno-development` or `main`, deploy, change secrets, or run
destructive operations without the user's explicit approval.

## Latest checkpoint — disposable Tender database acceptance matrix

Draft PR #38: `satno/tender-db-acceptance-matrix-20260928`, published feature
commit `b9e98f0550e2efbd31ae28c65fe60e355e3e4b69`, stacked directly on Draft PR
#37 at `a5cb7d787c2e8365046972b91c9f11e4939db6c6`.

- Live GitHub reconciliation confirmed #37 and #11 remained open, Draft,
  mergeable, and unmerged. `main`/`satno-development` remained at `dce557e`,
  upstream at `64e2163`, and the Persian reference at `85fc400`. The only SETAD
  branches were the existing #36 and #37 branches; no overlapping database
  acceptance branch or PR existed. #37 had no workflow run or commit status.
- Added a rollback-only pgTAP asset with 51 assertions for the five Tender
  tables/RPCs: RLS/grants, missing-identity denial, manager/sales/viewer access,
  assignment checks, A/B Radar import, same-lead idempotency, raw-provider
  quarantine, absence of core CRM/project/finance/inventory side effects,
  Pipeline gates, Saved Search ownership, append-only audit/SETAD observations,
  and human-transcribed conflict followed by official verification.
- The acceptance contract explicitly requires a reviewed declarative-schema
  migration/diff in a disposable stack before the suite runs. It never targets
  production and rolls back all synthetic rows. Concurrent identifier races
  remain a separate multi-connection acceptance requirement.
- Validation passed: the 51 assertions and 76 statements passed static SQL
  parsing after only parser-compatibility normalization; 29 focused Chromium
  tests, TypeScript, production build, targeted ESLint/Prettier, registry
  generation, secret/domain scanning, and `git diff --check` also passed. The
  published feature tree `a45094aa` exactly matched the tested local tree.
- `supabase test db` did not run. Docker, Podman, Supabase CLI, Postgres, and
  Deno remained unavailable and no disposable Supabase credentials existed.
  Therefore no real RLS, transaction, rollback, concurrency, Tender Radar, or
  SETAD acceptance is claimed. No migration, merge, deployment, production
  write, secret change, login, OTP, CAPTCHA, cookie, or session operation ran.

Next priority: reconcile PR #38 and run the reviewed matrix in a disposable
Supabase stack. If the runtime remains unavailable, prepare a separate
environment-gated multi-connection concurrency runner for official identifiers,
source IDs, and fallback fingerprints; never embed credentials or point it at a
shared/production project.

## Latest checkpoint — read-only SETAD history and conflict review

Draft PR #37: `satno/setad-history-conflict-20260928`, published feature commit
`f3d62e8247e5e55e82979417ddb356f966c30b53`, stacked directly on Draft PR #36
at `c066f5c129b762d9b47a1735b5566447415a9754`.

- Live GitHub reconciliation confirmed #36 and #11 remained open, Draft,
  mergeable, and unmerged. `main`/`satno-development` remained at `dce557e`,
  upstream at `64e2163`, and the Persian reference at `85fc400`. No overlapping
  SETAD history/conflict branch or PR existed; #36 had no workflow run or
  commit status.
- Added a Persian/RTL, read-only history of append-only official observations,
  newest first. Each record keeps its official Need No/Tender No, title,
  organizer, geography, publication date, both deadlines, checked time, and
  constrained official source link separate from the Radar assertion.
- `data_conflict` records now compare the latest official observation against
  the original Tender Radar fields side by side. The comparison selects no
  winner, mutates neither source, and preserves every earlier observation.
- Re-review uses only the existing guarded observation dialog and RPC from
  #36, so this package adds no alternative write path. The 390x844 browser test
  proves that the comparison and history have no horizontal page overflow.
- Validation passed: 28 focused Chromium tests, TypeScript, production build,
  targeted ESLint/Prettier, registry generation, and `git diff --check`. The
  published feature tree `464d99c5` exactly matched the tested local tree.
- No real SETAD login/session/CAPTCHA or official record was used. Docker,
  Podman, and Supabase CLI remained unavailable, so no real transaction/RLS/
  concurrency run occurred. No migration, Tender Radar request, production
  write, merge, deployment, or secret change occurred.

Next priority: reconcile PR #37 and execute the import, pipeline, Saved Search,
SETAD verification, RLS, rollback, append-only, and concurrent identifier
acceptance matrix in a disposable Supabase environment. Do not claim a live
Tender Radar or SETAD connection until the corresponding authorized real-data
tests have passed; CAPTCHA and login remain exclusively human-controlled.

## Latest checkpoint — human SETAD handoff and official observation capture

Draft PR #36: `satno/setad-interactive-handoff-20260928`, published feature
commit `fa6e03e1eb1e19eef1a3955ba30dda6704630b5d`, stacked directly on Draft PR
#35 at `af556f6692a81469329668979a62342dfcf040a4`.

- Live GitHub reconciliation confirmed #35 and #11 remained open, Draft,
  mergeable, and unmerged. `main`/`satno-development` remained at `dce557e`,
  upstream at `64e2163`, and the Persian reference at `85fc400`. No overlapping
  SETAD branch or PR existed; #35 had no workflow run or commit status.
- Replaced the SETAD placeholder with a Persian/RTL two-step workflow: a manual
  filter checklist that opens the type-correct official page in the user's
  browser, followed by explicit transcription of the authorized official
  observation. Filters are not injected into SETAD and the CRM does not inspect
  the opened tab.
- Added append-only `tender_setad_verifications` observations and the guarded
  `record_setad_verification(bigint, jsonb)` RPC. It enforces active
  admin/manager/sales roles, assignment, row and advisory locks, a scalar
  allow-list, length/date checks, type-correct Need No/Tender No, exact official
  portal URLs, verified-identifier uniqueness, and idempotent verified retries.
- A confirmed observation updates only the official identifier, URL, and
  verification status on the opportunity. A data conflict changes only its
  routing status; the quarantined Radar assertion and official observation are
  both preserved without overwrite.
- Audit metadata contains the verification ID, status transition, and boolean
  change indicators only. It excludes transcribed text, geography, official
  identifiers, credentials, cookies, OTP, CAPTCHA, tokens, sessions, and raw
  provider data. Direct authenticated writes remain revoked and FakeRest
  explicitly refuses verification writes.
- Validation passed: 27 focused Chromium tests, TypeScript, production build,
  targeted ESLint/Prettier, registry generation, and `git diff --check`. The
  published feature tree `60a8585f` exactly matched the tested local tree.
- No real SETAD login/session/CAPTCHA or official record was used. Docker,
  Podman, and Supabase CLI were unavailable, so no real transaction/RLS/
  concurrency run occurred. No migration, Tender Radar request, production
  write, merge, or deployment occurred.

Next priority: reconcile PR #36 and run import, pipeline, Saved Search, SETAD
verification, RLS, rollback, append-only, and concurrent identifier tests in a
disposable Supabase environment. If unavailable, add a separate read-only
official-observation history and conflict-resolution queue; never automate or
bypass SETAD login/CAPTCHA and never claim a live connection without an
authorized real-session acceptance run.

## Latest checkpoint — guarded Tender Saved Searches

Draft PR #35: `satno/tender-saved-searches-20260928`, published feature commit
`16140b1959b956f673975fc662e03902f1c53988`, stacked directly on Draft PR #34
at `c0621f9c15cae609aef03a9fe9dbd39faf8acee4`.

- Live GitHub reconciliation confirmed #34 and #11 remained open, Draft,
  mergeable, and unmerged. `main`/`satno-development` remained at `dce557e`,
  upstream at `64e2163`, and the Persian reference at `85fc400`. No overlapping
  Saved Searches implementation existed; #34 and then #35 had no workflow run
  or commit status. GitHub confirmed #35 is open, Draft, mergeable, and
  unmerged.
- Replaced the Saved Searches placeholder with a responsive Persian/RTL
  create/edit/delete UI. It supports arbitrary domain, opportunity type,
  province, city, keyword, trade, category, organizer, publication range,
  deadline range, verification status, and active-state filters.
- The requested Solar Khuzestan, UPS four target provinces, and CCTV
  Khuzestan/Ilam examples are editable prefill templates; they are not silently
  persisted as database records.
- Added guarded `save_tender_search(bigint, jsonb)` and
  `delete_tender_search(bigint)` security-definer RPCs. Direct authenticated
  table writes remain revoked. The RPCs enforce active admin/manager/sales
  roles, ownership, row locks, a typed JSON allow-list, list/length limits,
  valid date ranges, and case-insensitive unique names per owner.
- Accepted creates, updates, and deletes append redacted audit events. Audit
  metadata excludes names, keywords, geography, credentials, cookies, OTP,
  CAPTCHA, tokens, sessions, and raw provider material. FakeRest explicitly
  refuses Saved Search writes, so synthetic UI evidence cannot be confused
  with a database write.
- Validation passed: 29 focused Chromium tests, TypeScript, production build,
  targeted ESLint/Prettier, registry generation, and `git diff --check`.
- Docker, Podman, and the Supabase CLI were unavailable. This is static SQL
  contract and synthetic UI evidence only: no migration, real Supabase
  transaction/RLS/concurrency run, Tender Radar sender/request, SETAD login or
  CAPTCHA session, production write, merge, or deployment occurred.

Next priority: reconcile PR #35 and run the guarded import, pipeline, Saved
Search, RLS, rollback, and concurrency matrix against a disposable Supabase
environment when one is available. The following product package is the
human-controlled SETAD Interactive Search handoff and verified-data capture;
CAPTCHA/login stays in the user's browser and is never automated, bypassed, or
stored.

## Latest checkpoint — guarded Tender Pipeline transitions and audit UI

Draft PR #34: `satno/tender-pipeline-transitions-20260928`, published feature
commit `ac560f3f8b62df2bdc4ef5a65bc2cbd1d2c4763c`, stacked directly on Draft PR
#33 at `b16e45b789c94cc0a3c69389fadaccfe6a9d053b`.

- Live GitHub reconciliation confirmed #33 and #11 remained open, Draft,
  mergeable, and unmerged. `main`/`satno-development` remained at `dce557e`,
  upstream at `64e2163`, and the Persian reference at `85fc400`. No overlapping
  Tender Pipeline transition branch or PR existed; #33 had no workflow run or
  commit status. GitHub subsequently confirmed #34 is open, Draft, mergeable,
  and unmerged.
- Replaced the static Pipeline placeholder with a responsive Persian/RTL board
  backed by opportunity, pipeline, and append-only audit records. Each card
  shows its current milestone, SETAD verification state, and latest audit event.
- Added the guarded `update_tender_pipeline(bigint, jsonb)` security-definer
  RPC. Direct authenticated table writes remain revoked. The RPC enforces
  active admin/manager/sales roles, salesperson ownership, row locks,
  allow-listed scalar input, size limits, active assignment, forward-only
  stages, and milestone gates before updating state.
- Every accepted transition appends a redacted `pipeline_transitioned` event in
  the same transaction. Audit metadata contains status before/after and a
  `notes_changed` flag; it never copies note text, provider payloads, credentials,
  cookies, OTP, CAPTCHA, tokens, or session material. The function does not
  write Contact, Company, Deal, Project, Finance, or Inventory records.
- The Supabase provider calls the guarded RPC. FakeRest deliberately refuses
  writes; its synthetic records are used only to verify the board, dialog,
  audit display, allow-listed request, and 390x844 mobile overflow behavior.
- Validation passed: 27 focused Chromium tests, TypeScript, production build,
  targeted ESLint/Prettier, registry generation, and `git diff --check`. The
  full browser run reached 334 passing and one skipped test; the four known
  Gravatar/DataImport failures and Node-only backup collection issue remain
  unrelated baseline limitations.
- This is static contract and synthetic UI evidence only. No migration, real
  Supabase transaction/RLS/concurrency run, Tender Radar sender/request,
  production write, SETAD session/CAPTCHA, merge, or deployment occurred.

Next priority: reconcile PR #34 and run the guarded import/transition/RLS/
rollback/concurrency matrix against a disposable Supabase environment. If that
environment is unavailable, implement Saved Searches through a separate guarded
RPC/UI package; keep SETAD automation deferred to a human-controlled real
browser session and never claim live integration without official data.

## Latest checkpoint — Tender Radar human review/import UI

Draft PR #33: `satno/tender-radar-review-ui-20260928`, published feature
commit `ee29d12840238e26d1c3912bec44f9667a421f73`, stacked directly on Draft PR
#32 at `2505d759a683f179a7d9e14e8e6ff907b2c184df`.

- Live GitHub reconciliation confirmed #32 and #11 remained open, Draft,
  mergeable, and unmerged. #32 had no workflow run or commit status;
  `main`/`satno-development` remained at `dce557e`, upstream at `64e2163`, and
  the Persian reference at `85fc400`. No overlapping human-review/import UI
  branch or PR was found.
- Added a Persian/RTL review dialog for qualified A/B Radar rows. It maps only
  versioned allow-listed fields into `import_tender_opportunity`; quarantined
  `source_snapshot`, arbitrary provider data, scoring internals, and sensitive
  material never enter the review object.
- Candidate Need No/Tender No, official URL, organizer, geography, publication
  date, document deadline, and submission deadline remain separate editable
  fields. Verification always starts as `pending_setad_verification`; selecting
  `setad_verified` requires the type-correct official identifier and explicit
  human confirmation.
- Qualified Tender Radar leads no longer expose the generic Lead-to-Deal action
  and instead route to Tender Intelligence. Client RBAC now matches the guarded
  RPC for active manager/sales roles. FakeRest fails visibly and performs no
  simulated Tender write.
- Validation passed: 45 focused Chromium tests, all 182 Edge Function tests,
  TypeScript, production build, targeted ESLint/Prettier, registry generation,
  `git diff --check`, and secret-shaped-value scan. The full browser run reached
  930 passing and one skipped test; the four known Gravatar/DataImport failures
  and Node-only backup collection issue remain unrelated baseline limitations.
- This proves the reviewed UI-to-RPC boundary with synthetic fixtures only. No
  real Radar sender/token/record, network request, Supabase/RLS transaction,
  migration, production write, SETAD session/CAPTCHA, merge, or deployment
  occurred.

Next priority: reconcile PR #33, then add a guarded Tender Pipeline transition
and audit UI for documents, technical review, pricing, participation decision,
and result. A disposable real Supabase transaction/RLS/concurrency run remains
mandatory before any migration or live Tender Radar integration claim.

## Latest checkpoint — Tender Radar sender conformance

Draft PR #32: `satno/tender-radar-conformance-20260928`, published feature
commit `eb10b3b7933a8468504319a06eba53193cfd1f1e`, stacked directly on Draft PR
#31 at `9d14a9bff7bfbe563f4e1c4dcafa35697af65f1f`.

- Live reconciliation confirmed #31 and #11 remained open, Draft and unmerged;
  #31 was mergeable, two commits ahead and zero behind #30, with no Actions
  run, check run, or status context. `main` and `satno-development` remained at
  `dce557e`, upstream at `64e2163`, and the Persian reference at `85fc400`. No
  overlapping conformance/sender branch or PR was found.
- Added the receiver-owned `satno.tender-radar.lead.v1` contract. It requires a
  sender-owned scoring version, A/B/C grade plus score, type/domain, separate
  Need/Tender candidate identifiers, three separate source dates, a versioned
  fallback fingerprint, and a quarantined source snapshot.
- Added authored synthetic A-inquiry, B-tender, and C-quarantine fixtures. The
  Radar source ID is enforced separately from official identifier candidates;
  outer Lead deadline must equal the submission-deadline candidate and can
  never be substituted with publication date.
- Only A/B become human-review candidates. C remains a `new` quarantined lead.
  Sender fields are assertions only and cannot claim SETAD verification or
  directly create Tender/Core CRM records.
- Official candidate URLs must use the exact type-matched eproc/etend portal.
  Credential, authorization, session, secret, cookie, CAPTCHA, OTP, token, and
  related keys are recursively rejected from payloads and URL parameters.
- Validation passed: 32 Lead/Tender conformance tests, all 182 Edge Function
  tests, TypeScript, production build, targeted ESLint/Prettier,
  `git diff --check`, and secret-pattern scans. Existing FieldTitle, bundle,
  npm-config, ESLint-ignore, and Browserslist warnings remain.
- This proves only receiving-contract conformance. No independent Radar code,
  real record/token/request, network call, Supabase/RLS run, migration,
  production write, SETAD session, merge, or deployment occurred.

Next priority: reconcile PR #32, then add the explicit human review/import UI
adapter for A/B Radar rows calling the guarded PR #31 RPC. FakeRest must remain
demo-only, SETAD candidate data must default to pending verification, and no
live integration may be claimed before disposable Supabase acceptance.

## Latest checkpoint — guarded Tender Radar import

Draft PR #31: `satno/tender-radar-import-20260928`, published feature commit
`71f31f3cc71bae1ea53432e36890ad21d7d5299e`, stacked directly on Draft PR #30
at `b86ea3015672c8e960f83c07a84e66d58a8e1585`.

- Live reconciliation confirmed #30 and #11 remained open, Draft and unmerged;
  #30 was mergeable and had no Actions run, check run, or status context.
  `main` and `satno-development` remained at `dce557e`, upstream at `64e2163`,
  and the Persian reference at `85fc400`. No overlapping import/dedup branch or
  PR was found.
- Added the declarative `import_tender_opportunity(lead_id, review)` security-
  definer RPC. It accepts only an assigned, qualified Tender Radar lead and an
  allow-listed scalar review object from active admin/manager/sales staff.
- Only reviewed A/B rows with a paired score are accepted. Official Need No or
  Tender No is type-checked, official portal URLs must match eproc/etend, and
  verified status requires the corresponding official identifier.
- The transaction locks the Lead and all supplied identity dimensions, checks
  official identifier first, Radar source ID second, and fallback fingerprint
  last. Same-Lead retries return the original result without overwrite;
  different-Lead collisions fail for human resolution.
- Opportunity, initial Pipeline row, and audit event are created atomically.
  Radar/Lead provenance is trigger-protected, audit rows are append-only even
  for service-role callers, and an imported tender lead cannot use the generic
  Lead-to-Deal conversion RPC.
- Validation passed: 32 focused Tender/Lead/RBAC tests, all 173 Edge Function
  tests, TypeScript, production build, targeted ESLint/Prettier,
  `git diff --check`, and secret-pattern scan. Existing FieldTitle, bundle,
  npm-config, ESLint-ignore and Browserslist warnings remain.
- This is declarative evidence only. No migration, real Supabase transaction,
  RLS/grant/concurrency/rollback acceptance, real Tender Radar sender/token,
  production record, SETAD session, merge, or deployment occurred.

Next priority: reconcile PR #31, then add sender-conformance fixtures for the
A/B Tender Radar payload-to-review boundary without copying the independent
Radar codebase or using real tokens/records. After that, run the RPC/RLS/
concurrency contract in a disposable Supabase environment before activation.

## Latest checkpoint — Tender & Inquiry Intelligence contract and UI skeleton

Draft PR #30: `satno/tender-intelligence-skeleton-20260928`, published feature
commit `86e6b916e8701d3be0bea43afa43e5ec071d748b`, stacked directly on Draft PR
#29 at `1a69739793b1c5ad49378bd1191a3899abbfcde3`.

- Live reconciliation confirmed PRs #11 and #29 remained open, Draft and
  unmerged. `main` and `satno-development` remained at `dce557e`, upstream at
  `64e2163`, and the Persian reference at `85fc400`. No overlapping Tender,
  SETAD or Radar branch/PR existed; PR #29 had no workflow run or status context.
- Added the first Persian-first responsive skeleton for Radar Inbox, SETAD
  Interactive Search, Tender Pipeline and Saved Searches. It covers the two
  product domains, every requested custom filter, the official inquiry/tender
  portal split and the three starter saved searches.
- The data contract keeps SETAD Need No/Tender No separate from aggregator
  identity, keeps publication and official deadlines separate, and defines
  official-first dedup, fallback fingerprinting, A/B import eligibility and the
  three verification states.
- Added declarative opportunity, pipeline, saved-search and append-only audit
  tables with role/assignment-aware RLS. Authenticated writes are deliberately
  revoked until guarded server functions and disposable real-database tests
  exist. Sensitive audit keys are rejected by schema constraint.
- SETAD remains strictly human-in-the-loop: the UI only opens the official page
  in the user's browser. It does not solve/bypass CAPTCHA or read/store/login
  credentials, cookies, OTP or session state. No live SETAD success is claimed.
- Validation passed: 52 focused Chromium tests including desktop and 390x844
  mobile RTL, all 173 Edge Function tests, TypeScript, production build,
  targeted ESLint/Prettier, declarative table SQL parse, secret-pattern scan and
  `git diff --check`. Existing FieldTitle, bundle-size and Browserslist warnings
  remain.
- FakeRest records and starter searches are synthetic UI evidence only. No
  migration, real Supabase/RLS run, Tender Radar sender deployment/token
  exchange, SETAD session, production write, merge or deployment occurred.
  Acceptance requirements are in
  `docs/satno/TENDER_INTELLIGENCE_ACCEPTANCE.md`.

Next priority: reconcile PR #30, then add a guarded server-side Radar
Inbox-to-tender import/dedup function with immutable provenance and audit events.
Sender conformance fixtures remain separate from the independent Tender Radar
codebase and must not contain real tokens or production records.

## Latest checkpoint — server-side Lead ingestion contract

Draft PR #29: `satno/lead-ingestion-contract-20260928`, published feature
commit `d8240fe8a152d026d4007bc00427a1dc2bf71df6`, stacked directly on Draft PR
#28 at `194097f986dc87ecffa23173f857ea82d645ed4f`.

- Live reconciliation confirmed PR #28 remained open, Draft, unmerged and
  mergeable. `main` and `satno-development` remained at `dce557e` and the
  Persian reference remained `85fc400`. No overlapping ingestion/connector PR
  or branch existed and PR #28 had no workflow run or status context.
- Upstream advanced from `d00fdf3` to `64e2163` through two commits that add and
  then drop the same `deals.lost_reason` column. They have no final schema effect
  and were not mixed into this feature; controlled upstream sync remains a
  separate package.
- Added a server-to-server `ingest_leads` boundary for Tender Radar and Bale
  Market. Each connector uses a distinct server-only bearer token and can write
  only normalized quarantine fields. Browser CORS access is absent and no
  token, provider credential or `VITE_` secret is included.
- Stable `(source, source_record_id)` keys make retries idempotent. Persistence
  performs one insert and, only on a unique-key collision, reads the existing
  record; it never upserts or overwrites triage/conversion state.
- The contract rejects connector-supplied qualification, assignment and core
  CRM/Project/finance/inventory IDs, limits request/raw-payload sizes, validates
  URLs/dates/amounts and never returns the raw payload.
- Validation passed: all 173 Edge Function tests, including 23 ingestion tests,
  TypeScript, production build, targeted ESLint and Prettier, secret-pattern
  scan and `git diff --check`. Existing FieldTitle circular-chunk, large-bundle
  and stale Browserslist warnings remain.
- Tests use synthetic events and an injected store. Deno/Supabase local runtime
  was unavailable; no deployed Function, real token, real connector call,
  database concurrency run, migration, merge, deployment or production write
  occurred. Acceptance requirements are in
  `docs/satno/LEAD_INGESTION_ACCEPTANCE.md`.

Next priority: reconcile PR #29, then define sender-side conformance fixtures
for Tender Radar and Bale Market without moving either independent product into
this repository. Actual sender deployment and secret exchange require their own
reviewed changes and a disposable end-to-end test.

## Latest checkpoint — quarantined Lead Inbox foundation

Draft PR #28: `satno/lead-inbox-foundation-20260928`, published feature commit
`ca9296e6303f9de4bee631d6c4f11e978d1e179b`, stacked directly on Draft PR
#27 at `2d4bff3f6332341487af7690843fc1d795d7aecf`.

- Live reconciliation confirmed PR #27 remained open, Draft, unmerged and
  mergeable. `main` and `satno-development` remained at `dce557e`; upstream
  remained `d00fdf3` and the Persian reference remained `85fc400`. No
  overlapping Lead Inbox/Conversion branch or PR existed.
- Added a Persian-first responsive Lead Inbox for normalized inbound
  opportunities. Raw payloads remain quarantined and are never rendered or
  copied into Companies, Contacts or Deals.
- Explicit conversion requires a qualified lead and reviewed values. The
  security-definer RPC locks the lead, creates Company, optional Contact,
  opportunity-stage Deal and immutable provenance in one transaction. It does
  not create Projects, finance records or inventory movements.
- Added assignment-aware RLS, deny-by-default UI RBAC and explicit revokes that
  neutralize legacy default privileges before applying narrow authenticated
  grants. Authenticated clients cannot ingest/delete leads or write provenance
  directly; future connectors remain server-side and idempotent by source key.
- Validation passed: 34 focused Chromium tests, all 150 Edge Function tests,
  TypeScript, production build, targeted ESLint and Prettier, registry
  generation, declarative table-schema parse and `git diff --check`. The full
  app run reached 879 passing/1 skipped with four unrelated baseline or network
  failures (stale mobile DataImport assumptions and Gravatar network checks),
  while its browser project also collected the Node-only backup test.
- FakeRest tests and fixtures are synthetic evidence only. No real Supabase/RLS
  run, migration, connector call, production data write, merge, deployment or
  secret change occurred. The disposable-database acceptance contract is in
  `docs/satno/LEAD_INBOX_ACCEPTANCE.md`.

Next priority: reconcile PR #28, then define a separate server-side ingestion
package for Tender Radar and Bale Market. It must authenticate connectors,
retain stable source IDs, retry idempotently and never expose provider secrets
or bypass the Lead Inbox quarantine.

## Latest checkpoint — verified backup portability foundation

Draft PR #27: `satno/backup-portability-foundation-20260928`, published feature
commit `0dcdc7c442736e451fb6ddbf9e620704d2c1ff60`, stacked directly on Draft PR
#26 at `8c11d95b0d8a5919c3022d865b603702f3a43745`.

- Live reconciliation confirmed PR #26 remained open, Draft, unmerged, clean,
  and two commits ahead/zero behind PR #25. `main` and `satno-development`
  remained at `dce557e`; upstream remained `d00fdf3` and the Persian reference
  remained `85fc400`. No overlapping backup/export/migration PR or branch
  existed.
- Added a local, explicit PostgreSQL custom-archive backup command. Output must
  be an absolute directory outside the repository; the database URL is passed
  only through the process environment and is never written to arguments,
  output or the manifest.
- Creation validates the archive with `pg_restore --list`, records the tool
  version, byte count and SHA-256, and writes a final `COMPLETE` marker.
  Verification rejects partial directories, tampering and unexpected manifest
  archive paths without connecting to a destination database.
- Validation passed: 6 Node backup tests, plan output, deliberate restore
  rejection, all 150 Edge Function tests, TypeScript, production build,
  targeted ESLint and Prettier, Node syntax check, production-secret-pattern
  scan and `git diff --check`. Existing FieldTitle circular-chunk, large-bundle
  and stale Browserslist warnings remain.
- The tests use a stub archive only. No live database connection, real backup,
  Storage-object export, restore, migration, deployment, secret change or
  production write occurred. Physical Supabase Storage objects, secrets and
  platform/provider settings remain explicitly separate. Restore is
  intentionally unavailable pending explicit approval and a disposable drill.

Next priority: reconcile PR #27, then begin Lead/Opportunity Intelligence and a
Lead Inbox/Conversion foundation as a separate reviewable package. Raw leads
must remain quarantined from core Contacts, Companies and Deals until an
explicit, provenance-preserving conversion succeeds.

## Latest checkpoint — optional Phone/SMS OTP foundation

Draft PR #26: `satno/phone-otp-foundation-20260928`, published feature commit
`4a3bee82ab7dd04c88509c8e031b0ec06c48b4f3`, stacked directly on Draft PR #25
at `b6eccca0df6e46b9e5f805760f50e51f7ed0510e`.

- Live reconciliation confirmed PR #25 remained open, Draft, unmerged, clean
  and two commits ahead/zero behind PR #24. `main` and `satno-development`
  remained at `dce557e`; upstream remained `d00fdf3` and the Persian reference
  remained `85fc400`. No overlapping OTP branch or PR existed.
- Added an optional Persian-first phone OTP flow backed by Supabase Auth.
  Iranian local/Persian-digit inputs normalize to E.164, verification uses the
  SMS token type and the request always sets `shouldCreateUser: false`; raw or
  unknown phone numbers therefore cannot create Auth or CRM users.
- Administrators may assign or replace one unique staff sign-in phone through
  the existing users Edge Function. Provider selection stays outside the
  browser through Supabase's built-in SMS configuration or replaceable Send SMS
  Hook. Email/password login remains unchanged.
- Validation passed: 48 focused Chromium tests, all 150 Edge Function tests,
  TypeScript, production build, targeted ESLint and Prettier, registry
  generation, declarative table-schema parse, secret-pattern scan and
  `git diff --check`. Existing FieldTitle circular-chunk, large-bundle and stale
  Browserslist warnings remain.
- The UI is default-off behind `VITE_ENABLE_PHONE_OTP_AUTHENTICATION=true`. No
  provider, API key, hook secret or production secret was added; no SMS was sent
  and no real Supabase Auth/provider E2E was performed. SQL remains declarative;
  no migration, merge, deployment or production write occurred.

Next priority: reconcile PR #26, then start Export/Backup/Server Migration as a
separate portability package. Keep backup design and restore acceptance separate
from production execution; do not export secrets or real customer data.

## Latest checkpoint — Daily Work Reports foundation

Draft PR #25: `satno/daily-work-reports-20260928`, published feature commit
`21ac49999e9a621ecb72da5194d4c25b790ebbe5`, stacked directly on Draft PR #24
at `2f3a5cd013a7c4dd76be8ae0f005656fd728cbe6`.

- Live reconciliation confirmed PR #24 remained open, Draft and unmerged, with
  its head exactly descended from PR #23. `main` and `satno-development`
  remained at `dce557e`; upstream remained `d00fdf3` and the Persian reference
  remained `85fc400`. No overlapping Daily Work Reports branch or PR existed.
- Added a Persian-first, responsive Daily Work Reports resource for staff to
  record one report per work date: achievements, minutes worked, blockers and
  next steps. Managers and administrators may read team reports, but only the
  enabled owner may create, edit or delete a report.
- Added a declarative `daily_work_reports` table, ownership trigger, helper,
  indexes, grants and RLS policies. The enabled-sales identity is derived
  server-side; the client access matrix remains navigation/UI enforcement, not
  the production data-security boundary.
- Validation passed: 34 focused Chromium tests, all 140 Edge Function tests,
  TypeScript, production build, targeted ESLint and Prettier, registry
  generation, declarative table-schema parse and `git diff --check`. Existing
  FieldTitle circular-chunk, large-bundle and stale Browserslist warnings remain.
- FakeRest records are demo/test data only. No migration was generated or
  applied and no real Supabase/RLS E2E was performed because the local
  Docker/Podman Supabase stack is unavailable. This resource is not payroll and
  does not post finance, project-cost, procurement or inventory entries. No
  merge, deployment, secret change or production-data write occurred.

Next priority: reconcile PR #25, then design Phone/SMS OTP as a separate,
provider-replaceable package with all provider credentials and delivery calls
kept server-side. Do not weaken the existing email/password login path or claim
real OTP delivery until an approved provider and real integration test exist.

## Latest checkpoint — Staff Accounts and RBAC foundation

Draft PR #24: `satno/staff-rbac-foundation-20260928`, published feature commit
`5c7e04767ce5b84fb923c94638017125be1a20ad`, stacked directly on Draft PR #23
at `b2035e0f5ee8a521a095cd44cdc90a60f312533c`.

- Live reconciliation confirmed PR #23 remained open, Draft, unmerged and
  mergeable before this package. `main` and `satno-development` remained at
  `dce557e`; upstream remained `d00fdf3` and the Persian reference remained
  `85fc400`. No overlapping Staff/RBAC branch or PR existed. PR #24 is open and
  Draft; GitHub compare reports two commits ahead and zero behind its exact base,
  while REST mergeability is awaiting recomputation after the documentation
  commit. Its head has no workflow run or status context.
- Added seven explicit staff roles: administrator, manager, sales, project,
  finance, inventory and read-only viewer. The client matrix is deny-by-default,
  role selection and badges are localized, disabled accounts fail access checks,
  and Finance/Inventory custom routes now have explicit access gates.
- The users Edge Function validates roles, derives the legacy `administrator`
  field from the authoritative role, keeps role-less legacy records compatible,
  restricts staff mutation to administrators and blocks administrator
  self-lockout. Declarative schema helpers expose the current enabled staff role.
- Validation passed: 33 focused Chromium tests, 140 Edge Function tests,
  TypeScript, production build, targeted ESLint and Prettier, registry
  generation, declarative table-schema parse and `git diff --check`. Existing
  FieldTitle circular-chunk, large-bundle and stale Browserslist warnings remain.
- No migration was generated or applied. Most current resource policies are
  still broad `authenticated` policies, so this package is not production RLS
  acceptance. A backfill-first generated migration and the real role/RLS matrix
  remain blocked by the unavailable Docker/Podman Supabase stack. No merge,
  deployment, secret change or production-data write occurred.

Next priority: reconcile PR #24, then implement Daily Work Reports as a separate
package with ownership and manager-visibility rules. Keep resource-level RLS as
an explicit production gate; do not treat client `canAccess` as data security.

## Latest checkpoint — Inventory foundation

Draft PR #23: `satno/inventory-foundation-20260928`, feature commit
`c1843c3a76296e72ba88d1f551ae3c38078eba37`, stacked on Draft PR #22 at
`b7cf11712da90673dd0af080475e9e2084e93be3`.

- Live reconciliation confirmed PR #22 remained open, Draft, unmerged and
  mergeable before this package. `main` and `satno-development` remained at
  `dce557e`; upstream remained `d00fdf3` and the Persian reference remained
  `85fc400`. No overlapping Inventory branch or PR existed. PR #23 is open,
  Draft and mergeable; GitHub reports no workflow runs for its feature head.
- Added locations, stock items and explicit quantity movements. On-hand stock
  is derived from receipts, issues and adjustments; there is no mutable copied
  total. Negative balances remain visible instead of being silently clamped.
- A receipt may reference one procurement commitment and an issue may reference
  one project, but one movement cannot reference both. Marking Procurement as
  received never posts stock automatically. Quantities remain distinct from
  project actual costs, payables, payments and financial transactions.
- Added a Persian-first responsive, read-only Inventory dashboard and a
  Procurement entry point, plus FakeRest demo records and a separate acceptance
  contract. FakeRest results are not real-database or concurrency evidence.
- Validation passed: 43 focused Chromium tests across Inventory, Procurement,
  Finance, Project, Persian/i18n/RTL and money; TypeScript, production build,
  targeted ESLint and Prettier, registry generation, table-schema parse and
  `git diff --check`. Existing FieldTitle circular-chunk, large-bundle and stale
  Browserslist warnings remain.
- No migration was generated or applied. Real Supabase/RLS and concurrency
  testing remains blocked by the unavailable Docker/Podman stack, and GitHub
  Actions has no run. No merge, deployment, secret change or production write.

Next priority: reconcile PR #23, then begin Staff Accounts + RBAC as a separate
reviewable package. Define roles and acceptance boundaries before adding daily
work reports, and do not weaken the real Supabase/RLS gate.

## Latest checkpoint — Finance ledger foundation

Draft PR #22: `satno/finance-ledgers-foundation-20260928`, published at
`6d10e8d9c97293f283a9f606dbedcc4042143144` and stacked on Draft PR #21 at
`25779d168b4b1683ee452297195c0f857b04c4e0`.

- Live reconciliation confirmed PR #21 remained open, Draft, unmerged and
  mergeable before this package. `main` and `satno-development` remained at
  `dce557e`; upstream remained `d00fdf3` and the Persian reference remained
  `85fc400`. No overlapping Finance branch or PR existed. PR #22 is open,
  Draft and mergeable; GitHub reports no workflow runs for its feature head.
- Added separate receivable, payable and transaction ledgers. Composite keys
  enforce project/source currency provenance, and every transaction settles
  exactly one receivable (inflow) or payable (outflow). Balances floor at zero,
  cancelled obligations are excluded, and summaries never combine currencies.
- Added a Persian-first responsive, read-only Finance dashboard plus a
  Procurement entry point. Project contract snapshots and procurement
  commitments never create financial obligations or payments implicitly.
- Added FakeRest demo records and a separate acceptance contract. These prove
  deterministic UI behavior only; they are not evidence of real persistence.
- Validation passed: 38 focused Chromium tests and a final 5-test
  Finance/Procurement rerun; TypeScript, production build, targeted ESLint and
  Prettier, registry generation, table-schema parse and `git diff --check`.
  The full app run passed 272 tests with one skip; two external Gravatar checks
  and two pre-existing DataImport registration-isolation checks failed outside
  the changed finance surface. Existing FieldTitle circular-chunk, large-bundle
  and stale Browserslist warnings remain.
- No migration was generated or applied. Real Supabase/RLS testing remains
  blocked by the unavailable Docker/Podman stack, and GitHub Actions has no run.
  No merge, deployment, secret change or production-data write occurred.

Next priority: reconcile PR #22, then begin an Inventory foundation as a new
small package. Keep stock receipts/issues distinct from procurement commitments,
payables, transactions and project actual costs.

## Latest checkpoint — Procurement commitments UI

Draft PR #21: `satno/procurement-ui-foundation-20260928`, feature commit
`17cf7d168982d2c1c6eb1d482f75c434959a78be`, stacked on Draft PR #20 at
`71fa68667cb0d8360fb0cf70dac74d0e2165cb48`.

- Live reconciliation confirmed PRs #1–#20 remained open and unmerged before
  this package. `main` and `satno-development` remained at `dce557e`; upstream
  remained `d00fdf3` and the Persian reference remained `85fc400`. No newer or
  overlapping Procurement branch existed. PR #21 is open, Draft, clean and
  mergeable; GitHub reports no workflow runs for its feature head.
- Added a declarative `procurement_commitments` schema linked to exactly one
  project cost item and an optional supplier Company. Composite provenance keys
  enforce project/cost/commitment currency equality. RLS, grants, indexes and
  owner trigger follow the current repository pattern.
- Added a Persian-first responsive Procurement list and a Projects-page entry
  point. It shows reference, project, supplier, status, amount and expected date,
  plus separate draft, active and received summaries.
- Commitments remain operational obligations: receiving one does not create an
  actual cost, payable, payment, inventory receipt or transaction. Cancelled,
  received, active and draft amounts are mutually exclusive and are never summed
  into a finance total.
- Validation passed: 55 relevant real-Chromium tests and a focused 4-test rerun
  at 390x844; TypeScript, production build, targeted ESLint/Prettier, declarative
  table-schema parse, registry generation and `git diff --check`. Existing
  FieldTitle circular-chunk, large-bundle and stale Browserslist warnings remain.
- FakeRest UI evidence is not real-database evidence. No migration was generated
  or applied because this runtime has no local Supabase/Docker stack. The database
  gate remains migration generation plus the real Supabase/RLS contract in PR #18.
  No merge, deployment, secret change or production data write.

Next priority: begin Finance foundations in a separate reversible package with
Receivables, Payables and Transactions modeled as distinct ledgers. Do not turn
procurement commitments or project contract snapshots into payments implicitly.

## Latest checkpoint — Project + Costing foundation

Draft PR #20: `satno/project-costing-foundation-20260928`, published at
`bd549edb8038880758562e1964fb2578675ad91c` and stacked on Draft PR #19 at
`8d649da3efc1fe5c3f0beba490c1095d6ccd9f7b`.

- Live reconciliation confirmed PRs #1–#19 remained open and unmerged before
  this package. `main` and `satno-development` remained at `dce557e`; upstream
  remained `d00fdf3` and the Persian reference remained `85fc400`. No newer or
  overlapping Project/Costing branch existed. PR #20 is open, Draft, clean and
  mergeable; GitHub reports no workflow runs for its head.
- Added the declarative `projects` and `project_cost_items` schema, typed domain
  records, FakeRest demo data and a Persian-first responsive project list. Each
  project has one unique Deal provenance, cost lines keep planned and actual
  amounts together, and project/cost currencies must match.
- Forecast cost is `sum(max(planned, actual))` per line, so replacing an
  estimate with an actual amount cannot double-count the cost. Contract value
  remains a commercial snapshot rather than a finance transaction; no
  Rial/Toman or exchange-rate conversion is inferred.
- Validation passed: 57 relevant real-Chromium tests including costing,
  Persian/i18n, money and the desktop/mobile route matrix; TypeScript,
  production build, targeted ESLint/Prettier, registry generation and
  `git diff --check`. The declarative table schema parsed successfully. Existing
  FieldTitle circular-chunk, large-bundle and stale Browserslist warnings remain.
- FakeRest UI evidence is not real-database evidence. No migration was generated
  or applied because this runtime still has no local Supabase/Docker stack. The
  database gate remains migration generation plus the real Supabase/RLS contract
  from PR #18. No merge, deployment, secret change or production data write.

Next priority: reconcile PR #20, then build Procurement UI as a separate
reversible package linked to project cost items. Keep purchase commitments,
actual costs and payments distinct; do not create a duplicate finance total.

## Latest checkpoint — Persian deal money display

Draft PR #19: `satno/persian-money-ui-20260928`, published at
`c67304c58ee9b0e96c11ebf3af90e408d96b2fb1` and stacked on Draft PR #17 at
`7fcb69cbe64571702a5a85435c97fe02c55c01d8`.

- Live reconciliation confirmed PRs #1–#18 remain open and unmerged. `main`
  and `satno-development` remain at `dce557e`; upstream remains `d00fdf3` and
  the Persian reference remains `85fc400`. PR #18 still has no workflow runs
  and its real Supabase/RLS contract remains unexecuted because this runtime
  has no Docker/Podman and fork workflows were not enabled without approval.
- Connected the existing `formatMoney` helper to all current deal amount
  display surfaces: cards, columns, deal/company details, dashboard pipeline,
  and chart tooltip/axis. UI formatting now follows the loaded product locale,
  so Persian uses Persian numerals instead of the browser locale.
- The database `deals.amount` column remains `bigint`; its displayed unit still
  comes from explicit `configuration.currency`. No stored value is mutated and
  no Rial/Toman conversion or default-currency inference was introduced.
- Validation passed: 51 relevant Chromium tests across money, Persian i18n and
  direction, deal desktop/mobile routes and the initial route matrix; TypeScript,
  production build, targeted ESLint/Prettier, registry generation and
  `git diff --check` also passed. Existing FieldTitle circular-chunk,
  large-bundle and stale Browserslist warnings remain.

Next priority: reconcile PR #19 status, keep PR #18's database contract separate,
then start the Project + Costing package from verified current schema and explicit
acceptance criteria. Do not infer recovered historical artifacts or run Draft SQL.

## Latest checkpoint — Persian core UI and initial route matrix

Draft PR #17: `satno/initial-preview-route-matrix-20260927`, published at
`fa88916105d8e4b21a574236432626831a99b840` and stacked on Draft PR #16 at
`7c1383658becd159fca1859a3dba8516bbb6bcc4`.

- Live reconciliation confirmed PR #16 is open, Draft, unmerged and mergeable;
  `main` and `satno-development` remain at `dce557e`. Upstream remains
  `d00fdf3` and the Persian reference remains `85fc400`. GitHub reports no
  workflow runs or status contexts for the PR #16 head. No overlapping newer
  SATNO feature branch or PR was present before this package.
- Browser QA exposed a product-language gap: the SATNO CRM and Supabase
  overlays were Persian, but core React Admin messages such as Sign in, Email,
  Password and generic actions still came from the English fallback. The
  verified `ra-language-farsi` dependency used by the Persian reference branch
  is now merged between the English fallback and SATNO-specific overlays.
  French remains absent. English remains the fallback/reference catalog.
- A reusable acceptance matrix now exercises the protected contacts,
  companies, deals and tasks routes plus the signed-out login route at both
  1440x1000 and 390x844. It asserts Persian `lang=fa`, RTL direction, real
  route content and no document-level horizontal overflow for protected routes.
- Validation passed: 51 relevant real-Chromium tests with one existing skip,
  including ten new matrix cases; TypeScript, production build, targeted
  ESLint, Prettier, registry generation and `git diff --check` passed. Existing
  FieldTitle circular-chunk, large-bundle and stale Browserslist warnings remain.
- This matrix uses FakeRest data for protected-route content. It does not
  establish real Supabase persistence, RLS, OTP or production deployment
  acceptance. No database migration, secret change, merge or deployment.

Next priority: check PR #17 CI/status, then prepare and execute the real Supabase
persistence/RLS acceptance queue in an environment with a usable Supabase stack.
Keep FakeRest demo evidence explicitly separate from DB evidence.

## Latest checkpoint — mobile deals preview route

Draft PR #16: `satno/mobile-deals-preview-20260927`, feature commit
`775ed63d5f2ce0dacc8825a16050b416d7cd0839`, stacked on Draft PR #15 at
`ef6396db4fc730118929e28e1418eceb20073840`.

- Live GitHub reconciliation confirmed PR #15 is open, Draft, unmerged and
  mergeable at `ef6396d`; `main` and `satno-development` remain at `dce557e`.
  Upstream remains `d00fdf3` and the Persian reference remains `85fc400`.
  No overlapping mobile-deals branch or PR was present before this package.
- The mobile Admin now registers `/deals` instead of returning Not Found. The
  shared deal list has a Persian/RTL mobile header and constrained content shell;
  actions wrap, Kanban overflow stays inside its horizontal scroller, and stage
  columns use a stable responsive width without changing deal persistence or
  drag-and-drop semantics.
- Chromium 153 visual QA at 390x844 rendered the Persian/RTL deals route with
  `scrollWidth=clientWidth=390`. A dedicated route regression test plus the
  targeted Persian/i18n/mobile group passed 42 tests. TypeScript, production
  build, targeted ESLint, Prettier, registry generation and `git diff --check`
  passed. The published feature tree `65a9772d11e519c594e49d40ae67e05ff682ab6f`
  exactly matches the locally tested tree.
- FakeRest visual QA is still distinct from real Supabase persistence/RLS
  acceptance. External avatar requests remain blocked in this restricted
  runtime. Existing FieldTitle circular-chunk, large-bundle and stale
  Browserslist warnings remain.

Next priority: re-run the combined desktop/mobile user-test route matrix, then
prepare the real Supabase persistence/RLS test queue without deploying or
merging automatically.

## Latest checkpoint — mobile companies preview route

Draft PR #15: `satno/mobile-companies-preview-20260927`, feature commit
`2fa425da3b51509efb27a1bad622fc382a77d4aa`, stacked on Draft PR #14 at
`ae1b3bdaa699826b0fd0ca750984b1557fc8d378`.

- Live GitHub reconciliation superseded the stale #14 SHA in this document:
  PR #14 is open, Draft and points at `ae1b3bd`; `main` and
  `satno-development` remain at `dce557e`. Upstream remains `d00fdf3` and the
  Persian reference remains `85fc400`. No newer overlapping branch or PR was
  observed.
- The mobile Admin now registers a real company list route instead of only a
  company show route. `/companies` renders existing company cards in a mobile
  header/content shell with infinite pagination; the loading grid is responsive
  rather than fixed at 1008 pixels wide.
- A real Chromium 153 test at 390x844 exercised the registered `/companies`
  route, rendered a company and verified the document has no horizontal
  overflow. The targeted Persian/i18n group passed 20 tests. TypeScript,
  production build, targeted ESLint and Prettier passed. Registry output was
  regenerated and now also contains the previously integrated desktop tasks
  and money helper dependencies.
- The build retains the existing FieldTitle circular-chunk, large-bundle and
  stale Browserslist warnings. This package does not establish real Supabase
  persistence/RLS acceptance and does not fix the separate mobile deals route.

Next priority: check PR #15 CI/status, then fix the mobile deals route in a
separate reversible package and repeat mobile visual QA.

## Latest checkpoint — desktop tasks preview route

Draft PR #14: `satno/desktop-tasks-preview-20260927`, commit
`ae1b3bdaa699826b0fd0ca750984b1557fc8d378`, based on Draft PR #13 at
`a3e8f94c835eca14f95c8cc1514262ea9275534e`.

- Live reconciliation superseded the older #11 automation handoff: PR #13 is
  open, Draft, unmerged and mergeable. Its published tree matches the locally
  tested baseline tree. `main` and `satno-development` remain unchanged.
- Real Chromium visual QA opened dashboard, contacts, companies, deals and tasks
  with an English browser locale at desktop and mobile sizes. Loaded pages set
  `lang=fa`, `dir=rtl` and had no document-level horizontal overflow.
- The QA exposed three baseline route gaps: desktop `/tasks` stayed on the Admin
  loading screen; mobile `/deals` returned Not Found; mobile `/companies` had no
  list content. The desktop task gap is fixed here without changing data or task
  semantics: a dedicated task list page is registered and linked from the header.
- The new desktop tasks route was rechecked in Chromium at 1440x1000: Persian/RTL
  loaded, task groups rendered and the viewport had no horizontal overflow. All
  28 targeted browser tests, TypeScript, build, targeted ESLint and Prettier passed.
  The wider browser run passed 245 tests with one existing skip; only two unrelated
  Gravatar tests failed when external avatar requests returned no response in this
  restricted runtime. GitHub reports no status contexts for the published commit.

Next priority: address mobile company/deal routes in separate reversible work, then
repeat the mobile visual QA. Do not claim mobile acceptance for those routes until
they render and are tested.

## Latest checkpoint — reversible user-test baseline

Branch: `satno/user-test-baseline-20260927`, based on PR #12 at
`f311fb45ec320b2614fef4f486a605ec24f73996`.

- Fresh reconciliation: PRs #2–#12 remain open, Draft and unmerged. `main` and
  `satno-development` remain at `dce557e`; upstream remains at `d00fdf3`; the
  Persian reference remains at `85fc400`. PR #12 has no Actions workflow runs.
- Combined the already reviewed histories from money PR #3 and RTL PRs #7–#9
  on top of the Persian-primary checkpoint. The cherry-picks applied without
  conflict. This is a reversible integration branch, not a merge to the
  integration or main branch.
- 45/45 browser tests passed for Persian catalogs/providers, document/Radix
  direction, Supabase message overlay and money semantics. A second baseline
  group passed 76 tests with one existing skip across contacts, deals, tasks and
  the FakeRest/Supabase-filter adapter. TypeScript, production build, targeted
  ESLint and Prettier passed. Existing FieldTitle circular-chunk, large-bundle
  and stale Browserslist warnings remain.
- The local demo and component behavior are now covered on a single combined
  tree. This does not establish real Supabase persistence, RLS or full E2E
  acceptance. Docker is unavailable in the current execution environment, so
  the repository's local Supabase stack cannot be started here.
- A new current acceptance document (not a recovered historical artifact) is
  recorded at `docs/satno/USER_TEST_BASELINE.md`. It separates FakeRest demo
  checks from the real-database gate and defines login, contacts, companies,
  deals and tasks as the first user-test scope.

Next priority: publish this branch as a Draft PR, then make the combined UI
available for visual desktop/mobile QA. In parallel, prepare a real Supabase
test environment and execute persistence/RLS/E2E acceptance. Connect the money
formatter to selected UI consumers only after each stored monetary field's unit
is explicit; do not infer Toman or mutate stored amounts.

## Latest checkpoint — Persian as the product language

Branch: `satno/persian-primary-20260927`, stacked on #11 at
`ebf3a3066c3c4a48fe2dcdec92c3d66dace3a725`.

- Fresh reconciliation: PRs #2–#11 remain open/unmerged; no overlapping newer PR
  or branch observed. Main/integration, upstream and Persian reference retain the
  SHAs listed below. #11 has no reported workflow runs or status contexts.
- Ahmad's new language decision supersedes older en/fa/fr requirements below:
  Persian is the sole product language and default, independent of browser locale.
  English is retained as the translation fallback/reference and isolated test provider.
  French CRM catalog, both French-only packages, lock entries and registry entry removed.
- Legacy stored en/fr/unsupported locales resolve to Persian. The direction provider
  also normalizes the stored locale for single-language providers so date/number
  consumers agree with translations and document/Radix direction. Generic Admin
  multi-language behavior remains tested with an isolated en/fa fixture.
- 38 real Chromium tests passed (13 provider, 10 Admin integration, 9 direction
  helpers, 3 catalog and 3 Supabase overlay); TypeScript, production build and targeted
  ESLint passed. Prettier checked before publication. Existing build warnings for
  circular FieldTitle chunks, large bundles and stale Browserslist remain.
- Tests reused the temporary external Chromium 153 binary; the local launcher is
  not shipped. Package/lock changes remove only the two French language packages.
- Historical-source search returned no additional verifiable original artifact.
  Recovery ledger remains open. No database migration or production deployment.

Next priority: prepare a separate reversible user-test integration branch combining
this checkpoint with the existing RTL #7–#9 and money #3 work, without merging to
main/satno-development. Keep money storage units explicit. Validate baseline login,
contacts, companies, deals and tasks; distinguish FakeRest demo checks from real
Supabase persistence/RLS/E2E acceptance. No user-test URL or full completion
percentage is claimed yet. Do not recreate prior helpers/catalogs or recovered overlay.

## Previous checkpoint — Persian Supabase messages

Branch: `satno/persian-supabase-messages-20260927`, based on #10 at
`f69ba238257c51d6011ddff429cd775ea49e396d`. Read this branch's checkpoint for
the next run, then reconcile all live refs before coding.

- Rechecked PRs #2–#10: open and unmerged, no newer overlapping PR observed.
  Main/integration, upstream HEAD and Persian reference SHA still match below.
- Promoted the existing `SATNO_CRM_raSupabaseFarsiMessages.ts` from #2 at
  `3ffe029adb97ac25478ae03045ab6162b1cc90d3`, under
  `docs/satno/design-artifacts/persian-money/`, into the runtime commons folder.
  The message source is preserved byte-for-byte; this is integration of a recovered
  artifact, not recovery of another historical bundle.
- All 12 installed `ra-supabase-language-english` message keys match the overlay,
  including interpolation placeholders. Persian now uses this overlay after the
  English fallback and CRM catalog. English/French and the English-only test
  provider remain covered. No auth logic or database behavior changes.
- 34 real Chromium tests passed: 13 provider, 3 Supabase overlay, 3 CRM catalog,
  6 Admin integration and 9 locale helper tests. TypeScript, production build,
  targeted ESLint/Prettier passed; registry regenerated. Browser execution reused
  the temporary external Chromium 153 runtime without package/lockfile changes.
- PR #10 has no workflow runs, check runs or status contexts. `check.yml` gates
  most jobs on non-draft PRs, but E2E has no such condition, so draft status alone
  does not explain zero runs. Workflow-list access through the connector was
  rejected as an unsupported endpoint; repository Actions settings remain unverified.
  Do not claim CI success or change Actions settings without evidence.
- Historical source lookup found no additional recoverable artifact. The ledger
  below remains unchanged. Full DB/E2E and combined #7–#9 visual QA remain pending.

Next: connect #3 money formatting to selected UI consumers with explicit units,
or continue combined RTL visual QA; do not recreate this overlay or old helpers.

## Reconciled starting state

- `main` and `satno-development`: `dce557e2741eab9e24453b9f59e64eb2ea92da6b`.
- Controlled upstream snapshot: `d00fdf344f6648046d6a1ac6fcb01265625df54b`.
  The live `marmelab/atomic-crm` HEAD matched this snapshot during this run.
- Persian reference branch: `hoseinmaddahi75/atomic-crm:persian-localization`,
  live SHA `85fc400b551693e40b7864ca7b0ac10b691fab1d`. Extract selectively;
  do not wholesale cherry-pick its auth, environment or database changes.
- PRs #2–#9 were open and unmerged when reconciled.

| PR | Existing work | Head SHA | Dependency |
| --- | --- | --- | --- |
| #2 | Seven reference artifacts | `3ffe029` | satno-development |
| #3 | Money formatter | `c38eb78` | upstream snapshot |
| #4 | Locale direction helpers | `8ccf7d2` | upstream snapshot |
| #5 | Persian catalog | `2905e0f` | upstream snapshot |
| #6 | Persian i18n registration | `baf358c` | #5 |
| #7 | Dialog/Sheet/Dropdown/Select RTL | `9062e16` | upstream snapshot |
| #8 | Content/navigation RTL | `13f342c` | upstream snapshot |
| #9 | Navigation menu motion / drawer alignment | `c0b16c9` | upstream snapshot |

PR #9 was verified as Draft, on `satno/rtl-navigation-drawer-20260927`, full
SHA `c0b16c9bfd6167ce64eaa463be7bca497159c53a`. Its isolated diff modifies two
UI files. Its eight reported token assertions are not browser/E2E tests.

## Current integration work

Branch: `satno/locale-direction-integration-20260927`.

This branch starts from #6 and merges the existing #4 history as a dependency.
No old helpers or catalogs are recreated. New work connects the **loaded**
i18n locale to document `lang`/`dir` and Radix `Direction.Provider`, inside
Admin's context and outside route/layout selection. This covers authenticated,
ready/login and no-layout screens, and React portals. Failed asynchronous locale
requests retain the loaded language's direction. On unmount the host document's
previous attributes are restored. Currency, auth and database behavior do not change.

The CSS work in #7–#9 remains on its original branches; it is not implicitly
included or declared fully tested by this integration branch.

### Validation of this integration

- TypeScript: `npm run typecheck` passed.
- Production build: `npm run build` passed. Existing FieldTitle circular-chunk,
  large-chunk and stale Browserslist warnings remain.
- Browser tests: 28/28 passed across four files: six new Admin integration tests,
  nine existing locale helper tests, three catalog tests and ten provider tests.
- The new tests exercise default/stored Persian, Persian/French/English switching,
  Radix portal direction, reversed keyboard navigation, rejected locale loading,
  and restoration of host document attributes on unmount.
- Default Playwright Chromium downloads returned invalid archives in this runtime.
  Tests ran using an external temporary Chromium 153 binary and an uncommitted
  Vitest launcher override. No browser package or lockfile change is introduced.
- Targeted ESLint and Prettier passed. Registry generation was run; library test
  files are now excluded so the newly available helper test is not shipped as a
  runtime registry file. Registry distribution itself is not an acceptance claim.
- No full database/E2E suite or combined #7–#9 visual acceptance is claimed.
  GitHub Actions must be checked independently for the published commit.

## Artifact recovery ledger

The seven files in #2 are the only historical design artifacts verified in the
repository so far. Their inventory headings do not prove that all named groups
were recovered. Source retrieval in this run produced no additional historical
artifact filename, file content or accessible location for the groups below.
Missing evidence is not evidence that the files never existed.

| Group | Recovery status | Required evidence before implementation |
| --- | --- | --- |
| Project / Costing / Procurement | Not recovered | Original artifact, version and data/test contract |
| Finance / Inventory / Receivables / Payables | Not recovered | Ledger and anti-double-counting design |
| Staff / RBAC / Daily Work | Not recovered | Role matrix and RLS contract |
| Phone / SMS OTP | Not recovered | Provider and security contract |
| Export / Backup / Restore / Migration | Not recovered | Export/restore contract and test plan |
| Leads / Inbox / Conversion / provenance | Not recovered | Staging and dedup contract; Lead → Deal → Project lineage |

Do not invent historical filenames or recreate these designs while claiming
recovery. `SATNO_Claude_Code_Handoff.zip`, inspected in the previous reconciliation,
contains website SEO handoff materials and is not a CRM artifact bundle.

## Remaining backlog

The latest checkpoint and Persian-only decision above take priority over historical language requirements.
User-test integration of the baseline CRM is the immediate delivery priority.

1. Review and validate this locale-direction integration and its #4/#5/#6 dependencies.
2. Review the Persian Supabase overlay on the latest checkpoint branch; integration
   and local validation are complete, final merge remains pending.
3. Continue audited RTL fixes in Settings/Profile/filters/CSS; visually test the
   combined #7/#8/#9 behavior on mobile and desktop.
4. Connect #3's money formatter to consumers without silently changing stored units.
5. Diagnose absent GitHub Actions runs; do not equate local success with CI success.
6. Recover the historical groups above before claiming their design or implementation complete.
7. Review the upstream snapshot before final integration: it is 123 commits ahead,
   with 211 changed files including schema/functions, not just UI changes.

The existing hourly `SATNO CRM Development` automation remains the sole routine.
Before every run, refresh PRs/refs and this checkpoint to avoid parallel duplicate
work. The model selected in an interactive chat does not itself verify an
automation model change.
