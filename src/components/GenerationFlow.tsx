import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Sparkles, Copy, Check, Bookmark, RefreshCw, MessageSquare, FileText, ArrowLeft, Lock, CreditCard } from "lucide-react";
import { ContextSummary } from "@/components/ContextSummary";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { useMembership } from "@/contexts/MembershipContext";
import { useResultStore } from "@/contexts/ResultStoreContext";
import { buildContextSummary, generateMockResult, pipelineConfigs } from "@/lib/ai-generation";
import type { GenerationResult, GenerationResultSection, PipelineConfig } from "@/lib/ai-generation";
import type { FeatureKey } from "@/lib/membership";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface GenerationFlowProps {
  pipelineKey: string;
  featureKey: FeatureKey;
  title: string;
  description: string;
  icon: React.ReactNode;
  backUrl: string;
  children: (props: {
    onGenerate: (inputs: Record<string, string>) => void;
    loading: boolean;
  }) => React.ReactNode;
}

function ResultSectionCard({ section }: { section: GenerationResultSection }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(section.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-primary" />
          <CardTitle className="text-sm font-semibold">{section.title}</CardTitle>
        </div>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 text-xs hover:bg-primary/10">
          {copied ? <Check className="h-3 w-3 mr-1 text-emerald-400" /> : <Copy className="h-3 w-3 mr-1" />}
          {copied ? "복사됨" : "복사"}
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-1.5">
          {section.content.split("\n").map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={i} className="h-2" />;
            if (/^[0-9]+[.)]/.test(trimmed)) {
              return (
                <div key={i} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
                  <span className="text-primary font-medium min-w-[1.5rem]">{trimmed.match(/^[0-9]+[.)]/)?.[0]}</span>
                  <span>{trimmed.replace(/^[0-9]+[.)]\s*/, "")}</span>
                </div>
              );
            }
            if (/^[-•□▶✅⚠✓]/.test(trimmed)) {
              const bullet = trimmed.match(/^[-•□▶✅⚠✓]/)?.[0] || "•";
              return (
                <div key={i} className="flex gap-2 text-sm text-muted-foreground leading-relaxed pl-1">
                  <span className="text-primary/70">{bullet}</span>
                  <span>{trimmed.replace(/^[-•□▶✅⚠✓]\s*/, "")}</span>
                </div>
              );
            }
            if (trimmed.endsWith(":") && trimmed.length < 50) {
              return <p key={i} className="text-sm font-medium text-foreground mt-3 first:mt-0">{trimmed}</p>;
            }
            if (/^\[.+\]$/.test(trimmed)) {
              return <p key={i} className="text-sm font-semibold text-primary mt-3 first:mt-0">{trimmed}</p>;
            }
            if (/^\|/.test(trimmed)) {
              return <p key={i} className="text-xs text-muted-foreground font-mono">{trimmed}</p>;
            }
            return <p key={i} className="text-sm text-muted-foreground leading-relaxed">{trimmed}</p>;
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function GenerationFlow({ pipelineKey, featureKey, title, description, icon, backUrl, children }: GenerationFlowProps) {
  const navigate = useNavigate();
  const { businessType, label, orgProfile } = useBusinessContext();
  const { checkAccess, getResultActions, deductCredit, creditBalance } = useMembership();
  const { saveResult } = useResultStore();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isRegenerate, setIsRegenerate] = useState(false);

  const config = pipelineConfigs[pipelineKey];
  const contextSummary = buildContextSummary(businessType, label, orgProfile);

  // Check feature access
  const generateAccess = checkAccess(featureKey);
  const resultActions = getResultActions();

  const handleGenerate = useCallback(async (inputs: Record<string, string>) => {
    if (!config) return;
    if (!generateAccess.enabled) {
      toast({ title: "기능 제한", description: generateAccess.lockReason || "이 기능을 사용할 수 없습니다", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const genResult = await generateMockResult(
        { businessType, businessLabel: label, module: config.module, subtool: config.subtool, userInputs: inputs, contextSummary },
        config,
      );
      // Deduct credit on successful generation
      const ledgerType = isRegenerate ? "regenerate" : "generate";
      const actionLabel = isRegenerate ? "재생성" : "생성";
      if (generateAccess.requiresCredit && generateAccess.creditCost > 0) {
        deductCredit(generateAccess.creditCost, ledgerType, `${config.module} — ${config.subtool} ${actionLabel}`, config.module, genResult.id);
      }
      setIsRegenerate(false);
      setResult(genResult);
    } finally {
      setLoading(false);
    }
  }, [businessType, label, config, contextSummary, generateAccess, deductCredit]);

  const handleRegenerate = () => {
    if (!resultActions.regenerate.enabled) {
      toast({ title: "기능 제한", description: resultActions.regenerate.lockReason || "재생성이 제한됩니다", variant: "destructive" });
      return;
    }
    setIsRegenerate(true);
    setResult(null);
  };

  const handleSave = () => {
    if (result && config) {
      saveResult({
        id: result.id,
        type: "generation",
        title: result.title,
        module: result.module,
        subtool: result.subtool,
        sourceTool: config.module,
        sourceMenu: config.module,
        category: config.saveCategory,
        businessType: result.businessType,
        sections: result.sections,
        contextSummary: result.contextSummary,
        createdAt: result.createdAt,
        status: "임시 저장",
        sourceNote: result.sourceNote,
        referenceNote: result.referenceNote,
      });
      toast({ title: "저장 완료", description: `${config.saveCategory}에 저장되었습니다` });
    }
  };

  const handleCopyAll = async () => {
    if (!resultActions.copy.enabled) {
      toast({ title: "기능 제한", description: resultActions.copy.lockReason || "복사가 제한됩니다", variant: "destructive" });
      return;
    }
    if (result) {
      const text = result.sections.map(s => `${s.title}\n${s.content}`).join("\n\n");
      await navigator.clipboard.writeText(text);
      toast({ title: "전체 복사 완료" });
    }
  };

  const handleConsultant = () => {
    if (!resultActions.consultantTransfer.enabled) {
      toast({ title: "기능 제한", description: resultActions.consultantTransfer.lockReason || "전환이 제한됩니다", variant: "destructive" });
      return;
    }
    toast({ title: "전담 컨설턴트 전환", description: "전담 컨설턴트에게 요청이 전달되었습니다 (데모)" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate(backUrl)} className="mb-2 -ml-2 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3 w-3 mr-1" /> 뒤로가기
          </Button>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            {icon}
            {title}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{description}</p>
        </div>
        {generateAccess.requiresCredit && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CreditCard className="h-3 w-3" />
            <span>생성 시 {generateAccess.creditCost} 크레딧 차감</span>
            <span className="text-primary font-medium">· 잔액 {creditBalance}</span>
          </div>
        )}
      </div>

      {/* Access Lock Banner */}
      {!generateAccess.enabled && generateAccess.visible && (
        <Card className="bg-muted/20 border-border/30">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">{generateAccess.lockReason}</p>
          </CardContent>
        </Card>
      )}

      {/* Context Summary */}
      <ContextSummary context={contextSummary} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-1 space-y-4">
          {children({ onGenerate: handleGenerate, loading })}
        </div>

        {/* Result Panel */}
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              {/* Result Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-primary" />
                  생성 결과
                </h2>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{result.businessType}</Badge>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{result.status}</Badge>
                </div>
              </div>

              {/* Result Sections */}
              {result.sections.map((section, i) => (
                <ResultSectionCard key={i} section={section} />
              ))}

              {/* Source/Reference Notes */}
              {(result.sourceNote || result.referenceNote) && (
                <Card className="bg-muted/20 border-border/30">
                  <CardContent className="pt-3 pb-3 space-y-1">
                    {result.sourceNote && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <FileText className="h-3 w-3" /> {result.sourceNote}
                      </p>
                    )}
                    {result.referenceNote && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <FileText className="h-3 w-3" /> {result.referenceNote}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              <Separator />

              {/* Action Buttons - only in result area */}
              <div className="flex flex-wrap gap-2">
                {resultActions.save.visible && (
                  <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={handleSave} disabled={!resultActions.save.enabled}>
                    <Bookmark className="h-3 w-3" /> 결과 저장
                  </Button>
                )}
                {resultActions.copy.visible && (
                  <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={handleCopyAll} disabled={!resultActions.copy.enabled}>
                    {resultActions.copy.enabled ? <Copy className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    전체 복사
                    {!resultActions.copy.enabled && <span className="text-[9px] text-muted-foreground ml-0.5">{resultActions.copy.lockReason}</span>}
                  </Button>
                )}
                {resultActions.regenerate.visible && (
                  <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={handleRegenerate} disabled={!resultActions.regenerate.enabled}>
                    {resultActions.regenerate.enabled ? <RefreshCw className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    다시 생성
                    {resultActions.regenerate.requiresCredit && resultActions.regenerate.enabled && (
                      <span className="text-[9px] text-muted-foreground">({resultActions.regenerate.creditCost})</span>
                    )}
                  </Button>
                )}
                {resultActions.consultantTransfer.visible && (
                  <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={handleConsultant} disabled={!resultActions.consultantTransfer.enabled}>
                    {resultActions.consultantTransfer.enabled ? <MessageSquare className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    전담 컨설턴트 전환
                  </Button>
                )}
              </div>
            </>
          ) : loading ? (
            <Card className="bg-card/50 border-border/50 h-full min-h-[400px] flex items-center justify-center">
              <div className="text-center p-8">
                <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">AI가 {label} 업종 맞춤 결과를 생성하고 있습니다...</p>
                <p className="text-muted-foreground text-xs mt-1">비즈니스 컨텍스트 반영 중</p>
              </div>
            </Card>
          ) : (
            <Card className="bg-card/50 border-border/50 h-full min-h-[400px] flex items-center justify-center">
              <div className="text-center p-8">
                <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">입력을 완료하고 생성 버튼을 클릭하세요</p>
                <p className="text-muted-foreground text-xs mt-1">{label} 업종 맞춤 결과가 생성됩니다</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
