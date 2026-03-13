/**
 * OpsCheckPage — 놓치고 있는 운영 항목 관리
 * 직접 입력 + AI 비서 + 결과 관리 + 내보내기 + 추적 하이브리드 구조
 */

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertCircle, Plus, ArrowLeft, Loader2, Trash2, ShieldAlert, Sparkles, ListChecks } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { fetchTasks, insertTask, updateTask, deleteTask, type AssistantTask } from "@/lib/repositories/assistant-repository";
import { OperationalAIAssistantPanel, type ProcessingResult } from "@/components/OperationalAIAssistantPanel";
import { OperationalExportMenu } from "@/components/OperationalExportMenu";
import { OperationalMetaBadges } from "@/components/OperationalMetaBadges";
import { buildCsv, downloadCsv } from "@/lib/csv-export";
import { downloadXlsx } from "@/lib/xlsx-export";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

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

// AI 제안 리스크 템플릿 (규칙 기반)
const AI_SUGGESTED_RISKS = [
  { title: "미방문 회원 추적 누락", description: "30일 이상 미방문 회원에 대한 재방문 유도가 누락되고 있습니다", priority: "high" },
  { title: "재등록 리마인드 미실행", description: "이용권 만료 7일 전 재등록 안내가 자동화되지 않고 있습니다", priority: "high" },
  { title: "정산 마감일 확인 누락", description: "월말 정산 마감 전 매출 확인 절차가 누락될 수 있습니다", priority: "normal" },
  { title: "레슨 후기 수집 미실행", description: "레슨 완료 후 만족도 조사 또는 후기 요청이 실행되지 않고 있습니다", priority: "low" },
];

// 운영 권장 항목 (컨설턴트/운영팀 제공 템플릿)
const OPS_RECOMMENDED_ITEMS = [
  { title: "월간 시설 점검 실시", description: "타석, 스크린, 에어컨, 조명 등 주요 시설 월간 점검 실시 권장", priority: "normal" },
  { title: "직원 CS 교육 실시", description: "분기별 고객 응대 교육 및 클레임 처리 매뉴얼 점검", priority: "normal" },
  { title: "프로모션 효과 측정", description: "진행 중인 프로모션의 전환율 및 ROI를 정기적으로 확인", priority: "normal" },
];

const exportColumns = [
  { header: "제목", accessor: (t: AssistantTask) => t.title },
  { header: "상태", accessor: (t: AssistantTask) => statusOptions.find(s => s.value === t.status)?.label || t.status },
  { header: "우선순위", accessor: (t: AssistantTask) => priorityOptions.find(p => p.value === t.priority)?.label || t.priority },
  { header: "설명", accessor: (t: AssistantTask) => t.description || "" },
  { header: "담당자", accessor: (t: AssistantTask) => t.assignee || "" },
  { header: "기한", accessor: (t: AssistantTask) => t.due_date || "" },
  { header: "완료자", accessor: (t: AssistantTask) => t.completed_by_name || "" },
  { header: "완료일", accessor: (t: AssistantTask) => t.completed_at || "" },
  { header: "리스크 원천", accessor: (t: AssistantTask) => t.risk_source || "" },
  { header: "메모", accessor: (t: AssistantTask) => t.memo || "" },
];

export default function OpsCheckPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<AssistantTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "normal", due_date: "", assignee: "", memo: "" });
  const [tab, setTab] = useState("all");

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
      assignee: form.assignee || null,
      memo: form.memo || null,
      source_type: "user_created",
    });
    setForm({ title: "", description: "", priority: "normal", due_date: "", assignee: "", memo: "" });
    setAddOpen(false);
    toast({ title: "항목 추가 완료" });
    load();
  };

  const handleStatusChange = async (id: string, status: string) => {
    const updates: any = { status };
    if (status === "done") {
      updates.completed_at = new Date().toISOString();
      updates.completed_by_name = user?.name || user?.email || "사용자";
      updates.completed_by_user_id = user?.id || null;
    } else {
      updates.completed_at = null;
      updates.completed_by_name = null;
      updates.completed_by_user_id = null;
    }
    await updateTask(id, updates);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
    toast({ title: "삭제 완료" });
  };

  const handleAddAiSuggested = async (item: typeof AI_SUGGESTED_RISKS[0]) => {
    await insertTask({
      title: item.title,
      description: item.description,
      category: "ops_check",
      priority: item.priority,
      source_type: "ai_generated",
      risk_source: "ai_suggested",
    } as any);
    toast({ title: "AI 제안 항목 추가 완료" });
    load();
  };

  const handleAddOpsRecommended = async (item: typeof OPS_RECOMMENDED_ITEMS[0]) => {
    await insertTask({
      title: item.title,
      description: item.description,
      category: "ops_check",
      priority: item.priority,
      source_type: "user_created",
      risk_source: "ops_recommended",
    } as any);
    toast({ title: "운영 권장 항목 추가 완료" });
    load();
  };

  const handleAIAssistantSubmit = async (input: string): Promise<ProcessingResult | null> => {
    // Parse lines as tasks
    const lines = input.split("\n").map(l => l.trim()).filter(Boolean);
    let count = 0;
    for (const line of lines) {
      const parts = line.split("-");
      const title = parts[0]?.trim();
      const assignee = parts[1]?.trim() || null;
      if (!title) continue;
      await insertTask({
        title,
        category: "ops_check",
        priority: "normal",
        assignee,
        source_type: "user_created",
      });
      count++;
    }
    if (count > 0) {
      await load();
      return {
        id: crypto.randomUUID(),
        summary: `운영 점검 항목에 ${count}개 항목을 추가했습니다.`,
        details: lines.length > 1 ? `${lines.length}줄 입력 → ${count}건 처리` : undefined,
        timestamp: new Date(),
      };
    }
    return null;
  };

  const filteredTasks = tab === "all" ? tasks
    : tab === "ai" ? tasks.filter(t => t.risk_source === "ai_suggested")
    : tab === "ops" ? tasks.filter(t => t.risk_source === "ops_recommended")
    : tasks.filter(t => t.risk_source === "user_created" || !t.risk_source);

  const handleCsvExport = () => {
    const csv = buildCsv(filteredTasks, exportColumns);
    downloadCsv(csv, `운영점검_${new Date().toISOString().slice(0, 10)}.csv`);
    toast({ title: "CSV 다운로드 완료" });
  };

  const handleXlsxExport = () => {
    downloadXlsx(filteredTasks, exportColumns, `운영점검_${new Date().toISOString().slice(0, 10)}.xlsx`, "운영점검");
    toast({ title: "XLSX 다운로드 완료" });
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
        <p className="text-muted-foreground text-sm mt-1">운영 리스크를 AI 제안·운영 권장·직접 등록으로 관리합니다</p>
      </div>

      <BusinessContextBanner module="AI 비서" />

      {/* Tabs + Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-xs h-7 px-3">전체 ({tasks.length})</TabsTrigger>
            <TabsTrigger value="manual" className="text-xs h-7 px-3 gap-1">
              <ListChecks className="h-3 w-3" /> 직접 등록
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs h-7 px-3 gap-1">
              <Sparkles className="h-3 w-3" /> AI 제안
            </TabsTrigger>
            <TabsTrigger value="ops" className="text-xs h-7 px-3 gap-1">
              <ShieldAlert className="h-3 w-3" /> 운영 권장
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <OperationalExportMenu onCsv={handleCsvExport} onXlsx={handleXlsxExport} disabled={filteredTasks.length === 0} />
          <Button size="sm" onClick={() => setAddOpen(true)} className="text-xs gap-1.5">
            <Plus className="h-3 w-3" /> 항목 추가
          </Button>
        </div>
      </div>

      {/* AI Suggested section */}
      {tab === "ai" && (
        <Card className="bg-violet-500/5 border-violet-500/20">
          <CardContent className="py-3 px-4">
            <p className="text-xs font-medium mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              AI가 제안하는 운영 리스크
            </p>
            <div className="space-y-1.5">
              {AI_SUGGESTED_RISKS.map((item, i) => {
                const alreadyAdded = tasks.some(t => t.title === item.title && t.risk_source === "ai_suggested");
                return (
                  <div key={i} className="flex items-center justify-between gap-2 py-1.5 px-2 rounded bg-background/50">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium">{item.title}</span>
                      <p className="text-[10px] text-muted-foreground">{item.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[10px] h-6 px-2"
                      disabled={alreadyAdded}
                      onClick={() => handleAddAiSuggested(item)}
                    >
                      {alreadyAdded ? "추가됨" : "추가"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ops Recommended section */}
      {tab === "ops" && (
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="py-3 px-4">
            <p className="text-xs font-medium mb-2 flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
              운영팀 권장 점검 항목
            </p>
            <div className="space-y-1.5">
              {OPS_RECOMMENDED_ITEMS.map((item, i) => {
                const alreadyAdded = tasks.some(t => t.title === item.title && t.risk_source === "ops_recommended");
                return (
                  <div key={i} className="flex items-center justify-between gap-2 py-1.5 px-2 rounded bg-background/50">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium">{item.title}</span>
                      <p className="text-[10px] text-muted-foreground">{item.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[10px] h-6 px-2"
                      disabled={alreadyAdded}
                      onClick={() => handleAddOpsRecommended(item)}
                    >
                      {alreadyAdded ? "추가됨" : "추가"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {tab === "ai" ? "AI 제안 항목이 없습니다. 위에서 추가해보세요" :
               tab === "ops" ? "운영 권장 항목이 없습니다. 위에서 추가해보세요" :
               "등록된 운영 점검 항목이 없습니다"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map(task => {
            const st = statusOptions.find(s => s.value === task.status);
            const pr = priorityOptions.find(p => p.value === task.priority);
            return (
              <Card key={task.id} className="bg-card/50 border-border/50">
                <CardContent className="py-3 px-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{task.title}</span>
                        <Badge variant="outline" className={`text-[9px] ${st?.color || ""}`}>{st?.label || task.status}</Badge>
                        <Badge variant="outline" className={`text-[9px] ${pr?.color || ""}`}>{pr?.label || task.priority}</Badge>
                      </div>
                      {task.description && <p className="text-xs text-muted-foreground mt-1">{task.description}</p>}
                      <div className="mt-1.5">
                        <OperationalMetaBadges
                          assignee={task.assignee}
                          completedByName={task.completed_by_name}
                          completedAt={task.completed_at}
                          updatedAt={task.updated_at}
                          sourceType={task.source_type}
                          riskSource={task.risk_source}
                        />
                      </div>
                      {task.due_date && <span className="text-[10px] text-muted-foreground">기한: {task.due_date}</span>}
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
            );
          })}
        </div>
      )}

      {/* AI 비서 */}
      <OperationalAIAssistantPanel
        description="운영 리스크 추가 · 수정 · 분배 요청"
        placeholder={"항목을 줄바꿈으로 입력하세요.\n예: 미방문 회원 알림-직원A\n정산 마감 확인\n프로모션 마감 점검-직원B"}
        onSubmit={handleAIAssistantSubmit}
      />

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
            <Input placeholder="담당자 (선택)" value={form.assignee} onChange={e => setForm(p => ({ ...p, assignee: e.target.value }))} className="text-sm" />
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