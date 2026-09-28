# Tender Radar → SATNO CRM sender contract v1

## Boundary

This contract is the only supported shape for SATNO Tender Radar events sent to
the CRM `ingest_leads` endpoint. It is a receiving contract, not a copy of the
independent Tender Radar codebase. The sender remains independently deployable.

The connector sends one event with:

- header `x-satno-connector: tender_radar`;
- a server-only bearer secret supplied at runtime, never in this repository or
  a fixture;
- the normalized Lead Inbox fields already documented in
  `LEAD_INGESTION_ACCEPTANCE.md`;
- `raw_payload` containing the versioned Tender Radar envelope below.

All fixtures are synthetic. They are not captured or anonymized production
records.

## Versioned envelope

`raw_payload.contract_version` must equal `satno.tender-radar.lead.v1`.
Unknown top-level envelope fields fail closed so sender and receiver drift is
visible. The original provider material belongs only in the nested
`source_snapshot` object, where it remains quarantined.

| Field | Contract |
| --- | --- |
| `scoring_version` | Required sender-owned rule/model version; CRM does not invent A/B/C thresholds |
| `opportunity_type` | `inquiry` or `tender` |
| `domain` | `renewable_energy` or `security_systems` |
| `radar_grade` | `A`, `B`, or `C` |
| `radar_score` | Integer from 0 through 100; stored separately from grade |
| `official_need_no_candidate` | Optional Need No candidate; inquiry only |
| `official_tender_no_candidate` | Optional Tender No candidate; tender only |
| `official_source_url_candidate` | Optional HTTPS URL on the matching official eproc/etend host |
| `publish_date_candidate` | Optional source publication date, never a deadline |
| `document_deadline_candidate` | Optional document deadline |
| `submission_deadline_candidate` | Optional response/bid deadline |
| `organizer_candidate` | Optional source-reported organizer |
| `fallback_fingerprint` | Required lowercase `sha256:` value over the sender's documented canonical fields |
| `source_snapshot` | Required provider snapshot object retained only in quarantine |

`source_record_id` remains the stable Tender Radar aggregation identifier. It
must not be replaced by a Need No, Tender No, fingerprint, or list position.

## Quarantine and review transition

All conforming grades may enter `lead_inbox` with status `new`:

- A/B may be selected for human review;
- C remains quarantined and is not an import candidate;
- no grade directly creates a Tender Opportunity, Company, Contact, Deal, or
  Project.

Candidate fields inside `raw_payload` are source assertions, not SETAD truth.
Before `import_tender_opportunity` is called, an authorized user must review the
normalized Lead and, when required, verify the candidate in the official SETAD
browser session. The reviewed RPC input is a separate allow-listed object.

- A/B eligibility alone never means `setad_verified`.
- Default verification is `pending_setad_verification`.
- Official SETAD data wins over Tender Radar or another aggregator.
- Conflicting source and official values become `data_conflict`; neither value
  is silently overwritten.
- `publish_date_candidate` is never copied into either deadline field.

## Idempotency and fingerprint ownership

Delivery idempotency uses `(source, source_record_id)` at Lead Inbox. Reviewed
Tender import dedup uses the type-correct official identifier first, the Radar
source identifier second, and the reviewed fallback fingerprint last.

The sender owns canonicalization and must version any scoring or fingerprint
algorithm change. CRM validates the versioned result but does not recreate the
sender's scoring thresholds. A retry must send the same stable record ID and
must never be used to overwrite an already reviewed row.

## Sensitive material exclusion

Credential, authorization, password, cookie, CAPTCHA, OTP, and token keys are
rejected recursively from `raw_payload`, including `source_snapshot`. SETAD
login/session material is never part of this connector contract. The sender
must remove such material before submission and must not place it in logs,
screenshots, fixtures, database rows, issues, PRs, or chat.

## Conformance evidence

Synthetic A-inquiry, B-tender, and C-quarantine cases live at:

`supabase/functions/ingest_leads/fixtures/tender-radar-v1.json`

The tests prove shape validation, versioning, score/grade pairing, official
identifier separation, date separation, portal routing, sensitive-key denial,
and C-grade quarantine. They do not prove a deployed sender, real token,
production event, database concurrency, SETAD session, or successful live
integration.
