--
-- Triggers
-- This file declares all triggers.
--

-- Auto-populate sales_id from current auth user on insert
create or replace trigger set_company_sales_id_trigger
    before insert on public.companies
    for each row execute function public.set_sales_id_default();

create or replace trigger set_contact_sales_id_trigger
    before insert on public.contacts
    for each row execute function public.set_sales_id_default();

create or replace trigger set_contact_notes_sales_id_trigger
    before insert on public.contact_notes
    for each row execute function public.set_sales_id_default();

create or replace trigger set_deal_sales_id_trigger
    before insert on public.deals
    for each row execute function public.set_sales_id_default();

create or replace trigger set_deal_notes_sales_id_trigger
    before insert on public.deal_notes
    for each row execute function public.set_sales_id_default();

create or replace trigger set_project_sales_id_trigger
    before insert on public.projects
    for each row execute function public.set_sales_id_default();

create or replace trigger set_project_cost_item_sales_id_trigger
    before insert on public.project_cost_items
    for each row execute function public.set_sales_id_default();

create or replace trigger set_procurement_commitment_sales_id_trigger
    before insert on public.procurement_commitments
    for each row execute function public.set_sales_id_default();

create or replace trigger set_financial_receivable_sales_id_trigger
    before insert on public.financial_receivables
    for each row execute function public.set_sales_id_default();

create or replace trigger set_financial_payable_sales_id_trigger
    before insert on public.financial_payables
    for each row execute function public.set_sales_id_default();

create or replace trigger set_financial_transaction_sales_id_trigger
    before insert on public.financial_transactions
    for each row execute function public.set_sales_id_default();

create or replace trigger set_inventory_movement_sales_id_trigger
    before insert on public.inventory_movements
    for each row execute function public.set_sales_id_default();

create or replace trigger set_task_sales_id_trigger
    before insert on public.tasks
    for each row execute function public.set_sales_id_default();

create or replace trigger set_daily_work_report_sales_id_trigger
    before insert on public.daily_work_reports
    for each row execute function public.set_sales_id_default();

-- Preserve conversion provenance. The conversion RPC performs the one allowed
-- transition into converted; later edits to a converted lead are rejected.
create or replace trigger prevent_converted_lead_mutation_trigger
    before update on public.lead_inbox
    for each row execute function private.prevent_converted_lead_mutation();

-- Preserve the quarantined Lead/Radar identity even for privileged writers.
-- Official SETAD fields remain separately verifiable in a later guarded flow.
create or replace trigger prevent_tender_provenance_mutation_trigger
    before update of lead_id, source, aggregator_record_id on public.tender_opportunities
    for each row execute function private.prevent_tender_provenance_mutation();

-- Audit evidence is insert-only, including for service-role callers.
create or replace trigger prevent_tender_audit_mutation_trigger
    before update or delete on public.tender_audit_log
    for each row execute function private.prevent_tender_audit_mutation();

-- Auto-fetch company logo from website favicon on save
create or replace trigger company_saved
    before insert or update on public.companies
    for each row execute function public.handle_company_saved();

-- Lowercase contact emails before insert or update (must run before contact_saved)
create or replace trigger "10_lowercase_contact_emails"
    before insert or update on public.contacts
    for each row execute function public.lowercase_email_jsonb();

-- Auto-fetch contact avatar from email on save (runs after lowercase_contact_emails)
create or replace trigger "20_contact_saved"
    before insert or update on public.contacts
    for each row execute function public.handle_contact_saved();

-- Update contact.last_seen when a contact note is created
create or replace trigger on_public_contact_notes_created_or_updated
    after insert on public.contact_notes
    for each row execute function public.handle_contact_note_created_or_updated();

-- Cleanup storage attachments when contact notes are updated or deleted
create or replace trigger on_contact_notes_attachments_updated_delete_note_attachments
    after update on public.contact_notes
    for each row
    when (old.attachments is distinct from new.attachments)
    execute function public.cleanup_note_attachments();

create or replace trigger on_contact_notes_deleted_delete_note_attachments
    after delete on public.contact_notes
    for each row execute function public.cleanup_note_attachments();

-- Cleanup storage attachments when deal notes are updated or deleted
create or replace trigger on_deal_notes_attachments_updated_delete_note_attachments
    after update on public.deal_notes
    for each row
    when (old.attachments is distinct from new.attachments)
    execute function public.cleanup_note_attachments();

create or replace trigger on_deal_notes_deleted_delete_note_attachments
    after delete on public.deal_notes
    for each row execute function public.cleanup_note_attachments();

-- Auth triggers: sync auth.users to public.sales
create or replace trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

create or replace trigger on_auth_user_updated
    after update on auth.users
    for each row execute function public.handle_update_user();
