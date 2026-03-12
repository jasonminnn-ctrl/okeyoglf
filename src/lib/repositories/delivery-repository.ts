/**
 * Delivery Repository (Phase 10)
 * Append-only for result_deliveries + result_attachments.
 */

import { supabase } from "@/integrations/supabase/client";
import { DEV_ORG_ID } from "./constants";

type DbDeliveryMethod = "copy_text" | "email" | "export_csv" | "export_doc" | "export_pdf" | "export_ppt" | "export_txt" | "internal" | "kakao" | "link" | "sms";

export async function insertDelivery(
  resultId: string,
  method: string,
  orgId: string = DEV_ORG_ID,
  extra?: { recipient?: string; status?: string; fileName?: string; note?: string; metadata?: Record<string, unknown> },
): Promise<boolean> {
  const row: Record<string, unknown> = {
    result_id: resultId,
    org_id: orgId,
    method: method as DbDeliveryMethod,
    recipient: extra?.recipient ?? null,
    status: extra?.status ?? "sent",
    file_name: extra?.fileName ?? null,
    note: extra?.note ?? null,
    metadata: extra?.metadata ?? {},
  };
  const { error } = await supabase.from("result_deliveries").insert(row as never);
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
  const row: Record<string, unknown> = {
    result_id: resultId,
    org_id: orgId,
    file_name: fileName,
    file_type: fileType,
    storage_path: storagePath ?? null,
    file_size_bytes: fileSizeBytes ?? null,
  };
  const { error } = await supabase.from("result_attachments").insert(row as never);
  if (error) { console.error("insertAttachment error:", error); return false; }
  return true;
}

export async function deleteAttachment(id: string): Promise<boolean> {
  const { error } = await supabase.from("result_attachments").delete().eq("id", id);
  if (error) { console.error("deleteAttachment error:", error); return false; }
  return true;
}
