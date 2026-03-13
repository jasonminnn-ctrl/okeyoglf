import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { useMembership } from "@/contexts/MembershipContext";
import { FEATURE_KEYS } from "@/lib/membership";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, ListChecks, AlertCircle, Megaphone, CalendarClock, ClipboardCheck, Zap, Bell, Star } from "lucide-react";

const sectionKeys = [
  { key: "오늘의 할 일", icon: ListChecks, color: "bg-primary/10 text-primary", url: "/ai-assistant/daily-tasks", featureKey: FEATURE_KEYS.ASSISTANT_DAILY,
    prompt: "오늘 해야 할 운영 업무를 정리해 주세요. 미방문 회원, 예약 확인, 프로모션 점검 등을 포함해 주세요." },
  { key: "이번 주 추천 액션", icon: Zap, color: "bg-amber-500/10 text-amber-400", url: "/ai-assistant/weekly-actions", featureKey: FEATURE_KEYS.ASSISTANT_WEEKLY,
    prompt: "이번 주에 실행하면 좋을 운영 액션을 추천해 주세요. 매출, 회원 유지, 캠페인 관점에서 알려주세요." },
  { key: "놓치고 있는 운영 항목", icon: AlertCircle, color: "bg-red-500/10 text-red-400", url: "/ai-assistant/ops-check", featureKey: FEATURE_KEYS.ASSISTANT_MISSING },
  { key: "캠페인 추천", icon: Megaphone, color: "bg-blue-500/10 text-blue-400", url: "/ai-assistant/campaign-planner", featureKey: FEATURE_KEYS.ASSISTANT_CAMPAIGN },
  { key: "일정/마감 리마인드", icon: CalendarClock, color: "bg-violet-500/10 text-violet-400", url: "/ai-assistant/reminder-board", featureKey: FEATURE_KEYS.ASSISTANT_REMINDER },
  { key: "업종별 체크리스트", icon: ClipboardCheck, color: "bg-emerald-500/10 text-emerald-400", url: "/ai-assistant/checklist-manager", featureKey: FEATURE_KEYS.ASSISTANT_CHECKLIST },
];

type NoticeType = "공지" | "업데이트" | "이벤트" | "운영 팁";

interface Notice {
  id: string;
  title: string;
  summary: string;
  type: NoticeType;
  date: string;
  important?: boolean;
}

const MOCK_NOTICES: Notice[] = [
  {
    id: "1",
    title: "운영형 페이지 공통화 2차 업데이트 완료",
    summary: "체크리스트/운영점검/캠페인/리마인드 페이지에 AI 비서 하단 패널, CSV/XLSX 내보내기, 담당자·완료자 추적이 적용되었습니다.",
    type: "업데이트",
    date: "2026-03-13",
    important: true,
  },
  {
    id: "2",
    title: "골프연습장 시즌 점검 체크리스트 제공 시작",
    summary: "업종별 체크리스트에서 봄 시즌 점검 항목을 확인할 수 있습니다.",
    type: "운영 팁",
    date: "2026-03-12",
  },
  {
    id: "3",
    title: "전담 컨설턴트 요청 시 크레딧 차감 기준 안내",
    summary: "전담 컨설턴트 요청 유형별 크레딧 차감 기준이 정리되었습니다. 이용현황 탭에서 확인하세요.",
    type: "공지",
    date: "2026-03-11",
  },
  {
    id: "4",
    title: "3월 골프장 조기 오픈 프로모션 기획 예시",
    summary: "AI 마케팅팀에서 시즌 캠페인 제안을 확인해 보세요.",
    type: "이벤트",
    date: "2026-03-10",
  },
];

const typeBadgeColor: Record<NoticeType, string> = {
  "공지": "bg-primary/10 text-primary border-primary/20",
  "업데이트": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "이벤트": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "운영 팁": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export default function AIAssistantPage() {
  const { config } = useBusinessContext();
  const { checkAccess } = useMembership();

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
            />
          );
        })}
      </MenuLandingGrid>

      {/* 공지사항 영역 */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">공지사항</span>
            <span className="text-[10px] text-muted-foreground">— 운영 공지 · 업데이트 · 이벤트 · 중요 안내</span>
          </div>

          <div className="space-y-2">
            {MOCK_NOTICES.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 py-2.5 px-3 rounded-md border ${
                  n.important
                    ? "bg-primary/5 border-primary/20"
                    : "bg-muted/20 border-border/20"
                }`}
              >
                {n.important && (
                  <Star className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0 fill-primary" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium">{n.title}</span>
                    <Badge variant="outline" className={`text-[9px] ${typeBadgeColor[n.type]}`}>
                      {n.type}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{n.summary}</p>
                </div>
                <span className="text-[9px] text-muted-foreground flex-shrink-0 whitespace-nowrap">
                  {n.date}
                </span>
              </div>
            ))}
          </div>

          <p className="text-[9px] text-muted-foreground text-right">공지 관리 기능 연동 예정</p>
        </CardContent>
      </Card>
    </div>
  );
}
