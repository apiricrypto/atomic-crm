# SATNO backup, export and server-migration acceptance contract

This package provides a local database-backup and verification tool. It does not
connect to a live SATNO environment during automated tests and it intentionally
does not automate restore.

## Scope and evidence boundary

- `npm run backup:satno -- plan` prints the included and excluded components.
- `npm run backup:satno -- create` requires `PGDATABASE` and an explicit absolute
  `SATNO_BACKUP_OUTPUT_DIR` outside the Git repository.
- The database URL is inherited by `pg_dump`; it is never placed in arguments,
  logs or the manifest.
- The archive uses PostgreSQL custom format with ownership and grants excluded.
  `pg_restore --list` must succeed immediately after creation.
- The manifest records the UTC creation time, source Git commit, `pg_dump`
  version, archive size and SHA-256 checksum.
- A `COMPLETE` marker is written only after the archive, TOC and manifest have
  all been created; verification rejects partial directories without it.
- `npm run backup:satno -- verify /absolute/backup/path` recomputes the checksum
  and inspects the archive without connecting to a destination database.
- There is no `restore` implementation. Restore is a separately approved,
  destructive operation and must first target an empty disposable environment.

## Explicit exclusions

Database dumps contain Storage metadata, not physical Supabase Storage objects.
Storage objects require a separate encrypted export and count/checksum manifest.
The following also require separate migration steps and newly generated secrets:

- API, JWT, database-role and provider secrets;
- Auth provider, SMS, SMTP and OAuth configuration;
- Edge Function deployment and environment secrets;
- custom domains, DNS, Realtime and platform settings;
- scheduled jobs, external webhooks and third-party integrations.

References:

- <https://www.postgresql.org/docs/current/app-pgdump.html>
- <https://www.postgresql.org/docs/current/app-pgrestore.html>
- <https://supabase.com/docs/guides/platform/backups>
- <https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore>

## Real backup acceptance

A backup is accepted only when all of the following evidence is retained outside
the repository and outside the source server:

1. `create` exits successfully and the archive, TOC and manifest exist.
2. `verify` succeeds on a second machine or isolated execution environment.
3. Physical Storage objects have a separate manifest with object count, total
   bytes and checksums; private-bucket access remains private.
4. Backup media is encrypted at rest and access is restricted and audited.
5. Retention and deletion periods are documented and tested without broad or
   unresolved filesystem targets.

## Restore-drill acceptance

Restore requires explicit approval and a newly created disposable destination.
Before any production cutover:

1. Confirm destination project, region, PostgreSQL compatibility and an empty
   target database.
2. Inspect the archive TOC and treat dumps from untrusted superusers as unsafe;
   a restore can execute source-defined code.
3. Restore database content, then transfer Storage objects separately.
4. Generate fresh secrets; do not copy source API/JWT/provider credentials.
5. Redeploy Edge Functions from reviewed Git source and set secrets server-side.
6. Reconfigure Auth, SMS, SMTP, OAuth, webhooks, domains and scheduled jobs.
7. Run the real Supabase/RLS contract plus Login, Contacts, Companies, Deals,
   Tasks, Projects, Finance, Inventory and Daily Work Reports smoke tests.
8. Compare row counts and critical provenance/financial invariants, including
   Lead → Deal → Project and anti-double-counting rules.
9. Keep source read-only during final verification and define a tested rollback
   window before DNS or application cutover.

No real backup, Storage export, restore or server cutover is evidence from this
package until the above drills have been executed and recorded.
