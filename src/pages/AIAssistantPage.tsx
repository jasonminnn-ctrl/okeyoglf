import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";
import { ConsultantCTA } from "@/components/ConsultantCTA";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { Bot, ListChecks, AlertCircle, Megaphone, CalendarClock, ClipboardCheck, Zap } from "lucide-react";

const sections = [
  { title: "오늘의 할 일", desc: "AI가 분석한 오늘의 우선 업무 목록", icon: ListChecks, color: "bg-primary/10 text-primary" },
  { title: "이번 주 추천 액션", desc: "이번 주 매출·운영 개선을 위한 핵심 액션", icon: Zap, color: "bg-amber-500/10 text-amber-400" },
  { title: "놓치고 있는 운영 항목", desc: "현재 운영에서 누락 중인 중요 사항 점검", icon: AlertCircle, color: "bg-red-500/10 text-red-400" },
  { title: "캠페인 추천", desc: "업종·시즌에 맞는 마케팅 캠페인 제안", icon: Megaphone, color: "bg-blue-500/10 text-blue-400" },
  { title: "일정/마감 리마인드", desc: "이번 주 마감·예정 일정 알림", icon: CalendarClock, color: "bg-violet-500/10 text-violet-400" },
  { title: "업종별 체크리스트", desc: "선택한 업종에 맞는 일일/주간 체크리스트", icon: ClipboardCheck, color: "bg-emerald-500/10 text-emerald-400" },
];

export default function AIAssistantPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          AI 비서
        </h1>
        <p className="text-muted-foreground text-sm mt-1">AI가 오늘 해야 할 일과 놓치고 있는 항목을 정리합니다</p>
      </div>

      <MenuLandingGrid columns={3}>
        {sections.map((s) => (
          <MenuLandingCard key={s.title} title={s.title} description={s.desc} icon={s.icon} color={s.color} badge="준비 중" />
        ))}
      </MenuLandingGrid>

      <ConsultantCTA category="AI 비서" />
    </div>
  );
}
