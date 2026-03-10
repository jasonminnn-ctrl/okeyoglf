import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";
import { ConsultantCTA } from "@/components/ConsultantCTA";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { TrendingUp, Users, RefreshCcw, UserX, ShoppingBag, Crown, Package, MessageCircle } from "lucide-react";

const sections = [
  { key: "고객관리", icon: Users, color: "bg-primary/10 text-primary", badge: "준비 중" },
  { key: "재등록 관리", icon: RefreshCcw, color: "bg-amber-500/10 text-amber-400", badge: "준비 중" },
  { key: "미방문 관리", icon: UserX, color: "bg-red-500/10 text-red-400", badge: "준비 중" },
  { key: "판매 제안", icon: ShoppingBag, color: "bg-blue-500/10 text-blue-400", badge: "준비 중" },
  { key: "VIP 관리", icon: Crown, color: "bg-violet-500/10 text-violet-400", badge: "준비 중" },
  { key: "패키지 제안", icon: Package, color: "bg-emerald-500/10 text-emerald-400", badge: "준비 중" },
  { key: "응대 문안", icon: MessageCircle, color: "bg-cyan-500/10 text-cyan-400", badge: "준비 중" },
];

export default function AISalesPage() {
  const { config } = useBusinessContext();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          AI 영업팀
        </h1>
        <p className="text-muted-foreground text-sm mt-1">고객 관리와 매출 확대를 AI가 체계적으로 지원합니다</p>
      </div>

      <BusinessContextBanner module="AI 영업팀" />

      <MenuLandingGrid columns={3}>
        {sections.map((s) => (
          <MenuLandingCard
            key={s.key}
            title={s.key}
            description={config.salesExamples[s.key] || "준비 중"}
            icon={s.icon}
            color={s.color}
            badge={s.badge}
          />
        ))}
      </MenuLandingGrid>

      <ConsultantCTA category="영업 지원" />
    </div>
  );
}
