import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";
import { ConsultantCTA } from "@/components/ConsultantCTA";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { useMembership } from "@/contexts/MembershipContext";
import { FEATURE_KEYS } from "@/lib/membership";
import { Palette, PenTool, LayoutTemplate, Image, FileImage, Upload, FolderOpen } from "lucide-react";

const sections = [
  { key: "디자인 요청", icon: PenTool, color: "bg-primary/10 text-primary", url: "/ai-design/request", featureKey: FEATURE_KEYS.DESIGN_REQUEST },
  { key: "템플릿 디자인 센터", icon: LayoutTemplate, color: "bg-amber-500/10 text-amber-400", featureKey: FEATURE_KEYS.DESIGN_TEMPLATE },
  { key: "홍보물 문안 + 레이아웃", icon: FileImage, color: "bg-blue-500/10 text-blue-400", url: "/ai-design/copy-layout", featureKey: FEATURE_KEYS.DESIGN_COPY_LAYOUT },
  { key: "배너/포스터 요청", icon: Image, color: "bg-violet-500/10 text-violet-400", featureKey: FEATURE_KEYS.DESIGN_BANNER },
  { key: "업로드 폼 기반 제작", icon: Upload, color: "bg-emerald-500/10 text-emerald-400", featureKey: FEATURE_KEYS.DESIGN_UPLOAD },
  { key: "결과물 관리", icon: FolderOpen, color: "bg-cyan-500/10 text-cyan-400", featureKey: FEATURE_KEYS.DESIGN_RESULTS },
];

export default function AIDesignPage() {
  const { config } = useBusinessContext();
  const { checkAccess } = useMembership();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Palette className="h-6 w-6 text-primary" />
          AI 디자인팀
        </h1>
        <p className="text-muted-foreground text-sm mt-1">디자인 제작과 홍보물 관리를 AI가 지원합니다</p>
      </div>

      <BusinessContextBanner module="AI 디자인팀" />

      <MenuLandingGrid columns={3}>
        {sections.map((s) => {
          const access = checkAccess(s.featureKey);
          if (!access.visible) return null;
          return (
            <MenuLandingCard
              key={s.key}
              title={s.key}
              description={config.designExamples[s.key] || "준비 중"}
              icon={s.icon}
              color={s.color}
              url={s.url}
              access={access}
              badge={!s.url && access.enabled ? "준비중" : undefined}
            />
          );
        })}
      </MenuLandingGrid>

      <ConsultantCTA category="디자인 지원" />
    </div>
  );
}