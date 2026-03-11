import { Megaphone, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";
import { ConsultantCTA } from "@/components/ConsultantCTA";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { useMembership } from "@/contexts/MembershipContext";
import { marketingCards } from "@/lib/industry-cards";

export default function AIMarketingPage() {
  const navigate = useNavigate();
  const { config } = useBusinessContext();
  const { checkAccess } = useMembership();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-primary" />
          AI 마케팅팀
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          마케팅 기획부터 실행까지 AI가 전담합니다
        </p>
      </div>

      <BusinessContextBanner module="AI 마케팅팀" />

      <MenuLandingGrid columns={3}>
        {marketingCards.map((card) => {
          const access = checkAccess(card.featureKey);
          if (!access.visible) return null;

          const description =
            config.marketingExamples[card.key] || "준비 중";

          return (
            <MenuLandingCard
              key={card.key}
              title={card.key}
              description={description}
              icon={card.icon}
              color={card.color}
              url={card.url}
              access={access}
              badge={!card.url && access.enabled ? "준비중" : undefined}
            />
          );
        })}
      </MenuLandingGrid>

      <button
        type="button"
        onClick={() => navigate("/market-research")}
        className="w-full rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-4 text-left transition hover:bg-cyan-500/10"
      >
        <div className="flex items-center gap-2 text-cyan-300 font-medium">
          <Search className="h-4 w-4" />
          시장조사 약한 연결
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          시장조사 결과를 참고하여 마케팅 전략을 세워보세요 →
        </p>
      </button>

      <ConsultantCTA category="마케팅 지원" />
    </div>
  );
}
