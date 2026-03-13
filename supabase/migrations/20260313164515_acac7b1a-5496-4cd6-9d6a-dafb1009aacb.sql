
-- 1. assistant_tasks (운영 점검 항목)
CREATE TABLE public.assistant_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'ops_check',
  status TEXT NOT NULL DEFAULT 'new',
  priority TEXT NOT NULL DEFAULT 'normal',
  assignee TEXT,
  due_date DATE,
  memo TEXT,
  source_type TEXT NOT NULL DEFAULT 'user_created',
  linked_result_id UUID REFERENCES public.saved_results(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.assistant_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select_scoped" ON public.assistant_tasks FOR SELECT TO authenticated USING (can_access_org(org_id));
CREATE POLICY "tasks_insert_scoped" ON public.assistant_tasks FOR INSERT TO authenticated WITH CHECK (can_access_org(org_id));
CREATE POLICY "tasks_update_scoped" ON public.assistant_tasks FOR UPDATE TO authenticated USING (can_access_org(org_id)) WITH CHECK (can_access_org(org_id));
CREATE POLICY "tasks_delete_scoped" ON public.assistant_tasks FOR DELETE TO authenticated USING (can_access_org(org_id));

CREATE TRIGGER set_updated_at_assistant_tasks BEFORE UPDATE ON public.assistant_tasks FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- 2. assistant_campaigns (캠페인)
CREATE TABLE public.assistant_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  purpose TEXT,
  target_segment TEXT,
  channel TEXT,
  start_date DATE,
  end_date DATE,
  benefit TEXT,
  design_needs TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  memo TEXT,
  source_type TEXT NOT NULL DEFAULT 'user_created',
  linked_result_id UUID REFERENCES public.saved_results(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.assistant_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaigns_select_scoped" ON public.assistant_campaigns FOR SELECT TO authenticated USING (can_access_org(org_id));
CREATE POLICY "campaigns_insert_scoped" ON public.assistant_campaigns FOR INSERT TO authenticated WITH CHECK (can_access_org(org_id));
CREATE POLICY "campaigns_update_scoped" ON public.assistant_campaigns FOR UPDATE TO authenticated USING (can_access_org(org_id)) WITH CHECK (can_access_org(org_id));
CREATE POLICY "campaigns_delete_scoped" ON public.assistant_campaigns FOR DELETE TO authenticated USING (can_access_org(org_id));

CREATE TRIGGER set_updated_at_assistant_campaigns BEFORE UPDATE ON public.assistant_campaigns FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- 3. assistant_reminders (일정/마감 리마인드)
CREATE TABLE public.assistant_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  reminder_type TEXT NOT NULL DEFAULT 'general',
  due_date DATE,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_rule TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  memo TEXT,
  source_type TEXT NOT NULL DEFAULT 'user_created',
  linked_result_id UUID REFERENCES public.saved_results(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.assistant_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reminders_select_scoped" ON public.assistant_reminders FOR SELECT TO authenticated USING (can_access_org(org_id));
CREATE POLICY "reminders_insert_scoped" ON public.assistant_reminders FOR INSERT TO authenticated WITH CHECK (can_access_org(org_id));
CREATE POLICY "reminders_update_scoped" ON public.assistant_reminders FOR UPDATE TO authenticated USING (can_access_org(org_id)) WITH CHECK (can_access_org(org_id));
CREATE POLICY "reminders_delete_scoped" ON public.assistant_reminders FOR DELETE TO authenticated USING (can_access_org(org_id));

CREATE TRIGGER set_updated_at_assistant_reminders BEFORE UPDATE ON public.assistant_reminders FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- 4. assistant_checklists (체크리스트 헤더)
CREATE TABLE public.assistant_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  checklist_type TEXT NOT NULL DEFAULT 'daily',
  focus_area TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  memo TEXT,
  source_type TEXT NOT NULL DEFAULT 'user_created',
  linked_result_id UUID REFERENCES public.saved_results(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.assistant_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checklists_select_scoped" ON public.assistant_checklists FOR SELECT TO authenticated USING (can_access_org(org_id));
CREATE POLICY "checklists_insert_scoped" ON public.assistant_checklists FOR INSERT TO authenticated WITH CHECK (can_access_org(org_id));
CREATE POLICY "checklists_update_scoped" ON public.assistant_checklists FOR UPDATE TO authenticated USING (can_access_org(org_id)) WITH CHECK (can_access_org(org_id));
CREATE POLICY "checklists_delete_scoped" ON public.assistant_checklists FOR DELETE TO authenticated USING (can_access_org(org_id));

CREATE TRIGGER set_updated_at_assistant_checklists BEFORE UPDATE ON public.assistant_checklists FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- 5. assistant_checklist_items (체크리스트 항목)
CREATE TABLE public.assistant_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES public.assistant_checklists(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  is_checked BOOLEAN NOT NULL DEFAULT false,
  checked_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.assistant_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checklist_items_select_scoped" ON public.assistant_checklist_items FOR SELECT TO authenticated USING (can_access_org(org_id));
CREATE POLICY "checklist_items_insert_scoped" ON public.assistant_checklist_items FOR INSERT TO authenticated WITH CHECK (can_access_org(org_id));
CREATE POLICY "checklist_items_update_scoped" ON public.assistant_checklist_items FOR UPDATE TO authenticated USING (can_access_org(org_id)) WITH CHECK (can_access_org(org_id));
CREATE POLICY "checklist_items_delete_scoped" ON public.assistant_checklist_items FOR DELETE TO authenticated USING (can_access_org(org_id));

CREATE TRIGGER set_updated_at_assistant_checklist_items BEFORE UPDATE ON public.assistant_checklist_items FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();
