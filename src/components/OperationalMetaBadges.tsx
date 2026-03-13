/**
 * OperationalMetaBadges — 운영 객체의 담당자/완료자/완료일/수정일 메타 표시
 */

import { Badge } from "@/components/ui/badge";
import { User, CheckCircle2, Clock } from "lucide-react";

interface Props {
  assignee?: string | null;
  completedByName?: string | null;
  completedAt?: string | null;
  updatedAt?: string | null;
  sourceType?: string | null;
  riskSource?: string | null;
  compact?: boolean;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" }) +
    " " + d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

export function OperationalMetaBadges({
  assignee,
  completedByName,
  completedAt,
  updatedAt,
  sourceType,
  riskSource,
  compact = false,
}: Props) {
  const items: React.ReactNode[] = [];

  if (assignee) {
    items.push(
      <span key="assignee" className="inline-flex items-center gap-0.5">
        <User className="h-2.5 w-2.5" />
        담당: {assignee}
      </span>
    );
  }

  if (completedByName && completedAt) {
    items.push(
      <span key="completed" className="inline-flex items-center gap-0.5 text-emerald-400">
        <CheckCircle2 className="h-2.5 w-2.5" />
        완료: {completedByName} ({formatDate(completedAt)})
      </span>
    );
  }

  if (updatedAt && !compact) {
    items.push(
      <span key="updated" className="inline-flex items-center gap-0.5">
        <Clock className="h-2.5 w-2.5" />
        수정: {formatDate(updatedAt)}
      </span>
    );
  }

  if (sourceType === "ai_generated") {
    items.push(
      <Badge key="ai" variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/20">AI</Badge>
    );
  }

  if (riskSource === "ai_suggested") {
    items.push(
      <Badge key="risk-ai" variant="outline" className="text-[9px] bg-violet-500/10 text-violet-400 border-violet-500/20">AI 제안</Badge>
    );
  }

  if (riskSource === "ops_recommended") {
    items.push(
      <Badge key="risk-ops" variant="outline" className="text-[9px] bg-amber-500/10 text-amber-400 border-amber-500/20">운영 권장</Badge>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap text-[10px] text-muted-foreground">
      {items}
    </div>
  );
}
