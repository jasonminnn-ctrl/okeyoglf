/**
 * OperatorRecommendationTab — 운영 권장 관리
 * 운영자/컨설턴트가 고객사에 공급할 권장 항목 CRUD
 * 사용자 단위 타겟팅 지원 (target_user_ids)
 */

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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldAlert, Plus, Pencil, Trash2, Target, Users, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import RecommendationTargetPicker from "./RecommendationTargetPicker";
import RecommendationCoverageBoard from "./RecommendationCoverageBoard";

interface Recommendation {
  id: string;
  title: string;
  description: string | null;
  recommendation_type: string;
  target_business_types: string[];
  target_org_id: string | null;
  target_branch_code: string | null;
  target_user_ids: string[] | null;
  priority: string;
  category: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  link_url: string | null;
  link_label: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
}

const REC_TYPES = [
  { value: "ops_recommended", label: "운영 권장" },
  { value: "risk_signal", label: "위험신호" },
  { value: "doing_well", label: "잘하고 있는 점" },
  { value: "must_check", label: "꼭 확인할 것" },
  { value: "weekly_action", label: "이번 주 권장 액션" },
];

const CATEGORIES = [
  { value: "ops_check", label: "운영 점검" },
  { value: "campaign", label: "캠페인" },
  { value: "reminder", label: "리마인드" },
  { value: "checklist", label: "체크리스트" },
  { value: "general", label: "공통" },
];

const PRIORITIES = [
  { value: "high", label: "높음" },
  { value: "normal", label: "보통" },
  { value: "low", label: "낮음" },
];

const BUSINESS_TYPES = ["골프연습장", "골프장", "골프아카데미", "골프샵", "피팅샵", "골프회사"];

const typeBadgeColor: Record<string, string> = {
  ops_recommended: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  risk_signal: "bg-red-500/10 text-red-400 border-red-500/20",
  doing_well: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  must_check: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  weekly_action: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default function OperatorRecommendationTab() {
  const [items, setItems] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Recommendation | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [recType, setRecType] = useState("ops_recommended");
  const [category, setCategory] = useState("ops_check");
  const [priority, setPriority] = useState("normal");
  const [targetBizTypes, setTargetBizTypes] = useState<string[]>([]);
  const [targetOrgId, setTargetOrgId] = useState("");
  const [targetBranch, setTargetBranch] = useState("");
  const [targetUserIds, setTargetUserIds] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [memo, setMemo] = useState("");

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("operator_recommendations" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setItems(data as unknown as Recommendation[]);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const resetForm = () => {
    setTitle(""); setDescription(""); setRecType("ops_recommended");
    setCategory("ops_check"); setPriority("normal"); setTargetBizTypes([]);
    setTargetOrgId(""); setTargetBranch(""); setTargetUserIds([]);
    setIsActive(true); setStartDate(""); setEndDate("");
    setLinkUrl(""); setLinkLabel(""); setMemo("");
    setEditing(null);
  };

  const openCreate = () => { resetForm(); setDialogOpen(true); };

  const openEdit = (item: Recommendation) => {
    setEditing(item);
    setTitle(item.title); setDescription(item.description || "");
    setRecType(item.recommendation_type); setCategory(item.category);
    setPriority(item.priority); setTargetBizTypes(item.target_business_types || []);
    setTargetOrgId(item.target_org_id || ""); setTargetBranch(item.target_branch_code || "");
    setTargetUserIds(item.target_user_ids || []);
    setIsActive(item.is_active); setStartDate(item.start_date || "");
    setEndDate(item.end_date || ""); setLinkUrl(item.link_url || "");
    setLinkLabel(item.link_label || ""); setMemo(item.memo || "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim()) { toast.error("제목을 입력해 주세요."); return; }
    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      recommendation_type: recType,
      category,
      priority,
      target_business_types: targetBizTypes.length > 0 ? targetBizTypes : [],
      target_org_id: targetOrgId.trim() || null,
      target_branch_code: targetBranch.trim() || null,
      target_user_ids: targetUserIds.length > 0 ? targetUserIds : [],
      is_active: isActive,
      start_date: startDate || null,
      end_date: endDate || null,
      link_url: linkUrl.trim() || null,
      link_label: linkLabel.trim() || null,
      memo: memo.trim() || null,
    };

    if (editing) {
      const { error } = await supabase.from("operator_recommendations" as any).update(payload as any).eq("id", editing.id);
      if (error) { toast.error("수정 실패: " + error.message); return; }
      toast.success("운영 권장 항목이 수정되었습니다.");
    } else {
      const { error } = await supabase.from("operator_recommendations" as any).insert(payload as any);
      if (error) { toast.error("등록 실패: " + error.message); return; }
      toast.success("운영 권장 항목이 등록되었습니다.");
    }
    setDialogOpen(false); resetForm(); fetchItems();
    setRefreshKey(k => k + 1);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("operator_recommendations" as any).delete().eq("id", id);
    if (error) { toast.error("삭제 실패"); return; }
    toast.success("삭제 완료"); fetchItems(); setRefreshKey(k => k + 1);
  };

  const handleToggleActive = async (item: Recommendation) => {
    await supabase.from("operator_recommendations" as any).update({ is_active: !item.is_active } as any).eq("id", item.id);
    fetchItems(); setRefreshKey(k => k + 1);
  };

  const toggleBizType = (bt: string) => {
    setTargetBizTypes(prev => prev.includes(bt) ? prev.filter(x => x !== bt) : [...prev, bt]);
  };

  const typeLabel = (v: string) => REC_TYPES.find(t => t.value === v)?.label || v;
  const catLabel = (v: string) => CATEGORIES.find(c => c.value === v)?.label || v;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="manage" className="space-y-4">
        <TabsList className="h-auto gap-1 bg-muted/30 p-1">
          <TabsTrigger value="manage" className="text-xs px-3 py-1.5 gap-1"><ShieldAlert className="h-3 w-3" />항목 관리</TabsTrigger>
          <TabsTrigger value="coverage" className="text-xs px-3 py-1.5 gap-1"><BarChart3 className="h-3 w-3" />현황 보드</TabsTrigger>
        </TabsList>

        <TabsContent value="manage">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-amber-400" />운영 권장 관리</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{items.length}건</Badge>
                  <Button size="sm" className="h-7 text-xs gap-1" onClick={openCreate}><Plus className="h-3 w-3" />권장 등록</Button>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">고객사에 공급할 위험신호, 운영 권장, 잘하고 있는 점, 권장 액션을 관리합니다</p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-xs text-muted-foreground py-4 text-center">불러오는 중...</p>
              ) : items.length === 0 ? (
                <p className="text-xs text-muted-foreground py-8 text-center">등록된 권장 항목이 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className={`flex items-start gap-3 py-2.5 px-3 rounded-md border transition-colors ${!item.is_active ? "bg-muted/10 border-border/10 opacity-50" : "bg-muted/20 border-border/20"}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium">{item.title}</span>
                          <Badge variant="outline" className={`text-[9px] ${typeBadgeColor[item.recommendation_type] || ""}`}>{typeLabel(item.recommendation_type)}</Badge>
                          <Badge variant="outline" className="text-[9px]">{catLabel(item.category)}</Badge>
                          {!item.is_active && <Badge variant="outline" className="text-[9px] bg-muted/30 text-muted-foreground">비활성</Badge>}
                        </div>
                        {item.description && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {item.target_business_types?.length > 0 && (
                            <span className="text-[9px] text-muted-foreground flex items-center gap-0.5"><Target className="h-2.5 w-2.5" />{item.target_business_types.join(", ")}</span>
                          )}
                          {item.target_org_id && <span className="text-[9px] text-muted-foreground">조직: {item.target_org_id.slice(0, 8)}...</span>}
                          {item.target_user_ids && item.target_user_ids.length > 0 && (
                            <Badge variant="outline" className="text-[8px] bg-violet-500/10 text-violet-400 border-violet-500/20">
                              <Users className="h-2 w-2 mr-0.5" />{item.target_user_ids.length}명 지정
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-[9px] text-muted-foreground whitespace-nowrap mr-1">{item.created_at?.slice(0, 10)}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleToggleActive(item)}>
                          <div className={`w-2 h-2 rounded-full ${item.is_active ? "bg-emerald-400" : "bg-muted-foreground"}`} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(item)}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverage">
          <RecommendationCoverageBoard key={refreshKey} />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">{editing ? "권장 항목 수정" : "권장 항목 등록"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">제목 *</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="권장 항목 제목" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">상세 내용</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="상세 설명" className="mt-1" rows={4} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">유형</Label>
                <Select value={recType} onValueChange={setRecType}>
                  <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{REC_TYPES.map(t => <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">카테고리</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">중요도</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{PRIORITIES.map(p => <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            {/* Business type targeting */}
            <div>
              <Label className="text-xs">대상 업종 (복수 선택)</Label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {BUSINESS_TYPES.map(bt => (
                  <Badge
                    key={bt}
                    variant="outline"
                    className={`text-[10px] cursor-pointer transition-colors ${targetBizTypes.includes(bt) ? "bg-primary/10 text-primary border-primary/30" : ""}`}
                    onClick={() => toggleBizType(bt)}
                  >
                    {bt}
                  </Badge>
                ))}
              </div>
              <p className="text-[9px] text-muted-foreground mt-1">선택하지 않으면 전체 업종에 노출</p>
            </div>

            {/* Precision targeting with user selection */}
            <RecommendationTargetPicker
              targetOrgId={targetOrgId}
              onOrgIdChange={setTargetOrgId}
              targetBranch={targetBranch}
              onBranchChange={setTargetBranch}
              selectedUserIds={targetUserIds}
              onUserIdsChange={setTargetUserIds}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">노출 시작일</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 text-xs" />
              </div>
              <div>
                <Label className="text-xs">노출 종료일</Label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">링크 URL (선택)</Label>
                <Input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..." className="mt-1 text-xs" />
              </div>
              <div>
                <Label className="text-xs">링크 텍스트 (선택)</Label>
                <Input value={linkLabel} onChange={e => setLinkLabel(e.target.value)} placeholder="자세히 보기" className="mt-1 text-xs" />
              </div>
            </div>

            <div>
              <Label className="text-xs">메모</Label>
              <Textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="내부 메모" className="mt-1" rows={2} />
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <Label className="text-xs">활성</Label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>취소</Button>
              <Button size="sm" onClick={handleSave}>{editing ? "수정" : "등록"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
