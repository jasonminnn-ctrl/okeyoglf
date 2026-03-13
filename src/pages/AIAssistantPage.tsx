import { useState, useEffect } from "react";
import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { useMembership } from "@/contexts/MembershipContext";
import { FEATURE_KEYS } from "@/lib/membership";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot, ListChecks, AlertCircle, Megaphone, CalendarClock, ClipboardCheck, Zap, Bell, Star, ExternalLink, Paperclip } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { OperationalAttachmentSection } from "@/components/OperationalAttachmentSection";

const sectionKeys = [
  { key: "오늘의 할 일", icon: ListChecks, color: "bg-primary/10 text-primary", url: "/ai-assistant/daily-tasks", featureKey: FEATURE_KEYS.ASSISTANT_DAILY,
    prompt: "오늘 해야 할 운영 업무를 정리해 주세요. 미방문 회원, 예약 확인, 프로모션 점검 등을 포함해 주세요." },
  { key: "이번 주 추천 액션", icon: Zap, color: "bg-amber-500/10 text-amber-400", url: "/ai-assistant/weekly-actions", featureKey: FEATURE_KEYS.ASSISTANT_WEEKLY,
    prompt: "이번 주에 실행하면 좋을 운영 액션을 추천해 주세요. 매출, 회원 유지, 캠페인 관점에서 알려주세요." },
  { key: "놓치고 있는 운영 항목", icon: AlertCircle, color: "bg-red-500/10 text-red-400", url: "/ai-assistant/ops-check", featureKey: FEATURE_KEYS.ASSISTANT_MISSING },
  { key: "캠페인 추천", icon: Megaphone, color: "bg-blue-500/10 text-blue-400", url: "/ai-assistant/campaign-planner", featureKey: FEATURE_KEYS.ASSISTANT_CAMPAIGN },
  { key: "일정/마감 리마인드", icon: CalendarClock, color: "bg-violet-500/10 text-violet-400", url: "/ai-assistant/reminder-board", featureKey: FEATURE_KEYS.ASSISTANT_REMINDER },
  { key: "업종별 체크리스트", icon: ClipboardCheck, color: "bg-emerald-500/10 text-emerald-400", url: "/ai-assistant/checklist-manager", featureKey: FEATURE_KEYS.ASSISTANT_CHECKLIST },
];

interface Notice {
  id: string;
  title: string;
  summary: string | null;
  body: string | null;
  notice_type: string;
  important: boolean;
  link_url: string | null;
  link_label: string | null;
  created_at: string;
}

const typeBadgeColor: Record<string, string> = {
  notice: "bg-primary/10 text-primary border-primary/20",
  update: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  event: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  ops_tip: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const typeLabel: Record<string, string> = {
  notice: "공지",
  update: "업데이트",
  event: "이벤트",
  ops_tip: "운영 팁",
};

export default function AIAssistantPage() {
  const { config } = useBusinessContext();
  const { checkAccess } = useMembership();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const fetchNotices = async () => {
      const { data, error } = await supabase
        .from("operator_notices" as any)
        .select("id, title, summary, body, notice_type, important, link_url, link_label, created_at")
        .eq("is_active", true)
        .order("important", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        setNotices(data as unknown as Notice[]);
      }
      setLoadingNotices(false);
    };
    fetchNotices();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          AI 비서
        </h1>
        <p className="text-muted-foreground text-sm mt-1">AI가 오늘 해야 할 일과 놓치고 있는 항목을 정리합니다</p>
      </div>

      <BusinessContextBanner module="AI 비서" />

      <MenuLandingGrid columns={3}>
        {sectionKeys.map((s) => {
          const access = checkAccess(s.featureKey);
          if (!access.visible) return null;
          return (
            <MenuLandingCard key={s.key} title={s.key} description={config.assistantExamples[s.key] || "준비 중"} icon={s.icon} color={s.color} url={s.url} access={access} />
          );
        })}
      </MenuLandingGrid>

      {/* 공지사항 영역 — DB 연동 */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">공지사항</span>
            <span className="text-[10px] text-muted-foreground">— 운영 공지 · 업데이트 · 이벤트 · 중요 안내</span>
          </div>

          {loadingNotices ? (
            <p className="text-xs text-muted-foreground py-4 text-center">불러오는 중...</p>
          ) : notices.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">등록된 공지가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {notices.map((n) => (
                <div
                  key={n.id}
                  onClick={() => setSelectedNotice(n)}
                  className={`flex items-start gap-3 py-2.5 px-3 rounded-md border cursor-pointer transition-colors hover:border-primary/30 ${
                    n.important ? "bg-primary/5 border-primary/20" : "bg-muted/20 border-border/20"
                  }`}
                >
                  {n.important && (
                    <Star className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0 fill-primary" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium">{n.title}</span>
                      <Badge variant="outline" className={`text-[9px] ${typeBadgeColor[n.notice_type] || ""}`}>
                        {typeLabel[n.notice_type] || n.notice_type}
                      </Badge>
                    </div>
                    {n.summary && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{n.summary}</p>
                    )}
                  </div>
                  <span className="text-[9px] text-muted-foreground flex-shrink-0 whitespace-nowrap">
                    {n.created_at?.slice(0, 10)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notice Detail Dialog */}
      <Dialog open={!!selectedNotice} onOpenChange={open => { if (!open) setSelectedNotice(null); }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 flex-wrap">
              <DialogTitle className="text-base">{selectedNotice?.title}</DialogTitle>
              {selectedNotice && (
                <Badge variant="outline" className={`text-[9px] ${typeBadgeColor[selectedNotice.notice_type] || ""}`}>
                  {typeLabel[selectedNotice.notice_type] || selectedNotice.notice_type}
                </Badge>
              )}
              {selectedNotice?.important && (
                <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/20">중요</Badge>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">{selectedNotice?.created_at?.slice(0, 10)}</p>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {selectedNotice?.summary && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">요약</p>
                <p className="text-sm">{selectedNotice.summary}</p>
              </div>
            )}

            {selectedNotice?.body && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">내용</p>
                <div className="text-sm whitespace-pre-wrap bg-muted/20 rounded-md p-3 border border-border/30">
                  {selectedNotice.body}
                </div>
              </div>
            )}

            {selectedNotice?.link_url && (
              <a
                href={selectedNotice.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {selectedNotice.link_label || "자세히 보기"}
              </a>
            )}

            {/* Attachments */}
            {selectedNotice && (
              <div className="pt-2 border-t border-border/30">
                <OperationalAttachmentSection entityType="notice" entityId={selectedNotice.id} />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedNotice(null)} className="text-xs">닫기</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
