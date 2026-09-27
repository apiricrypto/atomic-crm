# SATNO CRM continuation — 2026-09-27

This is the existing SATNO CRM project, not a new project or automation.
Repository: `apiricrypto/atomic-crm`. Integration branch: `satno-development`.
GitHub refs and code take precedence over historical progress summaries.
Do not merge into `satno-development` or `main`, deploy, change secrets, or run
destructive operations without the user's explicit approval.

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
