import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";
import { ConsultantCTA } from "@/components/ConsultantCTA";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { useMembership } from "@/contexts/MembershipContext";
import { FEATURE_KEYS } from "@/lib/membership";
import { Megaphone, PenTool, Calendar, PartyPopper, Share2, BarChart2, Search } from "lucide-react";

const sections = [
  { key: "마케팅 카피 생성기", icon: PenTool, color: "bg-primary/10 text-primary", url: "/ai-marketing/copy", featureKey: FEATURE_KEYS.MARKETING_COPY },
  { key: "이벤트 생성기", icon: PartyPopper, color: "bg-amber-500/10 text-amber-400", featureKey: FEATURE_KEYS.MARKETING_EVENT },
  { key: "프로모션 기획", icon: Calendar, color: "bg-blue-500/10 text-blue-400", url: "/ai-marketing/promotion", featureKey: FEATURE_KEYS.MARKETING_PROMOTION },
  { key: "채널 운영안", icon: Share2, color: "bg-violet-500/10 text-violet-400", featureKey: FEATURE_KEYS.MARKETING_CHANNEL },
  { key: "시즌 캠페인 제안", icon: BarChart2, color: "bg-emerald-500/10 text-emerald-400", featureKey: FEATURE_KEYS.MARKETING_SEASON },
  { key: "시장조사 연계", icon: Search, color: "bg-cyan-500/10 text-cyan-400", featureKey: FEATURE_KEYS.MARKETING_RESEARCH },
];

export default function AIMarketingPage() {
  const { config } = useBusinessContext();
  const { checkAccess } = useMembership();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-primary" />
          AI 마케팅팀
        </h1>
        <p className="text-muted-foreground text-sm mt-1">마케팅 기획부터 실행까지 AI가 전담합니다</p>
      </div>

      <BusinessContextBanner module="AI 마케팅팀" />

      <MenuLandingGrid columns={3}>
        {sections.map((s) => {
          const access = checkAccess(s.featureKey);
          if (!access.visible) return null;
          return (
            <MenuLandingCard
              key={s.key}
              title={s.key}
              description={config.marketingExamples[s.key] || "준비 중"}
              icon={s.icon}
              color={s.color}
              url={s.url}
              access={access}
              badge={!s.url && access.enabled ? "준비중" : undefined}
            />
          );
        })}
      </MenuLandingGrid>

      <ConsultantCTA category="마케팅 지원" />
    </div>
  );
}