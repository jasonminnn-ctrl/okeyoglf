import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";
import { ConsultantCTA } from "@/components/ConsultantCTA";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { useMembership } from "@/contexts/MembershipContext";
import { FEATURE_KEYS } from "@/lib/membership";
import { Settings2, Brain, DollarSign, Clock, LayoutGrid, GraduationCap, BarChart3, Timer } from "lucide-react";

const sections = [
  { key: "AI 진단실", icon: Brain, color: "bg-primary/10 text-primary", url: "/ai-operations/diagnosis", featureKey: FEATURE_KEYS.OPERATIONS_DIAGNOSIS },
  { key: "요금결정", icon: DollarSign, color: "bg-amber-500/10 text-amber-400", featureKey: FEATURE_KEYS.OPERATIONS_PRICING },
  { key: "잔여타임 관리", icon: Timer, color: "bg-blue-500/10 text-blue-400", featureKey: FEATURE_KEYS.OPERATIONS_REMAINING },
  { key: "타임관리", icon: Clock, color: "bg-violet-500/10 text-violet-400", featureKey: FEATURE_KEYS.OPERATIONS_TIME },
  { key: "타석관리", icon: LayoutGrid, color: "bg-emerald-500/10 text-emerald-400", featureKey: FEATURE_KEYS.OPERATIONS_BAY },
  { key: "레슨관리", icon: GraduationCap, color: "bg-pink-500/10 text-pink-400", featureKey: FEATURE_KEYS.OPERATIONS_LESSON },
  { key: "KPI 분석", icon: BarChart3, color: "bg-cyan-500/10 text-cyan-400", featureKey: FEATURE_KEYS.OPERATIONS_KPI },
];

export default function AIOperationsPage() {
  const { config } = useBusinessContext();
  const { checkAccess } = useMembership();

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
          const access = checkAccess(s.featureKey);
          if (!access.visible) return null;
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
              access={access}
              badge={isNA ? "미해당" : (!s.url && access.enabled ? "준비중" : undefined)}
              locked={isNA}
            />
          );
        })}
      </MenuLandingGrid>

      <ConsultantCTA category="운영 지원" />
    </div>
  );
}