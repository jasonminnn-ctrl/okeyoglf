import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";
import { ConsultantCTA } from "@/components/ConsultantCTA";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { TrendingUp, Users, RefreshCcw, UserX, ShoppingBag, Crown, Package, MessageCircle } from "lucide-react";

const sections = [
  { title: "고객관리", desc: "고객 데이터 기반 세그먼트 분석 및 관리", icon: Users, color: "bg-primary/10 text-primary", badge: "준비 중" },
  { title: "재등록 관리", desc: "만료 예정·미갱신 회원 재등록 전략 수립", icon: RefreshCcw, color: "bg-amber-500/10 text-amber-400", badge: "준비 중" },
  { title: "미방문 관리", desc: "장기 미방문 고객 리텐션 액션 플랜", icon: UserX, color: "bg-red-500/10 text-red-400", badge: "준비 중" },
  { title: "판매 제안", desc: "고객 특성에 맞는 상품·서비스 추천 생성", icon: ShoppingBag, color: "bg-blue-500/10 text-blue-400", badge: "준비 중" },
  { title: "VIP 관리", desc: "핵심 고객 특별 관리 프로그램 운영", icon: Crown, color: "bg-violet-500/10 text-violet-400", badge: "준비 중" },
  { title: "패키지 제안", desc: "맞춤형 패키지·번들 상품 기획 지원", icon: Package, color: "bg-emerald-500/10 text-emerald-400", badge: "준비 중" },
  { title: "응대 문안", desc: "상황별 고객 응대 스크립트 생성", icon: MessageCircle, color: "bg-cyan-500/10 text-cyan-400", badge: "준비 중" },
];

export default function AISalesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          AI 영업팀
        </h1>
        <p className="text-muted-foreground text-sm mt-1">고객 관리와 매출 확대를 AI가 체계적으로 지원합니다</p>
      </div>

      <MenuLandingGrid columns={3}>
        {sections.map((s) => (
          <MenuLandingCard key={s.title} title={s.title} description={s.desc} icon={s.icon} color={s.color} badge={s.badge} />
        ))}
      </MenuLandingGrid>

      <ConsultantCTA category="영업 지원" />
    </div>
  );
}
