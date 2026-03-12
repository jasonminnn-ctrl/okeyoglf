/**
 * Delivery Repository (Phase 10)
 * Append-only for result_deliveries + result_attachments.
 */

import { supabase } from "@/integrations/supabase/client";
import { DEV_ORG_ID } from "./constants";

export async function insertDelivery(
  resultId: string,
  method: string,
  orgId: string = DEV_ORG_ID,
  extra?: { recipient?: string; status?: string; fileName?: string; note?: string; metadata?: Record<string, unknown> },
): Promise<boolean> {
  const { error } = await supabase.from("result_deliveries").insert({
    result_id: resultId,
    org_id: orgId,
    method,
    recipient: extra?.recipient,
    status: extra?.status ?? "sent",
    file_name: extra?.fileName,
    note: extra?.note,
    metadata: extra?.metadata ?? {},
  });
  if (error) { console.error("insertDelivery error:", error); return false; }
  return true;
}

export async function fetchDeliveriesByResult(resultId: string) {
  const { data, error } = await supabase
    .from("result_deliveries")
    .select("*")
    .eq("result_id", resultId)
    .order("created_at", { ascending: false });
  if (error) { console.error("fetchDeliveriesByResult error:", error); return []; }
  return data ?? [];
}

export async function insertAttachment(
  resultId: string,
  orgId: string = DEV_ORG_ID,
  fileName: string,
  fileType: string,
  storagePath?: string,
  fileSizeBytes?: number,
): Promise<boolean> {
  const { error } = await supabase.from("result_attachments").insert({
    result_id: resultId,
    org_id: orgId,
    file_name: fileName,
    file_type: fileType,
    storage_path: storagePath,
    file_size_bytes: fileSizeBytes,
  });
  if (error) { console.error("insertAttachment error:", error); return false; }
  return true;
}

export async function deleteAttachment(id: string): Promise<boolean> {
  const { error } = await supabase.from("result_attachments").delete().eq("id", id);
  if (error) { console.error("deleteAttachment error:", error); return false; }
  return true;
}
