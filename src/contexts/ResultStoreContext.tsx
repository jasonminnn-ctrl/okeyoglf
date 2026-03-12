/**
 * ResultStoreContext — Central store for saved AI generation results.
 * Phase 10: DB-backed with localStorage 1-time import + fallback.
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";
import { insertDelivery } from "@/lib/repositories/delivery-repository";
import { insertConsultantRequest as repoInsertConsultant } from "@/lib/repositories/consultant-repository";
import { DEV_ORG_ID } from "@/lib/repositories/constants";
import type { GenerationResultSection } from "@/lib/ai-generation";

export type ResultStatus = "임시 저장" | "검토 필요" | "완료" | "전달 완료" | "보관됨";
export type ResultType = "generation" | "research" | "consultant" | "manual";

export interface AttachmentMeta {
  id: string;
  fileName: string;
  fileType: string;
  fileSizeBytes?: number;
  storagePath?: string;
  uploadedAt?: string;
}

export interface ExportFileRecord {
  id: string;
  format: "txt" | "doc" | "pdf" | "ppt" | "csv";
  fileName: string;
  exportedAt: string;
  exportedBy?: string;
}

export interface ShareRecord {
  id: string;
  method: "link" | "email" | "kakao" | "internal" | "copy_text" | "link_placeholder" | "internal_placeholder";
  sharedAt: string;
  sharedTo?: string;
  note?: string;
}

export interface DeliveryRecord {
  id: string;
  channel: "email" | "kakao" | "sms" | "internal" | "link" | "copy_text" | "export_pdf" | "export_doc" | "export_ppt" | "export_csv" | "export_txt";
  deliveredAt: string;
  recipient?: string;
  status: string;
  note?: string;
}

export interface ConsultantTransferRecord {
  id: string;
  transferredAt: string;
  requestNote?: string;
  status: "requested" | "in_progress" | "completed" | "cancelled";
  consultantNote?: string;
  assignedTo?: string;
}

export interface SavedResult {
  id: string;
  type: ResultType;
  title: string;
  module?: string;
  subtool?: string;
  sourceTool?: string;
  sourceMenu?: string;
  category: string;
  businessType: string;
  tags?: string[];
  outputFormat?: string;
  sections: GenerationResultSection[];
  plainText?: string;
  contextSummary?: unknown;
  createdAt: string;
  updatedAt: string;
  status: ResultStatus;
  version?: number;
  sourceNote?: string;
  referenceNote?: string;
  referenceId?: string;
  regeneratedFromId?: string;
  metadata?: Record<string, unknown>;
  attachments?: AttachmentMeta[];
  exportFiles?: ExportFileRecord[];
  shareHistory?: ShareRecord[];
  deliveryHistory?: DeliveryRecord[];
  consultantTransferHistory?: ConsultantTransferRecord[];
}

// ──────────────────────────────────
// localStorage import helpers
// ──────────────────────────────────

const STORAGE_KEY = "okeygolf_result_store";
const IMPORT_FLAG = "okeygolf_result_store_imported";

function loadFromStorage(): SavedResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as SavedResult[];
  } catch {
    return [];
  }
}

// ──────────────────────────────────
// DB mapper helpers
// ──────────────────────────────────

type DbSavedResult = Database["public"]["Tables"]["saved_results"]["Row"];
type DbDelivery = Database["public"]["Tables"]["result_deliveries"]["Row"];
type DbConsultant = Database["public"]["Tables"]["consultant_requests"]["Row"];
type DbAttachment = Database["public"]["Tables"]["result_attachments"]["Row"];

type DbDeliveryMethod = Database["public"]["Enums"]["delivery_method"];
type DbResultStatus = Database["public"]["Enums"]["result_status"];

const STATUS_TO_DB: Record<ResultStatus, DbResultStatus> = {
  "임시 저장": "draft",
  "검토 필요": "review",
  "완료": "done",
  "전달 완료": "delivered",
  "보관됨": "archived",
};

const STATUS_FROM_DB: Record<DbResultStatus, ResultStatus> = {
  draft: "임시 저장",
  review: "검토 필요",
  done: "완료",
  delivered: "전달 완료",
  archived: "보관됨",
};

const EXPORT_METHOD_TO_FORMAT: Partial<Record<DbDeliveryMethod, ExportFileRecord["format"]>> = {
  export_pdf: "pdf",
  export_doc: "doc",
  export_ppt: "ppt",
  export_csv: "csv",
  export_txt: "txt",
};

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function parseSections(value: Json): GenerationResultSection[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry, idx) => {
    const row = asRecord(entry);
    return {
      title: typeof row.title === "string" ? row.title : `섹션 ${idx + 1}`,
      content: typeof row.content === "string" ? row.content : "",
      type: (typeof row.type === "string" ? row.type : "detail") as GenerationResultSection["type"],
    };
  });
}

function parseArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function rowToSavedResult(row: DbSavedResult): SavedResult {
  const metadata = asRecord(row.metadata);

  return {
    id: row.id,
    type: row.type,
    title: row.title,
    module: row.module ?? undefined,
    subtool: row.subtool ?? undefined,
    sourceTool: row.source_tool ?? undefined,
    sourceMenu: row.source_menu ?? undefined,
    category: row.category,
    businessType: row.business_type,
    tags: row.tags ?? [],
    outputFormat: row.output_format ?? undefined,
    sections: parseSections(row.sections),
    plainText: row.plain_text ?? undefined,
    contextSummary: row.context_summary ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: STATUS_FROM_DB[row.status] ?? "임시 저장",
    version: row.version,
    sourceNote: row.source_note ?? undefined,
    referenceNote: row.reference_note ?? undefined,
    referenceId: row.reference_id ?? undefined,
    regeneratedFromId: row.regenerated_from_id ?? undefined,
    metadata,
    attachments: parseArray<AttachmentMeta>(metadata.attachments),
    exportFiles: parseArray<ExportFileRecord>(metadata.exportFiles),
    shareHistory: parseArray<ShareRecord>(metadata.shareHistory),
    deliveryHistory: parseArray<DeliveryRecord>(metadata.deliveryHistory),
    consultantTransferHistory: parseArray<ConsultantTransferRecord>(metadata.consultantTransferHistory),
  };
}

async function fetchResults(orgId: string): Promise<SavedResult[]> {
  const { data, error } = await supabase
    .from("saved_results")
    .select("*")
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("fetchResults error:", error);
    return [];
  }

  const rows = (data ?? []) as DbSavedResult[];
  if (rows.length === 0) return [];

  const resultIds = rows.map((row) => row.id);

  const [deliveryRes, consultantRes, attachmentRes] = await Promise.all([
    supabase.from("result_deliveries").select("*").in("result_id", resultIds).order("created_at", { ascending: false }),
    supabase.from("consultant_requests").select("*").in("result_id", resultIds).order("created_at", { ascending: false }),
    supabase.from("result_attachments").select("*").in("result_id", resultIds).order("created_at", { ascending: false }),
  ]);

  if (deliveryRes.error) console.error("fetchResults deliveries error:", deliveryRes.error);
  if (consultantRes.error) console.error("fetchResults consultant error:", consultantRes.error);
  if (attachmentRes.error) console.error("fetchResults attachments error:", attachmentRes.error);

  const deliveryMap = new Map<string, DbDelivery[]>();
  for (const row of ((deliveryRes.data ?? []) as DbDelivery[])) {
    const list = deliveryMap.get(row.result_id) ?? [];
    list.push(row);
    deliveryMap.set(row.result_id, list);
  }

  const consultantMap = new Map<string, DbConsultant[]>();
  for (const row of ((consultantRes.data ?? []) as DbConsultant[])) {
    const resultId = row.result_id;
    if (!resultId) continue;
    const list = consultantMap.get(resultId) ?? [];
    list.push(row);
    consultantMap.set(resultId, list);
  }

  const attachmentMap = new Map<string, DbAttachment[]>();
  for (const row of ((attachmentRes.data ?? []) as DbAttachment[])) {
    const list = attachmentMap.get(row.result_id) ?? [];
    list.push(row);
    attachmentMap.set(row.result_id, list);
  }

  return rows.map((row) => {
    const base = rowToSavedResult(row);

    const dbDeliveries = deliveryMap.get(row.id) ?? [];
    const exportFiles: ExportFileRecord[] = [];
    const shareHistory: ShareRecord[] = [];
    const deliveryHistory: DeliveryRecord[] = [];

    for (const d of dbDeliveries) {
      const metadata = asRecord(d.metadata);
      const exportFormat = EXPORT_METHOD_TO_FORMAT[d.method];

      if (exportFormat) {
        exportFiles.push({
          id: d.id,
          format: exportFormat,
          fileName: d.file_name ?? `${base.title}.${exportFormat}`,
          exportedAt: d.created_at,
          exportedBy: typeof metadata.exported_by === "string" ? metadata.exported_by : undefined,
        });
        continue;
      }

      if (metadata.is_delivery === true) {
        deliveryHistory.push({
          id: d.id,
          channel: d.method,
          deliveredAt: d.created_at,
          recipient: d.recipient ?? undefined,
          status: d.status,
          note: d.note ?? undefined,
        });
        continue;
      }

      let method = d.method as ShareRecord["method"];
      if ((method === "link" || method === "internal") && metadata.placeholder === true) {
        method = `${method}_placeholder` as ShareRecord["method"];
      }

      shareHistory.push({
        id: d.id,
        method,
        sharedAt: d.created_at,
        sharedTo: d.recipient ?? undefined,
        note: d.note ?? undefined,
      });
    }

    const consultantTransferHistory: ConsultantTransferRecord[] = (consultantMap.get(row.id) ?? []).map((req) => ({
      id: req.id,
      transferredAt: req.created_at,
      requestNote: req.request_note ?? undefined,
      status: req.status,
      consultantNote: req.consultant_note ?? undefined,
      assignedTo: req.assigned_to ?? undefined,
    }));

    const attachments: AttachmentMeta[] = (attachmentMap.get(row.id) ?? []).map((a) => ({
      id: a.id,
      fileName: a.file_name,
      fileType: a.file_type,
      fileSizeBytes: a.file_size_bytes ?? undefined,
      storagePath: a.storage_path ?? undefined,
      uploadedAt: a.created_at,
    }));

    return {
      ...base,
      exportFiles: exportFiles.length > 0 ? exportFiles : base.exportFiles,
      shareHistory: shareHistory.length > 0 ? shareHistory : base.shareHistory,
      deliveryHistory: deliveryHistory.length > 0 ? deliveryHistory : base.deliveryHistory,
      consultantTransferHistory: consultantTransferHistory.length > 0 ? consultantTransferHistory : base.consultantTransferHistory,
      attachments: attachments.length > 0 ? attachments : base.attachments,
    };
  });
}

async function upsertResult(result: SavedResult, orgId: string): Promise<void> {
  const metadata = {
    ...(result.metadata ?? {}),
    exportFiles: result.exportFiles ?? [],
    shareHistory: result.shareHistory ?? [],
    deliveryHistory: result.deliveryHistory ?? [],
    consultantTransferHistory: result.consultantTransferHistory ?? [],
    attachments: result.attachments ?? [],
  };

  const payload = {
    id: result.id,
    org_id: orgId,
    business_type: result.businessType,
    category: result.category,
    context_summary: (result.contextSummary ?? null) as unknown as Json,
    metadata: metadata as unknown as Json,
    module: result.module ?? null,
    output_format: result.outputFormat ?? null,
    plain_text: result.plainText ?? null,
    reference_id: result.referenceId ?? null,
    reference_note: result.referenceNote ?? null,
    regenerated_from_id: result.regeneratedFromId ?? null,
    sections: (result.sections ?? []) as unknown as Json,
    source_menu: result.sourceMenu ?? null,
    source_note: result.sourceNote ?? null,
    source_tool: result.sourceTool ?? null,
    status: STATUS_TO_DB[result.status] ?? "draft",
    subtool: result.subtool ?? null,
    tags: result.tags ?? [],
    title: result.title,
    type: result.type,
    version: result.version ?? 1,
    created_at: result.createdAt ?? new Date().toISOString(),
    updated_at: result.updatedAt ?? new Date().toISOString(),
  };

  const { error } = await supabase.from("saved_results").upsert(payload, { onConflict: "id" });
  if (error) console.error("upsertResult error:", error);
}

async function softDeleteResult(id: string): Promise<void> {
  const { error } = await supabase
    .from("saved_results")
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) console.error("softDeleteResult error:", error);
}

async function updateResultStatus(id: string, status: ResultStatus): Promise<void> {
  const { error } = await supabase
    .from("saved_results")
    .update({ status: STATUS_TO_DB[status], updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) console.error("updateResultStatus error:", error);
}

async function insertDeliveryRecord(
  resultId: string,
  orgId: string,
  method: string,
  extra?: { recipient?: string; status?: string; fileName?: string; note?: string; metadata?: Record<string, unknown> },
) {
  await insertDelivery(resultId, method, orgId, extra);
}

// ──────────────────────────────────
// Context Value (unchanged public API)
// ──────────────────────────────────

interface ResultStoreContextValue {
  results: SavedResult[];
  saveResult: (result: Omit<SavedResult, "updatedAt" | "version"> & { version?: number }) => void;
  updateResult: (id: string, patch: Partial<SavedResult>) => void;
  getResultsByCategory: (category: string) => SavedResult[];
  getResultsByType: (type: ResultType) => SavedResult[];
  getResultById: (id: string) => SavedResult | undefined;
  updateStatus: (id: string, status: ResultStatus) => void;
  deleteResult: (id: string) => void;
  duplicateResult: (id: string) => SavedResult | undefined;
  markResultExported: (id: string, record: ExportFileRecord) => void;
  markResultShared: (id: string, record: ShareRecord) => void;
  markResultDelivered: (id: string, record: DeliveryRecord) => void;
  markConsultantTransferred: (id: string, record: ConsultantTransferRecord) => void;
  markResultRegenerated: (id: string, newResultId: string) => void;
  totalCount: number;
  countByCategory: (category: string) => number;
  recentResults: (limit?: number) => SavedResult[];
  recentByType: (type: ResultType, limit?: number) => SavedResult[];
}

const ResultStoreContext = createContext<ResultStoreContextValue | undefined>(undefined);

// ──────────────────────────────────
// Helpers
// ──────────────────────────────────

const now = () => new Date().toISOString();
const uid = () => crypto.randomUUID();

function buildPlainText(sections: GenerationResultSection[]): string {
  return sections.map((s) => `${s.title}\n${s.content}`).join("\n\n");
}

// ──────────────────────────────────
// Provider
// ──────────────────────────────────

export function ResultStoreProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<SavedResult[]>([]);
  const [loaded, setLoaded] = useState(false);
  const importAttempted = useRef(false);

  // Initial load from DB + one-time localStorage import
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // 1. Load from DB
      const dbResults = await fetchResults(DEV_ORG_ID);

      if (cancelled) return;

      // 2. One-time localStorage import
      const alreadyImported = localStorage.getItem(IMPORT_FLAG) === "true";
      if (!alreadyImported && !importAttempted.current) {
        importAttempted.current = true;
        const localResults = loadFromStorage();
        if (localResults.length > 0) {
          const existingIds = new Set(dbResults.map((r) => r.id));
          const toImport = localResults.filter((r) => !existingIds.has(r.id));
          // Import to DB in background
          for (const r of toImport) {
            await upsertResult(r, DEV_ORG_ID);
          }
          // Merge for immediate display
          const merged = [...dbResults, ...toImport.map((r) => ({ ...r, updatedAt: r.updatedAt || now() }))];
          merged.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
          if (!cancelled) {
            setResults(merged);
            localStorage.setItem(IMPORT_FLAG, "true");
          }
        } else {
          if (!cancelled) setResults(dbResults);
          localStorage.setItem(IMPORT_FLAG, "true");
        }
      } else {
        if (!cancelled) setResults(dbResults);
      }

      if (!cancelled) setLoaded(true);
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    } catch {
      // no-op
    }
  }, [results, loaded]);

  const saveResult = useCallback((result: Omit<SavedResult, "updatedAt" | "version"> & { version?: number }) => {
    const timestamp = now();
    setResults((prev) => {
      const existing = prev.findIndex((r) => r.id === result.id);
      const version = result.version ?? 1;
      const plainText = result.plainText ?? buildPlainText(result.sections);
      let saved: SavedResult;
      if (existing >= 0) {
        saved = { ...result, version: (prev[existing].version ?? 1) + 1, plainText, updatedAt: timestamp };
        const updated = [...prev];
        updated[existing] = saved;
        void upsertResult(saved, DEV_ORG_ID);
        return updated;
      }
      saved = { ...result, version, plainText, updatedAt: timestamp };
      void upsertResult(saved, DEV_ORG_ID);
      return [saved, ...prev];
    });
  }, []);

  const updateResult = useCallback((id: string, patch: Partial<SavedResult>) => {
    setResults((prev) => {
      const updated = prev.map((r) => {
        if (r.id !== id) return r;
        const patched = { ...r, ...patch, updatedAt: now() };
        void upsertResult(patched, DEV_ORG_ID);
        return patched;
      });
      return updated;
    });
  }, []);

  const getResultsByCategory = useCallback((category: string) => results.filter((r) => r.category === category), [results]);
  const getResultsByType = useCallback((type: ResultType) => results.filter((r) => r.type === type), [results]);
  const getResultById = useCallback((id: string) => results.find((r) => r.id === id), [results]);

  const updateStatus = useCallback((id: string, status: ResultStatus) => {
    setResults((prev) => prev.map((r) => (r.id === id ? { ...r, status, updatedAt: now() } : r)));
    void updateResultStatus(id, status);
  }, []);

  const deleteResult = useCallback((id: string) => {
    setResults((prev) => prev.filter((r) => r.id !== id));
    void softDeleteResult(id);
  }, []);

  const duplicateResult = useCallback((id: string) => {
    const original = results.find((r) => r.id === id);
    if (!original) return undefined;
    const dup: SavedResult = {
      ...original,
      id: uid(),
      title: `${original.title} (복사)`,
      status: "임시 저장",
      version: 1,
      createdAt: now(),
      updatedAt: now(),
      regeneratedFromId: undefined,
      exportFiles: [],
      shareHistory: [],
      deliveryHistory: [],
      consultantTransferHistory: [],
    };
    setResults((prev) => [dup, ...prev]);
    void upsertResult(dup, DEV_ORG_ID);
    return dup;
  }, [results]);

  const markResultExported = useCallback((id: string, record: ExportFileRecord) => {
    setResults((prev) => prev.map((r) => (r.id !== id ? r : { ...r, exportFiles: [...(r.exportFiles ?? []), record], updatedAt: now() })));
    const formatToMethod: Record<string, string> = { pdf: "export_pdf", doc: "export_doc", ppt: "export_ppt", csv: "export_csv", txt: "export_txt" };
    void insertDeliveryRecord(id, DEV_ORG_ID, formatToMethod[record.format] || "export_pdf", {
      fileName: record.fileName,
      metadata: { exported_by: record.exportedBy },
    });
  }, []);

  const markResultShared = useCallback((id: string, record: ShareRecord) => {
    setResults((prev) => prev.map((r) => (r.id !== id ? r : { ...r, shareHistory: [...(r.shareHistory ?? []), record], updatedAt: now() })));
    const isPlaceholder = record.method.endsWith("_placeholder");
    const dbMethod = isPlaceholder ? record.method.replace("_placeholder", "") : record.method;
    void insertDeliveryRecord(id, DEV_ORG_ID, dbMethod, {
      recipient: record.sharedTo,
      note: record.note,
      metadata: isPlaceholder ? { placeholder: true } : {},
    });
  }, []);

  const markResultDelivered = useCallback((id: string, record: DeliveryRecord) => {
    setResults((prev) => prev.map((r) => (r.id !== id ? r : { ...r, deliveryHistory: [...(r.deliveryHistory ?? []), record], updatedAt: now() })));
    void insertDeliveryRecord(id, DEV_ORG_ID, record.channel, {
      recipient: record.recipient,
      status: record.status,
      note: record.note,
      metadata: { is_delivery: true },
    });
  }, []);

  const markConsultantTransferred = useCallback((id: string, record: ConsultantTransferRecord) => {
    setResults((prev) => prev.map((r) => (r.id !== id ? r : {
      ...r,
      consultantTransferHistory: [...(r.consultantTransferHistory ?? []), record],
      status: "전달 완료" as ResultStatus,
      updatedAt: now(),
    })));
    void repoInsertConsultant(DEV_ORG_ID, id, record.requestNote);
    void updateResultStatus(id, "전달 완료");
  }, []);

  const markResultRegenerated = useCallback((id: string, newResultId: string) => {
    setResults((prev) => prev.map((r) => (r.id !== id ? r : { ...r, metadata: { ...r.metadata, lastRegeneratedTo: newResultId }, updatedAt: now() })));
    // Update metadata in DB
    const result = results.find((r) => r.id === id);
    if (result) {
      void upsertResult({ ...result, metadata: { ...result.metadata, lastRegeneratedTo: newResultId }, updatedAt: now() }, DEV_ORG_ID);
    }
  }, [results]);

  const recentResults = useCallback((limit = 5) => [...results].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, limit), [results]);
  const recentByType = useCallback((type: ResultType, limit = 5) => results.filter((r) => r.type === type).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, limit), [results]);
  const countByCategory = useCallback((category: string) => results.filter((r) => r.category === category).length, [results]);

  return (
    <ResultStoreContext.Provider value={{
      results,
      saveResult,
      updateResult,
      getResultsByCategory,
      getResultsByType,
      getResultById,
      updateStatus,
      deleteResult,
      duplicateResult,
      markResultExported,
      markResultShared,
      markResultDelivered,
      markConsultantTransferred,
      markResultRegenerated,
      totalCount: results.length,
      countByCategory,
      recentResults,
      recentByType,
    }}>
      {children}
    </ResultStoreContext.Provider>
  );
}

export function useResultStore() {
  const ctx = useContext(ResultStoreContext);
  if (!ctx) throw new Error("useResultStore must be inside ResultStoreProvider");
  return ctx;
}
