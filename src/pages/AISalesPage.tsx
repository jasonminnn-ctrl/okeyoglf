import { HandCoins } from "lucide-react";

import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";
import { ConsultantCTA } from "@/components/ConsultantCTA";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { useMembership } from "@/contexts/MembershipContext";
import { salesCards } from "@/lib/industry-cards";

export default function AISalesPage() {
  const { businessType, config } = useBusinessContext();
  const { checkAccess } = useMembership();

  const cards = salesCards[businessType] ?? salesCards.indoor;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <HandCoins className="h-6 w-6 text-primary" />
          AI 영업팀
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          고객 관리와 매출 확대를 AI가 체계적으로 지원합니다
        </p>
      </div>

      <BusinessContextBanner module="AI 영업팀" />

      <MenuLandingGrid columns={3}>
        {cards.map((card) => {
          const access = checkAccess(card.featureKey);
          if (!access.visible) return null;

          const description = config.salesExamples[card.key] || "준비 중";

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

      <ConsultantCTA category="영업 지원" />
    </div>
  );
}
