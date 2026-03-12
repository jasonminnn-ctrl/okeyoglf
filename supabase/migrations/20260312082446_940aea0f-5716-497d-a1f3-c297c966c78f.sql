
-- =============================================
-- OkeyGolf OS — Phase 10 Core Tables Migration v3.2
-- =============================================

-- ENUMS
CREATE TYPE public.membership_code AS ENUM ('trial', 'standard', 'pro', 'enterprise');

CREATE TYPE public.result_status AS ENUM ('draft', 'review', 'done', 'delivered', 'archived');

CREATE TYPE public.result_type AS ENUM ('generation', 'research', 'consultant', 'manual');

CREATE TYPE public.ledger_type AS ENUM (
  'generate', 'regenerate', 'export', 'research',
  'consultant', 'manual_grant', 'manual_deduct', 'auto_grant',
  'refund', 'bonus', 'expire', 'admin_adjust'
);

CREATE TYPE public.research_status AS ENUM ('requested', 'processing', 'completed', 'consultant_handoff', 'failed');

CREATE TYPE public.consultant_request_type AS ENUM ('request', 'ppt', 'analysis', 'review', 'custom');

CREATE TYPE public.consultant_status AS ENUM ('requested', 'in_progress', 'completed', 'cancelled');

CREATE TYPE public.delivery_method AS ENUM (
  'email', 'kakao', 'sms', 'internal', 'link',
  'copy_text', 'export_pdf', 'export_doc',
  'export_ppt', 'export_csv', 'export_txt'
);

-- 1. organizations
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business_type TEXT NOT NULL DEFAULT '',
  branch_code TEXT,
  parent_org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  membership_code public.membership_code NOT NULL DEFAULT 'trial',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_organizations_parent ON public.organizations(parent_org_id);
CREATE INDEX idx_organizations_membership ON public.organizations(membership_code);

-- 2. credit_wallets
CREATE TABLE public.credit_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  lifetime_granted INTEGER NOT NULL DEFAULT 0,
  lifetime_used INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id)
);

-- 3. saved_results (with soft delete)
CREATE TABLE public.saved_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  type public.result_type NOT NULL DEFAULT 'generation',
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  business_type TEXT NOT NULL DEFAULT '',
  status public.result_status NOT NULL DEFAULT 'draft',
  sections JSONB NOT NULL DEFAULT '[]',
  plain_text TEXT,
  source_tool TEXT,
  source_menu TEXT,
  module TEXT,
  subtool TEXT,
  reference_id TEXT,
  tags TEXT[] DEFAULT '{}',
  output_format TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  regenerated_from_id UUID REFERENCES public.saved_results(id) ON DELETE SET NULL,
  context_summary JSONB,
  source_note TEXT,
  reference_note TEXT,
  metadata JSONB DEFAULT '{}',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_saved_results_org ON public.saved_results(org_id);
CREATE INDEX idx_saved_results_type ON public.saved_results(type);
CREATE INDEX idx_saved_results_status ON public.saved_results(status);
CREATE INDEX idx_saved_results_category ON public.saved_results(category);
CREATE INDEX idx_saved_results_created ON public.saved_results(created_at DESC);
CREATE INDEX idx_saved_results_not_deleted ON public.saved_results(org_id) WHERE deleted_at IS NULL;

-- 4. credit_ledger
CREATE TABLE public.credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.credit_wallets(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  type public.ledger_type NOT NULL,
  amount_delta INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  related_module TEXT,
  related_result_id UUID REFERENCES public.saved_results(id) ON DELETE SET NULL,
  actor_type TEXT NOT NULL DEFAULT 'system',
  actor_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_credit_ledger_wallet ON public.credit_ledger(wallet_id);
CREATE INDEX idx_credit_ledger_org ON public.credit_ledger(org_id);
CREATE INDEX idx_credit_ledger_created ON public.credit_ledger(created_at DESC);
CREATE INDEX idx_credit_ledger_type ON public.credit_ledger(type);

-- 5. research_requests
CREATE TABLE public.research_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  research_type TEXT NOT NULL DEFAULT 'general',
  status public.research_status NOT NULL DEFAULT 'requested',
  request_payload JSONB DEFAULT '{}',
  result_data JSONB,
  result_payload JSONB,
  result_id UUID REFERENCES public.saved_results(id) ON DELETE SET NULL,
  error_message TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX idx_research_requests_org ON public.research_requests(org_id);
CREATE INDEX idx_research_requests_status ON public.research_requests(status);

-- 6. feature_overrides
CREATE TABLE public.feature_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  membership_code public.membership_code,
  enabled BOOLEAN NOT NULL DEFAULT true,
  custom_credit_cost INTEGER,
  reason TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, feature_key, membership_code)
);

-- 7. consultant_requests
CREATE TABLE public.consultant_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  result_id UUID REFERENCES public.saved_results(id) ON DELETE SET NULL,
  request_type public.consultant_request_type NOT NULL DEFAULT 'request',
  status public.consultant_status NOT NULL DEFAULT 'requested',
  request_note TEXT,
  consultant_note TEXT,
  assigned_to TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_consultant_requests_org ON public.consultant_requests(org_id);
CREATE INDEX idx_consultant_requests_result ON public.consultant_requests(result_id);
CREATE INDEX idx_consultant_requests_status ON public.consultant_requests(status);

-- 8. result_deliveries (append-only)
CREATE TABLE public.result_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID NOT NULL REFERENCES public.saved_results(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  method public.delivery_method NOT NULL,
  recipient TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  file_name TEXT,
  note TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_result_deliveries_result ON public.result_deliveries(result_id);
CREATE INDEX idx_result_deliveries_org ON public.result_deliveries(org_id);

-- 9. result_attachments
CREATE TABLE public.result_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID NOT NULL REFERENCES public.saved_results(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT '',
  storage_path TEXT,
  file_size_bytes INTEGER,
  uploaded_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_result_attachments_result ON public.result_attachments(result_id);

-- FUNCTION: deduct_credit (v3.2 with validation)
CREATE OR REPLACE FUNCTION public.deduct_credit(
  _org_id UUID,
  _amount INTEGER,
  _type public.ledger_type,
  _reason TEXT,
  _module TEXT DEFAULT NULL,
  _result_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _wallet_id UUID;
  _current_balance INTEGER;
  _new_balance INTEGER;
BEGIN
  IF _amount IS NULL OR _amount <= 0 THEN
    RAISE EXCEPTION 'deduct_credit: _amount must be > 0, got %', _amount;
  END IF;

  SELECT id, balance INTO _wallet_id, _current_balance
  FROM public.credit_wallets
  WHERE org_id = _org_id
  FOR UPDATE;

  IF _wallet_id IS NULL THEN RETURN FALSE; END IF;
  IF _current_balance < _amount THEN RETURN FALSE; END IF;

  _new_balance := _current_balance - _amount;

  UPDATE public.credit_wallets
  SET balance = _new_balance, lifetime_used = lifetime_used + _amount, updated_at = now()
  WHERE id = _wallet_id;

  INSERT INTO public.credit_ledger (wallet_id, org_id, type, amount_delta, balance_after, reason, related_module, related_result_id, actor_type)
  VALUES (_wallet_id, _org_id, _type, -_amount, _new_balance, _reason, _module, _result_id, 'user');

  RETURN TRUE;
END;
$$;

-- FUNCTION: grant_credit (v3.2 with validation)
CREATE OR REPLACE FUNCTION public.grant_credit(
  _org_id UUID,
  _amount INTEGER,
  _type public.ledger_type,
  _reason TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _wallet_id UUID;
  _current_balance INTEGER;
  _new_balance INTEGER;
BEGIN
  IF _amount IS NULL OR _amount <= 0 THEN
    RAISE EXCEPTION 'grant_credit: _amount must be > 0, got %', _amount;
  END IF;

  SELECT id, balance INTO _wallet_id, _current_balance
  FROM public.credit_wallets
  WHERE org_id = _org_id
  FOR UPDATE;

  IF _wallet_id IS NULL THEN RETURN FALSE; END IF;

  _new_balance := _current_balance + _amount;

  UPDATE public.credit_wallets
  SET balance = _new_balance, lifetime_granted = lifetime_granted + _amount, updated_at = now()
  WHERE id = _wallet_id;

  INSERT INTO public.credit_ledger (wallet_id, org_id, type, amount_delta, balance_after, reason, actor_type)
  VALUES (_wallet_id, _org_id, _type, _amount, _new_balance, _reason, 'operator');

  RETURN TRUE;
END;
$$;

-- RLS v3.1 — organizations SELECT-only, sensitive tables write-blocked

-- organizations: SELECT-only
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_select" ON public.organizations FOR SELECT USING (true);

-- credit_wallets: SELECT-only (write via RPC)
ALTER TABLE public.credit_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wallet_select" ON public.credit_wallets FOR SELECT USING (true);

-- credit_ledger: SELECT-only (write via RPC)
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ledger_select" ON public.credit_ledger FOR SELECT USING (true);

-- saved_results: full CRUD (soft delete)
ALTER TABLE public.saved_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "results_select" ON public.saved_results FOR SELECT USING (true);
CREATE POLICY "results_insert" ON public.saved_results FOR INSERT WITH CHECK (true);
CREATE POLICY "results_update" ON public.saved_results FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "results_delete" ON public.saved_results FOR DELETE USING (true);

-- research_requests: read/write, no delete
ALTER TABLE public.research_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "research_select" ON public.research_requests FOR SELECT USING (true);
CREATE POLICY "research_insert" ON public.research_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "research_update" ON public.research_requests FOR UPDATE USING (true) WITH CHECK (true);

-- feature_overrides: SELECT-only (write via server)
ALTER TABLE public.feature_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "overrides_select" ON public.feature_overrides FOR SELECT USING (true);

-- consultant_requests: read/write, no delete
ALTER TABLE public.consultant_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "consultant_select" ON public.consultant_requests FOR SELECT USING (true);
CREATE POLICY "consultant_insert" ON public.consultant_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "consultant_update" ON public.consultant_requests FOR UPDATE USING (true) WITH CHECK (true);

-- result_deliveries: append-only
ALTER TABLE public.result_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deliveries_select" ON public.result_deliveries FOR SELECT USING (true);
CREATE POLICY "deliveries_insert" ON public.result_deliveries FOR INSERT WITH CHECK (true);

-- result_attachments: SELECT + INSERT + DELETE
ALTER TABLE public.result_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attachments_select" ON public.result_attachments FOR SELECT USING (true);
CREATE POLICY "attachments_insert" ON public.result_attachments FOR INSERT WITH CHECK (true);
CREATE POLICY "attachments_delete" ON public.result_attachments FOR DELETE USING (true);
