import { MessageSquare, Lock, ArrowRight, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useMembership } from "@/contexts/MembershipContext";
import { FEATURE_KEYS } from "@/lib/membership";

interface ConsultantCTAProps {
  category?: string;
  className?: string;
}

export function ConsultantCTA({ category = "전문 지원", className }: ConsultantCTAProps) {
  const { checkAccess } = useMembership();
  const access = checkAccess(FEATURE_KEYS.RESULT_CONSULTANT_TRANSFER);

  if (!access.visible) return null;

  const isLocked = !access.enabled;

  return (
    <Card className={cn(
      "border-border/50 relative overflow-hidden",
      isLocked ? "bg-muted/20" : "bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20",
      className
    )}>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
              isLocked ? "bg-muted/40" : "bg-primary/20"
            )}>
              {isLocked ? (
                <Lock className="h-4 w-4 text-muted-foreground" />
              ) : (
                <MessageSquare className="h-4 w-4 text-primary" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {category} 전담 컨설턴트 요청
              </p>
              {isLocked ? (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {access.lockReason || "현재 플랜에서는 이 기능이 제한됩니다"}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-0.5">
                  전문 컨설턴트에게 {category} 관련 요청을 보내세요
                </p>
              )}
            </div>
          </div>
          <Button
            variant={isLocked ? "outline" : "default"}
            size="sm"
            disabled={isLocked}
            className={cn(
              "flex-shrink-0",
              isLocked && "opacity-60"
            )}
          >
            {isLocked ? "업그레이드" : "요청하기"}
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
