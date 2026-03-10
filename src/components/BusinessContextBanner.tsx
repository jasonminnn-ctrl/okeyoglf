import { Card, CardContent } from "@/components/ui/card";
import { Building2, Info } from "lucide-react";
import { useBusinessContext } from "@/contexts/BusinessContext";

interface BusinessContextBannerProps {
  module?: string;
}

export function BusinessContextBanner({ module }: BusinessContextBannerProps) {
  const { label, config } = useBusinessContext();
  const bannerMsg = module ? config.bannerMessages[module] : config.bannerMessages["대시보드"];
  const fallback = module
    ? `${module} 결과는 설정된 운영 프로필 기준으로 생성됩니다`
    : "관리자 설정에서 입력한 업종·운영 프로필이 AI 모듈에 자동 반영됩니다";

  return (
    <Card className="bg-muted/30 border-border/30">
      <CardContent className="pt-3 pb-3 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Building2 className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium">현재 업종:</span>
            <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">{label}</span>
            <span className="text-xs text-muted-foreground">|</span>
            <span className="text-xs text-muted-foreground">운영 프로필 반영 중</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Info className="h-3 w-3" />
            <span>{bannerMsg || fallback}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
