import { MessageSquare, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ConsultantCTAProps {
  category?: string;
  status?: "active" | "inactive" | "locked";
  className?: string;
}

export function ConsultantCTA({ category = "전문 지원", status = "locked", className }: ConsultantCTAProps) {
  const isLocked = status === "locked";

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
                  프로 멤버십 이상에서 이용 가능한 기능입니다
                </p>
              ) : status === "inactive" ? (
                <p className="text-xs text-muted-foreground mt-0.5">
                  업그레이드 후 전담 컨설턴트 요청이 가능합니다
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
