# SATNO CRM continuation — 2026-09-27

This is the existing SATNO CRM project, not a new project or automation.
Repository: `apiricrypto/atomic-crm`. Integration branch: `satno-development`.
GitHub refs and code take precedence over historical progress summaries.
Do not merge into `satno-development` or `main`, deploy, change secrets, or run
destructive operations without the user's explicit approval.

## Latest checkpoint — Persian core UI and initial route matrix

Branch: `satno/initial-preview-route-matrix-20260927`, stacked on Draft PR #16
at `7c1383658becd159fca1859a3dba8516bbb6bcc4`.

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

Next priority: publish this package as a Draft PR, then prepare and execute the
real Supabase persistence/RLS acceptance queue in an environment with a usable
Supabase stack. Keep FakeRest demo evidence explicitly separate from DB evidence.

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
