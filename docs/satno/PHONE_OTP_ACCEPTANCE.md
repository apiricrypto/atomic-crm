# SATNO Phone/SMS OTP acceptance contract

This package adds an optional phone sign-in path while preserving the existing
email/password login. It does not select, configure or claim delivery through a
real SMS provider.

## Architecture boundary

- The client uses Supabase Auth `signInWithOtp` and `verifyOtp`.
- `shouldCreateUser` is always `false`; an unknown/raw phone number cannot create
  an Auth user or a CRM staff record.
- Provider choice is outside the client. Supabase's built-in SMS provider or its
  HTTPS Send SMS Hook may be changed without changing the sign-in UI.
- A Send SMS Hook may implement a regional provider or primary/fallback routing.
  Provider credentials and the hook signing secret must be Supabase project
  secrets. They must never use a `VITE_` variable or enter the browser bundle.
- The phone field is unique and stored in E.164 form in both Supabase Auth and
  `public.sales`. Only administrators may assign or replace it.
- OTP is an authentication concern only. It must not create Contacts, Companies,
  Deals, Leads, Projects, finance records or inventory movements.

References:

- <https://supabase.com/docs/guides/auth/phone-login>
- <https://supabase.com/docs/guides/auth/auth-hooks/send-sms-hook>
- <https://supabase.com/docs/reference/javascript/auth-signinwithotp>

## Default-off rollout

The UI remains hidden unless
`VITE_ENABLE_PHONE_OTP_AUTHENTICATION=true`. Enable it only after all of these
environment-specific gates pass:

1. Apply a reviewed generated migration; do not run the declarative draft
   directly against production.
2. Configure phone authentication and either an approved provider or Send SMS
   Hook in Supabase.
3. Store provider keys and the hook secret server-side and verify hook signature
   validation.
4. Set Auth SMS and sign-in rate limits and enable CAPTCHA where appropriate.
5. Assign a unique, controlled phone number to a test staff account.
6. Confirm code delivery, expiry, retry/rate-limit behavior and successful session
   creation on the real Supabase environment.
7. Confirm unknown numbers receive a generic response and create no Auth/CRM row.
8. Confirm disabled/banned staff cannot obtain an authenticated CRM session.
9. Confirm email/password login and password recovery still work.

## Automated evidence in this package

- Persian, Arabic and ASCII digits normalize to a stable E.164 value.
- malformed phone numbers and OTP values are rejected before an Auth call.
- the request contract pins `shouldCreateUser: false`.
- verification uses the same normalized phone and the `sms` token type.
- the staff Edge Function validates uniqueness and restricts phone mutation to
  administrators.

## Evidence not provided yet

- No provider account, API key, Send SMS Hook or production secret was added.
- No SMS was sent.
- No generated migration was created or applied.
- No real Supabase Auth, RLS, rate-limit, CAPTCHA or disabled-user E2E test ran.
