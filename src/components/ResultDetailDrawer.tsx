import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Copy, RefreshCw, MessageSquare, Calendar, Clock, Tag, FolderOpen, Lock, FileText, Download, Share2, Send, History, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useMembership } from "@/contexts/MembershipContext";
import { useResultStore } from "@/contexts/ResultStoreContext";
import { toast } from "@/hooks/use-toast";
import { ExportDialog } from "@/components/ExportDialog";
import { ShareDialog } from "@/components/ShareDialog";
import { DeliverDialog } from "@/components/DeliverDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";

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
  const { getResultById, markResultRegenerated, markConsultantTransferred, deleteResult } = useResultStore();

  const [exportOpen, setExportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [deliverOpen, setDeliverOpen] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

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

  const handleDelete = () => {
    deleteResult(item.id);
    setDeleteOpen(false);
    onOpenChange(false);
    toast({ title: "삭제 완료", description: "결과가 삭제되었습니다" });
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleString("ko-KR");

  const exportCount = item.exportFiles?.length ?? 0;
  const shareCount = item.shareHistory?.length ?? 0;
  const deliveryCount = item.deliveryHistory?.length ?? 0;
  const consultantCount = item.consultantTransferHistory?.length ?? 0;
  const historyCount = exportCount + shareCount + deliveryCount + consultantCount;

  // Research metadata display
  const researchInputs = item.metadata?.researchInputs as Record<string, string> | undefined;

  return (
    <>
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

            {/* Research-specific metadata */}
            {item.type === "research" && researchInputs && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-3 pb-3 space-y-1">
                  <p className="text-[10px] font-medium text-primary mb-1.5">📊 조사 조건</p>
                  <div className="flex flex-wrap gap-1.5">
                    {researchInputs.businessTypeLabel && <Badge variant="outline" className="text-[9px]">업종: {researchInputs.businessTypeLabel}</Badge>}
                    {researchInputs.region && <Badge variant="outline" className="text-[9px]">지역: {researchInputs.region}</Badge>}
                    {researchInputs.keyword && <Badge variant="outline" className="text-[9px]">키워드: {researchInputs.keyword}</Badge>}
                    {researchInputs.templateTitle && <Badge variant="outline" className="text-[9px]">범위: {researchInputs.templateTitle}</Badge>}
                    {researchInputs.count && <Badge variant="outline" className="text-[9px]">수집: {researchInputs.count}건</Badge>}
                  </div>
                  {researchInputs.purpose && <p className="text-[10px] text-muted-foreground mt-1">목적: {researchInputs.purpose}</p>}
                  {(item.metadata as Record<string, unknown>)?.externalCollectionPlanned === false && (
                    <p className="text-[10px] text-amber-400 mt-1">⚠️ 외부 데이터 수집 미연동 — AI 내부 분석 기반 결과</p>
                  )}
                </CardContent>
              </Card>
            )}

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

            {/* History summary — collapsible */}
            {historyCount > 0 && (
              <Collapsible open={historyExpanded} onOpenChange={setHistoryExpanded}>
                <Card className="bg-muted/10 border-border/20">
                  <CardContent className="pt-3 pb-3">
                    <CollapsibleTrigger className="w-full flex items-center justify-between">
                      <p className="text-[10px] font-medium flex items-center gap-1.5">
                        <History className="h-3 w-3 text-primary" /> 이력 요약 · {historyCount}건
                      </p>
                      {historyExpanded ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                    </CollapsibleTrigger>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {exportCount > 0 && <Badge variant="outline" className="text-[9px] h-4"><Download className="h-2.5 w-2.5 mr-1" />내보내기 {exportCount}</Badge>}
                      {shareCount > 0 && <Badge variant="outline" className="text-[9px] h-4"><Share2 className="h-2.5 w-2.5 mr-1" />공유 {shareCount}</Badge>}
                      {deliveryCount > 0 && <Badge variant="outline" className="text-[9px] h-4"><Send className="h-2.5 w-2.5 mr-1" />전달 {deliveryCount}</Badge>}
                      {consultantCount > 0 && <Badge variant="outline" className="text-[9px] h-4"><MessageSquare className="h-2.5 w-2.5 mr-1" />컨설턴트 {consultantCount}</Badge>}
                    </div>

                    <CollapsibleContent className="mt-3 space-y-2">
                      {item.exportFiles && item.exportFiles.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">내보내기</p>
                          {item.exportFiles.map((e) => (
                            <div key={e.id} className="text-[10px] text-muted-foreground flex items-center gap-2">
                              <span className="uppercase font-mono text-primary">{e.format}</span>
                              <span>{e.fileName}</span>
                              <span className="ml-auto">{new Date(e.exportedAt).toLocaleDateString("ko-KR")}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {item.shareHistory && item.shareHistory.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">공유</p>
                          {item.shareHistory.map((s) => (
                            <div key={s.id} className="text-[10px] text-muted-foreground flex items-center gap-2">
                              <span className="font-medium">{s.method}</span>
                              {s.note && <span>{s.note}</span>}
                              <span className="ml-auto">{new Date(s.sharedAt).toLocaleDateString("ko-KR")}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {item.deliveryHistory && item.deliveryHistory.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">전달</p>
                          {item.deliveryHistory.map((d) => (
                            <div key={d.id} className="text-[10px] text-muted-foreground flex items-center gap-2">
                              <span className="font-medium">{d.channel}</span>
                              {d.recipient && <span>→ {d.recipient}</span>}
                              <Badge variant="outline" className="text-[8px] h-3.5">{d.status}</Badge>
                              <span className="ml-auto">{new Date(d.deliveredAt).toLocaleDateString("ko-KR")}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {item.consultantTransferHistory && item.consultantTransferHistory.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">전담 컨설턴트</p>
                          {item.consultantTransferHistory.map((ct) => (
                            <div key={ct.id} className="text-[10px] text-muted-foreground flex items-center gap-2">
                              <Badge variant="outline" className="text-[8px] h-3.5">{ct.status}</Badge>
                              {ct.requestNote && <span className="truncate">{ct.requestNote}</span>}
                              <span className="ml-auto">{new Date(ct.transferredAt).toLocaleDateString("ko-KR")}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CollapsibleContent>
                  </CardContent>
                </Card>
              </Collapsible>
            )}

            <Separator />

            {/* Primary actions — copy, regenerate, consultant */}
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

            {/* Delivery actions — download, share, deliver */}
            <div className="flex flex-wrap gap-2">
              {actions.export.visible && (
                <Button variant="secondary" size="sm" className="text-xs gap-1.5" disabled={!actions.export.enabled} onClick={() => actions.export.enabled && setExportOpen(true)}>
                  {actions.export.enabled ? <Download className="h-3 w-3" /> : <Lock className="h-3 w-3" />} 내보내기
                  {!actions.export.enabled && actions.export.lockReason && <span className="text-[9px] text-muted-foreground ml-0.5">{actions.export.lockReason}</span>}
                </Button>
              )}
              {actions.share.visible && (
                <Button variant="secondary" size="sm" className="text-xs gap-1.5" disabled={!actions.share.enabled} onClick={() => actions.share.enabled && setShareOpen(true)}>
                  {actions.share.enabled ? <Share2 className="h-3 w-3" /> : <Lock className="h-3 w-3" />} 공유
                  {!actions.share.enabled && actions.share.lockReason && <span className="text-[9px] text-muted-foreground ml-0.5">{actions.share.lockReason}</span>}
                </Button>
              )}
              {actions.deliver.visible && (
                <Button variant="secondary" size="sm" className="text-xs gap-1.5" disabled={!actions.deliver.enabled} onClick={() => actions.deliver.enabled && setDeliverOpen(true)}>
                  {actions.deliver.enabled ? <Send className="h-3 w-3" /> : <Lock className="h-3 w-3" />} 전달
                  {!actions.deliver.enabled && actions.deliver.lockReason && <span className="text-[9px] text-muted-foreground ml-0.5">{actions.deliver.lockReason}</span>}
                </Button>
              )}
            </div>

            {/* Delete action */}
            <Separator />
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-muted-foreground hover:text-destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-3 w-3" /> 삭제
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialogs */}
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} result={item} />
      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} result={item} />
      <DeliverDialog open={deliverOpen} onOpenChange={setDeliverOpen} result={item} />
      <DeleteConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={handleDelete} title={item.title} />
    </>
  );
}
