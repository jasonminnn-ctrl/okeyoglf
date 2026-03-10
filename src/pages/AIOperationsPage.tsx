import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";
import { ConsultantCTA } from "@/components/ConsultantCTA";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { Settings2, Brain, DollarSign, Clock, LayoutGrid, GraduationCap, BarChart3, Timer } from "lucide-react";

const sections = [
  { title: "AI 진단실", desc: "비즈니스 현황을 AI가 분석하고 개선안을 제시합니다", icon: Brain, color: "bg-primary/10 text-primary", url: "/ai-operations/diagnosis" },
  { title: "요금결정", desc: "시장 데이터 기반 최적 요금 체계 제안", icon: DollarSign, color: "bg-amber-500/10 text-amber-400", badge: "준비 중" },
  { title: "잔여타임 관리", desc: "잔여 타임 판매 전략 및 실시간 현황 관리", icon: Timer, color: "bg-blue-500/10 text-blue-400", badge: "준비 중" },
  { title: "타임관리", desc: "예약·운영 시간대별 효율 분석 및 최적화", icon: Clock, color: "bg-violet-500/10 text-violet-400", badge: "준비 중" },
  { title: "타석관리", desc: "타석 배정·가동률 모니터링 및 운영 효율화", icon: LayoutGrid, color: "bg-emerald-500/10 text-emerald-400", badge: "준비 중" },
  { title: "레슨관리", desc: "레슨 프로 배정·수업 운영·전환율 관리", icon: GraduationCap, color: "bg-pink-500/10 text-pink-400", badge: "준비 중" },
  { title: "KPI 분석", desc: "핵심 지표 추이 분석 및 목표 대비 현황", icon: BarChart3, color: "bg-cyan-500/10 text-cyan-400", badge: "준비 중" },
];

export default function AIOperationsPage() {
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
        {sections.map((s) => (
          <MenuLandingCard key={s.title} title={s.title} description={s.desc} icon={s.icon} color={s.color} url={s.url} badge={s.badge} />
        ))}
      </MenuLandingGrid>

      <ConsultantCTA category="운영 지원" />
    </div>
  );
}
