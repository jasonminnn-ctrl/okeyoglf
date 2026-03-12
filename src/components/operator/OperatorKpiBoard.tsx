/**
 * 운영자 전용 — KPI 운영 보드
 * 10단계: 목표값/현재값/기간/담당자/메모 관리
 */

import { useState, useMemo } from "react";
import { Target, TrendingUp, Plus, Edit2, Trash2, BarChart3, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import DataBoard, { type DataBoardColumn } from "./DataBoard";
import OrgBranchFilter, { type OrgFilterState } from "./OrgBranchFilter";

type KpiStatus = "on_track" | "at_risk" | "behind" | "achieved";

interface KpiItem {
  id: string;
  name: string;
  category: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  period: string;
  assignee: string;
  orgName: string;
  industry: string;
  status: KpiStatus;
  memo: string;
  updatedAt: string;
}

const statusConfig: Record<KpiStatus, { label: string; color: string }> = {
  on_track: { label: "정상", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  at_risk: { label: "주의", color: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  behind: { label: "미달", color: "bg-red-500/10 text-red-400 border-red-500/30" },
  achieved: { label: "달성", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
};

const categoryOptions = ["매출", "운영", "회원", "마케팅", "영업", "기타"];

const initialKpis: KpiItem[] = [
  { id: "kpi-001", name: "타석 가동률", category: "운영", targetValue: 75, currentValue: 68, unit: "%", period: "2026-03", assignee: "운영팀장", orgName: "그린골프연습장", industry: "골프연습장", status: "at_risk", memo: "주중 오전 가동률 낮음", updatedAt: "2026-03-12T10:00:00Z" },
  { id: "kpi-002", name: "회원 재등록률", category: "회원", targetValue: 80, currentValue: 72, unit: "%", period: "2026-03", assignee: "영업팀장", orgName: "그린골프연습장", industry: "골프연습장", status: "at_risk", memo: "3월 재등록 대상 47명 중 34명 접촉", updatedAt: "2026-03-12T09:00:00Z" },
  { id: "kpi-003", name: "월 매출", category: "매출", targetValue: 5000, currentValue: 4200, unit: "만원", period: "2026-03", assignee: "대표", orgName: "레이크사이드CC", industry: "골프장", status: "on_track", memo: "봄시즌 예약 증가 추세", updatedAt: "2026-03-11T16:00:00Z" },
  { id: "kpi-004", name: "신규 수강생", category: "영업", targetValue: 20, currentValue: 22, unit: "명", period: "2026-03", assignee: "원장", orgName: "이글아카데미", industry: "골프아카데미", status: "achieved", memo: "목표 초과 달성", updatedAt: "2026-03-12T08:00:00Z" },
  { id: "kpi-005", name: "피팅 전환율", category: "영업", targetValue: 60, currentValue: 45, unit: "%", period: "2026-03", assignee: "매니저", orgName: "피팅마스터", industry: "피팅샵", status: "behind", memo: "브랜드 재고 부족으로 전환율 하락", updatedAt: "2026-03-11T14:00:00Z" },
  { id: "kpi-006", name: "B2B 제안 전환", category: "영업", targetValue: 10, currentValue: 7, unit: "건", period: "2026-03", assignee: "영업이사", orgName: "(주)골프이노베이션", industry: "골프회사", status: "on_track", memo: "2건 추가 진행중", updatedAt: "2026-03-12T11:00:00Z" },
];

export default function OperatorKpiBoard() {
  const [kpis, setKpis] = useState<KpiItem[]>(initialKpis);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [orgFilter, setOrgFilter] = useState<OrgFilterState>({ search: "", industry: "전체", membership: "전체" });

  // New KPI form
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("운영");
  const [formTarget, setFormTarget] = useState("");
  const [formCurrent, setFormCurrent] = useState("");
  const [formUnit, setFormUnit] = useState("%");
  const [formPeriod, setFormPeriod] = useState("2026-03");
  const [formAssignee, setFormAssignee] = useState("");
  const [formOrg, setFormOrg] = useState("그린골프연습장");
  const [formMemo, setFormMemo] = useState("");

  const selected = kpis.find(k => k.id === selectedId);

  const filteredKpis = useMemo(() => {
    let list = kpis;
    if (orgFilter.search) {
      const q = orgFilter.search.toLowerCase();
      list = list.filter(k => k.orgName.toLowerCase().includes(q) || k.name.toLowerCase().includes(q));
    }
    if (orgFilter.industry !== "전체") {
      list = list.filter(k => k.industry === orgFilter.industry);
    }
    return list;
  }, [kpis, orgFilter]);

  // Summary stats
  const achievedCount = filteredKpis.filter(k => k.status === "achieved").length;
  const atRiskCount = filteredKpis.filter(k => k.status === "at_risk").length;
  const behindCount = filteredKpis.filter(k => k.status === "behind").length;
  const avgProgress = filteredKpis.length > 0
    ? Math.round(filteredKpis.reduce((s, k) => s + Math.min(100, (k.currentValue / k.targetValue) * 100), 0) / filteredKpis.length)
    : 0;

  const handleAddKpi = () => {
    const target = parseFloat(formTarget);
    const current = parseFloat(formCurrent);
    if (!formName.trim() || !target || isNaN(current)) {
      toast({ title: "필수 항목을 입력하세요", variant: "destructive" });
      return;
    }
    const progress = (current / target) * 100;
    const status: KpiStatus = progress >= 100 ? "achieved" : progress >= 70 ? "on_track" : progress >= 50 ? "at_risk" : "behind";

    const newKpi: KpiItem = {
      id: `kpi-${Date.now()}`,
      name: formName.trim(),
      category: formCategory,
      targetValue: target,
      currentValue: current,
      unit: formUnit,
      period: formPeriod,
      assignee: formAssignee || "미배정",
      orgName: formOrg,
      industry: "골프연습장",
      status,
      memo: formMemo,
      updatedAt: new Date().toISOString(),
    };

    setKpis(prev => [newKpi, ...prev]);
    toast({ title: "KPI 추가 완료", description: formName });
    setShowForm(false);
    setFormName(""); setFormTarget(""); setFormCurrent(""); setFormMemo(""); setFormAssignee("");
  };

  const handleUpdateCurrent = (id: string, newValue: string) => {
    const val = parseFloat(newValue);
    if (isNaN(val)) return;
    setKpis(prev => prev.map(k => {
      if (k.id !== id) return k;
      const progress = (val / k.targetValue) * 100;
      const status: KpiStatus = progress >= 100 ? "achieved" : progress >= 70 ? "on_track" : progress >= 50 ? "at_risk" : "behind";
      return { ...k, currentValue: val, status, updatedAt: new Date().toISOString() };
    }));
  };

  const handleUpdateMemo = (id: string, memo: string) => {
    setKpis(prev => prev.map(k => k.id === id ? { ...k, memo, updatedAt: new Date().toISOString() } : k));
  };

  const handleDelete = (id: string) => {
    setKpis(prev => prev.filter(k => k.id !== id));
    if (selectedId === id) setSelectedId(null);
    toast({ title: "KPI 삭제됨" });
  };

  const boardColumns: DataBoardColumn<KpiItem>[] = [
    { header: "KPI 지표", accessor: r => r.name, render: r => <span className="font-medium">{r.name}</span> },
    { header: "카테고리", accessor: r => r.category, render: r => <Badge variant="outline" className="text-[9px]">{r.category}</Badge> },
    { header: "조직", accessor: r => r.orgName },
    { header: "목표", accessor: r => `${r.targetValue}${r.unit}`, className: "text-right" },
    { header: "현재", accessor: r => `${r.currentValue}${r.unit}`, className: "text-right", render: r => {
      const pct = (r.currentValue / r.targetValue) * 100;
      return <span className={pct >= 100 ? "text-blue-400" : pct >= 70 ? "text-emerald-400" : pct >= 50 ? "text-amber-400" : "text-red-400"}>{r.currentValue}{r.unit}</span>;
    }},
    { header: "달성률", accessor: r => Math.round((r.currentValue / r.targetValue) * 100), className: "text-right", render: r => {
      const pct = Math.min(100, Math.round((r.currentValue / r.targetValue) * 100));
      return <span>{pct}%</span>;
    }},
    { header: "상태", accessor: r => statusConfig[r.status].label, render: r => <Badge variant="outline" className={`text-[9px] ${statusConfig[r.status].color}`}>{statusConfig[r.status].label}</Badge> },
    { header: "담당자", accessor: r => r.assignee },
    { header: "기간", accessor: r => r.period },
  ];

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-5 pb-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">전체 KPI</p>
            <p className="text-2xl font-bold mt-1">{filteredKpis.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="pt-5 pb-4">
            <p className="text-[10px] text-emerald-400 uppercase tracking-wider">달성</p>
            <p className="text-2xl font-bold mt-1 text-emerald-400">{achievedCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="pt-5 pb-4">
            <p className="text-[10px] text-amber-400 uppercase tracking-wider">주의</p>
            <p className="text-2xl font-bold mt-1 text-amber-400">{atRiskCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-5 pb-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">평균 달성률</p>
            <div className="mt-1">
              <p className="text-2xl font-bold">{avgProgress}%</p>
              <Progress value={avgProgress} className="h-1.5 mt-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add KPI button */}
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1.5">
          <Plus className="h-3 w-3" />{showForm ? "취소" : "KPI 추가"}
        </Button>
      </div>

      {/* Add KPI form */}
      {showForm && (
        <Card className="bg-card/50 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><Plus className="h-4 w-4 text-primary" />새 KPI 등록</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">지표명 *</Label>
                <Input placeholder="타석 가동률" value={formName} onChange={e => setFormName(e.target.value)} className="text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">카테고리</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">목표값 *</Label>
                <Input type="number" placeholder="75" value={formTarget} onChange={e => setFormTarget(e.target.value)} className="text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">현재값 *</Label>
                <Input type="number" placeholder="68" value={formCurrent} onChange={e => setFormCurrent(e.target.value)} className="text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">단위</Label>
                <Input placeholder="%" value={formUnit} onChange={e => setFormUnit(e.target.value)} className="text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">기간</Label>
                <Input placeholder="2026-03" value={formPeriod} onChange={e => setFormPeriod(e.target.value)} className="text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">담당자</Label>
                <Input placeholder="운영팀장" value={formAssignee} onChange={e => setFormAssignee(e.target.value)} className="text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">조직</Label>
                <Input placeholder="그린골프연습장" value={formOrg} onChange={e => setFormOrg(e.target.value)} className="text-xs" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">메모</Label>
              <Textarea placeholder="KPI 관련 참고 사항..." value={formMemo} onChange={e => setFormMemo(e.target.value)} className="text-xs min-h-[50px]" />
            </div>
            <Button size="sm" onClick={handleAddKpi}><Plus className="h-3 w-3 mr-1" />등록</Button>
          </CardContent>
        </Card>
      )}

      {/* KPI list with DataBoard */}
      <DataBoard
        title="KPI 현황 보드"
        icon={<BarChart3 className="h-4 w-4 text-primary" />}
        data={filteredKpis}
        columns={boardColumns}
        exportFileName="KPI_현황"
        filterSlot={<OrgBranchFilter filter={orgFilter} onChange={setOrgFilter} />}
        onRowClick={row => setSelectedId(row.id)}
        selectedRow={row => row.id === selectedId}
        emptyMessage="등록된 KPI가 없습니다. '+ KPI 추가' 버튼으로 등록하세요."
      />

      {/* Selected KPI detail */}
      {selected && (
        <Card className="bg-card/50 border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  {selected.name}
                </CardTitle>
                <CardDescription className="text-xs mt-1">{selected.orgName} · {selected.category} · {selected.period}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={statusConfig[selected.status].color}>{statusConfig[selected.status].label}</Badge>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(selected.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>현재: {selected.currentValue}{selected.unit}</span>
                <span>목표: {selected.targetValue}{selected.unit}</span>
              </div>
              <Progress value={Math.min(100, (selected.currentValue / selected.targetValue) * 100)} className="h-2" />
              <p className="text-[10px] text-muted-foreground text-right">
                달성률 {Math.round((selected.currentValue / selected.targetValue) * 100)}%
              </p>
            </div>

            <Separator className="opacity-30" />

            {/* Inline editable current value + memo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">현재값 수정</Label>
                <Input
                  type="number"
                  value={selected.currentValue}
                  onChange={e => handleUpdateCurrent(selected.id, e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">담당자</Label>
                <p className="text-xs mt-1">{selected.assignee}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">마지막 업데이트</Label>
                <p className="text-xs mt-1">{new Date(selected.updatedAt).toLocaleString("ko-KR")}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">메모</Label>
              <Textarea
                value={selected.memo}
                onChange={e => handleUpdateMemo(selected.id, e.target.value)}
                className="text-xs min-h-[50px]"
                placeholder="KPI 관련 메모..."
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
