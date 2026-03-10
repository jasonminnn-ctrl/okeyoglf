import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Copy, RefreshCw, MessageSquare, Calendar, Clock, Tag, FolderOpen, Lock, FileText } from "lucide-react";
import { useMembership } from "@/contexts/MembershipContext";
import { useResultStore } from "@/contexts/ResultStoreContext";
import { toast } from "@/hooks/use-toast";

interface ResultDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resultId: string | null;
}

const statusColors: Record<string, string> = {
  "임시 저장": "bg-muted text-muted-foreground",
  "검토 필요": "bg-amber-500/20 text-amber-400",
  "완료": "bg-emerald-500/20 text-emerald-400",
  "전달 완료": "bg-blue-500/20 text-blue-400",
  "보관됨": "bg-muted text-muted-foreground",
};

export function ResultDetailDrawer({ open, onOpenChange, resultId }: ResultDetailDrawerProps) {
  const { getResultActions } = useMembership();
  const { getResultById } = useResultStore();

  const item = resultId ? getResultById(resultId) : undefined;
  if (!item) return null;

  const actions = getResultActions();

  const handleCopyAll = async () => {
    if (!actions.copy.enabled) {
      toast({ title: "기능 제한", description: actions.copy.lockReason || "복사가 제한됩니다", variant: "destructive" });
      return;
    }
    const text = item.sections.map(s => `${s.title}\n${s.content}`).join("\n\n");
    await navigator.clipboard.writeText(text);
    toast({ title: "전체 복사 완료" });
  };

  const handleAction = (name: string, enabled: boolean, lockReason?: string) => {
    if (!enabled) {
      toast({ title: "기능 제한", description: lockReason || "현재 플랜에서 이용할 수 없습니다", variant: "destructive" });
      return;
    }
    toast({ title: `${name} 완료`, description: "실행되었습니다" });
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleString("ko-KR");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={statusColors[item.status] || "bg-muted text-muted-foreground"} variant="outline">{item.status}</Badge>
            <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
          </div>
          <SheetTitle className="text-lg">{item.title}</SheetTitle>
          <SheetDescription>{item.module} · {item.subtool} · {item.businessType}</SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Calendar className="h-3 w-3" /> <span>생성: {formatDate(item.createdAt)}</span></div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> <span>수정: {formatDate(item.updatedAt)}</span></div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Tag className="h-3 w-3" /> <span>업종: {item.businessType}</span></div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><FolderOpen className="h-3 w-3" /> <span>{item.category}</span></div>
          </div>

          <Separator />

          {/* Actual result sections */}
          {item.sections.map((section, i) => (
            <Card key={i} className="bg-muted/20 border-border/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs font-medium mb-2 flex items-center gap-1.5">
                  <FileText className="h-3 w-3 text-primary" />
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.content.split("\n").map((line, j) => {
                    const trimmed = line.trim();
                    if (!trimmed) return <div key={j} className="h-1.5" />;
                    return <p key={j} className="text-xs text-muted-foreground leading-relaxed">{trimmed}</p>;
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Source/Reference */}
          {(item.sourceNote || item.referenceNote) && (
            <Card className="bg-muted/10 border-border/20">
              <CardContent className="pt-3 pb-3 space-y-1">
                {item.sourceNote && <p className="text-[10px] text-muted-foreground">📋 {item.sourceNote}</p>}
                {item.referenceNote && <p className="text-[10px] text-muted-foreground">📎 {item.referenceNote}</p>}
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {actions.copy.visible && (
              <Button variant="outline" size="sm" className="text-xs gap-1.5" disabled={!actions.copy.enabled} onClick={handleCopyAll}>
                {actions.copy.enabled ? <Copy className="h-3 w-3" /> : <Lock className="h-3 w-3" />} 전체 복사
              </Button>
            )}
            {actions.regenerate.visible && (
              <Button variant="outline" size="sm" className="text-xs gap-1.5" disabled={!actions.regenerate.enabled}
                onClick={() => handleAction("수정 요청", actions.regenerate.enabled, actions.regenerate.lockReason)}>
                {actions.regenerate.enabled ? <RefreshCw className="h-3 w-3" /> : <Lock className="h-3 w-3" />} 수정 요청
              </Button>
            )}
            {actions.consultantTransfer.visible && (
              <Button variant="outline" size="sm" className="text-xs gap-1.5" disabled={!actions.consultantTransfer.enabled}
                onClick={() => handleAction("전담 컨설턴트 전환", actions.consultantTransfer.enabled, actions.consultantTransfer.lockReason)}>
                {actions.consultantTransfer.enabled ? <MessageSquare className="h-3 w-3" /> : <Lock className="h-3 w-3" />} 전담 컨설턴트 전환
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
