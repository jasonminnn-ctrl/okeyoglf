/**
 * ChecklistManagerPage — 업종별 체크리스트 관리
 * 직접 입력 + AI 비서 + 내보내기 + 담당자/완료자 추적 + 상세 보기 하이브리드 구조
 */

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ClipboardCheck, Plus, ArrowLeft, Loader2, Trash2, PlusCircle, Eye } from "lucide-react";
import { OperationalSourceTabs, filterBySourceTab } from "@/components/OperationalSourceTabs";
import { useNavigate } from "react-router-dom";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import {
  fetchChecklists, insertChecklist, updateChecklist, deleteChecklist,
  fetchChecklistItems, insertChecklistItem, updateChecklistItem, deleteChecklistItem,
  type AssistantChecklist, type AssistantChecklistItem, type OperatorRecommendation,
} from "@/lib/repositories/assistant-repository";
import { RecommendationSupplyPanel } from "@/components/RecommendationSupplyPanel";
import { OperationalAIAssistantPanel, type ProcessingResult } from "@/components/OperationalAIAssistantPanel";
import { OperationalExportMenu } from "@/components/OperationalExportMenu";
import { OperationalMetaBadges } from "@/components/OperationalMetaBadges";
import { OperationalDetailDialog, type DetailField } from "@/components/OperationalDetailDialog";
import { OperationalAttachmentSection } from "@/components/OperationalAttachmentSection";
import { buildCsv, downloadCsv } from "@/lib/csv-export";
import { downloadXlsx } from "@/lib/xlsx-export";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function ChecklistManagerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checklists, setChecklists] = useState<AssistantChecklist[]>([]);
  const [sourceTab, setSourceTab] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [items, setItems] = useState<AssistantChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addItemText, setAddItemText] = useState("");
  const [form, setForm] = useState({ title: "", checklist_type: "daily", focus_area: "", memo: "" });

  // Detail for checklist
  const [detailChecklist, setDetailChecklist] = useState<AssistantChecklist | null>(null);
  const [detailEdits, setDetailEdits] = useState<Record<string, string>>({});
  // Detail for item
  const [detailItem, setDetailItem] = useState<AssistantChecklistItem | null>(null);
  const [itemEdits, setItemEdits] = useState<Record<string, string>>({});

  const loadChecklists = useCallback(async () => {
    setLoading(true);
    setChecklists(await fetchChecklists());
    setLoading(false);
  }, []);

  useEffect(() => { loadChecklists(); }, [loadChecklists]);

  const loadItems = useCallback(async (id: string) => {
    setItemsLoading(true);
    setItems(await fetchChecklistItems(id));
    setItemsLoading(false);
  }, []);

  useEffect(() => {
    if (selectedId) loadItems(selectedId);
    else setItems([]);
  }, [selectedId, loadItems]);

  const handleAddChecklist = async () => {
    if (!form.title.trim()) return;
    const created = await insertChecklist({ title: form.title, checklist_type: form.checklist_type, focus_area: form.focus_area || null, memo: form.memo || null, source_type: "user_created" } as any);
    setForm({ title: "", checklist_type: "daily", focus_area: "", memo: "" });
    setAddOpen(false);
    toast({ title: "체크리스트 생성 완료" });
    await loadChecklists();
    if (created) setSelectedId(created.id);
  };

  const handleDeleteChecklist = async (id: string) => {
    await deleteChecklist(id);
    if (selectedId === id) { setSelectedId(null); setItems([]); }
    setChecklists(prev => prev.filter(c => c.id !== id));
    toast({ title: "삭제 완료" });
  };

  const handleAddItem = async () => {
    if (!addItemText.trim() || !selectedId) return;
    const parts = addItemText.trim().split("-");
    const label = parts[0]?.trim();
    const assignee = parts[1]?.trim() || null;
    if (!label) return;
    await insertChecklistItem({ checklist_id: selectedId, label, sort_order: items.length, assignee_name: assignee } as any);
    setAddItemText("");
    loadItems(selectedId);
  };

  const handleToggle = async (item: AssistantChecklistItem) => {
    const checked = !item.is_checked;
    const updates: any = {
      is_checked: checked,
      checked_at: checked ? new Date().toISOString() : null,
      completed_by_name: checked ? (user?.name || user?.email || "사용자") : null,
      completed_by_user_id: checked ? (user?.id || null) : null,
    };
    await updateChecklistItem(item.id, updates);
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, ...updates } : i));
  };

  const handleDeleteItem = async (id: string) => {
    await deleteChecklistItem(id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const filteredChecklists = filterBySourceTab(checklists, sourceTab);
  const selectedChecklist = filteredChecklists.find(c => c.id === selectedId) || checklists.find(c => c.id === selectedId);
  const checkedCount = items.filter(i => i.is_checked).length;
  const progress = items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0;

  const exportColumns = [
    { header: "항목", accessor: (i: AssistantChecklistItem) => i.label },
    { header: "완료", accessor: (i: AssistantChecklistItem) => i.is_checked ? "✅" : "☐" },
    { header: "담당자", accessor: (i: AssistantChecklistItem) => i.assignee_name || "" },
    { header: "완료자", accessor: (i: AssistantChecklistItem) => i.completed_by_name || "" },
    { header: "완료시각", accessor: (i: AssistantChecklistItem) => i.checked_at || "" },
    { header: "메모", accessor: (i: AssistantChecklistItem) => i.memo || "" },
  ];

  const handleCsvExport = () => { if (!selectedChecklist || items.length === 0) return; downloadCsv(buildCsv(items, exportColumns), `${selectedChecklist.title}_체크리스트.csv`); toast({ title: "CSV 다운로드 완료" }); };
  const handleXlsxExport = () => { if (!selectedChecklist || items.length === 0) return; downloadXlsx(items, exportColumns, `${selectedChecklist.title}_체크리스트.xlsx`, "체크리스트"); toast({ title: "XLSX 다운로드 완료" }); };

  const handleAISubmit = async (input: string): Promise<ProcessingResult | null> => {
    if (!selectedId) { toast({ title: "체크리스트를 먼저 선택하세요", variant: "destructive" }); return null; }
    const lines = input.split("\n").map(l => l.trim()).filter(Boolean);
    let count = 0;
    const assigneeSummary: Record<string, number> = {};
    for (const line of lines) {
      const parts = line.split("-");
      const label = parts[0]?.trim();
      const assignee = parts[1]?.trim() || null;
      if (!label) continue;
      await insertChecklistItem({ checklist_id: selectedId, label, sort_order: items.length + count, assignee_name: assignee } as any);
      count++;
      const key = assignee || "미지정";
      assigneeSummary[key] = (assigneeSummary[key] || 0) + 1;
    }
    if (count > 0) {
      await loadItems(selectedId);
      return { id: crypto.randomUUID(), summary: `${selectedChecklist?.title || "체크리스트"}에 ${count}개 항목을 추가했습니다.`, details: Object.entries(assigneeSummary).map(([k, v]) => `${k} ${v}건`).join(", "), timestamp: new Date() };
    }
    return null;
  };

  /** Add checklist from operator_recommendations DB */
  const handleAddFromRecommendation = async (rec: OperatorRecommendation) => {
    const created = await insertChecklist({
      title: rec.title,
      memo: rec.description,
      checklist_type: "daily",
      source_type: "ops_recommended",
    } as any);
    toast({ title: "운영 권장 체크리스트 추가 완료" });
    await loadChecklists();
    if (created) setSelectedId(created.id);
  };


  const openChecklistDetail = (cl: AssistantChecklist) => {
    setDetailChecklist(cl);
    setDetailEdits({ title: cl.title, memo: cl.memo || "", focus_area: cl.focus_area || "" });
  };

  const checklistDetailFields: DetailField[] = detailChecklist ? [
    { key: "title", label: "체크리스트 제목", type: "text", value: detailEdits.title || "" },
    { key: "focus_area", label: "관리 영역", type: "text", value: detailEdits.focus_area || "" },
    { key: "memo", label: "상세 설명", type: "textarea", value: detailEdits.memo || "" },
  ] : [];

  const handleChecklistDetailSave = async () => {
    if (!detailChecklist) return;
    await updateChecklist(detailChecklist.id, { title: detailEdits.title, memo: detailEdits.memo || null, focus_area: detailEdits.focus_area || null } as any);
    toast({ title: "수정 완료" });
    setDetailChecklist(null);
    loadChecklists();
  };

  // Item detail
  const openItemDetail = (item: AssistantChecklistItem) => {
    setDetailItem(item);
    setItemEdits({ label: item.label, memo: item.memo || "", assignee_name: item.assignee_name || "" });
  };

  const handleItemDetailSave = async () => {
    if (!detailItem) return;
    await updateChecklistItem(detailItem.id, { label: itemEdits.label, memo: itemEdits.memo || null, assignee_name: itemEdits.assignee_name || null } as any);
    toast({ title: "항목 수정 완료" });
    setDetailItem(null);
    if (selectedId) loadItems(selectedId);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/ai-assistant")} className="mb-2 -ml-2 text-xs text-muted-foreground"><ArrowLeft className="h-3 w-3 mr-1" /> AI 비서</Button>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><ClipboardCheck className="h-6 w-6 text-emerald-400" />체크리스트 관리</h1>
        <p className="text-muted-foreground text-sm mt-1">업종별 체크리스트를 실제 체크 가능한 구조로 관리합니다</p>
      </div>

      <BusinessContextBanner module="AI 비서" />

      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <OperationalSourceTabs
          value={sourceTab}
          onValueChange={setSourceTab}
          config={{ totalCount: checklists.length, aiLabel: "AI 추가", opsLabel: "운영 기본" }}
        />
      </div>

      {sourceTab === "ops" && (
        <RecommendationSupplyPanel
          category="checklist"
          onAdd={handleAddFromRecommendation}
          addedTitles={checklists.filter(c => c.source_type === "ops_recommended").map(c => c.title)}
          headerLabel="운영 권장 체크리스트"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Checklist list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium">체크리스트 목록</p>
            <Button size="sm" variant="outline" onClick={() => setAddOpen(true)} className="text-xs gap-1 h-7"><Plus className="h-3 w-3" /> 새 목록</Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 text-primary animate-spin" /></div>
          ) : filteredChecklists.length === 0 ? (
            <Card className="bg-card/50 border-border/50"><CardContent className="py-8 text-center"><p className="text-xs text-muted-foreground">체크리스트가 없습니다</p></CardContent></Card>
          ) : filteredChecklists.map(cl => (
            <button
              key={cl.id}
              onClick={() => setSelectedId(cl.id)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedId === cl.id ? "border-primary/50 bg-primary/5" : "border-border/30 bg-card/50 hover:bg-muted/20"}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{cl.title}</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-muted-foreground hover:text-primary" onClick={e => { e.stopPropagation(); openChecklistDetail(cl); }}>
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-muted-foreground hover:text-red-400" onClick={e => { e.stopPropagation(); handleDeleteChecklist(cl.id); }}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[9px]">{cl.checklist_type}</Badge>
                {cl.focus_area && <Badge variant="outline" className="text-[9px]">{cl.focus_area}</Badge>}
                {cl.source_type === "ai_generated" && <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/20">AI</Badge>}
              </div>
              {cl.memo && <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{cl.memo}</p>}
            </button>
          ))}
        </div>

        {/* Right: Items */}
        <div className="lg:col-span-2 space-y-4">
          {selectedChecklist ? (
            <>
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{selectedChecklist.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{checkedCount}/{items.length}</Badge>
                      <OperationalExportMenu onCsv={handleCsvExport} onXlsx={handleXlsxExport} disabled={items.length === 0} />
                    </div>
                  </div>
                  {selectedChecklist.memo && <p className="text-xs text-muted-foreground mt-1">{selectedChecklist.memo}</p>}
                  <Progress value={progress} className="h-1.5 mt-2" />
                </CardHeader>
                <CardContent className="space-y-1.5 pt-2">
                  {itemsLoading ? (
                    <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 text-primary animate-spin" /></div>
                  ) : items.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">항목을 추가하세요</p>
                  ) : items.map(item => (
                    <div key={item.id} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/10 group cursor-pointer" onClick={() => openItemDetail(item)}>
                      <div onClick={e => e.stopPropagation()}>
                        <Checkbox checked={item.is_checked} onCheckedChange={() => handleToggle(item)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm ${item.is_checked ? "line-through text-muted-foreground" : ""}`}>{item.label}</span>
                        <OperationalMetaBadges assignee={item.assignee_name} completedByName={item.completed_by_name} completedAt={item.checked_at} compact />
                      </div>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400" onClick={e => { e.stopPropagation(); handleDeleteItem(item.id); }}>
                        <Trash2 className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                  ))}

                  <div className="flex gap-2 pt-2 border-t border-border/30 mt-2">
                    <Input placeholder="항목명-담당자 (예: 걸레빨기-직원A)" value={addItemText} onChange={e => setAddItemText(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddItem()} className="text-sm h-8" />
                    <Button size="sm" variant="outline" onClick={handleAddItem} disabled={!addItemText.trim()} className="h-8 text-xs gap-1"><PlusCircle className="h-3 w-3" /> 추가</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Checklist-level attachments */}
              <Card className="bg-card/50 border-border/50">
                <CardContent className="py-3 px-4">
                  <OperationalAttachmentSection entityType="checklist" entityId={selectedId!} />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-card/50 border-border/50 h-full min-h-[300px] flex items-center justify-center">
              <CardContent className="text-center"><ClipboardCheck className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" /><p className="text-sm text-muted-foreground">좌측에서 체크리스트를 선택하세요</p></CardContent>
            </Card>
          )}
        </div>
      </div>

      <OperationalAIAssistantPanel description="체크리스트 추가 · 수정 · 업무 분배 요청" placeholder={"항목을 줄바꿈으로 입력하세요.\n- 뒤에 담당자를 지정할 수 있습니다.\n\n예:\n걸레빨기-직원A\n뭐뭐하기-직원B\n청소하기"} onSubmit={handleAISubmit} />

      {/* Add Checklist Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-base">새 체크리스트</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Input placeholder="체크리스트 제목" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="text-sm" />
            <Textarea placeholder="상세 설명 (선택)" value={form.memo} onChange={e => setForm(p => ({ ...p, memo: e.target.value }))} className="text-sm min-h-[60px]" />
            <div className="grid grid-cols-2 gap-2">
              <Select value={form.checklist_type} onValueChange={v => setForm(p => ({ ...p, checklist_type: v }))}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily" className="text-xs">일일</SelectItem>
                  <SelectItem value="weekly" className="text-xs">주간</SelectItem>
                  <SelectItem value="monthly" className="text-xs">월간</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.focus_area} onValueChange={v => setForm(p => ({ ...p, focus_area: v }))}>
                <SelectTrigger className="text-xs"><SelectValue placeholder="영역 (선택)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="facility" className="text-xs">시설 관리</SelectItem>
                  <SelectItem value="customer" className="text-xs">고객 관리</SelectItem>
                  <SelectItem value="sales" className="text-xs">매출 관리</SelectItem>
                  <SelectItem value="staff" className="text-xs">직원 관리</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setAddOpen(false)} className="text-xs">취소</Button>
            <Button size="sm" onClick={handleAddChecklist} disabled={!form.title.trim()} className="text-xs">생성</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checklist Detail Dialog */}
      {detailChecklist && (
        <OperationalDetailDialog
          open={!!detailChecklist}
          onOpenChange={open => { if (!open) setDetailChecklist(null); }}
          title="체크리스트 상세"
          entityType="checklist"
          entityId={detailChecklist.id}
          fields={checklistDetailFields}
          onFieldChange={(key, val) => setDetailEdits(prev => ({ ...prev, [key]: val }))}
          onSave={handleChecklistDetailSave}
          meta={{ sourceType: detailChecklist.source_type, updatedAt: detailChecklist.updated_at }}
        />
      )}

      {/* Item Detail Dialog */}
      {detailItem && (
        <Dialog open={!!detailItem} onOpenChange={open => { if (!open) setDetailItem(null); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle className="text-base">체크리스트 항목 상세</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <label className="text-xs font-medium">항목명</label>
                <Input value={itemEdits.label || ""} onChange={e => setItemEdits(p => ({ ...p, label: e.target.value }))} className="text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium">담당자</label>
                <Input value={itemEdits.assignee_name || ""} onChange={e => setItemEdits(p => ({ ...p, assignee_name: e.target.value }))} className="text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium">상세 내용 / 메모</label>
                <Textarea value={itemEdits.memo || ""} onChange={e => setItemEdits(p => ({ ...p, memo: e.target.value }))} className="text-sm min-h-[80px] mt-1" />
              </div>
              <OperationalMetaBadges assignee={detailItem.assignee_name} completedByName={detailItem.completed_by_name} completedAt={detailItem.checked_at} />
            </div>
            <DialogFooter>
              <Button variant="ghost" size="sm" onClick={() => setDetailItem(null)} className="text-xs">닫기</Button>
              <Button size="sm" onClick={handleItemDetailSave} className="text-xs">저장</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
