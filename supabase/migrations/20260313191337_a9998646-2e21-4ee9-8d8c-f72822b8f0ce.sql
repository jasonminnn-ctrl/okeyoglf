
-- operator_recommendations table for managing operational recommendations
CREATE TABLE public.operator_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  recommendation_type text NOT NULL DEFAULT 'ops_recommended',
  target_business_types text[] DEFAULT '{}'::text[],
  target_org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  target_branch_code text,
  priority text NOT NULL DEFAULT 'normal',
  category text NOT NULL DEFAULT 'ops_check',
  is_active boolean NOT NULL DEFAULT true,
  start_date date,
  end_date date,
  link_url text,
  link_label text,
  memo text,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.operator_recommendations ENABLE ROW LEVEL SECURITY;

-- Only operators can CRUD
CREATE POLICY "recommendations_select_all" ON public.operator_recommendations
  FOR SELECT TO authenticated USING (is_active = true OR is_operator_user());

CREATE POLICY "recommendations_insert_operator" ON public.operator_recommendations
  FOR INSERT TO authenticated WITH CHECK (is_operator_user());

CREATE POLICY "recommendations_update_operator" ON public.operator_recommendations
  FOR UPDATE TO authenticated USING (is_operator_user()) WITH CHECK (is_operator_user());

CREATE POLICY "recommendations_delete_operator" ON public.operator_recommendations
  FOR DELETE TO authenticated USING (is_operator_user());

-- Auto-update updated_at
CREATE TRIGGER set_updated_at_operator_recommendations
  BEFORE UPDATE ON public.operator_recommendations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_column();
