import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Search, Building2, MapPin, Tag, Hash, Play, FileText, Lightbulb, Target, MessageSquare, Bookmark, Loader2, Lock, Info, Clock, History, ChevronRight, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConsultantCTA } from "@/components/ConsultantCTA";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { ContextSummary } from "@/components/ContextSummary";
import { ResultDetailDrawer } from "@/components/ResultDetailDrawer";
import { useBusinessContext, businessTypeLabels, type BusinessType } from "@/contexts/BusinessContext";
import { useMembership } from "@/contexts/MembershipContext";
import { useResultStore } from "@/contexts/ResultStoreContext";
import { FEATURE_KEYS } from "@/lib/membership";
import { buildContextSummary } from "@/lib/ai-generation";
import { toast } from "@/hooks/use-toast";
import {
  getResearchTemplates,
  researchStatusLabels,
  researchStatusColors,
  type ResearchRequest,
  type ResearchRequestStatus,
  type ResearchTemplate,
} from "@/lib/market-research";
import { fetchResearchRequests, insertResearchRequest, updateResearchStatus } from "@/lib/repositories/research-repository";

// ──────────────────────────────────
// Research Inputs
// ──────────────────────────────────

interface ResearchInputs {
  businessType: BusinessType;
  region: string;
  keyword: string;
  purpose: string;
  count: string;
  scope: string;
  memo: string;
}

// ──────────────────────────────────
// Helpers
// ──────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

// One-time localStorage import
const LS_KEY = "okeygolf_research_requests";
const LS_IMPORT_FLAG = "okeygolf_research_imported";

function loadLocalRequests(): ResearchRequest[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ResearchRequest[];
  } catch { return []; }
}

// ──────────────────────────────────
// Page Component
// ──────────────────────────────────

export default function MarketResearchPage() {
  const { config, label, businessType: globalBusinessType, orgProfile } = useBusinessContext();
  const { checkAccess, getResultActions, deductCredit } = useMembership();
  const { saveResult, markConsultantTransferred, getResultsByCategory } = useResultStore();

  const [requests, setRequests] = useState<ResearchRequest[]>([]);
  const [activeTab, setActiveTab] = useState("new");
  const importAttempted = useRef(false);

  const [inputs, setInputs] = useState<ResearchInputs>({
    businessType: globalBusinessType,
    region: "",
    keyword: "",
    purpose: "",
    count: "20",
    scope: "competitor",
    memo: "",
  });
  const [loading, setLoading] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);

  const researchLabel = businessTypeLabels[inputs.businessType] || inputs.businessType;
  const isResearchDifferentFromGlobal = inputs.businessType !== globalBusinessType;
  const contextSummary = buildContextSummary(inputs.businessType, researchLabel, orgProfile);

  const generateAccess = checkAccess(FEATURE_KEYS.RESEARCH_BASIC);
  const resultActions = getResultActions();

  const templates = useMemo(() => getResearchTemplates(inputs.businessType), [inputs.businessType]);
  const selectedTemplate = templates.find(t => t.key === inputs.scope) || templates[0];

  const savedResearchResults = getResultsByCategory("시장조사 결과");

  // Load from DB + one-time localStorage import
  useEffect(() => {
    let cancelled = false;
    async function init() {
      const dbRequests = await fetchResearchRequests();
      if (cancelled) return;

      const alreadyImported = localStorage.getItem(LS_IMPORT_FLAG) === "true";
      if (!alreadyImported && !importAttempted.current) {
        importAttempted.current = true;
        const localRequests = loadLocalRequests();
        if (localRequests.length > 0) {
          const existingIds = new Set(dbRequests.map(r => r.id));
          const toImport = localRequests.filter(r => !existingIds.has(r.id) && r.status !== "draft");
          for (const r of toImport) {
            await insertResearchRequest(r);
          }
          const merged = [...dbRequests, ...toImport];
          merged.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
          if (!cancelled) setRequests(merged);
        } else {
          if (!cancelled) setRequests(dbRequests);
        }
        localStorage.setItem(LS_IMPORT_FLAG, "true");
      } else {
        if (!cancelled) setRequests(dbRequests);
      }
    }
    init();
    return () => { cancelled = true; };
  }, []);

  const setField = useCallback(<K extends keyof ResearchInputs>(key: K, value: ResearchInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  }, []);

  const regionValue = inputs.region || config.researchExamples.region;
  const keywordValue = inputs.keyword || config.researchExamples.keyword;

  // Persist request to DB + local state
  const persistRequest = useCallback((req: ResearchRequest) => {
    setRequests(prev => {
      const idx = prev.findIndex(r => r.id === req.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = req;
        return next;
      }
      return [req, ...prev];
    });
  }, []);

  const handleResearch = () => {
    if (!generateAccess.enabled) {
      toast({ title: "기능 제한", description: generateAccess.lockReason || "이 기능을 사용할 수 없습니다", variant: "destructive" });
      return;
    }

    const requestId = crypto.randomUUID();
    setCurrentRequestId(requestId);

    const request: ResearchRequest = {
      id: requestId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "requested",
      businessType: inputs.businessType,
      businessTypeLabel: researchLabel,
      region: regionValue,
      keyword: keywordValue,
      purpose: inputs.purpose,
      scope: inputs.scope,
      count: inputs.count,
      memo: inputs.memo,
      sourceType: "ai_internal",
      collectionStatus: "in_progress",
      externalCollectionPlanned: false,
    };
    persistRequest(request);
    insertResearchRequest(request); // DB insert

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setHasResult(true);

      const completed: ResearchRequest = {
        ...request,
        updatedAt: new Date().toISOString(),
        status: "completed",
        collectionStatus: "completed",
        sourceSummary: "AI 내부 분석 기반 결과 생성 완료 (외부 데이터 수집 미연동 — 추후 확장 예정)",
      };
      persistRequest(completed);
      updateResearchStatus(requestId, "completed", {
        sourceSummary: completed.sourceSummary,
      });

      if (generateAccess.requiresCredit && generateAccess.creditCost > 0) {
        deductCredit(generateAccess.creditCost, "generate", `시장조사 — ${selectedTemplate.title}`, "시장조사");
      }
    }, 2000);
  };

  const handleSave = () => {
    const resultId = currentRequestId || crypto.randomUUID();
    saveResult({
      id: resultId,
      type: "research",
      title: `시장조사 — ${selectedTemplate.title} (${researchLabel})`,
      module: "시장조사",
      subtool: selectedTemplate.title,
      sourceTool: `market-research/${inputs.scope}`,
      sourceMenu: "시장조사",
      category: "시장조사 결과",
      businessType: researchLabel,
      tags: ["시장조사", researchLabel, selectedTemplate.title, keywordValue].filter(Boolean),
      outputFormat: "structured",
      sections: [
        { title: "조사 요약", type: "summary", content: `${researchLabel} 업종 기준 ${selectedTemplate.title} 완료. 입력 기준에 따른 분석 결과입니다.\n\n⚠️ 현재 AI 내부 분석 기반 결과이며, 외부 데이터 수집은 추후 연동 예정입니다.` },
        { title: "조사 조건", type: "detail", content: `업종: ${researchLabel}\n지역: ${regionValue}\n키워드: ${keywordValue}\n조사 범위: ${selectedTemplate.title}\n수집 목표: ${inputs.count}건\n목적: ${inputs.purpose || "미입력"}` },
        { title: "분석 결과", type: "detail", content: `${researchLabel} 업종 기준 ${selectedTemplate.title} 분석이 완료되었습니다.\n\n※ 확인 필요: 실제 외부 데이터 수집이 연동되면 더 정확한 결과를 제공합니다.\n※ 현재 입력 기준 가정으로 생성된 구조화 결과입니다.` },
        { title: "인사이트", type: "recommendation", content: "추가 자료 필요: 외부 수집 데이터가 연동되면 경쟁사 비교, 가격 분석 등 상세 인사이트가 보강됩니다." },
        { title: "추천 액션", type: "action", content: "1. 조사 결과를 전담 컨설턴트에 전달하여 검토 요청\n2. 관련 프로모션/마케팅 모듈에서 활용\n3. 추가 조사 조건으로 심화 분석 진행" },
      ],
      contextSummary,
      createdAt: new Date().toISOString(),
      status: "임시 저장",
      sourceNote: "OkeyGolf AI 리서치 엔진 기반 생성 (외부 수집 미연동)",
      referenceNote: "고객 운영 프로필 + 업종별 시장조사 레퍼런스 참조",
      metadata: {
        researchInputs: {
          businessType: inputs.businessType,
          businessTypeLabel: researchLabel,
          region: regionValue,
          keyword: keywordValue,
          purpose: inputs.purpose,
          count: inputs.count,
          scope: inputs.scope,
          templateTitle: selectedTemplate.title,
          memo: inputs.memo,
        },
        globalBusinessType,
        isResearchDifferentFromGlobal,
        sourceType: "ai_internal",
        collectionStatus: "completed",
        externalCollectionPlanned: false,
      },
      attachments: [],
      exportFiles: [],
      shareHistory: [],
      deliveryHistory: [],
      consultantTransferHistory: [],
    });

    // Link request to result in DB (delay to ensure saved_results row exists for FK)
    if (currentRequestId) {
      setRequests(prev => prev.map(r => r.id === currentRequestId ? { ...r, linkedResultId: resultId, updatedAt: new Date().toISOString() } : r));
      setTimeout(() => {
        updateResearchStatus(currentRequestId, "completed", { resultId });
      }, 1500);
    }

    toast({ title: "저장 완료", description: "시장조사 결과에 저장되었습니다" });
  };

  const handleConsultantTransfer = () => {
    if (!resultActions.consultantTransfer.enabled) {
      toast({ title: "기능 제한", description: resultActions.consultantTransfer.lockReason || "현재 플랜에서 이용할 수 없습니다", variant: "destructive" });
      return;
    }
    const resultId = currentRequestId || crypto.randomUUID();
    if (hasResult) handleSave();
    markConsultantTransferred(resultId, {
      id: `ct-${Date.now()}`,
      transferredAt: new Date().toISOString(),
      requestNote: `시장조사 전담 컨설턴트 전환 — ${selectedTemplate.title}, ${researchLabel}, ${regionValue}`,
      status: "requested",
    });

    // Update request status in DB
    if (currentRequestId) {
      setRequests(prev => prev.map(r => r.id === currentRequestId ? { ...r, status: "consultant_handoff" as ResearchRequestStatus, updatedAt: new Date().toISOString() } : r));
      updateResearchStatus(currentRequestId, "consultant_handoff");
    }

    toast({ title: "전담 컨설턴트 전환 완료", description: "요청이 접수되었습니다. 전담 컨설턴트가 확인 후 연락드립니다." });
  };

  const handleOpenResult = (resultId: string) => {
    setSelectedResultId(resultId);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Search className="h-6 w-6 text-primary" />
          시장조사
        </h1>
        <p className="text-muted-foreground text-sm mt-1">업종·지역·키워드 기반 시장 데이터를 수집하고 분석합니다</p>
      </div>

      <BusinessContextBanner module="시장조사" />
      <ContextSummary context={contextSummary} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/30 p-1">
          <TabsTrigger value="new" className="text-xs px-4 py-1.5 gap-1.5">
            <Search className="h-3 w-3" /> 새 조사
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs px-4 py-1.5 gap-1.5">
            <History className="h-3 w-3" /> 최근 작업
            {requests.length > 0 && <Badge variant="outline" className="text-[9px] ml-1 h-4 px-1">{requests.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="saved" className="text-xs px-4 py-1.5 gap-1.5">
            <Bookmark className="h-3 w-3" /> 저장된 결과
            {savedResearchResults.length > 0 && <Badge variant="outline" className="text-[9px] ml-1 h-4 px-1">{savedResearchResults.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* ─── New Research Tab ─── */}
        <TabsContent value="new" className="space-y-4">
          {/* Template Selection */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" /> 조사 유형 선택
              </CardTitle>
              <CardDescription>업종에 맞는 조사 템플릿을 선택하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {templates.map(tmpl => (
                  <button
                    key={tmpl.key}
                    onClick={() => setField("scope", tmpl.key)}
                    className={`text-left p-3 rounded-lg border transition-colors ${
                      inputs.scope === tmpl.key
                        ? "border-primary/50 bg-primary/5"
                        : "border-border/30 bg-muted/10 hover:bg-muted/20"
                    }`}
                  >
                    <p className="text-sm font-medium">{tmpl.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{tmpl.description}</p>
                    <p className="text-[10px] text-primary/70 mt-1">💡 {tmpl.exampleQuestion}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Research Input */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">조사 조건 입력</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> 조사 업종</Label>
                  <Select value={inputs.businessType} onValueChange={(v) => setField("businessType", v as BusinessType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.entries(businessTypeLabels) as [BusinessType, string][]).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isResearchDifferentFromGlobal && (
                    <div className="flex items-start gap-1.5 p-2 rounded bg-amber-500/10 border border-amber-500/20">
                      <Info className="h-3 w-3 text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-[10px] text-amber-400 leading-relaxed">
                        현재 시장조사는 회사 기본 업종({businessTypeLabels[globalBusinessType]})과 별도로 선택한 조사 업종({researchLabel}) 기준으로 생성됩니다.
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> 지역</Label>
                  <Input placeholder={`예: ${config.researchExamples.region}`} value={inputs.region} onChange={(e) => setField("region", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> 키워드</Label>
                  <Input placeholder={`예: ${config.researchExamples.keyword}`} value={inputs.keyword} onChange={(e) => setField("keyword", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Hash className="h-3.5 w-3.5" /> 수집 개수</Label>
                  <Select value={inputs.count} onValueChange={(v) => setField("count", v)}>
                    <SelectTrigger><SelectValue placeholder="수집 수 선택" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10건</SelectItem>
                      <SelectItem value="20">20건</SelectItem>
                      <SelectItem value="50">50건</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Lightbulb className="h-3.5 w-3.5" /> 조사 목적 (선택)</Label>
                <Input placeholder="예: 경쟁사 가격 비교, 입지 분석, 트렌드 파악" value={inputs.purpose} onChange={(e) => setField("purpose", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> 메모 (선택)</Label>
                <Input placeholder="내부 참고용 메모" value={inputs.memo} onChange={(e) => setField("memo", e.target.value)} />
              </div>

              {/* Summary badges */}
              <Card className="bg-muted/20 border-border/30">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-muted-foreground">조사 업종:</span>
                    <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">{researchLabel}</Badge>
                    <span className="text-[11px] text-muted-foreground">·</span>
                    <Badge variant="outline" className="text-[10px]">{selectedTemplate.title}</Badge>
                    <span className="text-[11px] text-muted-foreground">·</span>
                    <span className="text-[11px] text-muted-foreground">💡 {config.researchExamples.focus}</span>
                  </div>
                </CardContent>
              </Card>

              <Button className="w-full md:w-auto" onClick={handleResearch} disabled={loading || !generateAccess.enabled}>
                {!generateAccess.enabled ? (
                  <><Lock className="h-4 w-4 mr-1.5" />{generateAccess.lockReason || "기능 제한"}</>
                ) : loading ? (
                  <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />조사 진행 중...</>
                ) : (
                  <><Play className="h-4 w-4 mr-1.5" />조사 시작</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Result */}
          <ResearchResultCard
            hasResult={hasResult}
            template={selectedTemplate}
            researchLabel={researchLabel}
            regionValue={regionValue}
            keywordValue={keywordValue}
            count={inputs.count}
            resultActions={resultActions}
            onSave={handleSave}
            onConsultantTransfer={handleConsultantTransfer}
          />
        </TabsContent>

        {/* ─── History Tab ─── */}
        <TabsContent value="history" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4 text-primary" /> 최근 조사 작업
              </CardTitle>
              <CardDescription>최근 진행한 시장조사 요청 이력입니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {requests.length > 0 ? (
                requests.slice(0, 20).map(req => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors border border-border/20"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm truncate">{req.businessTypeLabel} — {baseTemplates[req.scope]?.title || req.scope}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] text-muted-foreground">{req.region}</span>
                          <span className="text-[10px] text-muted-foreground">·</span>
                          <span className="text-[10px] text-muted-foreground">{formatDate(req.updatedAt)}</span>
                          <Badge className={`${researchStatusColors[req.status]} text-[9px] h-4`} variant="outline">
                            {researchStatusLabels[req.status]}
                          </Badge>
                          {req.externalCollectionPlanned === false && (
                            <Badge variant="outline" className="text-[9px] h-4 bg-muted/30 text-muted-foreground">외부 수집 미연동</Badge>
                          )}
                          {req.linkedResultId && (
                            <Badge variant="outline" className="text-[9px] h-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">저장됨</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {req.linkedResultId && (
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => handleOpenResult(req.linkedResultId!)}>
                        <ChevronRight className="h-3 w-3" /> 보기
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 py-8 justify-center">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">아직 조사 작업 이력이 없습니다. 새 조사 탭에서 조사를 시작하세요.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Saved Results Tab ─── */}
        <TabsContent value="saved" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-primary" /> 저장된 시장조사 결과
              </CardTitle>
              <CardDescription>저장한 시장조사 결과를 열람하고 다운로드/공유/전달할 수 있습니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {savedResearchResults.length > 0 ? (
                savedResearchResults.map(r => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer border border-border/20"
                    onClick={() => handleOpenResult(r.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm truncate">{r.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] text-muted-foreground">{r.subtool || r.sourceTool}</span>
                          <span className="text-[10px] text-muted-foreground">·</span>
                          <span className="text-[10px] text-muted-foreground">{formatDate(r.updatedAt)}</span>
                          <Badge variant="outline" className="text-[9px] h-4">{r.status}</Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
                      <ChevronRight className="h-3 w-3" /> 상세
                    </Button>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 py-8 justify-center">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">저장된 시장조사 결과가 없습니다. 조사를 실행하고 결과를 저장하면 여기에 표시됩니다.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConsultantCTA category="시장조사" />

      <ResultDetailDrawer open={drawerOpen} onOpenChange={setDrawerOpen} resultId={selectedResultId} />
    </div>
  );
}

// ──────────────────────────────────
// Template title lookup (for history tab)
// ──────────────────────────────────

const baseTemplates: Record<string, { title: string }> = {
  competitor: { title: "경쟁사 조사" },
  area: { title: "지역/상권 조사" },
  customer: { title: "고객/수요 조사" },
  promotion: { title: "프로모션/상품 아이디어 조사" },
  operation: { title: "운영 이슈 조사" },
};

// ──────────────────────────────────
// Result Card
// ──────────────────────────────────

interface ResearchResultCardProps {
  hasResult: boolean;
  template: ResearchTemplate;
  researchLabel: string;
  regionValue: string;
  keywordValue: string;
  count: string;
  resultActions: ReturnType<ReturnType<typeof useMembership>["getResultActions"]>;
  onSave: () => void;
  onConsultantTransfer: () => void;
}

function ResearchResultCard({
  hasResult, template, researchLabel, regionValue, keywordValue, count,
  resultActions, onSave, onConsultantTransfer,
}: ResearchResultCardProps) {
  const items = [
    { icon: FileText, label: "조사 요약", desc: hasResult ? `${researchLabel} 업종 기준 ${template.title} 완료. 입력 기준에 따른 분석 결과입니다.` : "수집된 데이터 요약 리포트" },
    { icon: Target, label: "분석 결과", desc: hasResult ? `${researchLabel} 업종 기준 ${template.title} 분석 결과 생성 완료.` : "조사 범위 기반 상세 분석" },
    { icon: Lightbulb, label: "인사이트", desc: hasResult ? "추가 자료 필요: 외부 수집 데이터 연동 시 상세 인사이트 보강 예정." : "데이터 기반 핵심 인사이트" },
    { icon: MessageSquare, label: "추천 액션", desc: hasResult ? "전담 컨설턴트 전달, 관련 모듈 활용, 심화 분석 진행 권장." : "조사 결과 기반 실행 제안" },
  ];

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">조사 결과</CardTitle>
          {hasResult && (
            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">생성 완료</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Card className="bg-muted/20 border-border/30">
          <CardContent className="pt-3 pb-3">
            <p className="text-[11px] font-medium mb-1">조사 조건 요약</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-[10px]">업종: {researchLabel}</Badge>
              <Badge variant="outline" className="text-[10px]">지역: {regionValue}</Badge>
              <Badge variant="outline" className="text-[10px]">키워드: {keywordValue}</Badge>
              <Badge variant="outline" className="text-[10px]">범위: {template.title}</Badge>
              <Badge variant="outline" className="text-[10px]">수집: {count}건</Badge>
            </div>
          </CardContent>
        </Card>

        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
            <item.icon className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            {hasResult ? (
              <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">완료</Badge>
            ) : (
              <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted/30">대기 중</span>
            )}
          </div>
        ))}

        {hasResult && (
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="pt-3 pb-3">
              <p className="text-[10px] text-amber-400">⚠️ 현재 AI 내부 분석 기반 결과입니다. 외부 데이터 수집 기능은 추후 연동 예정이며, 연동 시 더 정확한 결과를 제공합니다.</p>
            </CardContent>
          </Card>
        )}

        {hasResult && (
          <Card className="bg-muted/20 border-border/30">
            <CardContent className="pt-3 pb-3">
              <p className="text-[10px] text-muted-foreground">📋 OkeyGolf AI 리서치 엔진 기반 생성 · 고객 운영 프로필 + 업종별 시장조사 레퍼런스 참조</p>
            </CardContent>
          </Card>
        )}

        <Separator />

        <div className="flex items-center gap-2 pt-1">
          {resultActions.save.visible && (
            <Button variant="outline" size="sm" className="text-xs gap-1.5" disabled={!hasResult || !resultActions.save.enabled} onClick={onSave}>
              <Bookmark className="h-3 w-3" /> 결과 저장
            </Button>
          )}
          {resultActions.consultantTransfer.visible && (
            <Button variant="outline" size="sm" className="text-xs gap-1.5" disabled={!hasResult || !resultActions.consultantTransfer.enabled} onClick={onConsultantTransfer}>
              {resultActions.consultantTransfer.enabled ? <MessageSquare className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              전담 컨설턴트 전환
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
