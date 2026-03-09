import { Building, Cpu, Shield, Users, BarChart3, GitBranch } from "lucide-react";
import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";
import { Card, CardContent } from "@/components/ui/card";

const enterpriseSections = [
  { title: "고급 엔진 제어", desc: "AI 엔진 파라미터 및 모델 세부 설정", icon: Cpu, color: "bg-primary/10 text-primary", badge: "준비 중" },
  { title: "조직 단위 운영 설정", desc: "조직별 맞춤 운영 정책 및 설정 관리", icon: Building, color: "bg-amber-500/10 text-amber-400", badge: "준비 중" },
  { title: "고급 권한 제어", desc: "세분화된 역할·권한 체계 관리", icon: Shield, color: "bg-blue-500/10 text-blue-400", badge: "준비 중" },
  { title: "멀티브랜치 관리", desc: "다지점 통합 운영 및 비교 분석", icon: GitBranch, color: "bg-violet-500/10 text-violet-400", badge: "준비 중" },
  { title: "고급 리포트", desc: "경영진용 심층 분석 리포트 생성", icon: BarChart3, color: "bg-emerald-500/10 text-emerald-400", badge: "준비 중" },
];

export default function EnterprisePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Building className="h-6 w-6 text-primary" />
          엔터프라이즈 관리
        </h1>
        <p className="text-muted-foreground text-sm mt-1">대규모 조직 및 멀티브랜치 운영을 위한 고급 관리 영역</p>
      </div>

      <Card className="bg-violet-500/5 border-violet-500/20">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs text-violet-400">🏢 엔터프라이즈 플랜 전용 관리 영역입니다</p>
        </CardContent>
      </Card>

      <MenuLandingGrid columns={3}>
        {enterpriseSections.map((s) => (
          <MenuLandingCard key={s.title} title={s.title} description={s.desc} icon={s.icon} color={s.color} badge={s.badge} locked />
        ))}
      </MenuLandingGrid>
    </div>
  );
}
