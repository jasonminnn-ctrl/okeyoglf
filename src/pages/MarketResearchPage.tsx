import { useState, useCallback } from "react";
import { Search, Building2, MapPin, Tag, Hash, Play, FileText, Lightbulb, Target, MessageSquare, Bookmark, Loader2, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ConsultantCTA } from "@/components/ConsultantCTA";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { ContextSummary } from "@/components/ContextSummary";
import { useBusinessContext, businessTypeLabels, type BusinessType } from "@/contexts/BusinessContext";
import { useMembership } from "@/contexts/MembershipContext";
import { useResultStore } from "@/contexts/ResultStoreContext";
import { FEATURE_KEYS } from "@/lib/membership";
import { buildContextSummary } from "@/lib/ai-generation";
import { toast } from "@/hooks/use-toast";

interface ResearchInputs {
  businessType: BusinessType;
  region: string;
  keyword: string;
  purpose: string;
  count: string;
}

export default function MarketResearchPage() {
  const { config, label, businessType, orgProfile } = useBusinessContext();
  const { checkAccess, getResultActions, deductCredit } = useMembership();
  const { saveResult, markConsultantTransferred } = useResultStore();

  const [inputs, setInputs] = useState<ResearchInputs>({
    businessType,
    region: "",
    keyword: "",
    purpose: "",
    count: "20",
  });
  const [loading, setLoading] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [resultId] = useState(`research-${Date.now()}`);

  const effectiveLabel = businessTypeLabels[inputs.businessType] || label;
  const contextSummary = buildContextSummary(inputs.businessType, effectiveLabel, orgProfile);

  const generateAccess = checkAccess(FEATURE_KEYS.RESEARCH_BASIC);
  const resultActions = getResultActions();

  const setField = useCallback(<K extends keyof ResearchInputs>(key: K, value: ResearchInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  }, []);

  const regionValue = inputs.region || config.researchExamples.region;
  const keywordValue = inputs.keyword || config.researchExamples.keyword;

  const handleResearch = () => {
    if (!generateAccess.enabled) {
      toast({ title: "기능 제한", description: generateAccess.lockReason || "이 기능을 사용할 수 없습니다", variant: "destructive" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setHasResult(true);
      if (generateAccess.requiresCredit && generateAccess.creditCost > 0) {
        deductCredit(generateAccess.creditCost, "generate", "시장조사 — 기본 조사 생성", "시장조사");
      }
    }, 2000);
  };

  const handleSave = () => {
    saveResult({
      id: resultId,
      type: "research",
      title: `시장조사 — ${effectiveLabel}`,
      module: "시장조사",
      subtool: "기본 조사",
      sourceTool: "market-research/summary",
      sourceMenu: "시장조사",
      category: "시장조사 결과",
      businessType: effectiveLabel,
      tags: ["시장조사", effectiveLabel, keywordValue].filter(Boolean),
      outputFormat: "structured",
      sections: [
        { title: "조사 요약", type: "summary", content: `${effectiveLabel} 업종 기준 시장 데이터 수집 완료. 주요 경쟁 포인트 3건 도출.` },
        { title: "경쟁사 리스트", type: "detail", content: `반경 5km 내 ${effectiveLabel} 3곳 확인. 가격대/서비스 비교 완료.` },
        { title: "인사이트", type: "recommendation", content: "비수요 시간대 활용, 차별화 포인트 2건, 가격 경쟁력 우위 확인." },
        { title: "추천 액션", type: "action", content: "프로모션 기획 연계, 채널 전략 수립, 가격 조정 검토 권장." },
      ],
      contextSummary,
      createdAt: new Date().toISOString(),
      status: "임시 저장",
      sourceNote: "OkeyGolf AI 리서치 엔진 기반 생성",
      referenceNote: "고객 운영 프로필 + 업종별 시장조사 레퍼런스 참조",
      metadata: {
        researchInputs: {
          businessType: inputs.businessType,
          region: regionValue,
          keyword: keywordValue,
          purpose: inputs.purpose,
          count: inputs.count,
        },
      },
      attachments: [],
      exportFiles: [],
      shareHistory: [],
      deliveryHistory: [],
      consultantTransferHistory: [],
    });
    toast({ title: "저장 완료", description: "시장조사 결과에 저장되었습니다" });
  };

  const handleConsultantTransfer = () => {
    if (!resultActions.consultantTransfer.enabled) {
      toast({ title: "기능 제한", description: resultActions.consultantTransfer.lockReason || "현재 플랜에서 이용할 수 없습니다", variant: "destructive" });
      return;
    }
    // Save first if not saved
    if (hasResult) {
      handleSave();
    }
    markConsultantTransferred(resultId, {
      id: `ct-${Date.now()}`,
      transferredAt: new Date().toISOString(),
      requestNote: `시장조사 전담 컨설턴트 전환 요청 — ${effectiveLabel}, ${regionValue}, ${keywordValue}`,
      status: "requested",
    });
    toast({ title: "전담 컨설턴트 전환 완료", description: "요청이 접수되었습니다. 전담 컨설턴트가 확인 후 연락드립니다." });
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

      {/* Research Input */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">조사 조건 입력</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> 업종</Label>
              <Select value={inputs.businessType} onValueChange={(v) => setField("businessType", v as BusinessType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(businessTypeLabels) as [BusinessType, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> 지역</Label>
              <Input
                placeholder={`예: ${config.researchExamples.region}`}
                value={inputs.region}
                onChange={(e) => setField("region", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> 키워드</Label>
              <Input
                placeholder={`예: ${config.researchExamples.keyword}`}
                value={inputs.keyword}
                onChange={(e) => setField("keyword", e.target.value)}
              />
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

          {/* Purpose (optional) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Lightbulb className="h-3.5 w-3.5" /> 조사 목적 (선택)</Label>
            <Input
              placeholder="예: 경쟁사 가격 비교, 입지 분석, 트렌드 파악"
              value={inputs.purpose}
              onChange={(e) => setField("purpose", e.target.value)}
            />
          </div>

          <Card className="bg-muted/20 border-border/30">
            <CardContent className="pt-3 pb-3">
              <p className="text-[11px] text-muted-foreground">
                💡 추천 조사 포인트: <span className="text-primary">{config.researchExamples.focus}</span>
              </p>
            </CardContent>
          </Card>

          <Button className="w-full md:w-auto" onClick={handleResearch} disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />조사 진행 중...</> : <><Play className="h-4 w-4 mr-1.5" />조사 시작</>}
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      <ResearchResultCard
        hasResult={hasResult}
        effectiveLabel={effectiveLabel}
        regionValue={regionValue}
        keywordValue={keywordValue}
        count={inputs.count}
        resultActions={resultActions}
        onSave={handleSave}
        onConsultantTransfer={handleConsultantTransfer}
      />

      <ConsultantCTA category="시장조사" />
    </div>
  );
}

// ──────────────────────────────────
// Result Card (extracted component)
// ──────────────────────────────────

interface ResearchResultCardProps {
  hasResult: boolean;
  effectiveLabel: string;
  regionValue: string;
  keywordValue: string;
  count: string;
  resultActions: ReturnType<ReturnType<typeof useMembership>["getResultActions"]>;
  onSave: () => void;
  onConsultantTransfer: () => void;
}

function ResearchResultCard({
  hasResult, effectiveLabel, regionValue, keywordValue, count,
  resultActions, onSave, onConsultantTransfer,
}: ResearchResultCardProps) {
  const items = [
    { icon: FileText, label: "조사 요약", desc: hasResult ? `${effectiveLabel} 업종 기준 시장 데이터 수집 완료. 주요 경쟁 포인트 3건 도출.` : "수집된 데이터 요약 리포트" },
    { icon: Target, label: "경쟁사 리스트", desc: hasResult ? `반경 5km 내 ${effectiveLabel} 3곳 확인. 가격대/서비스 비교 완료.` : "주요 경쟁사 현황 정리" },
    { icon: Lightbulb, label: "인사이트", desc: hasResult ? "비수요 시간대 활용, 차별화 포인트 2건, 가격 경쟁력 우위 확인." : "데이터 기반 핵심 인사이트" },
    { icon: MessageSquare, label: "추천 액션", desc: hasResult ? "프로모션 기획 연계, 채널 전략 수립, 가격 조정 검토 권장." : "조사 결과 기반 실행 제안" },
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
              <Badge variant="outline" className="text-[10px]">업종: {effectiveLabel}</Badge>
              <Badge variant="outline" className="text-[10px]">지역: {regionValue}</Badge>
              <Badge variant="outline" className="text-[10px]">키워드: {keywordValue}</Badge>
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
