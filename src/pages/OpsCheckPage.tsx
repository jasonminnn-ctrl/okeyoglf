/**
 * OpsCheckPage — 놓치고 있는 운영 항목 관리
 * AI 생성 결과를 운영 점검 항목으로 저장/관리하는 운영형 페이지
 */

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertCircle, Plus, ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { fetchTasks, insertTask, updateTask, deleteTask, type AssistantTask } from "@/lib/repositories/assistant-repository";
import { toast } from "@/hooks/use-toast";

const statusOptions = [
  { value: "new", label: "신규", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { value: "checking", label: "확인중", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { value: "planned", label: "조치예정", color: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  { value: "done", label: "완료", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { value: "hold", label: "보류", color: "bg-muted/30 text-muted-foreground border-border/30" },
];

const priorityOptions = [
  { value: "high", label: "높음", color: "text-red-400" },
  { value: "normal", label: "보통", color: "text-foreground" },
  { value: "low", label: "낮음", color: "text-muted-foreground" },
];

function getStatusBadge(status: string) {
  const opt = statusOptions.find(o => o.value === status);
  return opt ? <Badge variant="outline" className={`text-[9px] ${opt.color}`}>{opt.label}</Badge> : <Badge variant="outline" className="text-[9px]">{status}</Badge>;
}

export default function OpsCheckPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<AssistantTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "normal", due_date: "", memo: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchTasks();
    setTasks(data.filter(t => t.category === "ops_check"));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    await insertTask({
      title: form.title,
      description: form.description || null,
      category: "ops_check",
      priority: form.priority,
      due_date: form.due_date || null,
      memo: form.memo || null,
      source_type: "user_created",
    });
    setForm({ title: "", description: "", priority: "normal", due_date: "", memo: "" });
    setAddOpen(false);
    toast({ title: "항목 추가 완료" });
    load();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateTask(id, { status } as any);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
    toast({ title: "삭제 완료" });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/ai-assistant")} className="mb-2 -ml-2 text-xs text-muted-foreground">
          <ArrowLeft className="h-3 w-3 mr-1" /> AI 비서
        </Button>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-red-400" />
          놓치고 있는 운영 항목
        </h1>
        <p className="text-muted-foreground text-sm mt-1">운영 점검 항목을 관리하고 추적합니다</p>
      </div>

      <BusinessContextBanner module="AI 비서" />

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{tasks.length}개 항목</p>
        <Button size="sm" onClick={() => setAddOpen(true)} className="text-xs gap-1.5">
          <Plus className="h-3 w-3" /> 항목 추가
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">등록된 운영 점검 항목이 없습니다</p>
            <p className="text-xs text-muted-foreground/60 mt-1">AI 비서에서 생성하거나 직접 추가하세요</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => (
            <Card key={task.id} className="bg-card/50 border-border/50">
              <CardContent className="py-3 px-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{task.title}</span>
                      {getStatusBadge(task.status)}
                      <Badge variant="outline" className={`text-[9px] ${priorityOptions.find(p => p.value === task.priority)?.color || ""}`}>
                        {priorityOptions.find(p => p.value === task.priority)?.label || task.priority}
                      </Badge>
                      {task.source_type === "ai_generated" && (
                        <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/20">AI</Badge>
                      )}
                    </div>
                    {task.description && <p className="text-xs text-muted-foreground mt-1">{task.description}</p>}
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                      {task.due_date && <span>기한: {task.due_date}</span>}
                      {task.assignee && <span>담당: {task.assignee}</span>}
                      {task.memo && <span>메모: {task.memo}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Select value={task.status} onValueChange={v => handleStatusChange(task.id, v)}>
                      <SelectTrigger className="h-7 w-24 text-[10px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400" onClick={() => handleDelete(task.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">운영 점검 항목 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input placeholder="항목 제목" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="text-sm" />
            <Textarea placeholder="설명 (선택)" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="text-sm min-h-[60px]" />
            <div className="grid grid-cols-2 gap-2">
              <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v }))}>
                <SelectTrigger className="text-xs"><SelectValue placeholder="우선순위" /></SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} className="text-xs" />
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
