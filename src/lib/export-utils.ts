/**
 * Export / Download utility functions for Phase 6.
 * Handles format recommendation, TXT generation, and placeholder interfaces
 * for future PDF/DOC/PPT server-side generation.
 */

import type { SavedResult } from "@/contexts/ResultStoreContext";
import type { GenerationResult, GenerationResultSection } from "@/lib/ai-generation";

// ──────────────────────────────────
// Format types
// ──────────────────────────────────

export type ExportFormat = "txt" | "doc" | "pdf" | "ppt";

/**
 * Minimal shape accepted by export helpers — works with both
 * SavedResult (saved) and GenerationResult (unsaved).
 */
export interface ExportableResult {
  title: string;
  businessType: string;
  module?: string;
  subtool?: string;
  sourceMenu?: string;
  sourceTool?: string;
  sections: GenerationResultSection[];
  createdAt: string;
  status: string;
  version?: number;
  category?: string;
  sourceNote?: string;
  referenceNote?: string;
}

export interface FormatOption {
  format: ExportFormat;
  label: string;
  description: string;
  available: boolean; // true = actually downloadable now
  recommended?: boolean;
}

// ──────────────────────────────────
// Format recommendation by category/type
// ──────────────────────────────────

const categoryFormatMap: Record<string, ExportFormat[]> = {
  "AI 비서 결과": ["txt", "doc"],
  "AI 운영팀 결과": ["doc", "pdf"],
  "AI 영업팀 결과": ["txt", "doc"],
  "AI 마케팅팀 결과": ["txt", "doc"],
  "AI 디자인팀 결과": ["ppt", "pdf"],
  "AI 경영지원 결과": ["doc", "pdf"],
  "시장조사 결과": ["doc", "pdf"],
  "전담 컨설턴트 결과": ["pdf", "doc"],
};

export function getRecommendedFormats(result: ExportableResult): FormatOption[] {
  const recommended = categoryFormatMap[result.category ?? ""] ?? ["txt", "doc"];
  const primary = recommended[0] ?? "txt";

  const allFormats: FormatOption[] = [
    {
      format: "txt",
      label: "텍스트 (TXT)",
      description: "서식 없는 텍스트 파일 — 즉시 다운로드",
      available: true,
      recommended: primary === "txt",
    },
    {
      format: "doc",
      label: "문서 (DOC)",
      description: "보고서·서식 문서 — 연결 준비 완료",
      available: false,
      recommended: primary === "doc",
    },
    {
      format: "pdf",
      label: "PDF",
      description: "인쇄·전달용 문서 — 연결 준비 완료",
      available: false,
      recommended: primary === "pdf",
    },
    {
      format: "ppt",
      label: "프레젠테이션 (PPT)",
      description: "발표·제안용 슬라이드 — 연결 준비 완료",
      available: false,
      recommended: primary === "ppt",
    },
  ];

  // Sort: recommended first, then available first
  return allFormats.sort((a, b) => {
    if (a.recommended && !b.recommended) return -1;
    if (!a.recommended && b.recommended) return 1;
    if (a.available && !b.available) return -1;
    if (!a.available && b.available) return 1;
    return 0;
  });
}

// ──────────────────────────────────
// TXT generation & download (real)
// ──────────────────────────────────

export function buildPlainTextExport(result: ExportableResult): string {
  const lines: string[] = [];
  lines.push(`# ${result.title}`);
  lines.push(`업종: ${result.businessType}`);
  lines.push(`모듈: ${result.module || result.sourceMenu || ""}`);
  lines.push(`도구: ${result.subtool || result.sourceTool || ""}`);
  lines.push(`생성일: ${result.createdAt}`);
  lines.push(`버전: v${result.version ?? 1}`);
  lines.push(`상태: ${result.status}`);
  lines.push("");
  lines.push("─".repeat(40));
  lines.push("");

  for (const section of result.sections) {
    lines.push(`## ${section.title}`);
    lines.push(section.content);
    lines.push("");
  }

  if (result.sourceNote) {
    lines.push(`📋 ${result.sourceNote}`);
  }
  if (result.referenceNote) {
    lines.push(`📎 ${result.referenceNote}`);
  }

  lines.push("");
  lines.push("─".repeat(40));
  lines.push("OkeyGolf OS · 결과 내보내기");

  return lines.join("\n");
}

export function downloadAsTextFile(content: string, fileName: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ──────────────────────────────────
// Safe filename
// ──────────────────────────────────

export function buildFileName(result: ExportableResult, format: ExportFormat): string {
  const safe = result.title
    .replace(/[^\w가-힣\s-]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 60);
  return `${safe}_v${result.version ?? 1}.${format}`;
}

// ──────────────────────────────────
// Share text builder
// ──────────────────────────────────

export function buildShareText(result: ExportableResult): string {
  const lines: string[] = [];
  lines.push(`📄 ${result.title}`);
  lines.push(`업종: ${result.businessType}`);
  lines.push(`생성: ${new Date(result.createdAt).toLocaleDateString("ko-KR")}`);
  lines.push(`버전: v${result.version ?? 1}`);
  lines.push("");
  // Include first section summary
  if (result.sections.length > 0) {
    const firstContent = result.sections[0].content.slice(0, 200);
    lines.push(firstContent + (result.sections[0].content.length > 200 ? "..." : ""));
  }
  lines.push("");
  lines.push("— OkeyGolf OS");
  return lines.join("\n");
}
