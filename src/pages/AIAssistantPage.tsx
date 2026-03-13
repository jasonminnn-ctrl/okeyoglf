import { useState, useCallback } from "react";
import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { AIWorkspace } from "@/components/AIWorkspace";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { useMembership } from "@/contexts/MembershipContext";
import { FEATURE_KEYS } from "@/lib/membership";
import { Bot, ListChecks, AlertCircle, Megaphone, CalendarClock, ClipboardCheck, Zap } from "lucide-react";

const sectionKeys = [
  { key: "오늘의 할 일", icon: ListChecks, color: "bg-primary/10 text-primary", url: "/ai-assistant/daily-tasks", featureKey: FEATURE_KEYS.ASSISTANT_DAILY,
    prompt: "오늘 해야 할 운영 업무를 정리해 주세요. 미방문 회원, 예약 확인, 프로모션 점검 등을 포함해 주세요." },
  { key: "이번 주 추천 액션", icon: Zap, color: "bg-amber-500/10 text-amber-400", url: "/ai-assistant/weekly-actions", featureKey: FEATURE_KEYS.ASSISTANT_WEEKLY,
    prompt: "이번 주에 실행하면 좋을 운영 액션을 추천해 주세요. 매출, 회원 유지, 캠페인 관점에서 알려주세요." },
  { key: "놓치고 있는 운영 항목", icon: AlertCircle, color: "bg-red-500/10 text-red-400", featureKey: FEATURE_KEYS.ASSISTANT_MISSING,
    prompt: "현재 놓치고 있을 수 있는 운영 항목을 점검해 주세요. 안내 미발송, 점검 미실시 등을 확인해 주세요." },
  { key: "캠페인 추천", icon: Megaphone, color: "bg-blue-500/10 text-blue-400", featureKey: FEATURE_KEYS.ASSISTANT_CAMPAIGN,
    prompt: "지금 시점에 적합한 마케팅 캠페인을 추천해 주세요. 시즌, 회원 세그먼트, 프로모션 유형을 고려해 주세요." },
  { key: "일정/마감 리마인드", icon: CalendarClock, color: "bg-violet-500/10 text-violet-400", featureKey: FEATURE_KEYS.ASSISTANT_REMINDER,
    prompt: "곧 다가오는 일정과 마감 사항을 정리해 주세요. 계약 갱신, 정산, 이벤트 마감 등을 포함해 주세요." },
  { key: "업종별 체크리스트", icon: ClipboardCheck, color: "bg-emerald-500/10 text-emerald-400", url: "/ai-assistant/checklist", featureKey: FEATURE_KEYS.ASSISTANT_CHECKLIST,
    prompt: "우리 업종에 맞는 일일 운영 체크리스트를 생성해 주세요. 시설 점검, 고객 응대, 매출 확인 항목을 포함해 주세요." },
];

export default function AIAssistantPage() {
  const { config } = useBusinessContext();
  const { checkAccess } = useMembership();
  const [injectedPrompt, setInjectedPrompt] = useState<{ text: string; cardKey: string } | null>(null);

  const handleCardClick = useCallback((key: string, prompt: string) => {
    setInjectedPrompt({ text: prompt, cardKey: key });
  }, []);

  const handlePromptConsumed = useCallback(() => {
    setInjectedPrompt(null);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          AI 비서
        </h1>
        <p className="text-muted-foreground text-sm mt-1">AI가 오늘 해야 할 일과 놓치고 있는 항목을 정리합니다</p>
      </div>

      <BusinessContextBanner module="AI 비서" />

      <MenuLandingGrid columns={3}>
        {sectionKeys.map((s) => {
          const access = checkAccess(s.featureKey);
          if (!access.visible) return null;
          return (
            <MenuLandingCard
              key={s.key}
              title={s.key}
              description={config.assistantExamples[s.key] || "준비 중"}
              icon={s.icon}
              color={s.color}
              url={s.url}
              access={access}
              badge={!s.url && access.enabled ? undefined : undefined}
              onClick={access.enabled && !s.url ? () => handleCardClick(s.key, s.prompt) : undefined}
            />
          );
        })}
      </MenuLandingGrid>

      {/* AI Workspace — chat pilot replaces old ConsultantCTA banner */}
      <AIWorkspace injectedPrompt={injectedPrompt} onPromptConsumed={handlePromptConsumed} />
    </div>
  );
}
