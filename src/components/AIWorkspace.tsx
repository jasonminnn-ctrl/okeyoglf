/**
 * AIWorkspace — Chat-style AI workspace pilot for AI 비서 page.
 * Cards inject template prompts; responses render as result cards with full actions.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Bot, Send, Loader2, Copy, Check, Bookmark, RefreshCw, MessageSquare,
  Download, ExternalLink, FileText, Sparkles, User,
} from "lucide-react";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { useMembership } from "@/contexts/MembershipContext";
import { useResultStore } from "@/contexts/ResultStoreContext";
import { ResultDetailDrawer } from "@/components/ResultDetailDrawer";
import { ExportDialog } from "@/components/ExportDialog";
import { buildPlainTextExport, downloadAsTextFile, buildFileName, type ExportableResult } from "@/lib/export-utils";
import { buildContextSummary, generateMockResult, pipelineConfigs } from "@/lib/ai-generation";
import type { GenerationResult, GenerationResultSection } from "@/lib/ai-generation";
import { FEATURE_KEYS } from "@/lib/membership";
import { toast } from "@/hooks/use-toast";

// ──────────────────────────────────
// Types
// ──────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  result?: GenerationResult;
  timestamp: string;
}

interface AIWorkspaceProps {
  injectedPrompt?: { text: string; cardKey: string } | null;
  onPromptConsumed?: () => void;
}

// ──────────────────────────────────
// Result Section renderer (reused from GenerationFlow pattern)
// ──────────────────────────────────

function MiniResultSection({ section }: { section: GenerationResultSection }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(section.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-border/50 bg-card/50 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-1 h-4 rounded-full bg-primary" />
          <span className="text-xs font-semibold">{section.title}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-6 px-1.5 text-[10px]">
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <div className="space-y-1">
        {section.content.split("\n").map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={i} className="h-1.5" />;
          if (/^[0-9]+[.)]/.test(trimmed)) {
            return (
              <div key={i} className="flex gap-1.5 text-xs text-muted-foreground leading-relaxed">
                <span className="text-primary font-medium min-w-[1.2rem]">{trimmed.match(/^[0-9]+[.)]/)?.[0]}</span>
                <span>{trimmed.replace(/^[0-9]+[.)]\s*/, "")}</span>
              </div>
            );
          }
          if (/^[-•□▶✅⚠✓]/.test(trimmed)) {
            return (
              <div key={i} className="flex gap-1.5 text-xs text-muted-foreground leading-relaxed pl-0.5">
                <span className="text-primary/70">{trimmed.match(/^[-•□▶✅⚠✓]/)?.[0]}</span>
                <span>{trimmed.replace(/^[-•□▶✅⚠✓]\s*/, "")}</span>
              </div>
            );
          }
          return <p key={i} className="text-xs text-muted-foreground leading-relaxed">{trimmed}</p>;
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────
// Result Actions bar
// ──────────────────────────────────

function ResultActions({
  result,
  onSave,
  onDownload,
  onExport,
  onRegenerate,
  savedId,
  onOpenDrawer,
}: {
  result: GenerationResult;
  onSave: () => void;
  onDownload: () => void;
  onExport: () => void;
  onRegenerate: () => void;
  savedId: string | null;
  onOpenDrawer: () => void;
}) {
  const { getResultActions } = useMembership();
  const actions = getResultActions();
  const [allCopied, setAllCopied] = useState(false);

  const handleCopyAll = async () => {
    const text = result.sections.map(s => `${s.title}\n${s.content}`).join("\n\n");
    await navigator.clipboard.writeText(text);
    setAllCopied(true);
    toast({ title: "전체 복사 완료" });
    setTimeout(() => setAllCopied(false), 2000);
  };

  const handleConsultant = () => {
    if (!actions.consultantTransfer.enabled) {
      toast({ title: "기능 제한", description: actions.consultantTransfer.lockReason || "전환이 제한됩니다", variant: "destructive" });
      return;
    }
    toast({ title: "전담 컨설턴트 전환", description: "전담 컨설턴트에게 요청이 전달되었습니다 (데모)" });
  };

  return (
    <div className="flex flex-wrap gap-1.5 pt-2">
      <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={onDownload}>
        <Download className="h-3 w-3" /> TXT
      </Button>
      <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={onExport}>
        <Download className="h-3 w-3" /> 내보내기
      </Button>
      <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={onSave} disabled={!!savedId}>
        <Bookmark className="h-3 w-3" /> {savedId ? "저장됨" : "저장"}
      </Button>
      {savedId && (
        <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={onOpenDrawer}>
          <ExternalLink className="h-3 w-3" /> 열기
        </Button>
      )}
      <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={handleCopyAll}>
        {allCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
        복사
      </Button>
      <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={onRegenerate}>
        <RefreshCw className="h-3 w-3" /> 다시 생성
      </Button>
      {actions.consultantTransfer.visible && (
        <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={handleConsultant} disabled={!actions.consultantTransfer.enabled}>
          <MessageSquare className="h-3 w-3" /> 컨설턴트
        </Button>
      )}
    </div>
  );
}

// ──────────────────────────────────
// Main Component
// ──────────────────────────────────

export function AIWorkspace({ injectedPrompt, onPromptConsumed }: AIWorkspaceProps) {
  const { businessType, label, orgProfile } = useBusinessContext();
  const { checkAccess, deductCredit } = useMembership();
  const { saveResult, getResultById } = useResultStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<Record<string, string>>({});
  const [drawerResultId, setDrawerResultId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [exportResult, setExportResult] = useState<ExportableResult | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Handle injected prompt from card clicks
  useEffect(() => {
    if (injectedPrompt) {
      setInput(injectedPrompt.text);
      onPromptConsumed?.();
      textareaRef.current?.focus();
    }
  }, [injectedPrompt, onPromptConsumed]);

  const contextSummary = buildContextSummary(businessType, label, orgProfile);

  const toExportable = useCallback((result: GenerationResult): ExportableResult => ({
    title: result.title,
    businessType: result.businessType,
    module: result.module,
    subtool: result.subtool,
    sections: result.sections,
    createdAt: result.createdAt,
    status: result.status,
    version: 1,
    category: "AI 비서 결과",
    sourceNote: result.sourceNote,
    referenceNote: result.referenceNote,
  }), []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const access = checkAccess(FEATURE_KEYS.ASSISTANT_DAILY);
    if (!access.enabled) {
      toast({ title: "기능 제한", description: access.lockReason || "이 기능을 사용할 수 없습니다", variant: "destructive" });
      return;
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Pick a pipeline config — default to daily-tasks
      const pipelineKey = "ai-assistant/daily-tasks";
      const config = pipelineConfigs[pipelineKey];
      if (!config) throw new Error("Pipeline not found");

      const genResult = await generateMockResult(
        { businessType, businessLabel: label, module: config.module, subtool: config.subtool, userInputs: { query: text }, contextSummary },
        config,
      );

      if (access.requiresCredit && access.creditCost > 0) {
        deductCredit(access.creditCost, "generate", `AI 작업실 — ${text.slice(0, 30)}`, config.module, genResult.id);
      }

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        result: genResult,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "결과를 생성하는 중 오류가 발생했습니다. 다시 시도해 주세요.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, businessType, label, contextSummary, checkAccess, deductCredit]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveResult = async (msgId: string, result: GenerationResult) => {
    const config = pipelineConfigs["ai-assistant/daily-tasks"];
    await saveResult({
      id: result.id,
      type: "generation",
      title: result.title,
      module: result.module,
      subtool: result.subtool,
      sourceTool: config?.module || "AI 비서",
      sourceMenu: "AI 비서",
      category: "AI 비서 결과",
      businessType: result.businessType,
      sections: result.sections,
      contextSummary: result.contextSummary,
      createdAt: result.createdAt,
      status: "임시 저장",
      sourceNote: result.sourceNote,
      referenceNote: result.referenceNote,
    });
    setSavedIds(prev => ({ ...prev, [msgId]: result.id }));
    toast({
      title: "저장 완료",
      description: "AI 비서 결과에 저장되었습니다 — 클릭하여 열기",
      action: (
        <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => {
          setDrawerResultId(result.id);
          setDrawerOpen(true);
        }}>
          <ExternalLink className="h-3 w-3" /> 열기
        </Button>
      ),
    });
  };

  const handleDownload = (result: GenerationResult) => {
    const exportable = toExportable(result);
    const content = buildPlainTextExport(exportable);
    const fileName = buildFileName(exportable, "txt");
    downloadAsTextFile(content, fileName);
    toast({ title: "다운로드 완료", description: `${fileName}` });
  };

  const handleExport = (result: GenerationResult) => {
    setExportResult(toExportable(result));
    setExportOpen(true);
  };

  const handleRegenerate = (originalText: string) => {
    setInput(originalText);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col border border-border/50 rounded-xl bg-card/30 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">AI 작업실</h3>
          <p className="text-[10px] text-muted-foreground">{label} 맞춤 · 결과 즉시 저장/다운로드 가능</p>
        </div>
        <Badge variant="outline" className="ml-auto text-[9px] bg-primary/5 text-primary border-primary/20">파일럿</Badge>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 min-h-[350px] max-h-[600px] overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
            <Sparkles className="h-10 w-10 text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground">위 카드를 클릭하거나 직접 입력하세요</p>
            <p className="text-xs text-muted-foreground/60 mt-1">AI가 {label} 업종 맞춤 결과를 생성합니다</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
            <div className={`max-w-[85%] ${msg.role === "user" ? "order-first" : ""}`}>
              {msg.role === "user" ? (
                <div className="rounded-xl bg-primary/10 border border-primary/20 px-3 py-2">
                  <p className="text-sm">{msg.content}</p>
                </div>
              ) : msg.result ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">{msg.result.title}</span>
                    <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      {msg.result.status}
                    </Badge>
                  </div>
                  {msg.result.sections.map((section, i) => (
                    <MiniResultSection key={i} section={section} />
                  ))}
                  {(msg.result.sourceNote || msg.result.referenceNote) && (
                    <div className="rounded-lg bg-muted/20 border border-border/30 px-2.5 py-1.5 space-y-0.5">
                      {msg.result.sourceNote && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <FileText className="h-2.5 w-2.5" /> {msg.result.sourceNote}
                        </p>
                      )}
                      {msg.result.referenceNote && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <FileText className="h-2.5 w-2.5" /> {msg.result.referenceNote}
                        </p>
                      )}
                    </div>
                  )}
                  <Separator className="my-1" />
                  <ResultActions
                    result={msg.result}
                    onSave={() => handleSaveResult(msg.id, msg.result!)}
                    onDownload={() => handleDownload(msg.result!)}
                    onExport={() => handleExport(msg.result!)}
                    onRegenerate={() => {
                      // Find the user message before this assistant message
                      const idx = messages.findIndex(m => m.id === msg.id);
                      const prevUser = idx > 0 ? messages[idx - 1] : null;
                      handleRegenerate(prevUser?.role === "user" ? prevUser.content : "");
                    }}
                    savedId={savedIds[msg.id] || null}
                    onOpenDrawer={() => {
                      setDrawerResultId(savedIds[msg.id] || msg.result!.id);
                      setDrawerOpen(true);
                    }}
                  />
                </div>
              ) : (
                <div className="rounded-xl bg-muted/30 border border-border/40 px-3 py-2">
                  <p className="text-sm text-muted-foreground">{msg.content}</p>
                </div>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bot className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="rounded-xl bg-muted/30 border border-border/40 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                <span className="text-xs text-muted-foreground">AI가 {label} 맞춤 결과를 생성하고 있습니다...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border/50 p-3">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`${label} 업종 관련 질문이나 작업을 입력하세요...`}
            className="min-h-[40px] max-h-[100px] resize-none text-sm bg-background/50"
            rows={1}
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="h-10 px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Drawers & Dialogs */}
      <ResultDetailDrawer open={drawerOpen} onOpenChange={setDrawerOpen} resultId={drawerResultId} />
      {exportResult && (
        <ExportDialog
          open={exportOpen}
          onOpenChange={setExportOpen}
          result={exportResult}
          savedResultId={savedIds[Object.keys(savedIds).find(k => savedIds[k]) || ""] || undefined}
        />
      )}
    </div>
  );
}
