import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, Plus, Pencil, Trash2, Star, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface Notice {
  id: string;
  title: string;
  summary: string | null;
  notice_type: string;
  important: boolean;
  link_url: string | null;
  link_label: string | null;
  is_active: boolean;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
}

const NOTICE_TYPES = [
  { value: "notice", label: "공지" },
  { value: "update", label: "업데이트" },
  { value: "event", label: "이벤트" },
  { value: "ops_tip", label: "운영 팁" },
];

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

export default function OperatorNoticeTab() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [noticeType, setNoticeType] = useState("notice");
  const [important, setImportant] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fetchNotices = async () => {
    // Operators can see all notices including inactive via RLS
    const { data, error } = await supabase
      .from("operator_notices" as any)
      .select("*")
      .order("important", { ascending: false })
      .order("created_at", { ascending: false });

    if (!error && data) {
      setNotices(data as unknown as Notice[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const resetForm = () => {
    setTitle("");
    setSummary("");
    setNoticeType("notice");
    setImportant(false);
    setLinkUrl("");
    setLinkLabel("");
    setIsActive(true);
    setEditingNotice(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (notice: Notice) => {
    setEditingNotice(notice);
    setTitle(notice.title);
    setSummary(notice.summary || "");
    setNoticeType(notice.notice_type);
    setImportant(notice.important);
    setLinkUrl(notice.link_url || "");
    setLinkLabel(notice.link_label || "");
    setIsActive(notice.is_active);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("제목을 입력해 주세요.");
      return;
    }

    const payload = {
      title: title.trim(),
      summary: summary.trim() || null,
      notice_type: noticeType,
      important,
      link_url: linkUrl.trim() || null,
      link_label: linkLabel.trim() || null,
      is_active: isActive,
    };

    if (editingNotice) {
      const { error } = await supabase
        .from("operator_notices" as any)
        .update(payload as any)
        .eq("id", editingNotice.id);

      if (error) {
        toast.error("수정 실패: " + error.message);
        return;
      }
      toast.success("공지사항이 수정되었습니다.");
    } else {
      const { error } = await supabase
        .from("operator_notices" as any)
        .insert(payload as any);

      if (error) {
        toast.error("등록 실패: " + error.message);
        return;
      }
      toast.success("공지사항이 등록되었습니다.");
    }

    setDialogOpen(false);
    resetForm();
    fetchNotices();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("operator_notices" as any)
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("삭제 실패: " + error.message);
      return;
    }
    toast.success("공지사항이 삭제되었습니다.");
    fetchNotices();
  };

  const handleToggleActive = async (notice: Notice) => {
    const { error } = await supabase
      .from("operator_notices" as any)
      .update({ is_active: !notice.is_active } as any)
      .eq("id", notice.id);

    if (error) {
      toast.error("상태 변경 실패");
      return;
    }
    fetchNotices();
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              공지사항 관리
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">{notices.length}건</Badge>
              <Button size="sm" className="h-7 text-xs gap-1" onClick={openCreateDialog}>
                <Plus className="h-3 w-3" />
                공지 등록
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-xs text-muted-foreground py-4 text-center">불러오는 중...</p>
          ) : notices.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">등록된 공지가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 py-2.5 px-3 rounded-md border transition-colors ${
                    !n.is_active
                      ? "bg-muted/10 border-border/10 opacity-50"
                      : n.important
                      ? "bg-primary/5 border-primary/20"
                      : "bg-muted/20 border-border/20"
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
                      {!n.is_active && (
                        <Badge variant="outline" className="text-[9px] bg-muted/30 text-muted-foreground">비활성</Badge>
                      )}
                      {n.link_url && (
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    {n.summary && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">{n.summary}</p>
                    )}
                    {n.link_url && (
                      <p className="text-[10px] text-primary/70 mt-0.5 truncate">{n.link_label || n.link_url}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-[9px] text-muted-foreground whitespace-nowrap mr-2">
                      {n.created_at?.slice(0, 10)}
                    </span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleToggleActive(n)}>
                      <div className={`w-2 h-2 rounded-full ${n.is_active ? "bg-emerald-400" : "bg-muted-foreground"}`} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditDialog(n)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(n.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">{editingNotice ? "공지 수정" : "공지 등록"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">제목 *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="공지 제목" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">요약</Label>
              <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="공지 내용 요약" className="mt-1" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">유형</Label>
                <Select value={noticeType} onValueChange={setNoticeType}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {NOTICE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col justify-end gap-2">
                <div className="flex items-center gap-2">
                  <Switch checked={important} onCheckedChange={setImportant} />
                  <Label className="text-xs">중요 공지</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                  <Label className="text-xs">활성</Label>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-xs">링크 URL (선택)</Label>
              <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">링크 표시 텍스트 (선택)</Label>
              <Input value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} placeholder="자세히 보기" className="mt-1" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>취소</Button>
              <Button size="sm" onClick={handleSave}>{editingNotice ? "수정" : "등록"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
