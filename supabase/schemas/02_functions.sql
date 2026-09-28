--
-- Functions
-- This file declares all PL/pgSQL functions in the public schema.
--

CREATE OR REPLACE FUNCTION "public"."cleanup_note_attachments"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
    DECLARE
      payload jsonb;
      request_headers jsonb;
      auth_header text;
    BEGIN
      request_headers := coalesce(
        nullif(current_setting('request.headers', true), '')::jsonb,
        '{}'::jsonb
      );
      auth_header := request_headers ->> 'authorization';

      IF auth_header IS NULL OR auth_header = '' THEN
        IF TG_OP = 'DELETE' THEN
          RETURN OLD;
        END IF;

        RETURN NEW;
      END IF;

      payload := jsonb_build_object(
        'old_record', OLD,
        'record', NEW,
        'type', TG_OP
      );

      PERFORM net.http_post(
        url := public.get_note_attachments_function_url(),
        body := payload,
        params := '{}'::jsonb,
        headers := jsonb_build_object(
          'Content-Type',
          'application/json',
          'Authorization',
          auth_header
        ),
        timeout_milliseconds := 10000
      );

      IF TG_OP = 'DELETE' THEN
        RETURN OLD;
      END IF;

      RETURN NEW;
    END;
    $$;

CREATE OR REPLACE FUNCTION "public"."get_avatar_for_email"("email" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare email_hash text;
declare gravatar_url text;
declare gravatar_status int8;
declare email_domain text;
declare favicon_url text;
declare domain_status int8;

begin
    -- Try to fetch a gravatar image
    email_hash = encode(extensions.digest(email, 'sha256'), 'hex');
    gravatar_url = concat('https://www.gravatar.com/avatar/', email_hash, '?d=404');

    select status from extensions.http_get(gravatar_url) into gravatar_status;

    if gravatar_status = 200 then
        return gravatar_url;
    end if;

    -- Fallback to email's domain favicon if not excluded
    email_domain = split_part(email, '@', 2);
    return get_domain_favicon(email_domain);
exception
    when others then
        return 'ERROR';
end;
$$;

CREATE OR REPLACE FUNCTION "public"."get_domain_favicon"("domain_name" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare domain_status int8;

begin
    if exists (select from favicons_excluded_domains as fav where fav.domain = domain_name) then
        return null;
    end if;

    return concat(
        'https://favicon.show/',
        (regexp_matches(domain_name, '^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)', 'i'))[1]
    );
end;
$$;

CREATE OR REPLACE FUNCTION "public"."get_note_attachments_function_url"() RETURNS "text"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
    DECLARE
      issuer text;
      function_url text;
    BEGIN
      issuer := coalesce(
        nullif(current_setting('request.jwt.claim.iss', true), ''),
        (
          coalesce(
            nullif(current_setting('request.jwt.claims', true), ''),
            '{}'
          )::jsonb ->> 'iss'
        )
      );
      issuer := nullif(issuer, '');
      IF issuer IS NOT NULL THEN
        issuer := rtrim(issuer, '/');
        IF right(issuer, 8) = '/auth/v1' THEN
          function_url :=
            left(issuer, length(issuer) - 8) || '/functions/v1/delete_note_attachments';

          IF function_url LIKE 'http://127.0.0.1:%' THEN
            RETURN replace(
              function_url,
              'http://127.0.0.1:',
              'http://host.docker.internal:'
            );
          END IF;

          IF function_url LIKE 'http://localhost:%' THEN
            RETURN replace(
              function_url,
              'http://localhost:',
              'http://host.docker.internal:'
            );
          END IF;

          RETURN function_url;
        END IF;
      END IF;

      RETURN 'http://host.docker.internal:54321/functions/v1/delete_note_attachments';
    END;
    $$;

CREATE OR REPLACE FUNCTION "public"."get_user_id_by_email"("email" "text") RETURNS TABLE("id" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
BEGIN
  RETURN QUERY SELECT au.id FROM auth.users au WHERE au.email = $1;
END;
$_$;

CREATE OR REPLACE FUNCTION "public"."handle_company_saved"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare company_logo text;

begin
    if new.logo is not null then
        return new;
    end if;

    company_logo = get_domain_favicon(new.website);
    if company_logo is null then
        return new;
    end if;

    new.logo = concat('{"src":"', company_logo, '","title":"Company favicon"}');
    return new;
end;
$$;

CREATE OR REPLACE FUNCTION "public"."handle_contact_note_created_or_updated"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  update public.contacts set last_seen = new.date where contacts.id = new.contact_id and contacts.last_seen < new.date;
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION "public"."handle_contact_saved"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$declare contact_avatar text;
declare emails_length int8;
declare item jsonb;

begin
    if new.avatar is not null then
        return new;
    end if;

    select coalesce(jsonb_array_length(new.email_jsonb), 0) into emails_length;

    if emails_length = 0 then
        return new;
    end if;

    for item in select jsonb_array_elements(new.email_jsonb)
    loop
        select public.get_avatar_for_email(item->>'email') into contact_avatar;
        if (contact_avatar is not null) then
            exit;
        end if;
    end loop;

    if contact_avatar is null then
        return new;
    end if;

    new.avatar = concat('{"src":"', contact_avatar, '"}');
    return new;
end;$$;

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  sales_count int;
begin
  select count(id) into sales_count
  from public.sales;

  insert into public.sales (first_name, last_name, email, phone, user_id, administrator, role)
  values (
    coalesce(new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data -> 'custom_claims' ->> 'first_name', 'Pending'),
    coalesce(new.raw_user_meta_data ->> 'last_name', new.raw_user_meta_data -> 'custom_claims' ->> 'last_name', 'Pending'),
    new.email,
    new.phone,
    new.id,
    case when sales_count > 0 then FALSE else TRUE end,
    case when sales_count > 0 then 'sales' else 'admin' end
  );
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION "public"."handle_update_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  update public.sales
  set
    first_name = coalesce(new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data -> 'custom_claims' ->> 'first_name', 'Pending'),
    last_name = coalesce(new.raw_user_meta_data ->> 'last_name', new.raw_user_meta_data -> 'custom_claims' ->> 'last_name', 'Pending'),
    email = new.email,
    phone = new.phone
  where user_id = new.id;

  return new;
end;
$$;

CREATE OR REPLACE FUNCTION "public"."current_staff_role"() RETURNS text
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  return (
    select coalesce(role, case when administrator then 'admin' else 'sales' end)
    from public.sales
    where user_id = auth.uid() and disabled = false
    limit 1
  );
end;
$$;

CREATE OR REPLACE FUNCTION "public"."current_sales_id"() RETURNS bigint
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select id
  from public.sales
  where user_id = auth.uid() and disabled = false
  limit 1;
$$;

CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select coalesce(public.current_staff_role() = 'admin', false);
$$;

CREATE OR REPLACE FUNCTION "public"."merge_contacts"("loser_id" bigint, "winner_id" bigint) RETURNS bigint
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  winner_contact contacts%ROWTYPE;
  loser_contact contacts%ROWTYPE;
  deal_record RECORD;
  merged_emails jsonb;
  merged_phones jsonb;
  merged_tags bigint[];
  winner_emails jsonb;
  loser_emails jsonb;
  winner_phones jsonb;
  loser_phones jsonb;
  email_map jsonb;
  phone_map jsonb;
BEGIN
  -- Fetch both contacts
  SELECT * INTO winner_contact FROM contacts WHERE id = winner_id;
  SELECT * INTO loser_contact FROM contacts WHERE id = loser_id;

  IF winner_contact IS NULL OR loser_contact IS NULL THEN
    RAISE EXCEPTION 'Contact not found';
  END IF;

  -- 1. Reassign tasks from loser to winner
  UPDATE tasks SET contact_id = winner_id WHERE contact_id = loser_id;

  -- 2. Reassign contact notes from loser to winner
  UPDATE contact_notes SET contact_id = winner_id WHERE contact_id = loser_id;

  -- 3. Update deals - replace loser with winner in contact_ids array
  FOR deal_record IN
    SELECT id, contact_ids
    FROM deals
    WHERE contact_ids @> ARRAY[loser_id]
  LOOP
    UPDATE deals
    SET contact_ids = (
      SELECT ARRAY(
        SELECT DISTINCT unnest(
          array_remove(deal_record.contact_ids, loser_id) || ARRAY[winner_id]
        )
      )
    )
    WHERE id = deal_record.id;
  END LOOP;

  -- 4. Merge contact data

  -- Get email arrays
  winner_emails := COALESCE(winner_contact.email_jsonb, '[]'::jsonb);
  loser_emails := COALESCE(loser_contact.email_jsonb, '[]'::jsonb);

  -- Merge emails with deduplication by email address
  -- Build a map of email -> email object, then convert back to array
  email_map := '{}'::jsonb;

  -- Add winner emails to map
  IF jsonb_array_length(winner_emails) > 0 THEN
    FOR i IN 0..jsonb_array_length(winner_emails)-1 LOOP
      email_map := email_map || jsonb_build_object(
        winner_emails->i->>'email',
        winner_emails->i
      );
    END LOOP;
  END IF;

  -- Add loser emails to map (won't overwrite existing keys)
  IF jsonb_array_length(loser_emails) > 0 THEN
    FOR i IN 0..jsonb_array_length(loser_emails)-1 LOOP
      IF NOT email_map ? (loser_emails->i->>'email') THEN
        email_map := email_map || jsonb_build_object(
          loser_emails->i->>'email',
          loser_emails->i
        );
      END IF;
    END LOOP;
  END IF;

  -- Convert map back to array
  merged_emails := (SELECT jsonb_agg(value) FROM jsonb_each(email_map));
  merged_emails := COALESCE(merged_emails, '[]'::jsonb);

  -- Get phone arrays
  winner_phones := COALESCE(winner_contact.phone_jsonb, '[]'::jsonb);
  loser_phones := COALESCE(loser_contact.phone_jsonb, '[]'::jsonb);

  -- Merge phones with deduplication by number
  phone_map := '{}'::jsonb;

  -- Add winner phones to map
  IF jsonb_array_length(winner_phones) > 0 THEN
    FOR i IN 0..jsonb_array_length(winner_phones)-1 LOOP
      phone_map := phone_map || jsonb_build_object(
        winner_phones->i->>'number',
        winner_phones->i
      );
    END LOOP;
  END IF;

  -- Add loser phones to map (won't overwrite existing keys)
  IF jsonb_array_length(loser_phones) > 0 THEN
    FOR i IN 0..jsonb_array_length(loser_phones)-1 LOOP
      IF NOT phone_map ? (loser_phones->i->>'number') THEN
        phone_map := phone_map || jsonb_build_object(
          loser_phones->i->>'number',
          loser_phones->i
        );
      END IF;
    END LOOP;
  END IF;

  -- Convert map back to array
  merged_phones := (SELECT jsonb_agg(value) FROM jsonb_each(phone_map));
  merged_phones := COALESCE(merged_phones, '[]'::jsonb);

  -- Merge tags (remove duplicates)
  merged_tags := ARRAY(
    SELECT DISTINCT unnest(
      COALESCE(winner_contact.tags, ARRAY[]::bigint[]) ||
      COALESCE(loser_contact.tags, ARRAY[]::bigint[])
    )
  );

  -- 5. Update winner with merged data
  UPDATE contacts SET
    avatar = COALESCE(winner_contact.avatar, loser_contact.avatar),
    gender = COALESCE(winner_contact.gender, loser_contact.gender),
    first_name = COALESCE(winner_contact.first_name, loser_contact.first_name),
    last_name = COALESCE(winner_contact.last_name, loser_contact.last_name),
    title = COALESCE(winner_contact.title, loser_contact.title),
    company_id = COALESCE(winner_contact.company_id, loser_contact.company_id),
    email_jsonb = merged_emails,
    phone_jsonb = merged_phones,
    linkedin_url = COALESCE(winner_contact.linkedin_url, loser_contact.linkedin_url),
    background = COALESCE(winner_contact.background, loser_contact.background),
    has_newsletter = COALESCE(winner_contact.has_newsletter, loser_contact.has_newsletter),
    first_seen = LEAST(COALESCE(winner_contact.first_seen, loser_contact.first_seen), COALESCE(loser_contact.first_seen, winner_contact.first_seen)),
    last_seen = GREATEST(COALESCE(winner_contact.last_seen, loser_contact.last_seen), COALESCE(loser_contact.last_seen, winner_contact.last_seen)),
    sales_id = COALESCE(winner_contact.sales_id, loser_contact.sales_id),
    tags = merged_tags
  WHERE id = winner_id;

  -- 6. Delete loser contact
  DELETE FROM contacts WHERE id = loser_id;

  RETURN winner_id;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."lowercase_email_jsonb"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NEW.email_jsonb IS NOT NULL THEN
    NEW.email_jsonb = COALESCE((
      SELECT jsonb_agg(
        jsonb_set(elem, '{email}', to_jsonb(LOWER(elem->>'email')))
      )
      FROM jsonb_array_elements(NEW.email_jsonb) AS elem
    ), '[]'::jsonb);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."set_sales_id_default"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NEW.sales_id IS NULL THEN
    SELECT id INTO NEW.sales_id FROM sales WHERE user_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION "private"."prevent_converted_lead_mutation"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  IF OLD.status = 'converted' THEN
    RAISE EXCEPTION 'Converted leads are immutable';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION "private"."prevent_tender_provenance_mutation"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  IF OLD.lead_id IS DISTINCT FROM NEW.lead_id
     OR OLD.source IS DISTINCT FROM NEW.source
     OR OLD.aggregator_record_id IS DISTINCT FROM NEW.aggregator_record_id THEN
    RAISE EXCEPTION 'Tender ingestion provenance is immutable';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION "private"."prevent_tender_audit_mutation"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  RAISE EXCEPTION 'Tender audit events are append-only';
END;
$$;

-- The only authenticated path from a raw lead into core CRM records. The
-- function locks the lead, validates ownership and qualification, creates all
-- target records, writes provenance, and marks the lead converted in one
-- database transaction. No value is copied from raw_payload or the raw estimate.
CREATE OR REPLACE FUNCTION "public"."convert_lead_to_deal"(
    "p_lead_id" bigint,
    "p_company_name" text,
    "p_deal_name" text,
    "p_deal_description" text default null,
    "p_deal_amount" bigint default null,
    "p_expected_closing_date" date default null,
    "p_contact_first_name" text default null,
    "p_contact_last_name" text default null,
    "p_contact_email" text default null,
    "p_contact_phone" text default null
) RETURNS TABLE (
    "lead_id" bigint,
    "company_id" bigint,
    "contact_id" bigint,
    "deal_id" bigint,
    "conversion_id" bigint
)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  v_actor_id bigint;
  v_actor_role text;
  v_lead public.lead_inbox%ROWTYPE;
  v_company_id bigint;
  v_contact_id bigint;
  v_deal_id bigint;
  v_conversion_id bigint;
  v_contact_ids bigint[] := ARRAY[]::bigint[];
BEGIN
  v_actor_id := public.current_sales_id();
  v_actor_role := public.current_staff_role();

  IF v_actor_id IS NULL OR v_actor_role NOT IN ('admin', 'manager', 'sales') THEN
    RAISE EXCEPTION 'Lead conversion is not allowed for this role'
      USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_lead
  FROM public.lead_inbox
  WHERE id = p_lead_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found' USING ERRCODE = 'P0002';
  END IF;
  IF v_lead.status <> 'qualified' THEN
    RAISE EXCEPTION 'Only qualified leads can be converted';
  END IF;
  IF v_actor_role = 'sales'
     AND v_lead.assigned_sales_id IS NOT NULL
     AND v_lead.assigned_sales_id <> v_actor_id THEN
    RAISE EXCEPTION 'Lead is assigned to another salesperson'
      USING ERRCODE = '42501';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM public.lead_conversions AS existing_conversion
    WHERE existing_conversion.lead_id = p_lead_id
  ) THEN
    RAISE EXCEPTION 'Lead has already been converted';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM public.tender_opportunities AS tender_opportunity
    WHERE tender_opportunity.lead_id = p_lead_id
  ) THEN
    RAISE EXCEPTION 'Tender leads must progress through Tender Pipeline';
  END IF;
  IF length(btrim(coalesce(p_company_name, ''))) = 0 THEN
    RAISE EXCEPTION 'company_name is required';
  END IF;
  IF length(btrim(coalesce(p_deal_name, ''))) = 0 THEN
    RAISE EXCEPTION 'deal_name is required';
  END IF;
  IF p_deal_amount IS NOT NULL AND p_deal_amount < 0 THEN
    RAISE EXCEPTION 'Deal amount cannot be negative';
  END IF;

  INSERT INTO public.companies (name, sales_id)
  VALUES (btrim(p_company_name), v_actor_id)
  RETURNING id INTO v_company_id;

  IF nullif(btrim(coalesce(p_contact_first_name, '')), '') IS NOT NULL
     OR nullif(btrim(coalesce(p_contact_last_name, '')), '') IS NOT NULL
     OR nullif(btrim(coalesce(p_contact_email, '')), '') IS NOT NULL
     OR nullif(btrim(coalesce(p_contact_phone, '')), '') IS NOT NULL THEN
    INSERT INTO public.contacts (
      first_name,
      last_name,
      company_id,
      email_jsonb,
      phone_jsonb,
      first_seen,
      last_seen,
      has_newsletter,
      status,
      tags,
      sales_id
    ) VALUES (
      nullif(btrim(coalesce(p_contact_first_name, '')), ''),
      nullif(btrim(coalesce(p_contact_last_name, '')), ''),
      v_company_id,
      CASE
        WHEN nullif(btrim(coalesce(p_contact_email, '')), '') IS NULL
          THEN '[]'::jsonb
        ELSE jsonb_build_array(jsonb_build_object(
          'email', btrim(p_contact_email), 'type', 'Work'
        ))
      END,
      CASE
        WHEN nullif(btrim(coalesce(p_contact_phone, '')), '') IS NULL
          THEN '[]'::jsonb
        ELSE jsonb_build_array(jsonb_build_object(
          'number', btrim(p_contact_phone), 'type', 'Work'
        ))
      END,
      now(),
      now(),
      false,
      'warm',
      ARRAY[]::bigint[],
      v_actor_id
    ) RETURNING id INTO v_contact_id;
    v_contact_ids := ARRAY[v_contact_id];
  END IF;

  INSERT INTO public.deals (
    name,
    company_id,
    contact_ids,
    category,
    stage,
    description,
    amount,
    expected_closing_date,
    sales_id,
    index
  ) VALUES (
    btrim(p_deal_name),
    v_company_id,
    v_contact_ids,
    'other',
    'opportunity',
    nullif(btrim(coalesce(p_deal_description, '')), ''),
    coalesce(p_deal_amount, 0),
    p_expected_closing_date,
    v_actor_id,
    0
  ) RETURNING id INTO v_deal_id;

  INSERT INTO public.lead_conversions (
    lead_id,
    company_id,
    contact_id,
    deal_id,
    converted_by_sales_id
  ) VALUES (
    p_lead_id,
    v_company_id,
    v_contact_id,
    v_deal_id,
    v_actor_id
  ) RETURNING id INTO v_conversion_id;

  UPDATE public.lead_inbox
  SET
    status = 'converted',
    assigned_sales_id = coalesce(assigned_sales_id, v_actor_id),
    updated_at = now()
  WHERE id = p_lead_id;

  RETURN QUERY SELECT
    p_lead_id,
    v_company_id,
    v_contact_id,
    v_deal_id,
    v_conversion_id;
END;
$$;

-- Guarded, atomic boundary from a reviewed Tender Radar lead into the tender
-- workspace. The JSON argument is deliberately treated as an allow-listed
-- review form: provider raw_payload and any credential/session material are
-- never read or copied. Deduplication is serialized by advisory locks and is
-- checked in official identifier, source identifier, then fingerprint order.
CREATE OR REPLACE FUNCTION "public"."import_tender_opportunity"(
    "p_lead_id" bigint,
    "p_review" jsonb
) RETURNS TABLE (
    "opportunity_id" bigint,
    "pipeline_entry_id" bigint,
    "lead_id" bigint,
    "duplicate" boolean,
    "dedup_basis" text
)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  v_actor_id bigint;
  v_actor_role text;
  v_lead public.lead_inbox%ROWTYPE;
  v_existing public.tender_opportunities%ROWTYPE;
  v_opportunity_id bigint;
  v_pipeline_entry_id bigint;
  v_dedup_basis text;
  v_opportunity_type text;
  v_domain text;
  v_title text;
  v_description text;
  v_organizer text;
  v_province text;
  v_city text;
  v_trade text;
  v_category text;
  v_official_need_no text;
  v_official_tender_no text;
  v_official_source_url text;
  v_verification_status text;
  v_fallback_fingerprint text;
  v_radar_grade text;
  v_radar_score smallint;
  v_publish_date date;
  v_document_deadline date;
  v_submission_deadline date;
  v_assigned_sales_id bigint;
  v_allowed_keys constant text[] := ARRAY[
    'opportunity_type', 'domain', 'title', 'description', 'organizer',
    'province', 'city', 'publish_date', 'document_deadline',
    'submission_deadline', 'official_need_no', 'official_tender_no',
    'official_source_url', 'trade', 'category', 'verification_status',
    'radar_score', 'radar_grade', 'fallback_fingerprint',
    'assigned_sales_id'
  ];
BEGIN
  v_actor_id := public.current_sales_id();
  v_actor_role := public.current_staff_role();

  IF v_actor_id IS NULL OR v_actor_role NOT IN ('admin', 'manager', 'sales') THEN
    RAISE EXCEPTION 'Tender import is not allowed for this role'
      USING ERRCODE = '42501';
  END IF;
  IF p_review IS NULL OR jsonb_typeof(p_review) <> 'object' THEN
    RAISE EXCEPTION 'review must be a JSON object';
  END IF;
  IF pg_catalog.pg_column_size(p_review) > 131072 THEN
    RAISE EXCEPTION 'review is too large';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM jsonb_object_keys(p_review) AS supplied(key)
    WHERE supplied.key <> ALL (v_allowed_keys)
  ) THEN
    RAISE EXCEPTION 'review contains an unsupported field';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM jsonb_each(p_review) AS supplied(key, value)
    WHERE jsonb_typeof(supplied.value) NOT IN ('string', 'number', 'null')
  ) THEN
    RAISE EXCEPTION 'review fields must be scalar values';
  END IF;

  SELECT * INTO v_lead
  FROM public.lead_inbox
  WHERE id = p_lead_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found' USING ERRCODE = 'P0002';
  END IF;
  IF v_lead.source <> 'tender_radar' THEN
    RAISE EXCEPTION 'Only Tender Radar leads can enter Tender Intelligence';
  END IF;
  IF v_lead.status <> 'qualified' THEN
    RAISE EXCEPTION 'Only qualified leads can be imported';
  END IF;
  IF v_actor_role = 'sales'
     AND v_lead.assigned_sales_id IS NOT NULL
     AND v_lead.assigned_sales_id <> v_actor_id THEN
    RAISE EXCEPTION 'Lead is assigned to another salesperson'
      USING ERRCODE = '42501';
  END IF;

  v_opportunity_type := nullif(btrim(p_review ->> 'opportunity_type'), '');
  v_domain := nullif(btrim(p_review ->> 'domain'), '');
  v_title := nullif(btrim(p_review ->> 'title'), '');
  v_description := nullif(btrim(p_review ->> 'description'), '');
  v_organizer := nullif(btrim(p_review ->> 'organizer'), '');
  v_province := nullif(btrim(p_review ->> 'province'), '');
  v_city := nullif(btrim(p_review ->> 'city'), '');
  v_trade := nullif(btrim(p_review ->> 'trade'), '');
  v_category := nullif(btrim(p_review ->> 'category'), '');
  v_official_need_no := nullif(btrim(p_review ->> 'official_need_no'), '');
  v_official_tender_no := nullif(btrim(p_review ->> 'official_tender_no'), '');
  v_official_source_url := nullif(btrim(p_review ->> 'official_source_url'), '');
  v_verification_status := coalesce(
    nullif(btrim(p_review ->> 'verification_status'), ''),
    'pending_setad_verification'
  );
  v_fallback_fingerprint := nullif(
    btrim(p_review ->> 'fallback_fingerprint'),
    ''
  );
  v_radar_grade := nullif(btrim(p_review ->> 'radar_grade'), '');

  BEGIN
    v_radar_score := nullif(p_review ->> 'radar_score', '')::smallint;
    v_publish_date := nullif(p_review ->> 'publish_date', '')::date;
    v_document_deadline := nullif(
      p_review ->> 'document_deadline',
      ''
    )::date;
    v_submission_deadline := nullif(
      p_review ->> 'submission_deadline',
      ''
    )::date;
    v_assigned_sales_id := nullif(
      p_review ->> 'assigned_sales_id',
      ''
    )::bigint;
  EXCEPTION WHEN invalid_text_representation
    OR numeric_value_out_of_range
    OR datetime_field_overflow THEN
    RAISE EXCEPTION 'review contains an invalid typed value';
  END;

  IF v_title IS NULL OR v_domain IS NULL OR v_opportunity_type IS NULL
     OR v_fallback_fingerprint IS NULL THEN
    RAISE EXCEPTION 'type, domain, title and fallback fingerprint are required';
  END IF;
  IF v_opportunity_type NOT IN ('inquiry', 'tender') THEN
    RAISE EXCEPTION 'Invalid opportunity type';
  END IF;
  IF v_domain NOT IN ('renewable_energy', 'security_systems') THEN
    RAISE EXCEPTION 'Invalid tender domain';
  END IF;
  IF v_verification_status NOT IN (
    'setad_verified', 'pending_setad_verification', 'data_conflict'
  ) THEN
    RAISE EXCEPTION 'Invalid verification status';
  END IF;
  IF v_radar_grade IS NULL
     OR v_radar_grade NOT IN ('A', 'B')
     OR v_radar_score IS NULL
     OR v_radar_score NOT BETWEEN 0 AND 100 THEN
    RAISE EXCEPTION 'Only reviewed A/B Tender Radar leads can be imported';
  END IF;
  IF v_opportunity_type = 'inquiry' AND v_official_tender_no IS NOT NULL THEN
    RAISE EXCEPTION 'Inquiry review cannot contain Tender No';
  END IF;
  IF v_opportunity_type = 'tender' AND v_official_need_no IS NOT NULL THEN
    RAISE EXCEPTION 'Tender review cannot contain Need No';
  END IF;
  IF v_official_source_url IS NOT NULL AND (
    (v_opportunity_type = 'inquiry'
      AND v_official_source_url NOT LIKE 'https://eproc.setadiran.ir/%')
    OR
    (v_opportunity_type = 'tender'
      AND v_official_source_url NOT LIKE 'https://etend.setadiran.ir/%')
  ) THEN
    RAISE EXCEPTION 'Official SETAD URL does not match opportunity type';
  END IF;
  IF v_verification_status = 'setad_verified' AND (
    (v_opportunity_type = 'inquiry' AND v_official_need_no IS NULL)
    OR
    (v_opportunity_type = 'tender' AND v_official_tender_no IS NULL)
  ) THEN
    RAISE EXCEPTION 'SETAD verification requires the type-correct official identifier';
  END IF;
  IF v_actor_role = 'sales'
     AND v_assigned_sales_id IS NOT NULL
     AND v_assigned_sales_id <> v_actor_id THEN
    RAISE EXCEPTION 'Sales staff cannot assign imported work to another salesperson'
      USING ERRCODE = '42501';
  END IF;
  v_assigned_sales_id := coalesce(
    v_assigned_sales_id,
    v_lead.assigned_sales_id,
    v_actor_id
  );

  -- Lock every available identity dimension in stable order. This makes two
  -- concurrent imports with different Lead IDs observe the same dedup result.
  IF v_official_need_no IS NOT NULL THEN
    PERFORM pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('tender:need:' || v_official_need_no, 0)
    );
  END IF;
  IF v_official_tender_no IS NOT NULL THEN
    PERFORM pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('tender:tender:' || v_official_tender_no, 0)
    );
  END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'tender:source:' || v_lead.source || ':' || v_lead.source_record_id,
      0
    )
  );
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'tender:fingerprint:' || v_fallback_fingerprint,
      0
    )
  );

  SELECT * INTO v_existing
  FROM public.tender_opportunities AS existing
  WHERE existing.lead_id = p_lead_id;
  IF FOUND THEN
    SELECT id INTO v_pipeline_entry_id
    FROM public.tender_pipeline_entries
    WHERE opportunity_id = v_existing.id;
    RETURN QUERY SELECT
      v_existing.id, v_pipeline_entry_id, p_lead_id, true, 'lead_id'::text;
    RETURN;
  END IF;

  IF v_official_need_no IS NOT NULL THEN
    SELECT * INTO v_existing
    FROM public.tender_opportunities AS existing
    WHERE existing.official_need_no = v_official_need_no;
    IF FOUND THEN v_dedup_basis := 'official_need_no'; END IF;
  ELSIF v_official_tender_no IS NOT NULL THEN
    SELECT * INTO v_existing
    FROM public.tender_opportunities AS existing
    WHERE existing.official_tender_no = v_official_tender_no;
    IF FOUND THEN v_dedup_basis := 'official_tender_no'; END IF;
  END IF;

  IF v_dedup_basis IS NULL THEN
    SELECT * INTO v_existing
    FROM public.tender_opportunities AS existing
    WHERE existing.source = v_lead.source
      AND existing.aggregator_record_id = v_lead.source_record_id;
    IF FOUND THEN v_dedup_basis := 'source_record_id'; END IF;
  END IF;

  IF v_dedup_basis IS NULL
     AND v_official_need_no IS NULL
     AND v_official_tender_no IS NULL THEN
    SELECT * INTO v_existing
    FROM public.tender_opportunities AS existing
    WHERE existing.fallback_fingerprint = v_fallback_fingerprint;
    IF FOUND THEN v_dedup_basis := 'fallback_fingerprint'; END IF;
  END IF;

  IF v_dedup_basis IS NOT NULL THEN
    RAISE EXCEPTION 'Tender duplicate conflicts with another quarantined lead (%).',
      v_dedup_basis
      USING ERRCODE = '23505';
  END IF;

  -- Claim the inbox row in the same transaction so another sales user cannot
  -- discover the resulting opportunity through an idempotent retry.
  UPDATE public.lead_inbox
  SET
    assigned_sales_id = v_assigned_sales_id,
    updated_at = now()
  WHERE id = p_lead_id
    AND assigned_sales_id IS DISTINCT FROM v_assigned_sales_id;

  INSERT INTO public.tender_opportunities (
    lead_id, source, aggregator_record_id, opportunity_type,
    official_need_no, official_tender_no, title, description, organizer,
    province, city, publish_date, document_deadline, submission_deadline,
    official_source_url, aggregator_source_url, domain, trade, category,
    verification_status, radar_score, radar_grade, fallback_fingerprint,
    assigned_sales_id
  ) VALUES (
    p_lead_id, v_lead.source, v_lead.source_record_id, v_opportunity_type,
    v_official_need_no, v_official_tender_no, v_title, v_description,
    v_organizer, v_province, v_city, v_publish_date, v_document_deadline,
    v_submission_deadline, v_official_source_url, v_lead.source_url, v_domain,
    v_trade, v_category, v_verification_status, v_radar_score, v_radar_grade,
    v_fallback_fingerprint, v_assigned_sales_id
  ) RETURNING id INTO v_opportunity_id;

  INSERT INTO public.tender_pipeline_entries (
    opportunity_id, assigned_sales_id
  ) VALUES (
    v_opportunity_id, v_assigned_sales_id
  ) RETURNING id INTO v_pipeline_entry_id;

  INSERT INTO public.tender_audit_log (
    opportunity_id, event_type, actor_sales_id, metadata
  ) VALUES (
    v_opportunity_id,
    'radar_lead_imported',
    v_actor_id,
    jsonb_build_object(
      'lead_id', p_lead_id,
      'source', v_lead.source,
      'source_record_id', v_lead.source_record_id,
      'verification_status', v_verification_status,
      'radar_grade', v_radar_grade
    )
  );

  RETURN QUERY SELECT
    v_opportunity_id,
    v_pipeline_entry_id,
    p_lead_id,
    false,
    CASE
      WHEN v_official_need_no IS NOT NULL THEN 'official_need_no'
      WHEN v_official_tender_no IS NOT NULL THEN 'official_tender_no'
      ELSE 'source_record_id'
    END;
END;
$$;
