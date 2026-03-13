
-- Add tracking columns to assistant_checklist_items
ALTER TABLE public.assistant_checklist_items
  ADD COLUMN IF NOT EXISTS assignee_name text NULL,
  ADD COLUMN IF NOT EXISTS completed_by_user_id uuid NULL,
  ADD COLUMN IF NOT EXISTS completed_by_name text NULL;

-- Add tracking columns to assistant_tasks
ALTER TABLE public.assistant_tasks
  ADD COLUMN IF NOT EXISTS completed_by_user_id uuid NULL,
  ADD COLUMN IF NOT EXISTS completed_by_name text NULL,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS risk_source text NOT NULL DEFAULT 'user_created';
