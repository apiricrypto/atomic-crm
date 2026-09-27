# SATNO CRM — Persian Fork Live Audit

Date: 2026-09-27

## Verified references

- SATNO base `satno-development`: `dce557e2741eab9e24453b9f59e64eb2ea92da6b`
- Controlled upstream baseline branch: `satno/upstream-sync-20260927` at `d00fdf344f6648046d6a1ac6fcb01265625df54b`
- Persian reference fork: `hoseinmaddahi75/atomic-crm:persian-localization`
- Persian reference commit: `85fc400b551693e40b7864ca7b0ac10b691fab1d`

The Persian fork is one large commit on the old June base. It must not be cherry-picked wholesale.

## High-risk / unrelated changes in the reference commit

The live compare includes, among other files:

- `.env.development` edits
- deletion of `.env.e2e`
- `package-lock.json` churn
- `pnpm-workspace.yaml`
- `vercel.json`
- `api/keep-alive.js`
- large `supabase/migrations/updates_schema.sql`
- large `supabase/schemas/base_schema.sql`
- auth/provider edits
- `CRM.tsx` edits
- Deal component changes
- Jalali date input implementation

These are outside the first SATNO Persian/RTL foundation and create avoidable merge/schema risk.

## Useful concepts to salvage selectively

- Persian CRM translation catalog
- adding `fa` as a supported locale
- runtime RTL direction
- Persian-first locale behavior
- later, Jalali support as a separate feature

## Important incompatibility found

The reference fork adds an Emotion/Stylis RTL cache, but current upstream SATNO stack is Tailwind/shadcn and does not include those dependencies. SATNO should not import that cache architecture into the first RTL PR.

The reference `rtl.css` also contains selectors for React Flow and MUI DataGrid even though those are not core dependencies in the current upstream. SATNO should prefer semantic document direction plus targeted logical-property fixes.

## SATNO implementation decision

First production step is dependency-free:

`src/lib/localeDirection.ts`

with tests for:

- locale normalization
- primary language extraction
- Persian/Arabic/Hebrew/Urdu RTL detection
- English/French LTR behavior

Branch:

`satno/persian-rtl-core-20260927`

Commits:

- `bdaed44ab2f2cd8a945e3364742e456081120fa8`
- `9654434fec440cceea219366b2b923cdb0e654a4`

## Next integration step

After this core is reviewed:

1. extend the current upstream Atomic CRM i18n provider from `en/fr` to `en/fr/fa`;
2. keep English as complete fallback;
3. add Persian CRM messages shaped exactly like current upstream;
4. synchronize `document.documentElement.lang` and `dir` on locale changes;
5. add targeted mobile/desktop RTL QA;
6. keep Jalali, fonts, Toman presentation, Auth and database changes in separate branches.

No final merge to `satno-development` is implied by this document.
