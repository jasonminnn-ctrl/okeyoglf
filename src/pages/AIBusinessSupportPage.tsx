import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";
import { ConsultantCTA } from "@/components/ConsultantCTA";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { Briefcase, FileSignature, Calculator, FileSpreadsheet, ListChecks, ShieldAlert, FileText } from "lucide-react";

const sections = [
  { title: "계약/발주/구매 정리", desc: "계약서·발주서·구매 내역 정리 및 초안 생성", icon: FileSignature, color: "bg-primary/10 text-primary", badge: "준비 중" },
  { title: "정산/협력사 커뮤니케이션", desc: "정산 안내·협력사 연락 초안 자동 작성", icon: Calculator, color: "bg-amber-500/10 text-amber-400", badge: "준비 중" },
  { title: "내부 서식 초안", desc: "보고서·품의서·공문 등 내부 문서 초안", icon: FileSpreadsheet, color: "bg-blue-500/10 text-blue-400", badge: "준비 중" },
  { title: "반복 업무 체크리스트", desc: "일일·주간·월간 반복 업무 체크리스트 관리", icon: ListChecks, color: "bg-violet-500/10 text-violet-400", badge: "준비 중" },
  { title: "리스크 검토 포인트", desc: "운영·법무·재무 리스크 사전 점검 지원", icon: ShieldAlert, color: "bg-red-500/10 text-red-400", badge: "준비 중" },
  { title: "문서/기획 지원", desc: "기획서·제안서 등 문서 작성 AI 지원", icon: FileText, color: "bg-emerald-500/10 text-emerald-400", badge: "준비 중" },
];

export default function AIBusinessSupportPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          AI 경영지원
        </h1>
        <p className="text-muted-foreground text-sm mt-1">경영 관리와 내부 업무를 AI가 효율화합니다</p>
      </div>

      <MenuLandingGrid columns={3}>
        {sections.map((s) => (
          <MenuLandingCard key={s.title} title={s.title} description={s.desc} icon={s.icon} color={s.color} badge={s.badge} />
        ))}
      </MenuLandingGrid>

      <ConsultantCTA category="문서/기획 지원" />
    </div>
  );
}
