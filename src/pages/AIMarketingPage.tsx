import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";
import { ConsultantCTA } from "@/components/ConsultantCTA";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { marketingCards } from "@/lib/industry-cards";
import { Megaphone, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AIMarketingPage() {
  const { config } = useBusinessContext();
  const navigate = useNavigate();

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
          const description = config.marketingExamples[card.key] || "준비 중";
          return (
            <MenuLandingCard
              key={card.key}
              title={card.key}
              description={description}
              icon={card.icon}
              color={card.color}
              url={card.url}
              badge={!card.url ? "준비중" : undefined}
            />
          );
        })}
      </MenuLandingGrid>

      {/* 시장조사 약한 연결 — 하단 CTA 수준 */}
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-lg bg-muted/20 border border-border/30 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => navigate("/market-research")}
      >
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">시장조사 결과를 참고하여 마케팅 전략을 세워보세요 →</span>
      </div>

      <ConsultantCTA category="마케팅 지원" />
    </div>
  );
}
