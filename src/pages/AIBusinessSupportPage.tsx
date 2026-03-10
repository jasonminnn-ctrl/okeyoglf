import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";
import { ConsultantCTA } from "@/components/ConsultantCTA";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { Briefcase, FileSignature, Calculator, FileSpreadsheet, ListChecks, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const sections = [
  { key: "계약/발주/구매 정리", icon: FileSignature, color: "bg-primary/10 text-primary", badge: "준비 중", saveCategory: "AI 경영지원 결과" },
  { key: "정산/협력사 커뮤니케이션", icon: Calculator, color: "bg-amber-500/10 text-amber-400", badge: "준비 중", saveCategory: "AI 경영지원 결과" },
  { key: "내부 서식 초안", icon: FileSpreadsheet, color: "bg-blue-500/10 text-blue-400", badge: "준비 중", saveCategory: "AI 경영지원 결과" },
  { key: "반복 업무 체크리스트", icon: ListChecks, color: "bg-violet-500/10 text-violet-400", badge: "준비 중", saveCategory: "AI 경영지원 결과" },
  { key: "리스크 검토 포인트", icon: ShieldAlert, color: "bg-red-500/10 text-red-400", badge: "준비 중", saveCategory: "AI 경영지원 결과" },
];

export default function AIBusinessSupportPage() {
  const { config } = useBusinessContext();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          AI 경영지원
        </h1>
        <p className="text-muted-foreground text-sm mt-1">경영 관리와 내부 업무를 AI가 효율화합니다</p>
      </div>

      <BusinessContextBanner module="AI 경영지원" />

      <MenuLandingGrid columns={3}>
        {sections.map((s) => (
          <MenuLandingCard
            key={s.key}
            title={s.key}
            description={config.supportExamples[s.key] || "준비 중"}
            icon={s.icon}
            color={s.color}
            badge={s.badge}
          />
        ))}
      </MenuLandingGrid>

      <ConsultantCTA category="문서/기획 지원" />
    </div>
  );
}
