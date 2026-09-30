# SATNO Staff Accounts and RBAC acceptance contract

Status: reviewable foundation. This contract does not claim production RLS
acceptance until the generated migration and real Supabase tests pass.

## Roles

| Role | Staff accounts | CRM | Projects / procurement | Finance | Inventory |
| --- | --- | --- | --- | --- | --- |
| Administrator | Full | Full | Full | Full | Full |
| Manager | Read | Full | Full | Full | Full |
| Sales | None | Full | Read | None | None |
| Project | None | Read | Full | None | Read |
| Finance | None | Read | Read | Full | None |
| Inventory | None | Read | Read; procurement write | None | Full |
| Viewer | None | Read | Read | Read | Read |

“Read” means list, show, get-one, get-list and export. Any resource or action not
listed is denied by default. Configuration writes and staff mutations are
administrator-only. A manager may list/show staff so records can be assigned,
but cannot create, edit, disable or change roles.

The application role is authoritative. `administrator` remains only as a
backward-compatible database field and is synchronized from `role` by the users
Edge Function. A legacy record without `role` resolves to administrator when
`administrator=true`, otherwise to sales. Disabled accounts fail application
access checks.

## Automated evidence in this package

- The client authorization matrix is unit tested for every role family, unknown
  resources, staff administration and read-only behavior.
- The users Edge Function validates the role allow-list server-side, rejects an
  unknown role, allows only an administrator to invite or modify another staff
  account, prevents administrator self-lockout, and derives `administrator`
  from `role` instead of trusting a second client flag.
- Staff create/edit UI selects a localized role; account lists display the
  effective role. Finance and Inventory custom routes use explicit access gates.
- The declarative schema contains the role allow-list, a disabled-aware
  `current_staff_role()` helper and an `is_admin()` compatibility wrapper.

## Real database gate (not satisfied here)

Before deployment, generate and review a migration that performs these steps in
order: add `role`, backfill existing administrators as `admin` and all remaining
staff as `sales`, add the not-null/check/consistency constraints, replace the
functions, then validate all rows. Do not apply a draft schema diff directly.

Run the resulting migration against a disposable Supabase stack and prove:

1. each role can read and mutate exactly the resources in the matrix;
2. direct REST/RPC calls are rejected when the UI would deny them;
3. a disabled account cannot read business data with an existing token;
4. an administrator cannot demote or disable their own active account (also
   covered by the Edge Function, then verified through a real request);
5. role escalation by sending inconsistent `role` and `administrator` values
   fails; and
6. staff email/profile visibility follows an explicit privacy decision.

Current resource policies are largely broad `authenticated` policies. Therefore
client `canAccess`, route gates and the Edge Function are useful defenses and UX,
but they are not a substitute for resource-level RLS. Production RBAC remains
blocked until those policies and the tests above are implemented and executed.

Daily work reports are intentionally outside this package. They require their
own table, ownership rules, manager visibility policy and acceptance tests.
