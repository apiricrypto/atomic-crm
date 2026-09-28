# Tender concurrency acceptance runner

## Evidence boundary

`scripts/satno-tender-concurrency.mjs` is a fail-closed, multi-request
acceptance runner for a **local disposable Supabase stack only**. It is not a
migration, fixture loader, production diagnostic, connector, or SETAD client.
Adding the runner does not prove that any race has passed: evidence exists only
after its six-case output is captured from a reviewed disposable database.

The runner never connects to SETAD or Tender Radar. Need No, Tender No, source
identity, and fallback fingerprint values in the external manifest must be
synthetic. SETAD login, OTP, cookie, session, and CAPTCHA handling stay entirely
outside this runner and remain human-controlled.

## Hard execution gates

Execution is refused unless all of these conditions hold:

1. `SATNO_TENDER_ACCEPTANCE_CONFIRM` is exactly `DISPOSABLE-ONLY`;
2. `SATNO_TENDER_SUPABASE_URL` is credential-free `http://localhost`,
   `http://127.0.0.1`, or `http://[::1]` (with an optional port);
3. the manifest path is absolute and outside the Git repository;
4. the manifest has exactly six versioned race cases and no secret-shaped
   field names;
5. an anon key and two authenticated disposable-user JWTs are supplied only as
   process environment variables.

Remote Supabase hosts are deliberately unsupported. The runner accepts no
service-role key and has no fixture-creation or cleanup privilege. It emits
only case names and redacted pass/fail classifications: response bodies,
database IDs, manifest values, URLs, keys, and JWTs are never printed.

## Disposable fixture prerequisites

After generating and reviewing a migration/diff from the declarative schema,
prepare a local disposable stack with:

- two active `admin`, `manager`, or appropriately assigned `sales` users;
- separate qualified `tender_radar` Lead Inbox rows for Need No, Tender No,
  and fallback-fingerprint collisions;
- one qualified Lead Inbox row used twice for the source-record retry case;
- two inquiry opportunities and two tender opportunities for official SETAD
  verification collisions;
- only synthetic titles, identifiers, URLs, and provider payloads.

Fixture creation is intentionally separate. Giving this runner a service-role
key or a hidden setup RPC would weaken the same write boundary it is intended
to test. Destroy the disposable stack after preserving the redacted result.

## Required manifest cases

| Case | Guarded RPC | Concurrent inputs | Required result |
|---|---|---|---|
| `import_need_no` | `import_tender_opportunity` | two different leads, same inquiry Need No | one accepted, one `23505` conflict |
| `import_tender_no` | `import_tender_opportunity` | two different leads, same tender Tender No | one accepted, one `23505` conflict |
| `import_source_retry` | `import_tender_opportunity` | same lead and identical review | one new write, one `duplicate=true` with `lead_id` basis |
| `import_fingerprint` | `import_tender_opportunity` | two different leads, no official ID, same fingerprint | one accepted, one `23505` conflict |
| `verify_need_no` | `record_setad_verification` | two inquiry opportunities, same verified Need No | one accepted, one `23505` conflict |
| `verify_tender_no` | `record_setad_verification` | two tender opportunities, same verified Tender No | one accepted, one `23505` conflict |

The manifest root is:

```json
{
  "version": 1,
  "fixture_namespace": "satno-disposable-unique-run-name",
  "races": []
}
```

Each race contains only `name`, `rpc`, `expectation`, and exactly two
`requests`. Each request contains actor `a` or `b` and the exact PostgREST RPC
arguments. Import arguments are `p_lead_id` and allow-listed `p_review`;
verification arguments are `p_opportunity_id` and allow-listed
`p_verification`. The runner validates the type-specific identifiers and the
cross-request equality/difference invariants before any network request.

## Invocation

Keep the manifest and shell history outside the repository. Export values from
the local disposable test setup without pasting them into source, logs, chat,
screenshots, or command-line arguments:

```sh
export SATNO_TENDER_ACCEPTANCE_CONFIRM=DISPOSABLE-ONLY
export SATNO_TENDER_SUPABASE_URL=http://127.0.0.1:54321
export SATNO_TENDER_ANON_KEY=...
export SATNO_TENDER_USER_A_JWT=...
export SATNO_TENDER_USER_B_JWT=...
npm run test:tender-concurrency:satno -- /absolute/outside-repo/manifest.json
```

Unit tests for validation, redaction, request synchronization, conflict
classification, and retry classification do not require Supabase:

```sh
npm run test:tender-concurrency-unit:satno
```

## Interpretation

A passing run demonstrates only the six races against the exact disposable
schema and fixtures used. It does not establish production readiness, live
Tender Radar delivery, SETAD authenticity, browser-session safety, migration
safety, or load behavior. Run the rollback-only pgTAP matrix separately for
RLS, grants, transactions, audit immutability, Pipeline gates, and quarantine
invariants.
