/**
 * Repository layer for assistant operational objects:
 * tasks, campaigns, reminders, checklists + items.
 */

import { supabase } from "@/integrations/supabase/client";

// ── Types ──

export interface AssistantTask {
  id: string;
  org_id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  priority: string;
  assignee: string | null;
  due_date: string | null;
  memo: string | null;
  source_type: string;
  linked_result_id: string | null;
  risk_source: string;
  completed_by_user_id: string | null;
  completed_by_name: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssistantCampaign {
  id: string;
  org_id: string;
  title: string;
  purpose: string | null;
  target_segment: string | null;
  channel: string | null;
  start_date: string | null;
  end_date: string | null;
  benefit: string | null;
  design_needs: string | null;
  status: string;
  memo: string | null;
  source_type: string;
  linked_result_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssistantReminder {
  id: string;
  org_id: string;
  title: string;
  reminder_type: string;
  due_date: string | null;
  is_recurring: boolean;
  recurrence_rule: string | null;
  status: string;
  memo: string | null;
  source_type: string;
  linked_result_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssistantChecklist {
  id: string;
  org_id: string;
  title: string;
  checklist_type: string;
  focus_area: string | null;
  status: string;
  memo: string | null;
  source_type: string;
  linked_result_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssistantChecklistItem {
  id: string;
  checklist_id: string;
  org_id: string;
  label: string;
  is_checked: boolean;
  checked_at: string | null;
  sort_order: number;
  memo: string | null;
  assignee_name: string | null;
  completed_by_user_id: string | null;
  completed_by_name: string | null;
  created_at: string;
  updated_at: string;
}

// ── Helpers ──

async function getOrgId(): Promise<string> {
  const { data } = await supabase.rpc("get_my_org_id");
  return data ?? "00000000-0000-0000-0000-000000000001";
}

// ── Tasks ──

export async function fetchTasks(): Promise<AssistantTask[]> {
  const { data, error } = await supabase
    .from("assistant_tasks" as any)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("fetchTasks error", error); return []; }
  return (data ?? []) as unknown as AssistantTask[];
}

export async function insertTask(task: Partial<AssistantTask>): Promise<AssistantTask | null> {
  const org_id = await getOrgId();
  const { data, error } = await supabase
    .from("assistant_tasks" as any)
    .insert({ ...task, org_id } as any)
    .select()
    .single();
  if (error) { console.error("insertTask error", error); return null; }
  return data as unknown as AssistantTask;
}

export async function updateTask(id: string, updates: Partial<AssistantTask>): Promise<void> {
  await supabase.from("assistant_tasks" as any).update(updates as any).eq("id", id);
}

export async function deleteTask(id: string): Promise<void> {
  await supabase.from("assistant_tasks" as any).delete().eq("id", id);
}

// ── Campaigns ──

export async function fetchCampaigns(): Promise<AssistantCampaign[]> {
  const { data, error } = await supabase
    .from("assistant_campaigns" as any)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("fetchCampaigns error", error); return []; }
  return (data ?? []) as unknown as AssistantCampaign[];
}

export async function insertCampaign(campaign: Partial<AssistantCampaign>): Promise<AssistantCampaign | null> {
  const org_id = await getOrgId();
  const { data, error } = await supabase
    .from("assistant_campaigns" as any)
    .insert({ ...campaign, org_id } as any)
    .select()
    .single();
  if (error) { console.error("insertCampaign error", error); return null; }
  return data as unknown as AssistantCampaign;
}

export async function updateCampaign(id: string, updates: Partial<AssistantCampaign>): Promise<void> {
  await supabase.from("assistant_campaigns" as any).update(updates as any).eq("id", id);
}

export async function deleteCampaign(id: string): Promise<void> {
  await supabase.from("assistant_campaigns" as any).delete().eq("id", id);
}

// ── Reminders ──

export async function fetchReminders(): Promise<AssistantReminder[]> {
  const { data, error } = await supabase
    .from("assistant_reminders" as any)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("fetchReminders error", error); return []; }
  return (data ?? []) as unknown as AssistantReminder[];
}

export async function insertReminder(reminder: Partial<AssistantReminder>): Promise<AssistantReminder | null> {
  const org_id = await getOrgId();
  const { data, error } = await supabase
    .from("assistant_reminders" as any)
    .insert({ ...reminder, org_id } as any)
    .select()
    .single();
  if (error) { console.error("insertReminder error", error); return null; }
  return data as unknown as AssistantReminder;
}

export async function updateReminder(id: string, updates: Partial<AssistantReminder>): Promise<void> {
  await supabase.from("assistant_reminders" as any).update(updates as any).eq("id", id);
}

export async function deleteReminder(id: string): Promise<void> {
  await supabase.from("assistant_reminders" as any).delete().eq("id", id);
}

// ── Checklists ──

export async function fetchChecklists(): Promise<AssistantChecklist[]> {
  const { data, error } = await supabase
    .from("assistant_checklists" as any)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("fetchChecklists error", error); return []; }
  return (data ?? []) as unknown as AssistantChecklist[];
}

export async function insertChecklist(checklist: Partial<AssistantChecklist>): Promise<AssistantChecklist | null> {
  const org_id = await getOrgId();
  const { data, error } = await supabase
    .from("assistant_checklists" as any)
    .insert({ ...checklist, org_id } as any)
    .select()
    .single();
  if (error) { console.error("insertChecklist error", error); return null; }
  return data as unknown as AssistantChecklist;
}

export async function updateChecklist(id: string, updates: Partial<AssistantChecklist>): Promise<void> {
  await supabase.from("assistant_checklists" as any).update(updates as any).eq("id", id);
}

export async function deleteChecklist(id: string): Promise<void> {
  await supabase.from("assistant_checklists" as any).delete().eq("id", id);
}

// ── Checklist Items ──

export async function fetchChecklistItems(checklistId: string): Promise<AssistantChecklistItem[]> {
  const { data, error } = await supabase
    .from("assistant_checklist_items" as any)
    .select("*")
    .eq("checklist_id", checklistId)
    .order("sort_order", { ascending: true });
  if (error) { console.error("fetchChecklistItems error", error); return []; }
  return (data ?? []) as unknown as AssistantChecklistItem[];
}

export async function insertChecklistItem(item: Partial<AssistantChecklistItem>): Promise<AssistantChecklistItem | null> {
  const org_id = await getOrgId();
  const { data, error } = await supabase
    .from("assistant_checklist_items" as any)
    .insert({ ...item, org_id } as any)
    .select()
    .single();
  if (error) { console.error("insertChecklistItem error", error); return null; }
  return data as unknown as AssistantChecklistItem;
}

export async function updateChecklistItem(id: string, updates: Partial<AssistantChecklistItem>): Promise<void> {
  await supabase.from("assistant_checklist_items" as any).update(updates as any).eq("id", id);
}

export async function deleteChecklistItem(id: string): Promise<void> {
  await supabase.from("assistant_checklist_items" as any).delete().eq("id", id);
}

// ── Operator Recommendations (customer-facing supply) ──

export interface OperatorRecommendation {
  id: string;
  title: string;
  description: string | null;
  recommendation_type: string;
  category: string;
  priority: string;
  target_business_types: string[];
  target_org_id: string | null;
  target_branch_code: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  link_url: string | null;
  link_label: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch active operator recommendations filtered by category, business type,
 * org_id, and branch_code.
 *
 * Targeting rules:
 * - target_org_id NULL → visible to all orgs; non-null → only matching org
 * - target_branch_code NULL → visible to all branches; non-null → only matching branch
 * - target_business_types empty → all types; non-empty → must include viewer's type
 *
 * NOTE: target_org_id / target_branch_code filtering is done client-side because
 * the current user's org context is resolved in-app (AuthContext → profiles.org_id).
 * A future optimisation could push this into an RPC or server-side filter.
 */
export async function fetchRecommendations(
  category?: string,
  businessTypeLabel?: string,
  viewerOrgId?: string | null,
  viewerBranchCode?: string | null,
): Promise<OperatorRecommendation[]> {
  let query = supabase
    .from("operator_recommendations" as any)
    .select("*")
    .eq("is_active", true)
    .order("priority", { ascending: true })
    .order("created_at", { ascending: false });

  if (category && category !== "all") {
    query = query.in("category", [category, "general"]);
  }

  const { data, error } = await query;
  if (error) { console.error("fetchRecommendations error", error); return []; }

  const today = new Date().toISOString().slice(0, 10);
  return ((data ?? []) as unknown as OperatorRecommendation[]).filter(r => {
    // Date range filter
    if (r.start_date && r.start_date > today) return false;
    if (r.end_date && r.end_date < today) return false;
    // Business type filter (empty = all types)
    if (businessTypeLabel && r.target_business_types?.length > 0) {
      if (!r.target_business_types.includes(businessTypeLabel)) return false;
    }
    // Org targeting: null = all orgs, non-null = exact match only
    if (r.target_org_id) {
      if (!viewerOrgId || r.target_org_id !== viewerOrgId) return false;
    }
    // Branch targeting: null = all branches, non-null = exact match only
    if (r.target_branch_code) {
      if (!viewerBranchCode || r.target_branch_code !== viewerBranchCode) return false;
    }
    return true;
  });
}
