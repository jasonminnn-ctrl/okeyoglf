-- ============================================================
-- OkeyGolf OS — Imweb Phase 1 Schema
-- ============================================================

-- 0. helper functions
CREATE OR REPLACE FUNCTION public.set_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT p.org_id FROM public.profiles p WHERE p.id = auth.uid() $$;

-- 1. imweb_site_connections
CREATE TABLE IF NOT EXISTS public.imweb_site_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_provider TEXT NOT NULL DEFAULT 'imweb',
  site_code TEXT NOT NULL,
  connection_status TEXT NOT NULL DEFAULT 'pending',
  webhook_url TEXT,
  webhook_registered BOOLEAN NOT NULL DEFAULT false,
  last_synced_at TIMESTAMPTZ,
  last_event_at TIMESTAMPTZ,
  last_event_type TEXT,
  last_error TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT imweb_site_connections_provider_check CHECK (external_provider = 'imweb'),
  CONSTRAINT imweb_site_connections_status_check CHECK (connection_status IN ('pending', 'connected', 'disconnected', 'testing', 'error')),
  CONSTRAINT imweb_site_connections_org_site_unique UNIQUE (org_id, site_code)
);
CREATE INDEX IF NOT EXISTS idx_imweb_site_connections_org ON public.imweb_site_connections(org_id);
CREATE INDEX IF NOT EXISTS idx_imweb_site_connections_status ON public.imweb_site_connections(connection_status);
DROP TRIGGER IF EXISTS trg_imweb_site_connections_updated_at ON public.imweb_site_connections;
CREATE TRIGGER trg_imweb_site_connections_updated_at BEFORE UPDATE ON public.imweb_site_connections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();

-- 2. imweb_product_membership_mappings
CREATE TABLE IF NOT EXISTS public.imweb_product_membership_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  site_connection_id UUID NOT NULL REFERENCES public.imweb_site_connections(id) ON DELETE CASCADE,
  external_product_code TEXT NOT NULL,
  external_product_name TEXT NOT NULL,
  mapped_membership_code public.membership_code NOT NULL,
  mapped_membership_label TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  note TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT imweb_product_membership_mappings_unique UNIQUE (org_id, site_connection_id, external_product_code)
);
CREATE INDEX IF NOT EXISTS idx_imweb_product_membership_mappings_org ON public.imweb_product_membership_mappings(org_id);
CREATE INDEX IF NOT EXISTS idx_imweb_product_membership_mappings_membership ON public.imweb_product_membership_mappings(mapped_membership_code);
CREATE INDEX IF NOT EXISTS idx_imweb_product_membership_mappings_active ON public.imweb_product_membership_mappings(is_active);
DROP TRIGGER IF EXISTS trg_imweb_product_membership_mappings_updated_at ON public.imweb_product_membership_mappings;
CREATE TRIGGER trg_imweb_product_membership_mappings_updated_at BEFORE UPDATE ON public.imweb_product_membership_mappings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();

-- 3. imweb_point_credit_mappings
CREATE TABLE IF NOT EXISTS public.imweb_point_credit_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  site_connection_id UUID NOT NULL REFERENCES public.imweb_site_connections(id) ON DELETE CASCADE,
  external_point_product_code TEXT NOT NULL,
  external_point_product_name TEXT NOT NULL,
  mapped_credit_amount INTEGER NOT NULL,
  grant_mode TEXT NOT NULL DEFAULT 'manual_review',
  is_active BOOLEAN NOT NULL DEFAULT true,
  note TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT imweb_point_credit_mappings_unique UNIQUE (org_id, site_connection_id, external_point_product_code),
  CONSTRAINT imweb_point_credit_mappings_credit_check CHECK (mapped_credit_amount > 0),
  CONSTRAINT imweb_point_credit_mappings_grant_mode_check CHECK (grant_mode IN ('auto', 'manual_review', 'manual_only'))
);
CREATE INDEX IF NOT EXISTS idx_imweb_point_credit_mappings_org ON public.imweb_point_credit_mappings(org_id);
CREATE INDEX IF NOT EXISTS idx_imweb_point_credit_mappings_grant_mode ON public.imweb_point_credit_mappings(grant_mode);
CREATE INDEX IF NOT EXISTS idx_imweb_point_credit_mappings_active ON public.imweb_point_credit_mappings(is_active);
DROP TRIGGER IF EXISTS trg_imweb_point_credit_mappings_updated_at ON public.imweb_point_credit_mappings;
CREATE TRIGGER trg_imweb_point_credit_mappings_updated_at BEFORE UPDATE ON public.imweb_point_credit_mappings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();

-- 4. imweb_order_events
CREATE TABLE IF NOT EXISTS public.imweb_order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  site_connection_id UUID NOT NULL REFERENCES public.imweb_site_connections(id) ON DELETE CASCADE,
  external_provider TEXT NOT NULL DEFAULT 'imweb',
  event_type TEXT NOT NULL,
  external_order_id TEXT,
  external_member_id TEXT,
  external_product_code TEXT,
  external_product_name TEXT,
  paid_amount NUMERIC(12,2),
  currency_code TEXT NOT NULL DEFAULT 'KRW',
  ordered_at TIMESTAMPTZ,
  order_status TEXT,
  processing_status TEXT NOT NULL DEFAULT 'received',
  processing_error TEXT,
  processed_at TIMESTAMPTZ,
  processed_by TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  idempotency_key TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT imweb_order_events_provider_check CHECK (external_provider = 'imweb'),
  CONSTRAINT imweb_order_events_processing_status_check CHECK (processing_status IN ('received', 'mapped', 'manual_review', 'applied', 'failed', 'ignored'))
);
CREATE INDEX IF NOT EXISTS idx_imweb_order_events_org ON public.imweb_order_events(org_id);
CREATE INDEX IF NOT EXISTS idx_imweb_order_events_site_connection ON public.imweb_order_events(site_connection_id);
CREATE INDEX IF NOT EXISTS idx_imweb_order_events_event_type ON public.imweb_order_events(event_type);
CREATE INDEX IF NOT EXISTS idx_imweb_order_events_external_order_id ON public.imweb_order_events(external_order_id);
CREATE INDEX IF NOT EXISTS idx_imweb_order_events_processing_status ON public.imweb_order_events(processing_status);
CREATE UNIQUE INDEX IF NOT EXISTS uq_imweb_order_events_idempotency_key ON public.imweb_order_events(idempotency_key) WHERE idempotency_key IS NOT NULL;
DROP TRIGGER IF EXISTS trg_imweb_order_events_updated_at ON public.imweb_order_events;
CREATE TRIGGER trg_imweb_order_events_updated_at BEFORE UPDATE ON public.imweb_order_events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();

-- 5. imweb_member_links
CREATE TABLE IF NOT EXISTS public.imweb_member_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  site_connection_id UUID NOT NULL REFERENCES public.imweb_site_connections(id) ON DELETE CASCADE,
  external_provider TEXT NOT NULL DEFAULT 'imweb',
  external_member_id TEXT NOT NULL,
  member_name TEXT,
  email TEXT,
  phone TEXT,
  linked_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  link_status TEXT NOT NULL DEFAULT 'needs_review',
  sync_status TEXT NOT NULL DEFAULT 'pending',
  first_linked_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT imweb_member_links_provider_check CHECK (external_provider = 'imweb'),
  CONSTRAINT imweb_member_links_unique UNIQUE (org_id, external_provider, external_member_id),
  CONSTRAINT imweb_member_links_link_status_check CHECK (link_status IN ('linked', 'unlinked', 'needs_review', 'sync_failed')),
  CONSTRAINT imweb_member_links_sync_status_check CHECK (sync_status IN ('pending', 'synced', 'failed'))
);
CREATE INDEX IF NOT EXISTS idx_imweb_member_links_org ON public.imweb_member_links(org_id);
CREATE INDEX IF NOT EXISTS idx_imweb_member_links_linked_profile ON public.imweb_member_links(linked_profile_id);
CREATE INDEX IF NOT EXISTS idx_imweb_member_links_link_status ON public.imweb_member_links(link_status);
CREATE INDEX IF NOT EXISTS idx_imweb_member_links_sync_status ON public.imweb_member_links(sync_status);
DROP TRIGGER IF EXISTS trg_imweb_member_links_updated_at ON public.imweb_member_links;
CREATE TRIGGER trg_imweb_member_links_updated_at BEFORE UPDATE ON public.imweb_member_links FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();

-- 6. RLS
ALTER TABLE public.imweb_site_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imweb_product_membership_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imweb_point_credit_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imweb_order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imweb_member_links ENABLE ROW LEVEL SECURITY;

-- RLS policies: site_connections
DROP POLICY IF EXISTS "imweb_site_connections_select" ON public.imweb_site_connections;
DROP POLICY IF EXISTS "imweb_site_connections_insert" ON public.imweb_site_connections;
DROP POLICY IF EXISTS "imweb_site_connections_update" ON public.imweb_site_connections;
DROP POLICY IF EXISTS "imweb_site_connections_delete" ON public.imweb_site_connections;
CREATE POLICY "imweb_site_connections_select" ON public.imweb_site_connections FOR SELECT USING (org_id = public.get_my_org_id());
CREATE POLICY "imweb_site_connections_insert" ON public.imweb_site_connections FOR INSERT WITH CHECK (org_id = public.get_my_org_id() AND public.has_role(auth.uid(), 'operator'::public.app_role));
CREATE POLICY "imweb_site_connections_update" ON public.imweb_site_connections FOR UPDATE USING (org_id = public.get_my_org_id() AND public.has_role(auth.uid(), 'operator'::public.app_role)) WITH CHECK (org_id = public.get_my_org_id() AND public.has_role(auth.uid(), 'operator'::public.app_role));
CREATE POLICY "imweb_site_connections_delete" ON public.imweb_site_connections FOR DELETE USING (org_id = public.get_my_org_id() AND public.has_role(auth.uid(), 'operator'::public.app_role));

-- RLS policies: product_membership_mappings
DROP POLICY IF EXISTS "imweb_product_membership_mappings_select" ON public.imweb_product_membership_mappings;
DROP POLICY IF EXISTS "imweb_product_membership_mappings_insert" ON public.imweb_product_membership_mappings;
DROP POLICY IF EXISTS "imweb_product_membership_mappings_update" ON public.imweb_product_membership_mappings;
DROP POLICY IF EXISTS "imweb_product_membership_mappings_delete" ON public.imweb_product_membership_mappings;
CREATE POLICY "imweb_product_membership_mappings_select" ON public.imweb_product_membership_mappings FOR SELECT USING (org_id = public.get_my_org_id());
CREATE POLICY "imweb_product_membership_mappings_insert" ON public.imweb_product_membership_mappings FOR INSERT WITH CHECK (org_id = public.get_my_org_id() AND public.has_role(auth.uid(), 'operator'::public.app_role));
CREATE POLICY "imweb_product_membership_mappings_update" ON public.imweb_product_membership_mappings FOR UPDATE USING (org_id = public.get_my_org_id() AND public.has_role(auth.uid(), 'operator'::public.app_role)) WITH CHECK (org_id = public.get_my_org_id() AND public.has_role(auth.uid(), 'operator'::public.app_role));
CREATE POLICY "imweb_product_membership_mappings_delete" ON public.imweb_product_membership_mappings FOR DELETE USING (org_id = public.get_my_org_id() AND public.has_role(auth.uid(), 'operator'::public.app_role));

-- RLS policies: point_credit_mappings
DROP POLICY IF EXISTS "imweb_point_credit_mappings_select" ON public.imweb_point_credit_mappings;
DROP POLICY IF EXISTS "imweb_point_credit_mappings_insert" ON public.imweb_point_credit_mappings;
DROP POLICY IF EXISTS "imweb_point_credit_mappings_update" ON public.imweb_point_credit_mappings;
DROP POLICY IF EXISTS "imweb_point_credit_mappings_delete" ON public.imweb_point_credit_mappings;
CREATE POLICY "imweb_point_credit_mappings_select" ON public.imweb_point_credit_mappings FOR SELECT USING (org_id = public.get_my_org_id());
CREATE POLICY "imweb_point_credit_mappings_insert" ON public.imweb_point_credit_mappings FOR INSERT WITH CHECK (org_id = public.get_my_org_id() AND public.has_role(auth.uid(), 'operator'::public.app_role));
CREATE POLICY "imweb_point_credit_mappings_update" ON public.imweb_point_credit_mappings FOR UPDATE USING (org_id = public.get_my_org_id() AND public.has_role(auth.uid(), 'operator'::public.app_role)) WITH CHECK (org_id = public.get_my_org_id() AND public.has_role(auth.uid(), 'operator'::public.app_role));
CREATE POLICY "imweb_point_credit_mappings_delete" ON public.imweb_point_credit_mappings FOR DELETE USING (org_id = public.get_my_org_id() AND public.has_role(auth.uid(), 'operator'::public.app_role));

-- RLS policies: order_events
DROP POLICY IF EXISTS "imweb_order_events_select" ON public.imweb_order_events;
DROP POLICY IF EXISTS "imweb_order_events_insert" ON public.imweb_order_events;
DROP POLICY IF EXISTS "imweb_order_events_update" ON public.imweb_order_events;
CREATE POLICY "imweb_order_events_select" ON public.imweb_order_events FOR SELECT USING (org_id = public.get_my_org_id());
CREATE POLICY "imweb_order_events_insert" ON public.imweb_order_events FOR INSERT WITH CHECK (org_id = public.get_my_org_id() AND public.has_role(auth.uid(), 'operator'::public.app_role));
CREATE POLICY "imweb_order_events_update" ON public.imweb_order_events FOR UPDATE USING (org_id = public.get_my_org_id() AND public.has_role(auth.uid(), 'operator'::public.app_role)) WITH CHECK (org_id = public.get_my_org_id() AND public.has_role(auth.uid(), 'operator'::public.app_role));

-- RLS policies: member_links
DROP POLICY IF EXISTS "imweb_member_links_select" ON public.imweb_member_links;
DROP POLICY IF EXISTS "imweb_member_links_insert" ON public.imweb_member_links;
DROP POLICY IF EXISTS "imweb_member_links_update" ON public.imweb_member_links;
CREATE POLICY "imweb_member_links_select" ON public.imweb_member_links FOR SELECT USING (org_id = public.get_my_org_id());
CREATE POLICY "imweb_member_links_insert" ON public.imweb_member_links FOR INSERT WITH CHECK (org_id = public.get_my_org_id() AND public.has_role(auth.uid(), 'operator'::public.app_role));
CREATE POLICY "imweb_member_links_update" ON public.imweb_member_links FOR UPDATE USING (org_id = public.get_my_org_id() AND public.has_role(auth.uid(), 'operator'::public.app_role)) WITH CHECK (org_id = public.get_my_org_id() AND public.has_role(auth.uid(), 'operator'::public.app_role));