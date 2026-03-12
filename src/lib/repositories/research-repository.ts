/**
 * Research Repository (Phase 10)
 * CRUD for research_requests with payload JSONB support.
 */

import { supabase } from "@/integrations/supabase/client";
import { DEV_ORG_ID } from "./constants";
import type { ResearchRequest, ResearchRequestStatus } from "@/lib/market-research";

// ── Status mapping ──
const STATUS_TO_DB: Record<string, string> = {
  requested: "requested",
  processing_placeholder: "processing",
  completed: "completed",
  consultant_handoff: "consultant_handoff",
};

const STATUS_FROM_DB: Record<string, ResearchRequestStatus> = {
  requested: "requested",
  processing: "processing_placeholder",
  completed: "completed",
  consultant_handoff: "consultant_handoff",
  failed: "requested", // fallback
};

// ── Row → ResearchRequest ──
function rowToRequest(row: Record<string, unknown>): ResearchRequest {
  const payload = (row.request_payload ?? {}) as Record<string, unknown>;
  return {
    id: row.id as string,
    createdAt: row.requested_at as string,
    updatedAt: (row.completed_at as string) ?? (row.requested_at as string),
    status: STATUS_FROM_DB[row.status as string] ?? "requested",
    businessType: (payload.businessType as string) ?? "",
    businessTypeLabel: (payload.businessTypeLabel as string) ?? "",
    region: (payload.region as string) ?? "",
    keyword: (payload.keyword as string) ?? "",
    purpose: (payload.purpose as string) ?? "",
    scope: (payload.scope as string) ?? "",
    count: (payload.count as string) ?? "20",
    memo: (payload.memo as string) ?? "",
    linkedResultId: row.result_id as string | undefined,
    sourceType: (payload.sourceType as ResearchRequest["sourceType"]) ?? "ai_internal",
    collectionStatus: payload.collectionStatus as ResearchRequest["collectionStatus"],
    sourceSummary: payload.sourceSummary as string | undefined,
    externalCollectionPlanned: (payload.externalCollectionPlanned as boolean) ?? false,
  };
}

// ── Fetch all ──
export async function fetchResearchRequests(orgId: string = DEV_ORG_ID): Promise<ResearchRequest[]> {
  const { data, error } = await supabase
    .from("research_requests")
    .select("*")
    .eq("org_id", orgId)
    .order("requested_at", { ascending: false });
  if (error) { console.error("fetchResearchRequests error:", error); return []; }
  return (data ?? []).map(row => rowToRequest(row as Record<string, unknown>));
}

// ── Insert ──
export async function insertResearchRequest(req: ResearchRequest, orgId: string = DEV_ORG_ID): Promise<boolean> {
  const payload = {
    businessType: req.businessType,
    businessTypeLabel: req.businessTypeLabel,
    region: req.region,
    keyword: req.keyword,
    purpose: req.purpose,
    scope: req.scope,
    count: req.count,
    memo: req.memo,
    sourceType: req.sourceType,
    collectionStatus: req.collectionStatus,
    externalCollectionPlanned: req.externalCollectionPlanned,
    sourceSummary: req.sourceSummary,
  };

  const { error } = await supabase.from("research_requests").insert({
    id: req.id,
    org_id: orgId,
    query: `${req.businessTypeLabel} ${req.scope} ${req.keyword}`.trim(),
    research_type: req.scope,
    status: STATUS_TO_DB[req.status] ?? "requested",
    request_payload: payload,
    result_id: req.linkedResultId ?? null,
    requested_at: req.createdAt,
  });
  if (error) { console.error("insertResearchRequest error:", error); return false; }
  return true;
}

// ── Update status ──
export async function updateResearchStatus(
  id: string,
  status: ResearchRequestStatus,
  extra?: { resultId?: string; resultPayload?: Record<string, unknown>; sourceSummary?: string },
): Promise<boolean> {
  const update: Record<string, unknown> = {
    status: STATUS_TO_DB[status] ?? "requested",
  };
  if (status === "completed" || status === "consultant_handoff") {
    update.completed_at = new Date().toISOString();
  }
  if (extra?.resultId) update.result_id = extra.resultId;
  if (extra?.resultPayload) update.result_payload = extra.resultPayload;
  if (extra?.sourceSummary) {
    // Merge into request_payload
    const { data: existing } = await supabase
      .from("research_requests")
      .select("request_payload")
      .eq("id", id)
      .maybeSingle();
    const prev = (existing?.request_payload ?? {}) as Record<string, unknown>;
    update.request_payload = { ...prev, sourceSummary: extra.sourceSummary };
  }

  const { error } = await supabase.from("research_requests").update(update).eq("id", id);
  if (error) { console.error("updateResearchStatus error:", error); return false; }
  return true;
}
