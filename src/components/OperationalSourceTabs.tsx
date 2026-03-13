/**
 * OperationalSourceTabs — 운영형 페이지 공통 source 분류 탭
 * 전체 / 직접 등록 / AI 제안(또는 AI 초안) / 운영 권장(또는 운영 템플릿)
 */

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListChecks, Sparkles, ShieldAlert } from "lucide-react";

export interface SourceTabConfig {
  allLabel?: string;
  manualLabel?: string;
  aiLabel?: string;
  opsLabel?: string;
  totalCount?: number;
}

interface Props {
  value: string;
  onValueChange: (value: string) => void;
  config?: SourceTabConfig;
}

export function OperationalSourceTabs({ value, onValueChange, config = {} }: Props) {
  const {
    allLabel = "전체",
    manualLabel = "직접 등록",
    aiLabel = "AI 제안",
    opsLabel = "운영 권장",
    totalCount,
  } = config;

  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList className="h-8">
        <TabsTrigger value="all" className="text-xs h-7 px-3">
          {allLabel}{totalCount !== undefined ? ` (${totalCount})` : ""}
        </TabsTrigger>
        <TabsTrigger value="manual" className="text-xs h-7 px-3 gap-1">
          <ListChecks className="h-3 w-3" /> {manualLabel}
        </TabsTrigger>
        <TabsTrigger value="ai" className="text-xs h-7 px-3 gap-1">
          <Sparkles className="h-3 w-3" /> {aiLabel}
        </TabsTrigger>
        <TabsTrigger value="ops" className="text-xs h-7 px-3 gap-1">
          <ShieldAlert className="h-3 w-3" /> {opsLabel}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

/** Helper to filter items by source tab value */
export function filterBySourceTab<T extends { source_type?: string; risk_source?: string }>(
  items: T[],
  tab: string,
): T[] {
  if (tab === "all") return items;
  if (tab === "ai") return items.filter(i => i.source_type === "ai_generated" || i.risk_source === "ai_suggested");
  if (tab === "ops") return items.filter(i => i.source_type === "ops_recommended" || i.risk_source === "ops_recommended");
  // manual
  return items.filter(i => {
    const src = i.source_type || i.risk_source || "user_created";
    return src === "user_created" || (!["ai_generated", "ops_recommended"].includes(src) && !["ai_suggested", "ops_recommended"].includes(i.risk_source || ""));
  });
}
