/**
 * DeliverDialog — Delivery method and recipient selection for saved results.
 * Phase 6: All channels are placeholder with history tracking.
 * Future: Connect email/KakaoTalk/internal APIs.
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, Mail, MessageCircle, Users, Check } from "lucide-react";
import { useResultStore, type SavedResult } from "@/contexts/ResultStoreContext";
import { toast } from "@/hooks/use-toast";

interface DeliverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: SavedResult;
}

type DeliveryChannel = "email" | "kakao" | "internal";

interface ChannelOption {
  channel: DeliveryChannel;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const channelOptions: ChannelOption[] = [
  {
    channel: "email",
    label: "이메일 전달",
    description: "이메일로 결과물 전달 — 연결 준비 완료",
    icon: <Mail className="h-4 w-4" />,
  },
  {
    channel: "kakao",
    label: "카카오톡 / 알림",
    description: "카카오톡 또는 알림 발송 — 연결 준비 완료",
    icon: <MessageCircle className="h-4 w-4" />,
  },
  {
    channel: "internal",
    label: "내부 전달",
    description: "조직 내부 구성원에게 전달 — 연결 준비 완료",
    icon: <Users className="h-4 w-4" />,
  },
];

export function DeliverDialog({ open, onOpenChange, result }: DeliverDialogProps) {
  const { markResultDelivered } = useResultStore();
  const [selectedChannel, setSelectedChannel] = useState<DeliveryChannel | null>(null);
  const [recipient, setRecipient] = useState("");
  const [memo, setMemo] = useState("");

  const handleDeliver = () => {
    if (!selectedChannel) return;

    markResultDelivered(result.id, {
      id: `dl-${Date.now()}`,
      channel: selectedChannel,
      deliveredAt: new Date().toISOString(),
      recipient: recipient || undefined,
      status: "sent",
      note: memo || `${channelOptions.find(c => c.channel === selectedChannel)?.label} 전달 요청`,
    });

    toast({
      title: "전달 요청 기록",
      description: `${channelOptions.find(c => c.channel === selectedChannel)?.label} — 서버 연결 후 자동 발송됩니다`,
    });

    setSelectedChannel(null);
    setRecipient("");
    setMemo("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Send className="h-4 w-4 text-primary" />
            전달
          </DialogTitle>
          <DialogDescription className="text-xs">
            {result.title} · v{result.version ?? 1}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Channel selection */}
          <div className="space-y-2">
            {channelOptions.map((opt) => (
              <button
                key={opt.channel}
                onClick={() => setSelectedChannel(opt.channel)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                  selectedChannel === opt.channel
                    ? "border-primary bg-primary/5"
                    : "border-border/30 bg-muted/10 hover:bg-muted/20"
                }`}
              >
                <span className="text-muted-foreground">{opt.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">{opt.label}</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{opt.description}</p>
                </div>
                {selectedChannel === opt.channel && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
              </button>
            ))}
          </div>

          {/* Recipient & memo — shown when channel selected */}
          {selectedChannel && (
            <div className="space-y-3 pt-1">
              <div className="space-y-1.5">
                <Label className="text-xs">받는 사람</Label>
                <Input
                  placeholder={
                    selectedChannel === "email" ? "이메일 주소"
                    : selectedChannel === "kakao" ? "전화번호 또는 이름"
                    : "내부 구성원 이름"
                  }
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="text-sm h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">전달 메모 (선택)</Label>
                <Textarea
                  placeholder="전달 시 함께 보낼 메모를 입력하세요"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="text-sm min-h-[60px] resize-none"
                />
              </div>
              <Badge variant="outline" className="text-[10px] bg-muted/30">
                서버 연결 후 실제 발송이 활성화됩니다
              </Badge>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
            취소
          </Button>
          <Button size="sm" onClick={handleDeliver} disabled={!selectedChannel} className="text-xs gap-1.5">
            <Send className="h-3 w-3" />
            전달 요청
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
