import { Settings2 } from "lucide-react";

import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";
import { ConsultantCTA } from "@/components/ConsultantCTA";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { useMembership } from "@/contexts/MembershipContext";
import { operationsCards } from "@/lib/industry-cards";

export default function AIOperationsPage() {
  const { businessType, config } = useBusinessContext();
  const { checkAccess } = useMembership();

  const cards = operationsCards[businessType] ?? operationsCards.indoor;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings2 className="h-6 w-6 text-primary" />
          AI 운영팀
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          운영 전반을 AI가 분석·관리하고 실행 방안을 제시합니다
        </p>
      </div>

      <BusinessContextBanner module="AI 운영팀" />

      <MenuLandingGrid columns={3}>
        {cards.map((card) => {
          const access = checkAccess(card.featureKey);
          if (!access.visible) return null;

          const description =
            config.operationsExamples[card.key] || "준비 중";

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

      <ConsultantCTA category="운영 지원" />
    </div>
  );
}
