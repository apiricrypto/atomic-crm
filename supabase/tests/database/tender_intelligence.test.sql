-- Executable only against a disposable Supabase stack after the declarative
-- schemas have been generated/applied there. This transaction never targets
-- production and rolls back every synthetic row.

begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(51);

-- Structural and grant boundary ------------------------------------------------

select has_table('public', 'tender_opportunities');
select has_table('public', 'tender_pipeline_entries');
select has_table('public', 'tender_saved_searches');
select has_table('public', 'tender_setad_verifications');
select has_table('public', 'tender_audit_log');

select has_function(
  'public',
  'import_tender_opportunity',
  array['bigint', 'jsonb']
);
select has_function(
  'public',
  'update_tender_pipeline',
  array['bigint', 'jsonb']
);
select has_function('public', 'save_tender_search', array['bigint', 'jsonb']);
select has_function('public', 'delete_tender_search', array['bigint']);
select has_function(
  'public',
  'record_setad_verification',
  array['bigint', 'jsonb']
);

select results_eq(
  $$
    select relname
    from pg_catalog.pg_class
    where relnamespace = 'public'::regnamespace
      and relname in (
        'tender_opportunities',
        'tender_pipeline_entries',
        'tender_saved_searches',
        'tender_setad_verifications',
        'tender_audit_log'
      )
      and not relrowsecurity
    order by relname
  $$,
  $$ values (null::name) limit 0 $$,
  'RLS is enabled on every Tender table'
);

select results_eq(
  $$
    select table_name::text
    from information_schema.role_table_grants
    where grantee = 'authenticated'
      and table_schema = 'public'
      and table_name like 'tender_%'
      and privilege_type in ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')
    order by table_name
  $$,
  $$ values (null::text) limit 0 $$,
  'authenticated clients have no direct Tender table writes'
);

select results_eq(
  $$
    select table_name::text
    from information_schema.role_table_grants
    where grantee = 'anon'
      and table_schema = 'public'
      and table_name like 'tender_%'
    order by table_name
  $$,
  $$ values (null::text) limit 0 $$,
  'anonymous clients have no Tender table privileges'
);

select is(
  (
    select count(*)
    from information_schema.routine_privileges
    where grantee = 'authenticated'
      and routine_schema = 'public'
      and routine_name in (
        'import_tender_opportunity',
        'update_tender_pipeline',
        'save_tender_search',
        'delete_tender_search',
        'record_setad_verification'
      )
      and privilege_type = 'EXECUTE'
  ),
  5::bigint,
  'authenticated clients can execute exactly the five guarded Tender RPCs'
);

select is(
  (
    select count(*)
    from information_schema.routine_privileges
    where grantee = 'anon'
      and routine_schema = 'public'
      and routine_name in (
        'import_tender_opportunity',
        'update_tender_pipeline',
        'save_tender_search',
        'delete_tender_search',
        'record_setad_verification'
      )
      and privilege_type = 'EXECUTE'
  ),
  0::bigint,
  'anonymous clients cannot execute guarded Tender RPCs'
);

select is(
  (
    select count(*)
    from pg_catalog.pg_proc
    where pronamespace = 'public'::regnamespace
      and proname in (
        'import_tender_opportunity',
        'update_tender_pipeline',
        'save_tender_search',
        'delete_tender_search',
        'record_setad_verification'
      )
      and prosecdef
      and exists (
        select 1
        from unnest(proconfig) as config(value)
        where config.value in ('search_path=', 'search_path=""')
      )
  ),
  5::bigint,
  'guarded Tender RPCs are security-definer functions with an empty search path'
);

select has_trigger(
  'public',
  'tender_opportunities',
  'prevent_tender_provenance_mutation_trigger'
);
select has_trigger(
  'public',
  'tender_audit_log',
  'prevent_tender_audit_mutation_trigger'
);
select has_trigger(
  'public',
  'tender_setad_verifications',
  'prevent_setad_verification_mutation_trigger'
);

-- Unauthenticated authenticated-role session ----------------------------------

set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000099';

select throws_ok(
  $$ select * from public.import_tender_opportunity(1, '{}'::jsonb) $$,
  '42501',
  'Tender import is not allowed for this role'
);
select throws_ok(
  $$ select public.update_tender_pipeline(1, '{}'::jsonb) $$,
  '42501',
  'Tender Pipeline update is not allowed for this role'
);
select throws_ok(
  $$ select public.save_tender_search(null, '{}'::jsonb) $$,
  '42501',
  'Saving Tender searches is not allowed for this role'
);
select throws_ok(
  $$ select public.delete_tender_search(1) $$,
  '42501',
  'Deleting Tender searches is not allowed for this role'
);
select throws_ok(
  $$ select public.record_setad_verification(1, '{}'::jsonb) $$,
  '42501',
  'Recording SETAD verification is not allowed for this role'
);

reset role;

-- Synthetic identities and quarantined leads ----------------------------------

insert into auth.users (
  id,
  email,
  aud,
  role,
  raw_app_meta_data,
  raw_user_meta_data
) values
  (
    '10000000-0000-0000-0000-000000000001',
    'satno-tender-admin@example.test',
    'authenticated',
    'authenticated',
    '{}'::jsonb,
    '{"first_name":"Admin","last_name":"Tender"}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'satno-tender-sales-a@example.test',
    'authenticated',
    'authenticated',
    '{}'::jsonb,
    '{"first_name":"Sales","last_name":"A"}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'satno-tender-sales-b@example.test',
    'authenticated',
    'authenticated',
    '{}'::jsonb,
    '{"first_name":"Sales","last_name":"B"}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'satno-tender-viewer@example.test',
    'authenticated',
    'authenticated',
    '{}'::jsonb,
    '{"first_name":"Viewer","last_name":"Tender"}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    'satno-tender-manager@example.test',
    'authenticated',
    'authenticated',
    '{}'::jsonb,
    '{"first_name":"Manager","last_name":"Tender"}'::jsonb
  );

update public.sales
set role = 'admin', administrator = true
where user_id = '10000000-0000-0000-0000-000000000001';

update public.sales
set role = 'sales', administrator = false
where user_id in (
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003'
);

update public.sales
set role = 'viewer', administrator = false
where user_id = '10000000-0000-0000-0000-000000000004';

update public.sales
set role = 'manager', administrator = false
where user_id = '10000000-0000-0000-0000-000000000005';

create temporary table tender_test_baseline (
  relation_name text primary key,
  row_count bigint not null
) on commit drop;

insert into tender_test_baseline values
  ('companies', (select count(*) from public.companies)),
  ('contacts', (select count(*) from public.contacts)),
  ('deals', (select count(*) from public.deals)),
  ('projects', (select count(*) from public.projects)),
  ('financial_transactions', (select count(*) from public.financial_transactions)),
  ('inventory_movements', (select count(*) from public.inventory_movements));

insert into public.lead_inbox (
  source,
  source_record_id,
  source_url,
  title,
  province,
  city,
  status,
  priority,
  raw_payload,
  captured_at,
  assigned_sales_id
) values (
  'tender_radar',
  'SYNTHETIC-DB-ACCEPTANCE-1',
  'https://example.test/tenders/SYNTHETIC-DB-ACCEPTANCE-1',
  'رکورد مصنوعی پذیرش پایگاه داده',
  'خوزستان',
  'اهواز',
  'qualified',
  'high',
  '{"source_snapshot":{"private_provider_field":"MUST_STAY_QUARANTINED"}}',
  now(),
  (
    select id from public.sales
    where user_id = '10000000-0000-0000-0000-000000000002'
  )
);

insert into public.lead_inbox (
  source,
  source_record_id,
  title,
  status,
  priority,
  raw_payload,
  captured_at,
  assigned_sales_id
) values (
  'tender_radar',
  'SYNTHETIC-DB-ASSIGNMENT-2',
  'رکورد مصنوعی کنترل مسئول',
  'qualified',
  'normal',
  '{}'::jsonb,
  now(),
  (
    select id from public.sales
    where user_id = '10000000-0000-0000-0000-000000000002'
  )
);

-- Authorized Radar import and idempotency --------------------------------------

set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';

select lives_ok(
  $$
    select *
    from public.import_tender_opportunity(
      (
        select id from public.lead_inbox
        where source_record_id = 'SYNTHETIC-DB-ACCEPTANCE-1'
      ),
      '{
        "opportunity_type":"inquiry",
        "domain":"renewable_energy",
        "title":"فرصت مصنوعی بررسی‌شده",
        "description":"فقط برای پذیرش disposable",
        "organizer":"دستگاه مصنوعی",
        "province":"خوزستان",
        "city":"اهواز",
        "publish_date":"2026-09-28",
        "document_deadline":"2026-10-02",
        "submission_deadline":"2026-10-05",
        "verification_status":"pending_setad_verification",
        "radar_score":91,
        "radar_grade":"A",
        "fallback_fingerprint":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      }'::jsonb
    )
  $$,
  'assigned sales user imports one reviewed A-grade Radar lead'
);

select is(
  (
    select count(*) from public.tender_opportunities
    where aggregator_record_id = 'SYNTHETIC-DB-ACCEPTANCE-1'
  ),
  1::bigint,
  'import creates exactly one Tender opportunity'
);

select is(
  (
    select count(*)
    from public.tender_pipeline_entries pipeline
    join public.tender_opportunities opportunity
      on opportunity.id = pipeline.opportunity_id
    where opportunity.aggregator_record_id = 'SYNTHETIC-DB-ACCEPTANCE-1'
  ),
  1::bigint,
  'import creates exactly one initial Pipeline row'
);

select is(
  (
    select count(*)
    from public.tender_audit_log audit
    join public.tender_opportunities opportunity
      on opportunity.id = audit.opportunity_id
    where opportunity.aggregator_record_id = 'SYNTHETIC-DB-ACCEPTANCE-1'
      and audit.event_type = 'radar_lead_imported'
  ),
  1::bigint,
  'import appends exactly one redacted audit event'
);

select lives_ok(
  $$
    select *
    from public.import_tender_opportunity(
      (
        select id from public.lead_inbox
        where source_record_id = 'SYNTHETIC-DB-ACCEPTANCE-1'
      ),
      '{
        "opportunity_type":"inquiry",
        "domain":"renewable_energy",
        "title":"این عنوان نباید رکورد قبلی را بازنویسی کند",
        "verification_status":"pending_setad_verification",
        "radar_score":91,
        "radar_grade":"A",
        "fallback_fingerprint":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      }'::jsonb
    )
  $$,
  'same-lead retry is idempotent'
);

select is(
  (
    select title from public.tender_opportunities
    where aggregator_record_id = 'SYNTHETIC-DB-ACCEPTANCE-1'
  ),
  'فرصت مصنوعی بررسی‌شده',
  'idempotent retry does not overwrite reviewed data'
);

select results_eq(
  $$
    select relation_name, row_count
    from (
      values
        ('companies', (select count(*) from public.companies)),
        ('contacts', (select count(*) from public.contacts)),
        ('deals', (select count(*) from public.deals)),
        ('projects', (select count(*) from public.projects)),
        ('financial_transactions', (select count(*) from public.financial_transactions)),
        ('inventory_movements', (select count(*) from public.inventory_movements))
    ) as current_counts(relation_name, row_count)
    order by relation_name
  $$,
  $$
    select relation_name, row_count
    from tender_test_baseline
    order by relation_name
  $$,
  'Tender import does not contaminate core CRM, project, finance or inventory'
);

select is(
  (
    select count(*)
    from public.tender_opportunities
    where row_to_json(tender_opportunities)::text like '%MUST_STAY_QUARANTINED%'
  ),
  0::bigint,
  'quarantined raw provider material never enters Tender opportunities'
);

-- RBAC, Pipeline and Saved Searches --------------------------------------------

set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000003';

select is(
  (
    select count(*) from public.tender_opportunities
    where aggregator_record_id = 'SYNTHETIC-DB-ACCEPTANCE-1'
  ),
  0::bigint,
  'sales staff cannot read another salesperson assigned Tender opportunity'
);

select throws_ok(
  $$
    select *
    from public.import_tender_opportunity(
      (
        select id from public.lead_inbox
        where source_record_id = 'SYNTHETIC-DB-ASSIGNMENT-2'
      ),
      '{
        "opportunity_type":"inquiry",
        "domain":"renewable_energy",
        "title":"رد کنترل مسئول",
        "verification_status":"pending_setad_verification",
        "radar_score":80,
        "radar_grade":"B",
        "fallback_fingerprint":"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
      }'::jsonb
    )
  $$,
  '42501',
  'Lead is assigned to another salesperson'
);

set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000005';

select is(
  (
    select count(*) from public.tender_opportunities
    where aggregator_record_id = 'SYNTHETIC-DB-ACCEPTANCE-1'
  ),
  1::bigint,
  'manager can read an assigned Tender opportunity'
);

set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000004';

select throws_ok(
  $$
    select public.save_tender_search(
      null,
      '{"name":"رد نقش viewer","domain":"renewable_energy"}'::jsonb
    )
  $$,
  '42501',
  'Saving Tender searches is not allowed for this role'
);

set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';

select lives_ok(
  $$
    select public.save_tender_search(
      null,
      '{
        "name":"خورشیدی خوزستان - پذیرش مصنوعی",
        "domain":"renewable_energy",
        "opportunity_type":"inquiry",
        "provinces":["خوزستان"],
        "keywords":["خورشیدی"],
        "statuses":["pending_setad_verification"],
        "active":true
      }'::jsonb
    )
  $$,
  'sales user creates an owner-scoped Saved Search through the RPC'
);

select is(
  (
    select owner_sales_id
    from public.tender_saved_searches
    where name = 'خورشیدی خوزستان - پذیرش مصنوعی'
  ),
  public.current_sales_id(),
  'Saved Search ownership is derived from the authenticated user'
);

select lives_ok(
  $$
    select public.update_tender_pipeline(
      (
        select id from public.tender_opportunities
        where aggregator_record_id = 'SYNTHETIC-DB-ACCEPTANCE-1'
      ),
      '{"documents_status":"requested"}'::jsonb
    )
  $$,
  'assigned sales user records a forward Pipeline milestone'
);

select throws_ok(
  $$
    select public.update_tender_pipeline(
      (
        select id from public.tender_opportunities
        where aggregator_record_id = 'SYNTHETIC-DB-ACCEPTANCE-1'
      ),
      '{"stage":"pricing","documents_status":"complete"}'::jsonb
    )
  $$,
  'P0001',
  'Technical review must be approved before pricing'
);

-- Human-only SETAD transcription boundary --------------------------------------

select lives_ok(
  $$
    select public.record_setad_verification(
      (
        select id from public.tender_opportunities
        where aggregator_record_id = 'SYNTHETIC-DB-ACCEPTANCE-1'
      ),
      '{
        "verification_status":"data_conflict",
        "official_need_no":"SYNTHETIC-NEED-CONFLICT-1",
        "title":"عنوان رسمی مصنوعی متعارض",
        "organizer":"دستگاه رسمی مصنوعی",
        "province":"خوزستان",
        "city":"اهواز",
        "publish_date":"2026-09-29",
        "document_deadline":"2026-10-03",
        "submission_deadline":"2026-10-06",
        "official_source_url":"https://eproc.setadiran.ir/eproc/entry.do"
      }'::jsonb
    )
  $$,
  'authorized human transcription appends a SETAD conflict observation'
);

select is(
  (
    select verification_status from public.tender_opportunities
    where aggregator_record_id = 'SYNTHETIC-DB-ACCEPTANCE-1'
  ),
  'data_conflict',
  'conflict changes only the opportunity routing status'
);

select is(
  (
    select title from public.tender_opportunities
    where aggregator_record_id = 'SYNTHETIC-DB-ACCEPTANCE-1'
  ),
  'فرصت مصنوعی بررسی‌شده',
  'official conflict does not overwrite the Radar-reviewed title'
);

select lives_ok(
  $$
    select public.record_setad_verification(
      (
        select id from public.tender_opportunities
        where aggregator_record_id = 'SYNTHETIC-DB-ACCEPTANCE-1'
      ),
      '{
        "verification_status":"setad_verified",
        "official_need_no":"SYNTHETIC-NEED-CONFLICT-1",
        "title":"عنوان رسمی مصنوعی تأییدشده",
        "publish_date":"2026-09-29",
        "document_deadline":"2026-10-03",
        "submission_deadline":"2026-10-06",
        "official_source_url":"https://eproc.setadiran.ir/eproc/entry.do"
      }'::jsonb
    )
  $$,
  'a later human review can append a verified official observation'
);

select is(
  (
    select official_need_no from public.tender_opportunities
    where aggregator_record_id = 'SYNTHETIC-DB-ACCEPTANCE-1'
  ),
  'SYNTHETIC-NEED-CONFLICT-1',
  'verified Need No is stored separately from the Radar record ID'
);

select lives_ok(
  $$
    select public.record_setad_verification(
      (
        select id from public.tender_opportunities
        where aggregator_record_id = 'SYNTHETIC-DB-ACCEPTANCE-1'
      ),
      '{
        "verification_status":"setad_verified",
        "official_need_no":"SYNTHETIC-NEED-CONFLICT-1",
        "title":"retry does not overwrite",
        "official_source_url":"https://eproc.setadiran.ir/eproc/entry.do"
      }'::jsonb
    )
  $$,
  'verified SETAD retry is idempotent'
);

select is(
  (
    select count(*) from public.tender_setad_verifications
    where opportunity_id = (
      select id from public.tender_opportunities
      where aggregator_record_id = 'SYNTHETIC-DB-ACCEPTANCE-1'
    )
  ),
  2::bigint,
  'idempotent retry does not append a duplicate verified observation'
);

select is(
  (
    select count(*)
    from public.tender_audit_log
    where metadata ?| array[
      'password', 'credential', 'cookie', 'captcha', 'otp', 'token', 'raw_payload'
    ]
  ),
  0::bigint,
  'Tender audit metadata contains no credential or raw-provider keys'
);

reset role;

select throws_ok(
  $$
    update public.tender_opportunities
    set aggregator_record_id = 'MUTATED'
    where aggregator_record_id = 'SYNTHETIC-DB-ACCEPTANCE-1'
  $$,
  'P0001',
  'Tender ingestion provenance is immutable'
);

select throws_ok(
  $$ update public.tender_audit_log set event_type = 'mutated' $$,
  'P0001',
  'Tender audit events are append-only'
);

select throws_ok(
  $$ update public.tender_setad_verifications set title = 'mutated' $$,
  'P0001',
  'SETAD verification observations are append-only'
);

select * from finish();
rollback;
