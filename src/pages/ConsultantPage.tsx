import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { useMembership } from "@/contexts/MembershipContext";
import { FEATURE_KEYS } from "@/lib/membership";
import { MessageSquare, FileText, Presentation, BarChart3, Megaphone, Palette, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";

const requestTypes = [
  { key: "전담 컨설턴트 요청", desc: "전문 컨설턴트에게 맞춤 상담 및 지원 요청", icon: MessageSquare, color: "bg-primary/10 text-primary", featureKey: FEATURE_KEYS.CONSULTANT_REQUEST },
  { key: "문서 제작 요청", desc: "사업계획서·제안서·보고서 등 전문 문서 제작", icon: FileText, color: "bg-amber-500/10 text-amber-400", featureKey: FEATURE_KEYS.CONSULTANT_DOCUMENT },
  { key: "PPT 제작 요청", desc: "프레젠테이션 자료 전문 제작 의뢰", icon: Presentation, color: "bg-blue-500/10 text-blue-400", featureKey: FEATURE_KEYS.CONSULTANT_PPT },
  { key: "운영 분석 요청", desc: "심층 운영 데이터 분석 및 컨설팅 리포트", icon: BarChart3, color: "bg-violet-500/10 text-violet-400", featureKey: FEATURE_KEYS.CONSULTANT_ANALYSIS },
  { key: "마케팅 검토 요청", desc: "마케팅 전략·실행안에 대한 전문가 검토", icon: Megaphone, color: "bg-emerald-500/10 text-emerald-400", featureKey: FEATURE_KEYS.CONSULTANT_MARKETING },
  { key: "디자인 요청", desc: "전문 디자이너를 통한 고품질 디자인 제작", icon: Palette, color: "bg-pink-500/10 text-pink-400", featureKey: FEATURE_KEYS.CONSULTANT_DESIGN },
];

export default function ConsultantPage() {
  const { config, label } = useBusinessContext();
  const { checkAccess, membershipCode } = useMembership();

  const showUpgradeGate = membershipCode === "trial" || membershipCode === "standard";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          전담 컨설턴트
        </h1>
        <p className="text-muted-foreground text-sm mt-1">전문 컨설턴트에게 직접 요청하고 결과를 받아보세요</p>
      </div>

      {showUpgradeGate && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">프로 멤버십 전용 서비스</p>
                <p className="text-xs text-muted-foreground mt-0.5">프로 멤버십 이상에서 전담 컨설턴트 서비스를 이용할 수 있습니다</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <BusinessContextBanner module="전담 컨설턴트" />

      <Card className="bg-muted/20 border-border/30">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs text-muted-foreground mb-2">
            <span className="text-primary font-medium">{label}</span> 업종 추천 요청 예시:
          </p>
          <div className="flex flex-wrap gap-2">
            {config.consultantExamples.map((ex, i) => (
              <Badge key={i} variant="outline" className="text-[11px]">{ex}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <MenuLandingGrid columns={3}>
        {requestTypes.map((r) => {
          const access = checkAccess(r.featureKey);
          if (!access.visible) return null;
          return (
            <MenuLandingCard
              key={r.key}
              title={r.key}
              description={r.desc}
              icon={r.icon}
              color={r.color}
              access={access}
            />
          );
        })}
      </MenuLandingGrid>

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">요청 이력</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">아직 요청 이력이 없습니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}