/**
 * CampaignPlannerPage — 캠페인 관리
 * 직접 입력 + AI 비서 + 내보내기 + 추적 + 상세 보기 하이브리드 구조
 */

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Megaphone, Plus, ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { OperationalSourceTabs, filterBySourceTab } from "@/components/OperationalSourceTabs";
import { useNavigate } from "react-router-dom";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { fetchCampaigns, insertCampaign, updateCampaign, deleteCampaign, type AssistantCampaign } from "@/lib/repositories/assistant-repository";
import { OperationalAIAssistantPanel, type ProcessingResult } from "@/components/OperationalAIAssistantPanel";
import { OperationalExportMenu } from "@/components/OperationalExportMenu";
import { OperationalMetaBadges } from "@/components/OperationalMetaBadges";
import { OperationalDetailDialog, type DetailField } from "@/components/OperationalDetailDialog";
import { buildCsv, downloadCsv } from "@/lib/csv-export";
import { downloadXlsx } from "@/lib/xlsx-export";
import { toast } from "@/hooks/use-toast";

const statusOptions = [
  { value: "draft", label: "초안", color: "bg-muted/30 text-muted-foreground border-border/30" },
  { value: "review", label: "검토중", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { value: "active", label: "진행중", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { value: "done", label: "완료", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
];

const exportColumns = [
  { header: "캠페인명", accessor: (c: AssistantCampaign) => c.title },
  { header: "상태", accessor: (c: AssistantCampaign) => statusOptions.find(s => s.value === c.status)?.label || c.status },
  { header: "목적", accessor: (c: AssistantCampaign) => c.purpose || "" },
  { header: "대상", accessor: (c: AssistantCampaign) => c.target_segment || "" },
  { header: "채널", accessor: (c: AssistantCampaign) => c.channel || "" },
  { header: "시작일", accessor: (c: AssistantCampaign) => c.start_date || "" },
  { header: "종료일", accessor: (c: AssistantCampaign) => c.end_date || "" },
  { header: "혜택", accessor: (c: AssistantCampaign) => c.benefit || "" },
  { header: "디자인요청", accessor: (c: AssistantCampaign) => c.design_needs || "" },
  { header: "메모", accessor: (c: AssistantCampaign) => c.memo || "" },
  { header: "수정일", accessor: (c: AssistantCampaign) => c.updated_at || "" },
];

export default function CampaignPlannerPage() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<AssistantCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", purpose: "", target_segment: "", channel: "", start_date: "", end_date: "", benefit: "", design_needs: "", memo: "" });
  const [tab, setTab] = useState("all");
  const [detailItem, setDetailItem] = useState<AssistantCampaign | null>(null);
  const [detailEdits, setDetailEdits] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setCampaigns(await fetchCampaigns());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    await insertCampaign({ title: form.title, purpose: form.purpose || null, target_segment: form.target_segment || null, channel: form.channel || null, start_date: form.start_date || null, end_date: form.end_date || null, benefit: form.benefit || null, design_needs: form.design_needs || null, memo: form.memo || null, source_type: "user_created" });
    setForm({ title: "", purpose: "", target_segment: "", channel: "", start_date: "", end_date: "", benefit: "", design_needs: "", memo: "" });
    setAddOpen(false);
    toast({ title: "캠페인 추가 완료" });
    load();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateCampaign(id, { status } as any);
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const handleDelete = async (id: string) => {
    await deleteCampaign(id);
    setCampaigns(prev => prev.filter(c => c.id !== id));
    toast({ title: "삭제 완료" });
  };

  const handleAISubmit = async (input: string): Promise<ProcessingResult | null> => {
    const lines = input.split("\n").map(l => l.trim()).filter(Boolean);
    let count = 0;
    for (const line of lines) {
      await insertCampaign({ title: line, source_type: "user_created" });
      count++;
    }
    if (count > 0) { await load(); return { id: crypto.randomUUID(), summary: `캠페인 ${count}개를 추가했습니다.`, timestamp: new Date() }; }
    return null;
  };

  const filteredCampaigns = tab === "all" ? campaigns
    : tab === "ai" ? campaigns.filter(c => c.source_type === "ai_generated")
    : campaigns.filter(c => c.source_type === "user_created" || !c.source_type);

  const handleCsvExport = () => { downloadCsv(buildCsv(filteredCampaigns, exportColumns), `캠페인_${new Date().toISOString().slice(0, 10)}.csv`); toast({ title: "CSV 다운로드 완료" }); };
  const handleXlsxExport = () => { downloadXlsx(filteredCampaigns, exportColumns, `캠페인_${new Date().toISOString().slice(0, 10)}.xlsx`, "캠페인"); toast({ title: "XLSX 다운로드 완료" }); };

  const openDetail = (c: AssistantCampaign) => {
    setDetailItem(c);
    setDetailEdits({ title: c.title, purpose: c.purpose || "", target_segment: c.target_segment || "", channel: c.channel || "", start_date: c.start_date || "", end_date: c.end_date || "", benefit: c.benefit || "", design_needs: c.design_needs || "", memo: c.memo || "" });
  };

  const detailFields: DetailField[] = detailItem ? [
    { key: "title", label: "캠페인명", type: "text", value: detailEdits.title || "" },
    { key: "purpose", label: "목적", type: "textarea", value: detailEdits.purpose || "" },
    { key: "target_segment", label: "대상 세그먼트", type: "text", value: detailEdits.target_segment || "" },
    { key: "channel", label: "채널", type: "text", value: detailEdits.channel || "" },
    { key: "start_date", label: "시작일", type: "date", value: detailEdits.start_date || "" },
    { key: "end_date", label: "종료일", type: "date", value: detailEdits.end_date || "" },
    { key: "benefit", label: "혜택", type: "text", value: detailEdits.benefit || "" },
    { key: "design_needs", label: "디자인/콘텐츠 요청", type: "textarea", value: detailEdits.design_needs || "" },
    { key: "memo", label: "메모", type: "textarea", value: detailEdits.memo || "" },
  ] : [];

  const handleDetailSave = async () => {
    if (!detailItem) return;
    await updateCampaign(detailItem.id, {
      title: detailEdits.title, purpose: detailEdits.purpose || null, target_segment: detailEdits.target_segment || null,
      channel: detailEdits.channel || null, start_date: detailEdits.start_date || null, end_date: detailEdits.end_date || null,
      benefit: detailEdits.benefit || null, design_needs: detailEdits.design_needs || null, memo: detailEdits.memo || null,
    } as any);
    toast({ title: "수정 완료" });
    setDetailItem(null);
    load();
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/ai-assistant")} className="mb-2 -ml-2 text-xs text-muted-foreground"><ArrowLeft className="h-3 w-3 mr-1" /> AI 비서</Button>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Megaphone className="h-6 w-6 text-blue-400" />캠페인 플래너</h1>
        <p className="text-muted-foreground text-sm mt-1">AI 추천 캠페인을 운영 가능한 캠페인으로 관리합니다</p>
      </div>

      <BusinessContextBanner module="AI 비서" />

      <div className="flex items-center justify-between flex-wrap gap-2">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-xs h-7 px-3">전체 ({campaigns.length})</TabsTrigger>
            <TabsTrigger value="manual" className="text-xs h-7 px-3 gap-1"><ListChecks className="h-3 w-3" /> 직접 등록</TabsTrigger>
            <TabsTrigger value="ai" className="text-xs h-7 px-3 gap-1"><Sparkles className="h-3 w-3" /> AI 초안</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <OperationalExportMenu onCsv={handleCsvExport} onXlsx={handleXlsxExport} disabled={filteredCampaigns.length === 0} />
          <Button size="sm" onClick={() => setAddOpen(true)} className="text-xs gap-1.5"><Plus className="h-3 w-3" /> 캠페인 추가</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 text-primary animate-spin" /></div>
      ) : filteredCampaigns.length === 0 ? (
        <Card className="bg-card/50 border-border/50"><CardContent className="py-12 text-center"><Megaphone className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" /><p className="text-sm text-muted-foreground">등록된 캠페인이 없습니다</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredCampaigns.map(c => {
            const st = statusOptions.find(s => s.value === c.status);
            return (
              <Card key={c.id} className="bg-card/50 border-border/50 cursor-pointer hover:border-primary/30 transition-colors" onClick={() => openDetail(c)}>
                <CardContent className="py-3 px-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{c.title}</span>
                      <Badge variant="outline" className={`text-[9px] ${st?.color || ""}`}>{st?.label || c.status}</Badge>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-red-400" onClick={e => { e.stopPropagation(); handleDelete(c.id); }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  {c.purpose && <p className="text-xs text-muted-foreground line-clamp-1">목적: {c.purpose}</p>}
                  <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                    {c.target_segment && <span>대상: {c.target_segment}</span>}
                    {c.channel && <span>채널: {c.channel}</span>}
                    {c.start_date && <span>기간: {c.start_date}{c.end_date ? ` ~ ${c.end_date}` : ""}</span>}
                  </div>
                  <OperationalMetaBadges sourceType={c.source_type} updatedAt={c.updated_at} compact />
                  <div className="flex justify-end" onClick={e => e.stopPropagation()}>
                    <Select value={c.status} onValueChange={v => handleStatusChange(c.id, v)}>
                      <SelectTrigger className="h-7 w-24 text-[10px]"><SelectValue /></SelectTrigger>
                      <SelectContent>{statusOptions.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <OperationalAIAssistantPanel description="캠페인 초안 · 수정 · 일정 요청" placeholder={"캠페인명을 줄바꿈으로 입력하거나 자유롭게 요청하세요.\n예: 봄맞이 재등록 캠페인\n여름 프로모션 기획"} onSubmit={handleAISubmit} />

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="text-base">캠페인 추가</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Input placeholder="캠페인명" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="text-sm" />
            <Textarea placeholder="목적 / 상세 내용" value={form.purpose} onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))} className="text-sm min-h-[60px]" />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="대상 세그먼트" value={form.target_segment} onChange={e => setForm(p => ({ ...p, target_segment: e.target.value }))} className="text-sm" />
              <Input placeholder="채널" value={form.channel} onChange={e => setForm(p => ({ ...p, channel: e.target.value }))} className="text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} className="text-xs" />
              <Input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} className="text-xs" />
            </div>
            <Input placeholder="제안 혜택" value={form.benefit} onChange={e => setForm(p => ({ ...p, benefit: e.target.value }))} className="text-sm" />
            <Textarea placeholder="필요 디자인/콘텐츠" value={form.design_needs} onChange={e => setForm(p => ({ ...p, design_needs: e.target.value }))} className="text-sm min-h-[50px]" />
            <Input placeholder="메모 (선택)" value={form.memo} onChange={e => setForm(p => ({ ...p, memo: e.target.value }))} className="text-sm" />
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setAddOpen(false)} className="text-xs">취소</Button>
            <Button size="sm" onClick={handleAdd} disabled={!form.title.trim()} className="text-xs">추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {detailItem && (
        <OperationalDetailDialog
          open={!!detailItem}
          onOpenChange={open => { if (!open) setDetailItem(null); }}
          title="캠페인 상세"
          entityType="campaign"
          entityId={detailItem.id}
          fields={detailFields}
          onFieldChange={(key, val) => setDetailEdits(prev => ({ ...prev, [key]: val }))}
          onSave={handleDetailSave}
          meta={{ sourceType: detailItem.source_type, updatedAt: detailItem.updated_at }}
        />
      )}
    </div>
  );
}
