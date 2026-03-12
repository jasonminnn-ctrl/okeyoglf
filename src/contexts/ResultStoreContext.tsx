/**
 * ResultStoreContext — Central store for saved AI generation results.
 * Phase 10: DB-backed with localStorage 1-time import + fallback.
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { fetchResults, upsertResult, softDeleteResult, updateResultStatus as repoUpdateStatus, insertDeliveryRecord, insertConsultantRequest as repoInsertConsultant } from "@/lib/repositories/result-repository";
import { DEV_ORG_ID } from "@/lib/repositories/constants";

// Re-export all types from shared file for backward compatibility
export type { ResultStatus, ResultType, AttachmentMeta, ExportFileRecord, ShareRecord, DeliveryRecord, ConsultantTransferRecord, SavedResult } from "@/lib/result-types";
import type { SavedResult, ResultStatus, ResultType, ExportFileRecord, ShareRecord, DeliveryRecord, ConsultantTransferRecord } from "@/lib/result-types";
import type { GenerationResultSection } from "@/lib/ai-generation";

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
  } catch { return []; }
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
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function buildPlainText(sections: GenerationResultSection[]): string {
  return sections.map(s => `${s.title}\n${s.content}`).join("\n\n");
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
          const existingIds = new Set(dbResults.map(r => r.id));
          const toImport = localResults.filter(r => !existingIds.has(r.id));
          // Import to DB in background
          for (const r of toImport) {
            await upsertResult(r, DEV_ORG_ID);
          }
          // Merge for immediate display
          const merged = [...dbResults, ...toImport.map(r => ({ ...r, updatedAt: r.updatedAt || now() }))];
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
    return () => { cancelled = true; };
  }, []);

  const saveResult = useCallback((result: Omit<SavedResult, "updatedAt" | "version"> & { version?: number }) => {
    const timestamp = now();
    setResults(prev => {
      const existing = prev.findIndex(r => r.id === result.id);
      const version = result.version ?? 1;
      const plainText = result.plainText ?? buildPlainText(result.sections);
      let saved: SavedResult;
      if (existing >= 0) {
        saved = { ...result, version: (prev[existing].version ?? 1) + 1, plainText, updatedAt: timestamp };
        const updated = [...prev];
        updated[existing] = saved;
        upsertResult(saved, DEV_ORG_ID);
        return updated;
      }
      saved = { ...result, version, plainText, updatedAt: timestamp };
      upsertResult(saved, DEV_ORG_ID);
      return [saved, ...prev];
    });
  }, []);

  const updateResult = useCallback((id: string, patch: Partial<SavedResult>) => {
    setResults(prev => {
      const updated = prev.map(r => {
        if (r.id !== id) return r;
        const patched = { ...r, ...patch, updatedAt: now() };
        upsertResult(patched, DEV_ORG_ID);
        return patched;
      });
      return updated;
    });
  }, []);

  const getResultsByCategory = useCallback((category: string) => results.filter(r => r.category === category), [results]);
  const getResultsByType = useCallback((type: ResultType) => results.filter(r => r.type === type), [results]);
  const getResultById = useCallback((id: string) => results.find(r => r.id === id), [results]);

  const updateStatus = useCallback((id: string, status: ResultStatus) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, status, updatedAt: now() } : r));
    repoUpdateStatus(id, status);
  }, []);

  const deleteResult = useCallback((id: string) => {
    setResults(prev => prev.filter(r => r.id !== id));
    softDeleteResult(id);
  }, []);

  const duplicateResult = useCallback((id: string) => {
    const original = results.find(r => r.id === id);
    if (!original) return undefined;
    const dup: SavedResult = {
      ...original,
      id: `dup-${uid()}`,
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
    setResults(prev => [dup, ...prev]);
    upsertResult(dup, DEV_ORG_ID);
    return dup;
  }, [results]);

  const markResultExported = useCallback((id: string, record: ExportFileRecord) => {
    setResults(prev => prev.map(r => r.id !== id ? r : { ...r, exportFiles: [...(r.exportFiles ?? []), record], updatedAt: now() }));
    const formatToMethod: Record<string, string> = { pdf: "export_pdf", doc: "export_doc", ppt: "export_ppt", csv: "export_csv", txt: "export_txt" };
    insertDeliveryRecord(id, DEV_ORG_ID, formatToMethod[record.format] || "export_pdf", {
      fileName: record.fileName,
      metadata: { exported_by: record.exportedBy },
    });
  }, []);

  const markResultShared = useCallback((id: string, record: ShareRecord) => {
    setResults(prev => prev.map(r => r.id !== id ? r : { ...r, shareHistory: [...(r.shareHistory ?? []), record], updatedAt: now() }));
    const isPlaceholder = record.method.endsWith("_placeholder");
    const dbMethod = isPlaceholder ? record.method.replace("_placeholder", "") : record.method;
    insertDeliveryRecord(id, DEV_ORG_ID, dbMethod, {
      recipient: record.sharedTo,
      note: record.note,
      metadata: isPlaceholder ? { placeholder: true } : {},
    });
  }, []);

  const markResultDelivered = useCallback((id: string, record: DeliveryRecord) => {
    setResults(prev => prev.map(r => r.id !== id ? r : { ...r, deliveryHistory: [...(r.deliveryHistory ?? []), record], updatedAt: now() }));
    insertDeliveryRecord(id, DEV_ORG_ID, record.channel, {
      recipient: record.recipient,
      status: record.status,
      note: record.note,
      metadata: { is_delivery: true },
    });
  }, []);

  const markConsultantTransferred = useCallback((id: string, record: ConsultantTransferRecord) => {
    setResults(prev => prev.map(r => r.id !== id ? r : {
      ...r,
      consultantTransferHistory: [...(r.consultantTransferHistory ?? []), record],
      status: "전달 완료" as ResultStatus,
      updatedAt: now(),
    }));
    repoInsertConsultant(id, DEV_ORG_ID, record.requestNote);
    repoUpdateStatus(id, "전달 완료");
  }, []);

  const markResultRegenerated = useCallback((id: string, newResultId: string) => {
    setResults(prev => prev.map(r => r.id !== id ? r : { ...r, metadata: { ...r.metadata, lastRegeneratedTo: newResultId }, updatedAt: now() }));
    // Update metadata in DB
    const result = results.find(r => r.id === id);
    if (result) {
      upsertResult({ ...result, metadata: { ...result.metadata, lastRegeneratedTo: newResultId }, updatedAt: now() }, DEV_ORG_ID);
    }
  }, [results]);

  const recentResults = useCallback((limit = 5) => [...results].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, limit), [results]);
  const recentByType = useCallback((type: ResultType, limit = 5) => results.filter(r => r.type === type).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, limit), [results]);
  const countByCategory = useCallback((category: string) => results.filter(r => r.category === category).length, [results]);

  return (
    <ResultStoreContext.Provider value={{
      results, saveResult, updateResult, getResultsByCategory, getResultsByType, getResultById,
      updateStatus, deleteResult, duplicateResult, markResultExported, markResultShared,
      markResultDelivered, markConsultantTransferred, markResultRegenerated,
      totalCount: results.length, countByCategory, recentResults, recentByType,
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
