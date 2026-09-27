# SATNO CRM — Persian fork delta audit

Reference commit: `hoseinmaddahi75/atomic-crm@85fc400b551693e40b7864ca7b0ac10b691fab1d`

The Persian localization fork changes 43 files in one commit. It mixes localization work with unrelated environment, deployment, schema, auth, currency and Jalali-date changes, so it is not suitable for direct cherry-pick into SATNO CRM.

## Safe extraction groups

### Group A — Persian catalog
The most reusable part is the dedicated CRM Persian message catalog. It should be rebased against the current upstream English message schema and checked for exact key and Polyglot placeholder parity.

### Group B — RTL foundation
Logical CSS directions and locale-driven document direction can be extracted independently. Physical APIs whose meaning is explicitly left/right, centered geometry and bidirectional email fields require separate review.

### Group C — dates
Jalali/date-field work should remain a separate optional feature. It must not be coupled to base Persian translation or RTL support.

### Group D — money
Toman display must be an explicit presentation choice for IRR values. It must not be inferred from Persian locale and must not mutate stored financial values.

## Files requiring caution

The fork also changes environment files, package lock/workspace files, Supabase auth/provider files, Supabase schema/migration files and deployment configuration. These are intentionally excluded from the first Persian/RTL integration wave.

## SATNO integration sequence

1. keep controlled upstream snapshot as the baseline;
2. finish locale-direction helpers and tests;
3. add the rebased Persian CRM catalog and parity tests;
4. add Persian ra-supabase overlay/fallback;
5. register Persian in the i18n provider and update document lang/dir;
6. apply audited RTL-safe UI replacements;
7. integrate the centralized money formatter separately;
8. evaluate Jalali support only after the base localization path is stable.

No merge to `satno-development` is performed by this artifact.
