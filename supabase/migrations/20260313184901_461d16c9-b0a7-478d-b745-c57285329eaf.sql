
CREATE TABLE public.operator_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  notice_type TEXT NOT NULL DEFAULT 'notice',
  important BOOLEAN NOT NULL DEFAULT false,
  link_url TEXT,
  link_label TEXT,
  target_business_types TEXT[] DEFAULT '{}',
  priority INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by TEXT,
  org_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.operator_notices ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read active notices
CREATE POLICY "notices_select_all" ON public.operator_notices
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Only operators can manage notices
CREATE POLICY "notices_insert_operator" ON public.operator_notices
  FOR INSERT TO authenticated
  WITH CHECK (is_operator_user());

CREATE POLICY "notices_update_operator" ON public.operator_notices
  FOR UPDATE TO authenticated
  USING (is_operator_user())
  WITH CHECK (is_operator_user());

CREATE POLICY "notices_delete_operator" ON public.operator_notices
  FOR DELETE TO authenticated
  USING (is_operator_user());
