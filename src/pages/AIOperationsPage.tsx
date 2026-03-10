import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";
import { ConsultantCTA } from "@/components/ConsultantCTA";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { Settings2, Brain, DollarSign, Clock, LayoutGrid, GraduationCap, BarChart3, Timer } from "lucide-react";


const sections = [
  { key: "AI 진단실", icon: Brain, color: "bg-primary/10 text-primary", url: "/ai-operations/diagnosis", saveCategory: "AI 운영팀 결과" },
  { key: "요금결정", icon: DollarSign, color: "bg-amber-500/10 text-amber-400", badge: "준비 중", saveCategory: "AI 운영팀 결과" },
  { key: "잔여타임 관리", icon: Timer, color: "bg-blue-500/10 text-blue-400", badge: "준비 중", saveCategory: "AI 운영팀 결과" },
  { key: "타임관리", icon: Clock, color: "bg-violet-500/10 text-violet-400", badge: "준비 중", saveCategory: "AI 운영팀 결과" },
  { key: "타석관리", icon: LayoutGrid, color: "bg-emerald-500/10 text-emerald-400", badge: "준비 중", saveCategory: "AI 운영팀 결과" },
  { key: "레슨관리", icon: GraduationCap, color: "bg-pink-500/10 text-pink-400", badge: "준비 중", saveCategory: "AI 운영팀 결과" },
  { key: "KPI 분석", icon: BarChart3, color: "bg-cyan-500/10 text-cyan-400", badge: "준비 중", saveCategory: "AI 운영팀 결과" },
];

const resultTypeMap: Record<string, string> = {
  "AI 진단실": "운영 분석",
  "요금결정": "요금 제안",
  "잔여타임 관리": "판매 전략",
  "타임관리": "효율 분석",
  "타석관리": "운영 점검표",
  "레슨관리": "배정 요약",
  "KPI 분석": "KPI 리포트",
};

export default function AIOperationsPage() {
  const { config } = useBusinessContext();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings2 className="h-6 w-6 text-primary" />
          AI 운영팀
        </h1>
        <p className="text-muted-foreground text-sm mt-1">운영 전반을 AI가 분석·관리하고 실행 방안을 제시합니다</p>
      </div>

      <BusinessContextBanner module="AI 운영팀" />

      <MenuLandingGrid columns={3}>
        {sections.map((s) => {
          const example = config.operationsExamples[s.key];
          const isNA = example === "-";
          return (
            <MenuLandingCard
              key={s.key}
              title={s.key}
              description={isNA ? "현재 업종에서는 해당하지 않는 항목입니다" : (example || "준비 중")}
              icon={s.icon}
              color={s.color}
              url={s.url}
              badge={isNA ? "미해당" : s.badge}
              locked={isNA}
            >
            </MenuLandingCard>
          );
        })}
      </MenuLandingGrid>

      <ConsultantCTA category="운영 지원" />
    </div>
  );
}
