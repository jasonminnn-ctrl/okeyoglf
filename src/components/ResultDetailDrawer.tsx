import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Copy, RefreshCw, MessageSquare, Paperclip, StickyNote, Link2, Calendar, Clock, Tag, FolderOpen, Lock } from "lucide-react";
import { useMembership } from "@/contexts/MembershipContext";
import { toast } from "@/hooks/use-toast";

export interface ResultItem {
  title: string;
  category: string;
  module: string;
  businessType: string;
  status: "임시 저장" | "검토 필요" | "완료" | "전달 완료" | "보관됨";
}

interface ResultDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ResultItem | null;
}

const statusColors: Record<string, string> = {
  "임시 저장": "bg-muted text-muted-foreground",
  "검토 필요": "bg-amber-500/20 text-amber-400",
  "완료": "bg-emerald-500/20 text-emerald-400",
  "전달 완료": "bg-blue-500/20 text-blue-400",
  "보관됨": "bg-muted text-muted-foreground",
};

const categoryPlaceholders: Record<string, { body: string; summary: string }> = {
  "AI 비서 결과": { body: "AI 비서가 생성한 추천 문안, 체크리스트, 또는 요약 결과가 여기에 표시됩니다.", summary: "오늘의 추천 항목 및 운영 체크리스트 요약이 표시됩니다." },
  "AI 운영팀 결과": { body: "운영 분석 리포트, 점검표, 또는 KPI 진단 결과가 여기에 표시됩니다.", summary: "운영 지표 분석 및 개선 포인트 요약이 표시됩니다." },
  "AI 영업팀 결과": { body: "고객 관리 제안, 응대 문안, 또는 판매 전략 요약이 여기에 표시됩니다.", summary: "영업 액션 및 고객 접촉 결과 요약이 표시됩니다." },
  "AI 마케팅팀 결과": { body: "마케팅 카피, 캠페인 기획안, 또는 채널 전략 초안이 여기에 표시됩니다.", summary: "프로모션 문안 및 캠페인 핵심 포인트 요약이 표시됩니다." },
  "AI 디자인팀 결과": { body: "디자인 시안, 홍보물 초안, 또는 템플릿 결과가 여기에 표시됩니다.", summary: "제작된 홍보물 및 디자인 요청 결과 요약이 표시됩니다." },
  "AI 경영지원 결과": { body: "문서 초안, 계약서 정리, 또는 업무 체크리스트가 여기에 표시됩니다.", summary: "경영지원 문서 및 반복 업무 점검 요약이 표시됩니다." },
  "시장조사 결과": { body: "조사 요약, 경쟁사 리스트, 또는 인사이트 분석이 여기에 표시됩니다.", summary: "시장조사 조건, 경쟁 현황, 추천 액션 요약이 표시됩니다." },
  "전담 컨설턴트 결과": { body: "컨설턴트 검토 결과, 전달 문서, 또는 회신 내용이 여기에 표시됩니다.", summary: "컨설팅 요청 사항 및 전문가 회신 요약이 표시됩니다." },
};

const defaultPlaceholder = { body: "결과 본문이 여기에 표시됩니다.", summary: "결과 요약이 여기에 표시됩니다." };

export function ResultDetailDrawer({ open, onOpenChange, item }: ResultDetailDrawerProps) {
  const { getResultActions } = useMembership();
  
  if (!item) return null;

  const placeholder = categoryPlaceholders[item.category] || defaultPlaceholder;
  const actions = getResultActions();

  const handleAction = (name: string, enabled: boolean, lockReason?: string) => {
    if (!enabled) {
      toast({ title: "기능 제한", description: lockReason || "현재 플랜에서 이용할 수 없습니다", variant: "destructive" });
      return;
    }
    toast({ title: `${name} 완료`, description: "데모 모드에서 실행되었습니다" });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={statusColors[item.status] || "bg-muted text-muted-foreground"} variant="outline">{item.status}</Badge>
            <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
          </div>
          <SheetTitle className="text-lg">{item.title}</SheetTitle>
          <SheetDescription>{item.module} · {item.businessType}</SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Calendar className="h-3 w-3" /> <span>생성일: 2026-03-10</span></div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> <span>최근 수정: 2026-03-10</span></div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Tag className="h-3 w-3" /> <span>업종: {item.businessType}</span></div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><FolderOpen className="h-3 w-3" /> <span>카테고리: {item.category}</span></div>
          </div>

          <Separator />

          <Card className="bg-muted/20 border-border/30">
            <CardContent className="pt-4 pb-4"><p className="text-sm text-muted-foreground">{placeholder.body}</p></CardContent>
          </Card>
          <Card className="bg-muted/20 border-border/30">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs font-medium mb-1">요약</p>
              <p className="text-xs text-muted-foreground">{placeholder.summary}</p>
            </CardContent>
          </Card>

          <Separator />

          {/* Action buttons with policy-based access */}
          <div className="flex flex-wrap gap-2">
            {actions.copy.visible && (
              <Button variant="outline" size="sm" className="text-xs gap-1.5" disabled={!actions.copy.enabled}
                onClick={() => handleAction("복사", actions.copy.enabled, actions.copy.lockReason)}>
                {actions.copy.enabled ? <Copy className="h-3 w-3" /> : <Lock className="h-3 w-3" />} 복사 / 재사용
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

          <Separator />

          <div>
            <p className="text-xs font-medium mb-2 flex items-center gap-1.5"><Paperclip className="h-3 w-3" /> 첨부파일</p>
            <div className="h-16 rounded-md border border-dashed border-border/50 flex items-center justify-center text-xs text-muted-foreground">첨부파일 영역 (준비 중)</div>
          </div>
          <div>
            <p className="text-xs font-medium mb-2 flex items-center gap-1.5"><StickyNote className="h-3 w-3" /> 메모</p>
            <div className="h-12 rounded-md border border-dashed border-border/50 flex items-center justify-center text-xs text-muted-foreground">메모 영역 (준비 중)</div>
          </div>
          <div>
            <p className="text-xs font-medium mb-2 flex items-center gap-1.5"><Link2 className="h-3 w-3" /> 관련 결과</p>
            <div className="h-12 rounded-md border border-dashed border-border/50 flex items-center justify-center text-xs text-muted-foreground">관련 결과 연결 (준비 중)</div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
