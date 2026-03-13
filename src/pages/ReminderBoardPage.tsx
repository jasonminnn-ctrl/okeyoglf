/**
 * ReminderBoardPage — 일정/마감 리마인드 관리 보드
 */

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CalendarClock, Plus, ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { fetchReminders, insertReminder, updateReminder, deleteReminder, type AssistantReminder } from "@/lib/repositories/assistant-repository";
import { toast } from "@/hooks/use-toast";

const typeOptions = [
  { value: "settlement", label: "정산" },
  { value: "contract", label: "계약" },
  { value: "promotion", label: "프로모션" },
  { value: "ops_check", label: "운영점검" },
  { value: "general", label: "기타" },
];

const statusOptions = [
  { value: "active", label: "활성", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { value: "snoozed", label: "연기", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { value: "done", label: "완료", color: "bg-muted/30 text-muted-foreground border-border/30" },
];

export default function ReminderBoardPage() {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<AssistantReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", reminder_type: "general", due_date: "", is_recurring: false, memo: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setReminders(await fetchReminders());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    await insertReminder({
      title: form.title,
      reminder_type: form.reminder_type,
      due_date: form.due_date || null,
      is_recurring: form.is_recurring,
      memo: form.memo || null,
      source_type: "user_created",
    });
    setForm({ title: "", reminder_type: "general", due_date: "", is_recurring: false, memo: "" });
    setAddOpen(false);
    toast({ title: "리마인드 추가 완료" });
    load();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateReminder(id, { status } as any);
    setReminders(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const handleDelete = async (id: string) => {
    await deleteReminder(id);
    setReminders(prev => prev.filter(r => r.id !== id));
    toast({ title: "삭제 완료" });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/ai-assistant")} className="mb-2 -ml-2 text-xs text-muted-foreground">
          <ArrowLeft className="h-3 w-3 mr-1" /> AI 비서
        </Button>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CalendarClock className="h-6 w-6 text-violet-400" />
          일정/마감 리마인드
        </h1>
        <p className="text-muted-foreground text-sm mt-1">일정과 마감 사항을 보드형으로 관리합니다</p>
      </div>

      <BusinessContextBanner module="AI 비서" />

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{reminders.length}개 리마인드</p>
        <Button size="sm" onClick={() => setAddOpen(true)} className="text-xs gap-1.5">
          <Plus className="h-3 w-3" /> 리마인드 추가
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 text-primary animate-spin" /></div>
      ) : reminders.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-12 text-center">
            <CalendarClock className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">등록된 리마인드가 없습니다</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {reminders.map(r => {
            const st = statusOptions.find(s => s.value === r.status);
            const tp = typeOptions.find(t => t.value === r.reminder_type);
            return (
              <Card key={r.id} className="bg-card/50 border-border/50">
                <CardContent className="py-3 px-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{r.title}</span>
                        <Badge variant="outline" className={`text-[9px] ${st?.color || ""}`}>{st?.label || r.status}</Badge>
                        <Badge variant="outline" className="text-[9px]">{tp?.label || r.reminder_type}</Badge>
                        {r.is_recurring && <Badge variant="outline" className="text-[9px] bg-violet-500/10 text-violet-400 border-violet-500/20">반복</Badge>}
                        {r.source_type === "ai_generated" && <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/20">AI</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                        {r.due_date && <span>기준일: {r.due_date}</span>}
                        {r.memo && <span>메모: {r.memo}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Select value={r.status} onValueChange={v => handleStatusChange(r.id, v)}>
                        <SelectTrigger className="h-7 w-20 text-[10px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {statusOptions.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400" onClick={() => handleDelete(r.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-base">리마인드 추가</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Input placeholder="제목" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <Select value={form.reminder_type} onValueChange={v => setForm(p => ({ ...p, reminder_type: v }))}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {typeOptions.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} className="text-xs" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_recurring} onCheckedChange={v => setForm(p => ({ ...p, is_recurring: v }))} />
              <span className="text-xs text-muted-foreground">반복</span>
            </div>
            <Input placeholder="메모 (선택)" value={form.memo} onChange={e => setForm(p => ({ ...p, memo: e.target.value }))} className="text-sm" />
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setAddOpen(false)} className="text-xs">취소</Button>
            <Button size="sm" onClick={handleAdd} disabled={!form.title.trim()} className="text-xs">추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
