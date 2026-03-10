import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";
import { ConsultantCTA } from "@/components/ConsultantCTA";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { Megaphone, PenTool, Calendar, PartyPopper, Share2, BarChart2, Search } from "lucide-react";

const sections = [
  { title: "마케팅 카피 생성기", desc: "문자·카카오톡·프로모션 문안을 AI가 작성", icon: PenTool, color: "bg-primary/10 text-primary", url: "/ai-marketing/copy" },
  { title: "이벤트 생성기", desc: "시즌·타겟별 이벤트 기획안 자동 생성", icon: PartyPopper, color: "bg-amber-500/10 text-amber-400", badge: "준비 중" },
  { title: "프로모션 기획", desc: "할인·패키지·제휴 프로모션 전략 수립", icon: Calendar, color: "bg-blue-500/10 text-blue-400", badge: "준비 중" },
  { title: "채널 운영안", desc: "SNS·블로그·카카오 채널 운영 전략", icon: Share2, color: "bg-violet-500/10 text-violet-400", badge: "준비 중" },
  { title: "시즌 캠페인 제안", desc: "계절·시기별 최적 캠페인 자동 제안", icon: BarChart2, color: "bg-emerald-500/10 text-emerald-400", badge: "준비 중" },
  { title: "시장조사 연계", desc: "시장조사 결과 기반 마케팅 인사이트", icon: Search, color: "bg-cyan-500/10 text-cyan-400", badge: "준비 중" },
];

export default function AIMarketingPage() {
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
        {sections.map((s) => (
          <MenuLandingCard key={s.title} title={s.title} description={s.desc} icon={s.icon} color={s.color} url={s.url} badge={s.badge} />
        ))}
      </MenuLandingGrid>

      <ConsultantCTA category="마케팅 지원" />
    </div>
  );
}
