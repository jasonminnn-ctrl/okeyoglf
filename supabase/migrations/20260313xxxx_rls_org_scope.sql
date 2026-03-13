-- Phase 11.1
-- org_id scoped RLS hardening
-- keep current Supabase Auth, harden data access first

-- ------------------------------------------------------------
-- 1) helper functions
-- ------------------------------------------------------------
create or replace function public.current_profile_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.org_id
  from public.profiles p
  where p.id = auth.uid()
  limit 1
$$;

create or replace function public.is_operator_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.has_role(auth.uid(), 'operator'), false)
$$;

create or replace function public.can_access_org(_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid() is not null
    and (
      public.is_operator_user()
      or _org_id = public.current_profile_org_id()
    )
$$;

create or replace function public.can_access_feature_override(_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid() is not null
    and (
      public.is_operator_user()
      or _org_id is null
      or _org_id = public.current_profile_org_id()
    )
$$;

-- ------------------------------------------------------------
-- 2) replace open policies
-- ------------------------------------------------------------

-- organizations
drop policy if exists "org_select" on public.organizations;
create policy "org_select_scoped"
on public.organizations
for select
using (public.can_access_org(id));

-- customer settings save를 위해 own org update는 허용
-- 주의: membership_code 같은 민감 컬럼은 다음 단계에서 RPC/trigger로 더 좁히는 것이 안전
create policy "org_update_scoped"
on public.organizations
for update
using (public.can_access_org(id))
with check (public.can_access_org(id));

-- credit_wallets
drop policy if exists "wallet_select" on public.credit_wallets;
create policy "wallet_select_scoped"
on public.credit_wallets
for select
using (public.can_access_org(org_id));

-- credit_ledger
drop policy if exists "ledger_select" on public.credit_ledger;
create policy "ledger_select_scoped"
on public.credit_ledger
for select
using (public.can_access_org(org_id));

-- saved_results
drop policy if exists "results_select" on public.saved_results;
drop policy if exists "results_insert" on public.saved_results;
drop policy if exists "results_update" on public.saved_results;
drop policy if exists "results_delete" on public.saved_results;

create policy "results_select_scoped"
on public.saved_results
for select
using (public.can_access_org(org_id));

create policy "results_insert_scoped"
on public.saved_results
for insert
with check (public.can_access_org(org_id));

create policy "results_update_scoped"
on public.saved_results
for update
using (public.can_access_org(org_id))
with check (public.can_access_org(org_id));

create policy "results_delete_scoped"
on public.saved_results
for delete
using (public.can_access_org(org_id));

-- research_requests
drop policy if exists "research_select" on public.research_requests;
drop policy if exists "research_insert" on public.research_requests;
drop policy if exists "research_update" on public.research_requests;

create policy "research_select_scoped"
on public.research_requests
for select
using (public.can_access_org(org_id));

create policy "research_insert_scoped"
on public.research_requests
for insert
with check (public.can_access_org(org_id));

create policy "research_update_scoped"
on public.research_requests
for update
using (public.can_access_org(org_id))
with check (public.can_access_org(org_id));

-- feature_overrides
drop policy if exists "overrides_select" on public.feature_overrides;
create policy "overrides_select_scoped"
on public.feature_overrides
for select
using (public.can_access_feature_override(org_id));

-- consultant_requests
drop policy if exists "consultant_select" on public.consultant_requests;
drop policy if exists "consultant_insert" on public.consultant_requests;
drop policy if exists "consultant_update" on public.consultant_requests;

create policy "consultant_select_scoped"
on public.consultant_requests
for select
using (public.can_access_org(org_id));

create policy "consultant_insert_scoped"
on public.consultant_requests
for insert
with check (public.can_access_org(org_id));

create policy "consultant_update_scoped"
on public.consultant_requests
for update
using (public.can_access_org(org_id))
with check (public.can_access_org(org_id));

-- result_deliveries
drop policy if exists "deliveries_select" on public.result_deliveries;
drop policy if exists "deliveries_insert" on public.result_deliveries;

create policy "deliveries_select_scoped"
on public.result_deliveries
for select
using (public.can_access_org(org_id));

create policy "deliveries_insert_scoped"
on public.result_deliveries
for insert
with check (public.can_access_org(org_id));

-- result_attachments
drop policy if exists "attachments_select" on public.result_attachments;
drop policy if exists "attachments_insert" on public.result_attachments;
drop policy if exists "attachments_delete" on public.result_attachments;

create policy "attachments_select_scoped"
on public.result_attachments
for select
using (public.can_access_org(org_id));

create policy "attachments_insert_scoped"
on public.result_attachments
for insert
with check (public.can_access_org(org_id));

create policy "attachments_delete_scoped"
on public.result_attachments
for delete
using (public.can_access_org(org_id));

-- profiles
drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_scoped"
on public.profiles
for select
using (
  auth.uid() = id
  or public.is_operator_user()
);

create policy "profiles_update_own_scoped"
on public.profiles
for update
using (auth.uid() = id or public.is_operator_user())
with check (auth.uid() = id or public.is_operator_user());

-- user_roles
drop policy if exists "roles_select" on public.user_roles;

create policy "roles_select_scoped"
on public.user_roles
for select
using (
  user_id = auth.uid()
  or public.is_operator_user()
);
