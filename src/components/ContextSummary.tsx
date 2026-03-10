import { Card, CardContent } from "@/components/ui/card";
import { Building2, MapPin, Clock, BarChart3, StickyNote } from "lucide-react";
import type { BusinessContextSummary } from "@/lib/ai-generation";

interface ContextSummaryProps {
  context: BusinessContextSummary;
  compact?: boolean;
}

export function ContextSummary({ context, compact }: ContextSummaryProps) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-2 text-[11px]">
        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary">{context.businessType}</span>
        {context.location && (
          <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">{context.location}</span>
        )}
        {context.keyMetrics.slice(0, 2).map((m, i) => (
          <span key={i} className="px-2 py-0.5 rounded bg-muted text-muted-foreground">{m}</span>
        ))}
      </div>
    );
  }

  return (
    <Card className="bg-muted/20 border-border/30">
      <CardContent className="pt-3 pb-3 space-y-2">
        <p className="text-[11px] font-medium text-muted-foreground">📋 비즈니스 컨텍스트 요약</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 className="h-3 w-3 flex-shrink-0" />
            <span>{context.organizationName} · {context.businessType}</span>
          </div>
          {context.location && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span>{context.location}</span>
            </div>
          )}
          {context.operatingHours && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span>{context.operatingHours}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <BarChart3 className="h-3 w-3 flex-shrink-0" />
            <span>{context.keyMetrics.join(" · ")}</span>
          </div>
        </div>
        {context.internalNotes.length > 0 && (
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground pt-1 border-t border-border/20">
            <StickyNote className="h-3 w-3 flex-shrink-0 mt-0.5" />
            <span>{context.internalNotes.join(" / ")}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
