/**
 * ResultStoreContext — Central store for saved AI generation results.
 * Expanded for Phase 6 (download / share / deliver) readiness.
 * Mock/local state now; designed for future Supabase migration.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { BusinessContextSummary, GenerationResultSection } from "@/lib/ai-generation";

// ──────────────────────────────────
// Status & Types
// ──────────────────────────────────

export type ResultStatus = "임시 저장" | "검토 필요" | "완료" | "전달 완료" | "보관됨";
export type ResultType = "generation" | "research" | "consultant" | "manual";

export interface AttachmentMeta {
  id: string;
  fileName: string;
  fileType: string;
  url?: string;
  addedAt: string;
}

export interface ExportFileRecord {
  id: string;
  format: "pdf" | "doc" | "ppt" | "txt" | "csv";
  fileName: string;
  exportedAt: string;
  exportedBy?: string;
}

export interface ShareRecord {
  id: string;
  method: "link" | "email" | "kakao" | "internal";
  sharedAt: string;
  sharedTo?: string;
  note?: string;
}

export interface DeliveryRecord {
  id: string;
  channel: "email" | "kakao" | "sms" | "internal";
  deliveredAt: string;
  recipient?: string;
  status: "sent" | "delivered" | "failed";
  note?: string;
}

export interface ConsultantTransferRecord {
  id: string;
  transferredAt: string;
  requestNote?: string;
  status: "requested" | "in_progress" | "completed" | "cancelled";
  consultantNote?: string;
}

export interface SavedResult {
  id: string;
  type: ResultType;
  title: string;
  category: string;
  businessType: string;
  createdAt: string;
  updatedAt: string;
  status: ResultStatus;
  sections: GenerationResultSection[];
  plainText?: string;
  sourceTool?: string;
  sourceMenu?: string;
  /** Legacy compat */
  module?: string;
  subtool?: string;
  referenceId?: string;
  tags?: string[];
  outputFormat?: string;
  version?: number;
  regeneratedFromId?: string;
  contextSummary?: BusinessContextSummary;
  sourceNote?: string;
  referenceNote?: string;
  attachments?: AttachmentMeta[];
  exportFiles?: ExportFileRecord[];
  shareHistory?: ShareRecord[];
  deliveryHistory?: DeliveryRecord[];
  consultantTransferHistory?: ConsultantTransferRecord[];
  metadata?: Record<string, unknown>;
}

// ──────────────────────────────────
// Context Value
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

  const saveResult = useCallback((result: Omit<SavedResult, "updatedAt" | "version"> & { version?: number }) => {
    const timestamp = now();
    setResults(prev => {
      const existing = prev.findIndex(r => r.id === result.id);
      const version = result.version ?? 1;
      const plainText = result.plainText ?? buildPlainText(result.sections);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...result, version: (prev[existing].version ?? 1) + 1, plainText, updatedAt: timestamp };
        return updated;
      }
      return [{ ...result, version, plainText, updatedAt: timestamp }, ...prev];
    });
  }, []);

  const updateResult = useCallback((id: string, patch: Partial<SavedResult>) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, ...patch, updatedAt: now() } : r));
  }, []);

  const getResultsByCategory = useCallback((category: string) => {
    return results.filter(r => r.category === category);
  }, [results]);

  const getResultsByType = useCallback((type: ResultType) => {
    return results.filter(r => r.type === type);
  }, [results]);

  const getResultById = useCallback((id: string) => {
    return results.find(r => r.id === id);
  }, [results]);

  const updateStatus = useCallback((id: string, status: ResultStatus) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, status, updatedAt: now() } : r));
  }, []);

  const deleteResult = useCallback((id: string) => {
    setResults(prev => prev.filter(r => r.id !== id));
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
    return dup;
  }, [results]);

  const markResultExported = useCallback((id: string, record: ExportFileRecord) => {
    setResults(prev => prev.map(r => {
      if (r.id !== id) return r;
      return { ...r, exportFiles: [...(r.exportFiles ?? []), record], updatedAt: now() };
    }));
  }, []);

  const markResultShared = useCallback((id: string, record: ShareRecord) => {
    setResults(prev => prev.map(r => {
      if (r.id !== id) return r;
      return { ...r, shareHistory: [...(r.shareHistory ?? []), record], updatedAt: now() };
    }));
  }, []);

  const markResultDelivered = useCallback((id: string, record: DeliveryRecord) => {
    setResults(prev => prev.map(r => {
      if (r.id !== id) return r;
      return { ...r, deliveryHistory: [...(r.deliveryHistory ?? []), record], updatedAt: now() };
    }));
  }, []);

  const markConsultantTransferred = useCallback((id: string, record: ConsultantTransferRecord) => {
    setResults(prev => prev.map(r => {
      if (r.id !== id) return r;
      return {
        ...r,
        consultantTransferHistory: [...(r.consultantTransferHistory ?? []), record],
        status: "전달 완료" as ResultStatus,
        updatedAt: now(),
      };
    }));
  }, []);

  const markResultRegenerated = useCallback((id: string, newResultId: string) => {
    setResults(prev => prev.map(r => {
      if (r.id !== id) return r;
      return { ...r, metadata: { ...r.metadata, lastRegeneratedTo: newResultId }, updatedAt: now() };
    }));
  }, []);

  const recentResults = useCallback((limit = 5) => {
    return [...results].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, limit);
  }, [results]);

  const recentByType = useCallback((type: ResultType, limit = 5) => {
    return results.filter(r => r.type === type).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, limit);
  }, [results]);

  const countByCategory = useCallback((category: string) => {
    return results.filter(r => r.category === category).length;
  }, [results]);

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
