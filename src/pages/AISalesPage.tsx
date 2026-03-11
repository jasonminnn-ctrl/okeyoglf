import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";
import { ConsultantCTA } from "@/components/ConsultantCTA";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { salesCards } from "@/lib/industry-cards";
import { TrendingUp } from "lucide-react";

export default function AISalesPage() {
  const { businessType, config } = useBusinessContext();
  const cards = salesCards[businessType];

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
        {cards.map((card) => {
          const example = config.salesExamples[card.key];
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

      <ConsultantCTA category="영업 지원" />
    </div>
  );
}
