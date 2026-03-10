/**
 * ShareDialog — Share method selection for saved results.
 * Phase 6: Copy share text is real; link generation is placeholder with history tracking.
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Link, Copy, Users, Check } from "lucide-react";
import { useResultStore, type SavedResult } from "@/contexts/ResultStoreContext";
import { buildShareText } from "@/lib/export-utils";
import { toast } from "@/hooks/use-toast";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: SavedResult;
}

type ShareMethod = "copy" | "link" | "internal";

interface ShareOption {
  method: ShareMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
}

const shareOptions: ShareOption[] = [
  {
    method: "copy",
    label: "텍스트 복사",
    description: "결과 요약을 클립보드에 복사합니다",
    icon: <Copy className="h-4 w-4" />,
    available: true,
  },
  {
    method: "link",
    label: "공유 링크 생성",
    description: "외부 공유 링크 — 연결 준비 완료",
    icon: <Link className="h-4 w-4" />,
    available: false,
  },
  {
    method: "internal",
    label: "내부 공유",
    description: "조직 내부 구성원에게 공유 — 연결 준비 완료",
    icon: <Users className="h-4 w-4" />,
    available: false,
  },
];

export function ShareDialog({ open, onOpenChange, result }: ShareDialogProps) {
  const { markResultShared } = useResultStore();
  const [selectedMethod, setSelectedMethod] = useState<ShareMethod | null>(null);

  const handleShare = async () => {
    if (!selectedMethod) return;

    const isReal = selectedMethod === "copy";

    if (isReal) {
      const text = buildShareText(result);
      await navigator.clipboard.writeText(text);
    }

    markResultShared(result.id, {
      id: `sh-${Date.now()}`,
      method: selectedMethod === "copy" ? "link" : selectedMethod === "link" ? "link" : "internal",
      sharedAt: new Date().toISOString(),
      sharedTo: selectedMethod === "internal" ? "내부 구성원" : undefined,
      note: selectedMethod === "copy"
        ? "텍스트 복사 공유"
        : selectedMethod === "link"
          ? "공유 링크 생성 요청"
          : "내부 공유 요청",
    });

    toast({
      title: isReal ? "복사 완료" : "공유 요청 기록",
      description: isReal
        ? "결과 요약이 클립보드에 복사되었습니다"
        : "서버 연결 후 공유 기능이 활성화됩니다",
    });

    setSelectedMethod(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Share2 className="h-4 w-4 text-primary" />
            공유
          </DialogTitle>
          <DialogDescription className="text-xs">
            {result.title} · v{result.version ?? 1}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {shareOptions.map((opt) => (
            <button
              key={opt.method}
              onClick={() => setSelectedMethod(opt.method)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                selectedMethod === opt.method
                  ? "border-primary bg-primary/5"
                  : "border-border/30 bg-muted/10 hover:bg-muted/20"
              }`}
            >
              <span className="text-muted-foreground">{opt.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{opt.label}</span>
                  {opt.available && (
                    <Badge variant="outline" className="text-[9px] h-4 px-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">즉시 가능</Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{opt.description}</p>
              </div>
              {selectedMethod === opt.method && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
            취소
          </Button>
          <Button size="sm" onClick={handleShare} disabled={!selectedMethod} className="text-xs gap-1.5">
            <Share2 className="h-3 w-3" />
            {selectedMethod && shareOptions.find(o => o.method === selectedMethod)?.available
              ? "공유하기"
              : "공유 요청"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
