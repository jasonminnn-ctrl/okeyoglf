import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";
import { ConsultantCTA } from "@/components/ConsultantCTA";
import { Palette, PenTool, LayoutTemplate, Image, FileImage, Upload, FolderOpen } from "lucide-react";

const sections = [
  { title: "디자인 요청", desc: "배너·포스터·인쇄물 등 디자인 제작 요청", icon: PenTool, color: "bg-primary/10 text-primary", badge: "준비 중" },
  { title: "템플릿 디자인 센터", desc: "업종별 맞춤 디자인 템플릿 라이브러리", icon: LayoutTemplate, color: "bg-amber-500/10 text-amber-400", badge: "준비 중" },
  { title: "홍보물 문안 + 레이아웃", desc: "AI 문안 작성과 레이아웃 자동 생성", icon: FileImage, color: "bg-blue-500/10 text-blue-400", badge: "준비 중" },
  { title: "배너/포스터 요청", desc: "온라인·오프라인 홍보물 제작 의뢰", icon: Image, color: "bg-violet-500/10 text-violet-400", badge: "준비 중" },
  { title: "업로드 폼 기반 제작", desc: "자료 업로드 후 자동 디자인 생성", icon: Upload, color: "bg-emerald-500/10 text-emerald-400", badge: "준비 중" },
  { title: "결과물 관리", desc: "제작된 디자인 결과물 보관 및 관리", icon: FolderOpen, color: "bg-cyan-500/10 text-cyan-400", badge: "준비 중" },
];

export default function AIDesignPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Palette className="h-6 w-6 text-primary" />
          AI 디자인팀
        </h1>
        <p className="text-muted-foreground text-sm mt-1">디자인 제작과 홍보물 관리를 AI가 지원합니다</p>
      </div>

      <MenuLandingGrid columns={3}>
        {sections.map((s) => (
          <MenuLandingCard key={s.title} title={s.title} description={s.desc} icon={s.icon} color={s.color} badge={s.badge} />
        ))}
      </MenuLandingGrid>

      <ConsultantCTA category="디자인 지원" />
    </div>
  );
}
