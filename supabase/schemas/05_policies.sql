--
-- Row Level Security
-- This file declares RLS policies for all tables.
--

-- Enable RLS on all tables
alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.contact_notes enable row level security;
alter table public.deals enable row level security;
alter table public.deal_notes enable row level security;
alter table public.lead_inbox enable row level security;
alter table public.lead_conversions enable row level security;
alter table public.projects enable row level security;
alter table public.project_cost_items enable row level security;
alter table public.procurement_commitments enable row level security;
alter table public.financial_receivables enable row level security;
alter table public.financial_payables enable row level security;
alter table public.financial_transactions enable row level security;
alter table public.inventory_locations enable row level security;
alter table public.inventory_items enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.sales enable row level security;
alter table public.daily_work_reports enable row level security;
alter table public.tags enable row level security;
alter table public.tasks enable row level security;
alter table public.configuration enable row level security;
alter table public.favicons_excluded_domains enable row level security;

-- Companies
create policy "Enable read access for authenticated users" on public.companies for select to authenticated using (true);
create policy "Enable insert for authenticated users only" on public.companies for insert to authenticated with check (true);
create policy "Enable update for authenticated users only" on public.companies for update to authenticated using (true) with check (true);
create policy "Company Delete Policy" on public.companies for delete to authenticated using (true);

-- Contacts
create policy "Enable read access for authenticated users" on public.contacts for select to authenticated using (true);
create policy "Enable insert for authenticated users only" on public.contacts for insert to authenticated with check (true);
create policy "Enable update for authenticated users only" on public.contacts for update to authenticated using (true) with check (true);
create policy "Contact Delete Policy" on public.contacts for delete to authenticated using (true);

-- Contact Notes
create policy "Enable read access for authenticated users" on public.contact_notes for select to authenticated using (true);
create policy "Enable insert for authenticated users only" on public.contact_notes for insert to authenticated with check (true);
create policy "Contact Notes Update policy" on public.contact_notes for update to authenticated using (true);
create policy "Contact Notes Delete Policy" on public.contact_notes for delete to authenticated using (true);

-- Deals
create policy "Enable read access for authenticated users" on public.deals for select to authenticated using (true);
create policy "Enable insert for authenticated users only" on public.deals for insert to authenticated with check (true);
create policy "Enable update for authenticated users only" on public.deals for update to authenticated using (true) with check (true);
create policy "Deals Delete Policy" on public.deals for delete to authenticated using (true);

-- Deal Notes
create policy "Enable read access for authenticated users" on public.deal_notes for select to authenticated using (true);
create policy "Enable insert for authenticated users only" on public.deal_notes for insert to authenticated with check (true);
create policy "Deal Notes Update Policy" on public.deal_notes for update to authenticated using (true);
create policy "Deal Notes Delete Policy" on public.deal_notes for delete to authenticated using (true);

-- Lead inbox: raw records remain quarantined. Admins and managers can triage
-- every lead; sales staff can only see unassigned or explicitly assigned leads.
-- Authenticated clients cannot insert or delete ingestion records and cannot
-- mutate a converted lead. Core CRM creation is only available through the
-- guarded convert_lead_to_deal function.
create policy "Authorized staff can read visible leads" on public.lead_inbox
    for select to authenticated
    using (
        public.current_staff_role() in ('admin', 'manager')
        or (
            public.current_staff_role() = 'sales'
            and (
                assigned_sales_id is null
                or assigned_sales_id = public.current_sales_id()
            )
        )
    );

create policy "Authorized staff can triage visible leads" on public.lead_inbox
    for update to authenticated
    using (
        status <> 'converted'
        and (
            public.current_staff_role() in ('admin', 'manager')
            or (
                public.current_staff_role() = 'sales'
                and (
                    assigned_sales_id is null
                    or assigned_sales_id = public.current_sales_id()
                )
            )
        )
    )
    with check (
        status <> 'converted'
        and (
            public.current_staff_role() in ('admin', 'manager')
            or (
                public.current_staff_role() = 'sales'
                and (
                    assigned_sales_id is null
                    or assigned_sales_id = public.current_sales_id()
                )
            )
        )
    );

create policy "Authorized staff can read visible lead conversions" on public.lead_conversions
    for select to authenticated
    using (
        public.current_staff_role() in ('admin', 'manager', 'sales')
        and exists (
            select 1
            from public.lead_inbox
            where public.lead_inbox.id = public.lead_conversions.lead_id
        )
    );

-- Projects
create policy "Enable project read for authenticated" on public.projects for select to authenticated using (true);
create policy "Enable project insert for authenticated" on public.projects for insert to authenticated with check (true);
create policy "Enable project update for authenticated" on public.projects for update to authenticated using (true) with check (true);
create policy "Enable project delete for authenticated" on public.projects for delete to authenticated using (true);

-- Project cost items
create policy "Enable project cost read for authenticated" on public.project_cost_items for select to authenticated using (true);
create policy "Enable project cost insert for authenticated" on public.project_cost_items for insert to authenticated with check (true);
create policy "Enable project cost update for authenticated" on public.project_cost_items for update to authenticated using (true) with check (true);
create policy "Enable project cost delete for authenticated" on public.project_cost_items for delete to authenticated using (true);

-- Procurement commitments
create policy "Enable procurement read for authenticated" on public.procurement_commitments for select to authenticated using (true);
create policy "Enable procurement insert for authenticated" on public.procurement_commitments for insert to authenticated with check (true);
create policy "Enable procurement update for authenticated" on public.procurement_commitments for update to authenticated using (true) with check (true);
create policy "Enable procurement delete for authenticated" on public.procurement_commitments for delete to authenticated using (true);

-- Financial ledgers
create policy "Enable receivable read for authenticated" on public.financial_receivables for select to authenticated using (true);
create policy "Enable receivable insert for authenticated" on public.financial_receivables for insert to authenticated with check (true);
create policy "Enable receivable update for authenticated" on public.financial_receivables for update to authenticated using (true) with check (true);
create policy "Enable receivable delete for authenticated" on public.financial_receivables for delete to authenticated using (true);

create policy "Enable payable read for authenticated" on public.financial_payables for select to authenticated using (true);
create policy "Enable payable insert for authenticated" on public.financial_payables for insert to authenticated with check (true);
create policy "Enable payable update for authenticated" on public.financial_payables for update to authenticated using (true) with check (true);
create policy "Enable payable delete for authenticated" on public.financial_payables for delete to authenticated using (true);

create policy "Enable transaction read for authenticated" on public.financial_transactions for select to authenticated using (true);
create policy "Enable transaction insert for authenticated" on public.financial_transactions for insert to authenticated with check (true);
create policy "Enable transaction update for authenticated" on public.financial_transactions for update to authenticated using (true) with check (true);
create policy "Enable transaction delete for authenticated" on public.financial_transactions for delete to authenticated using (true);

-- Inventory
create policy "Enable inventory location read for authenticated" on public.inventory_locations for select to authenticated using (true);
create policy "Enable inventory location insert for authenticated" on public.inventory_locations for insert to authenticated with check (true);
create policy "Enable inventory location update for authenticated" on public.inventory_locations for update to authenticated using (true) with check (true);
create policy "Enable inventory location delete for authenticated" on public.inventory_locations for delete to authenticated using (true);

create policy "Enable inventory item read for authenticated" on public.inventory_items for select to authenticated using (true);
create policy "Enable inventory item insert for authenticated" on public.inventory_items for insert to authenticated with check (true);
create policy "Enable inventory item update for authenticated" on public.inventory_items for update to authenticated using (true) with check (true);
create policy "Enable inventory item delete for authenticated" on public.inventory_items for delete to authenticated using (true);

create policy "Enable inventory movement read for authenticated" on public.inventory_movements for select to authenticated using (true);
create policy "Enable inventory movement insert for authenticated" on public.inventory_movements for insert to authenticated with check (true);
create policy "Enable inventory movement update for authenticated" on public.inventory_movements for update to authenticated using (true) with check (true);
create policy "Enable inventory movement delete for authenticated" on public.inventory_movements for delete to authenticated using (true);

-- Sales
create policy "Enable read access for authenticated users" on public.sales for select to authenticated using (true);

-- Daily work reports: authors own mutations; managers and admins have read-only oversight
create policy "Staff can read own daily work reports" on public.daily_work_reports
    for select to authenticated
    using (
        sales_id = public.current_sales_id()
        or public.current_staff_role() in ('admin', 'manager')
    );

create policy "Staff can create own daily work reports" on public.daily_work_reports
    for insert to authenticated
    with check (
        sales_id = public.current_sales_id()
        and public.current_staff_role() is not null
    );

create policy "Staff can update own daily work reports" on public.daily_work_reports
    for update to authenticated
    using (sales_id = public.current_sales_id())
    with check (sales_id = public.current_sales_id());

create policy "Staff can delete own daily work reports" on public.daily_work_reports
    for delete to authenticated
    using (sales_id = public.current_sales_id());

-- Tags
create policy "Enable read access for authenticated users" on public.tags for select to authenticated using (true);
create policy "Enable insert for authenticated users only" on public.tags for insert to authenticated with check (true);
create policy "Enable update for authenticated users only" on public.tags for update to authenticated using (true);
create policy "Enable delete for authenticated users only" on public.tags for delete to authenticated using (true);

-- Tasks
create policy "Enable read access for authenticated users" on public.tasks for select to authenticated using (true);
create policy "Enable insert for authenticated users only" on public.tasks for insert to authenticated with check (true);
create policy "Task Update Policy" on public.tasks for update to authenticated using (true);
create policy "Task Delete Policy" on public.tasks for delete to authenticated using (true);

-- Configuration (admin-only for writes)
create policy "Enable read for authenticated" on public.configuration for select to authenticated using (true);
create policy "Enable insert for admins" on public.configuration for insert to authenticated with check (public.is_admin());
create policy "Enable update for admins" on public.configuration for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Favicons excluded domains
create policy "Enable access for authenticated users only" on public.favicons_excluded_domains to authenticated using (true) with check (true);
