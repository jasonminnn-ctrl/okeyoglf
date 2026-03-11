import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";
import { ConsultantCTA } from "@/components/ConsultantCTA";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { operationsCards } from "@/lib/industry-cards";
import { Settings2 } from "lucide-react";

export default function AIOperationsPage() {
  const { businessType, config } = useBusinessContext();
  const cards = operationsCards[businessType];

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
        {cards.map((card) => {
          const example = config.operationsExamples[card.key];
          return (
            <MenuLandingCard
              key={card.key}
              title={card.key}
              description={example || "준비 중"}
              icon={card.icon}
              color={card.color}
              url={card.url}
              badge={!card.url ? "준비중" : undefined}
            />
          );
        })}
      </MenuLandingGrid>

      <ConsultantCTA category="운영 지원" />
    </div>
  );
}
