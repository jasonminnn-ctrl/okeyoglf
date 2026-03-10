import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";
import { ConsultantCTA } from "@/components/ConsultantCTA";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { Bot, ListChecks, AlertCircle, Megaphone, CalendarClock, ClipboardCheck, Zap } from "lucide-react";


const sectionKeys = [
  { key: "오늘의 할 일", icon: ListChecks, color: "bg-primary/10 text-primary", saveCategory: "AI 비서 결과" },
  { key: "이번 주 추천 액션", icon: Zap, color: "bg-amber-500/10 text-amber-400", saveCategory: "AI 비서 결과" },
  { key: "놓치고 있는 운영 항목", icon: AlertCircle, color: "bg-red-500/10 text-red-400", saveCategory: "AI 비서 결과" },
  { key: "캠페인 추천", icon: Megaphone, color: "bg-blue-500/10 text-blue-400", saveCategory: "AI 마케팅팀 결과" },
  { key: "일정/마감 리마인드", icon: CalendarClock, color: "bg-violet-500/10 text-violet-400", saveCategory: "AI 비서 결과" },
  { key: "업종별 체크리스트", icon: ClipboardCheck, color: "bg-emerald-500/10 text-emerald-400", saveCategory: "AI 비서 결과" },
];

const resultTypeMap: Record<string, string> = {
  "오늘의 할 일": "추천 문안",
  "이번 주 추천 액션": "액션 요약",
  "놓치고 있는 운영 항목": "체크리스트",
  "캠페인 추천": "캠페인 초안",
  "일정/마감 리마인드": "리마인드 요약",
  "업종별 체크리스트": "운영 체크리스트",
};

export default function AIAssistantPage() {
  const { config } = useBusinessContext();

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
        {sectionKeys.map((s) => (
          <MenuLandingCard
            key={s.key}
            title={s.key}
            description={config.assistantExamples[s.key] || "준비 중"}
            icon={s.icon}
            color={s.color}
          />
        ))}
      </MenuLandingGrid>

      <ConsultantCTA category="AI 비서" />
    </div>
  );
}
