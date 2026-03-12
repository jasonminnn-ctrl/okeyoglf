/**
 * Consultant Repository (Phase 10)
 * CRUD for consultant_requests table.
 */

import { supabase } from "@/integrations/supabase/client";
import { DEV_ORG_ID } from "./constants";

export interface ConsultantRequestRow {
  id: string;
  org_id: string;
  result_id: string | null;
  request_type: string;
  status: string;
  request_note: string | null;
  consultant_note: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchConsultantRequests(orgId: string = DEV_ORG_ID): Promise<ConsultantRequestRow[]> {
  const { data, error } = await supabase
    .from("consultant_requests")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });
  if (error) { console.error("fetchConsultantRequests error:", error); return []; }
  return (data ?? []) as ConsultantRequestRow[];
}

export async function insertConsultantRequest(
  orgId: string,
  resultId: string | null,
  requestNote?: string,
  requestType: string = "request",
): Promise<boolean> {
  const { error } = await supabase.from("consultant_requests").insert({
    org_id: orgId,
    result_id: resultId,
    request_type: requestType,
    status: "requested",
    request_note: requestNote,
  });
  if (error) { console.error("insertConsultantRequest error:", error); return false; }
  return true;
}

export async function updateConsultantStatus(id: string, status: string, note?: string): Promise<boolean> {
  const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (note !== undefined) update.consultant_note = note;
  const { error } = await supabase.from("consultant_requests").update(update).eq("id", id);
  if (error) { console.error("updateConsultantStatus error:", error); return false; }
  return true;
}
