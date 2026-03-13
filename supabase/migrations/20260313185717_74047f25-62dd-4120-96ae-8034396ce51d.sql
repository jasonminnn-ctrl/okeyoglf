
-- Storage bucket for operational attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('operational-attachments', 'operational-attachments', false);

-- Operational attachments table
CREATE TABLE public.operational_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'task' | 'campaign' | 'reminder' | 'checklist' | 'notice'
  entity_id UUID NOT NULL,
  org_id UUID NOT NULL REFERENCES public.organizations(id),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- storage path
  file_size_bytes INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.operational_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attachments_select_scoped" ON public.operational_attachments
  FOR SELECT TO authenticated USING (can_access_org(org_id));

CREATE POLICY "attachments_insert_scoped" ON public.operational_attachments
  FOR INSERT TO authenticated WITH CHECK (can_access_org(org_id));

CREATE POLICY "attachments_delete_scoped" ON public.operational_attachments
  FOR DELETE TO authenticated USING (can_access_org(org_id));

-- Storage RLS policies
CREATE POLICY "operational_attachments_select" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'operational-attachments');

CREATE POLICY "operational_attachments_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'operational-attachments');

CREATE POLICY "operational_attachments_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'operational-attachments');

-- Add content/body column to operator_notices for full detail view
ALTER TABLE public.operator_notices ADD COLUMN IF NOT EXISTS body TEXT;
