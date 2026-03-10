import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Copy, RefreshCw, MessageSquare, Calendar, Clock, Tag, FolderOpen, Lock, FileText, Download, Share2, Send, History } from "lucide-react";
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
  const { getResultById, markResultExported, markResultShared, markResultDelivered, markConsultantTransferred, markResultRegenerated } = useResultStore();

  const item = resultId ? getResultById(resultId) : undefined;
  if (!item) return null;

  const actions = getResultActions();

  const handleCopyAll = async () => {
    if (!actions.copy.enabled) {
      toast({ title: "기능 제한", description: actions.copy.lockReason || "복사가 제한됩니다", variant: "destructive" });
      return;
    }
    const text = item.plainText || item.sections.map(s => `${s.title}\n${s.content}`).join("\n\n");
    await navigator.clipboard.writeText(text);
    toast({ title: "전체 복사 완료" });
  };

  const handleRegenerate = () => {
    if (!actions.regenerate.enabled) {
      toast({ title: "기능 제한", description: actions.regenerate.lockReason || "현재 플랜에서 이용할 수 없습니다", variant: "destructive" });
      return;
    }
    const newId = `regen-${Date.now()}`;
    markResultRegenerated(item.id, newId);
    toast({ title: "수정 요청 접수", description: "재생성 요청이 기록되었습니다" });
  };

  const handleConsultantTransfer = () => {
    if (!actions.consultantTransfer.enabled) {
      toast({ title: "기능 제한", description: actions.consultantTransfer.lockReason || "현재 플랜에서 이용할 수 없습니다", variant: "destructive" });
      return;
    }
    markConsultantTransferred(item.id, {
      id: `ct-${Date.now()}`,
      transferredAt: new Date().toISOString(),
      requestNote: `결과 상세에서 전담 컨설턴트 전환 — ${item.title}`,
      status: "requested",
    });
    toast({ title: "전담 컨설턴트 전환 완료", description: "요청이 접수되었습니다" });
  };

  // Phase 6 placeholder actions
  const handleExport = () => {
    markResultExported(item.id, {
      id: `exp-${Date.now()}`,
      format: "pdf",
      fileName: `${item.title}.pdf`,
      exportedAt: new Date().toISOString(),
    });
    toast({ title: "내보내기 준비", description: "PDF 내보내기 기능은 다음 업데이트에서 제공됩니다" });
  };

  const handleShare = () => {
    markResultShared(item.id, {
      id: `sh-${Date.now()}`,
      method: "link",
      sharedAt: new Date().toISOString(),
      note: "공유 링크 생성",
    });
    toast({ title: "공유 준비", description: "공유 기능은 다음 업데이트에서 제공됩니다" });
  };

  const handleDeliver = () => {
    markResultDelivered(item.id, {
      id: `dl-${Date.now()}`,
      channel: "internal",
      deliveredAt: new Date().toISOString(),
      status: "sent",
      note: "내부 전달",
    });
    toast({ title: "전달 준비", description: "전달 기능은 다음 업데이트에서 제공됩니다" });
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleString("ko-KR");

  const historyCount =
    (item.exportFiles?.length ?? 0) +
    (item.shareHistory?.length ?? 0) +
    (item.deliveryHistory?.length ?? 0) +
    (item.consultantTransferHistory?.length ?? 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={statusColors[item.status] || "bg-muted text-muted-foreground"} variant="outline">{item.status}</Badge>
            <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
            {item.type && <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">{item.type}</Badge>}
            {item.version && item.version > 1 && <Badge variant="outline" className="text-[10px]">v{item.version}</Badge>}
          </div>
          <SheetTitle className="text-lg">{item.title}</SheetTitle>
          <SheetDescription>{item.module || item.sourceMenu} · {item.subtool || item.sourceTool} · {item.businessType}</SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Calendar className="h-3 w-3" /> <span>생성: {formatDate(item.createdAt)}</span></div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> <span>수정: {formatDate(item.updatedAt)}</span></div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Tag className="h-3 w-3" /> <span>업종: {item.businessType}</span></div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><FolderOpen className="h-3 w-3" /> <span>{item.category}</span></div>
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tag, i) => (
                <Badge key={i} variant="outline" className="text-[9px] bg-muted/30">{tag}</Badge>
              ))}
            </div>
          )}

          <Separator />

          {/* Sections */}
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

          {/* Source / Reference */}
          {(item.sourceNote || item.referenceNote) && (
            <Card className="bg-muted/10 border-border/20">
              <CardContent className="pt-3 pb-3 space-y-1">
                {item.sourceNote && <p className="text-[10px] text-muted-foreground">📋 {item.sourceNote}</p>}
                {item.referenceNote && <p className="text-[10px] text-muted-foreground">📎 {item.referenceNote}</p>}
              </CardContent>
            </Card>
          )}

          {/* History summary */}
          {historyCount > 0 && (
            <Card className="bg-muted/10 border-border/20">
              <CardContent className="pt-3 pb-3">
                <p className="text-[10px] font-medium flex items-center gap-1.5 mb-1.5">
                  <History className="h-3 w-3 text-primary" /> 이력 요약
                </p>
                <div className="space-y-0.5 text-[10px] text-muted-foreground">
                  {(item.exportFiles?.length ?? 0) > 0 && <p>내보내기 {item.exportFiles!.length}건</p>}
                  {(item.shareHistory?.length ?? 0) > 0 && <p>공유 {item.shareHistory!.length}건</p>}
                  {(item.deliveryHistory?.length ?? 0) > 0 && <p>전달 {item.deliveryHistory!.length}건</p>}
                  {(item.consultantTransferHistory?.length ?? 0) > 0 && <p>전담 컨설턴트 전환 {item.consultantTransferHistory!.length}건</p>}
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Primary actions */}
          <div className="flex flex-wrap gap-2">
            {actions.copy.visible && (
              <Button variant="outline" size="sm" className="text-xs gap-1.5" disabled={!actions.copy.enabled} onClick={handleCopyAll}>
                {actions.copy.enabled ? <Copy className="h-3 w-3" /> : <Lock className="h-3 w-3" />} 전체 복사
              </Button>
            )}
            {actions.regenerate.visible && (
              <Button variant="outline" size="sm" className="text-xs gap-1.5" disabled={!actions.regenerate.enabled} onClick={handleRegenerate}>
                {actions.regenerate.enabled ? <RefreshCw className="h-3 w-3" /> : <Lock className="h-3 w-3" />} 수정 요청
              </Button>
            )}
            {actions.consultantTransfer.visible && (
              <Button variant="outline" size="sm" className="text-xs gap-1.5" disabled={!actions.consultantTransfer.enabled} onClick={handleConsultantTransfer}>
                {actions.consultantTransfer.enabled ? <MessageSquare className="h-3 w-3" /> : <Lock className="h-3 w-3" />} 전담 컨설턴트 전환
              </Button>
            )}
          </div>

          {/* Phase 6 placeholder actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-muted-foreground" onClick={handleExport}>
              <Download className="h-3 w-3" /> 내보내기
            </Button>
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-muted-foreground" onClick={handleShare}>
              <Share2 className="h-3 w-3" /> 공유
            </Button>
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-muted-foreground" onClick={handleDeliver}>
              <Send className="h-3 w-3" /> 전달
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
