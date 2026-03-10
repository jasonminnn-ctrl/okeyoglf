/**
 * ResultStoreContext — Central store for saved AI generation results.
 * Mock/local state now; designed for future Supabase migration.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { BusinessContextSummary, GenerationResultSection } from "@/lib/ai-generation";

export type ResultStatus = "임시 저장" | "검토 필요" | "완료" | "전달 완료" | "보관됨";

export interface SavedResult {
  id: string;
  title: string;
  module: string;
  subtool: string;
  category: string;
  businessType: string;
  sections: GenerationResultSection[];
  contextSummary: BusinessContextSummary;
  createdAt: string;
  updatedAt: string;
  status: ResultStatus;
  sourceNote?: string;
  referenceNote?: string;
}

interface ResultStoreContextValue {
  results: SavedResult[];
  saveResult: (result: Omit<SavedResult, "updatedAt">) => void;
  getResultsByCategory: (category: string) => SavedResult[];
  getResultById: (id: string) => SavedResult | undefined;
  updateStatus: (id: string, status: ResultStatus) => void;
  deleteResult: (id: string) => void;
  totalCount: number;
  countByCategory: (category: string) => number;
}

const ResultStoreContext = createContext<ResultStoreContextValue | undefined>(undefined);

export function ResultStoreProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<SavedResult[]>([]);

  const saveResult = useCallback((result: Omit<SavedResult, "updatedAt">) => {
    const now = new Date().toISOString();
    setResults(prev => {
      const existing = prev.findIndex(r => r.id === result.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...result, updatedAt: now };
        return updated;
      }
      return [{ ...result, updatedAt: now }, ...prev];
    });
  }, []);

  const getResultsByCategory = useCallback((category: string) => {
    return results.filter(r => r.category === category);
  }, [results]);

  const getResultById = useCallback((id: string) => {
    return results.find(r => r.id === id);
  }, [results]);

  const updateStatus = useCallback((id: string, status: ResultStatus) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r));
  }, []);

  const deleteResult = useCallback((id: string) => {
    setResults(prev => prev.filter(r => r.id !== id));
  }, []);

  const countByCategory = useCallback((category: string) => {
    return results.filter(r => r.category === category).length;
  }, [results]);

  return (
    <ResultStoreContext.Provider value={{
      results,
      saveResult,
      getResultsByCategory,
      getResultById,
      updateStatus,
      deleteResult,
      totalCount: results.length,
      countByCategory,
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
