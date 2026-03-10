import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";
import { ConsultantCTA } from "@/components/ConsultantCTA";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { useMembership } from "@/contexts/MembershipContext";
import { FEATURE_KEYS } from "@/lib/membership";
import { TrendingUp, Users, RefreshCcw, UserX, ShoppingBag, Crown, Package, MessageCircle } from "lucide-react";

const sections = [
  { key: "고객관리", icon: Users, color: "bg-primary/10 text-primary", featureKey: FEATURE_KEYS.SALES_CUSTOMER },
  { key: "재등록 관리", icon: RefreshCcw, color: "bg-amber-500/10 text-amber-400", url: "/ai-sales/re-registration", featureKey: FEATURE_KEYS.SALES_REREGISTRATION },
  { key: "미방문 관리", icon: UserX, color: "bg-red-500/10 text-red-400", featureKey: FEATURE_KEYS.SALES_NOVISIT },
  { key: "판매 제안", icon: ShoppingBag, color: "bg-blue-500/10 text-blue-400", featureKey: FEATURE_KEYS.SALES_PROPOSAL },
  { key: "VIP 관리", icon: Crown, color: "bg-violet-500/10 text-violet-400", featureKey: FEATURE_KEYS.SALES_VIP },
  { key: "패키지 제안", icon: Package, color: "bg-emerald-500/10 text-emerald-400", featureKey: FEATURE_KEYS.SALES_PACKAGE },
  { key: "응대 문안", icon: MessageCircle, color: "bg-cyan-500/10 text-cyan-400", url: "/ai-sales/response-script", featureKey: FEATURE_KEYS.SALES_RESPONSE },
];

export default function AISalesPage() {
  const { config } = useBusinessContext();
  const { checkAccess } = useMembership();

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
        {sections.map((s) => {
          const access = checkAccess(s.featureKey);
          if (!access.visible) return null;
          return (
            <MenuLandingCard
              key={s.key}
              title={s.key}
              description={config.salesExamples[s.key] || "준비 중"}
              icon={s.icon}
              color={s.color}
              url={s.url}
              access={access}
              badge={!s.url && access.enabled ? "준비중" : undefined}
            />
          );
        })}
      </MenuLandingGrid>

      <ConsultantCTA category="영업 지원" />
    </div>
  );
}