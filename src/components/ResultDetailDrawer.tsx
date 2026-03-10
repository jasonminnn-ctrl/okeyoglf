import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Copy, RefreshCw, MessageSquare, Paperclip, StickyNote, Link2, Calendar, Clock, Tag, FolderOpen } from "lucide-react";

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

export function ResultDetailDrawer({ open, onOpenChange, item }: ResultDetailDrawerProps) {
  if (!item) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={statusColors[item.status] || "bg-muted text-muted-foreground"} variant="outline">
              {item.status}
            </Badge>
            <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
          </div>
          <SheetTitle className="text-lg">{item.title}</SheetTitle>
          <SheetDescription>
            {item.module} · {item.businessType}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" /> <span>생성일: 2026-03-10</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> <span>최근 수정: 2026-03-10</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Tag className="h-3 w-3" /> <span>업종: {item.businessType}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FolderOpen className="h-3 w-3" /> <span>카테고리: {item.category}</span>
            </div>
          </div>

          <Separator />

          {/* Result body placeholder */}
          <Card className="bg-muted/20 border-border/30">
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-muted-foreground">결과 본문이 여기에 표시됩니다. 실제 AI 생성 결과가 연동되면 전체 내용을 확인할 수 있습니다.</p>
            </CardContent>
          </Card>

          {/* Summary placeholder */}
          <Card className="bg-muted/20 border-border/30">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs font-medium mb-1">요약</p>
              <p className="text-xs text-muted-foreground">결과 요약이 여기에 표시됩니다.</p>
            </CardContent>
          </Card>

          <Separator />

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <Copy className="h-3 w-3" /> 복사 / 재사용
            </Button>
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <RefreshCw className="h-3 w-3" /> 수정 요청
            </Button>
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <MessageSquare className="h-3 w-3" /> 전담 컨설턴트 전환
            </Button>
          </div>

          <Separator />

          {/* Attachments placeholder */}
          <div>
            <p className="text-xs font-medium mb-2 flex items-center gap-1.5"><Paperclip className="h-3 w-3" /> 첨부파일</p>
            <div className="h-16 rounded-md border border-dashed border-border/50 flex items-center justify-center text-xs text-muted-foreground">
              첨부파일 영역 (준비 중)
            </div>
          </div>

          {/* Memo placeholder */}
          <div>
            <p className="text-xs font-medium mb-2 flex items-center gap-1.5"><StickyNote className="h-3 w-3" /> 메모</p>
            <div className="h-12 rounded-md border border-dashed border-border/50 flex items-center justify-center text-xs text-muted-foreground">
              메모 영역 (준비 중)
            </div>
          </div>

          {/* Related results placeholder */}
          <div>
            <p className="text-xs font-medium mb-2 flex items-center gap-1.5"><Link2 className="h-3 w-3" /> 관련 결과</p>
            <div className="h-12 rounded-md border border-dashed border-border/50 flex items-center justify-center text-xs text-muted-foreground">
              관련 결과 연결 (준비 중)
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
