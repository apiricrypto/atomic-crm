# Lead connector ingestion acceptance contract

## Scope

`ingest_leads` is a server-to-server boundary for SATNO Tender Radar and SATNO
Bale Market Intelligence. It accepts one normalized source event per request and
places it in the quarantined `lead_inbox`. It does not scrape either provider,
run in the browser, qualify leads, create CRM records, or contain provider
credentials.

## Authentication and secret handling

- The caller identifies itself with `x-satno-connector: tender_radar` or
  `x-satno-connector: bale_market`.
- Each source has a different random token of at least 32 characters, supplied
  as `Authorization: Bearer ...` over HTTPS.
- Tokens exist only in the connector's server environment and Supabase Function
  secrets:
  `SATNO_TENDER_RADAR_INGEST_TOKEN` and
  `SATNO_BALE_MARKET_INGEST_TOKEN`.
- Tokens must never use a `VITE_` prefix, appear in Git, logs, request bodies,
  browser storage, screenshots, test fixtures, or CRM database rows.
- A token authorizes only its matching source. Missing, short, cross-source, or
  incorrect tokens fail closed before parsing or persistence.
- Rotation is operational: configure a new token at both servers, deploy, test a
  synthetic event, and revoke the previous token. Do not publish either value in
  a PR or issue.

## Request contract

Only `POST` with `Content-Type: application/json` is accepted. The required
fields are:

- `source_record_id`: stable ID from the connector/provider;
- `title`;
- `captured_at`: provider observation time;
- `raw_payload`: versioned connector envelope retained only in quarantine. For
  Tender Radar, the untouched provider material is nested in `source_snapshot`
  under contract `satno.tender-radar.lead.v1`.

Optional normalized fields include source URL, organization/contact details,
location, description, paired non-negative estimated amount and ISO currency,
deadline, and priority. Unknown fields are rejected. In particular a connector
cannot send `status`, assignment, Company, Contact, Deal, Project, finance, or
inventory IDs.

The body is limited to 128 KiB and `raw_payload` to 64 KiB. Source links must use
HTTP(S), dates are validated, future capture timestamps are rejected beyond a
small clock-skew allowance, and connector estimates never become Deal values
without human review.

Tender Radar additionally requires the versioned contract documented in
`TENDER_RADAR_SENDER_CONTRACT.md`. A/B/C grade and score are quarantined source
assertions. Only A/B can later enter human review. Credential, authorization,
password, cookie, CAPTCHA, OTP, and token keys are rejected recursively from all
connector raw payloads.

## Idempotency and quarantine

The database unique key `(source, source_record_id)` is the idempotency key.

- First delivery returns HTTP `201` and creates a `new` lead.
- A retry returns HTTP `200` and the existing record.
- A retry never overwrites raw payload, reviewed normalized fields, assignment,
  priority, qualification, rejection, or conversion state.
- Responses contain only record identity/status metadata, never raw payload.
- The endpoint never calls `convert_lead_to_deal` and never writes core CRM,
  Project, finance, procurement, or inventory tables.

## Example without a real secret

```sh
curl --fail-with-body \
  -H "Authorization: Bearer $SATNO_TENDER_RADAR_INGEST_TOKEN" \
  -H "Content-Type: application/json" \
  -H "x-satno-connector: tender_radar" \
  --data @synthetic-lead.json \
  "$SUPABASE_URL/functions/v1/ingest_leads"
```

The example variables must be provided by the server runtime. They are not
frontend configuration.

## Evidence boundaries

Unit tests use an injected in-memory store and synthetic records. They establish
validation, source-specific authentication, response redaction, idempotent
response behavior, and failure handling without claiming a deployed Function or
database transaction.

Before enabling either connector, a disposable Supabase acceptance run must
prove:

1. both configured source tokens accept only their matching connector;
2. anonymous, browser-origin, short-token and cross-source requests fail;
3. one synthetic event creates exactly one `new` lead;
4. concurrent and sequential retries return the same lead without changing it;
5. invalid/oversized events create no rows and leak no payload in responses or
   logs;
6. direct authenticated ingestion remains forbidden by table grants/RLS;
7. no Contact, Company, Deal, Project, procurement, finance, or inventory row is
   created or changed;
8. token rotation succeeds and the old token is rejected;
9. rate limits, retention, provider consent, and audit ownership are approved
   for the production deployment.

No real connector, Function secret, migration, deployment, or production data
write is part of this package.
