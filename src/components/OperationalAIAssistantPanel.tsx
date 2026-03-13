/**
 * OperationalAIAssistantPanel — 운영형 페이지 공통 AI 비서 하단 패널
 * 자연어로 항목 추가/수정/분배 요청 가능
 * 상단: 처리 결과 영역, 하단: 입력 textarea
 */

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, CheckCircle2 } from "lucide-react";

export interface ProcessingResult {
  id: string;
  summary: string;
  details?: string;
  timestamp: Date;
}

interface Props {
  title?: string;
  description: string;
  placeholder: string;
  onSubmit: (input: string) => Promise<ProcessingResult | null>;
  recentResults?: ProcessingResult[];
}

export function OperationalAIAssistantPanel({
  title = "AI 비서",
  description,
  placeholder,
  onSubmit,
  recentResults = [],
}: Props) {
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<ProcessingResult[]>(recentResults);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (!input.trim() || submitting) return;
    setSubmitting(true);
    try {
      const result = await onSubmit(input.trim());
      if (result) {
        setResults(prev => [result, ...prev].slice(0, 3));
      }
      setInput("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{title}</span>
          <span className="text-[10px] text-muted-foreground">— {description}</span>
        </div>

        {/* Recent results */}
        {results.length > 0 && (
          <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
            {results.map(r => (
              <div key={r.id} className="flex items-start gap-2 py-1.5 px-2.5 rounded-md bg-muted/20 border border-border/20">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">{r.summary}</p>
                  {r.details && <p className="text-[10px] text-muted-foreground mt-0.5">{r.details}</p>}
                </div>
                <span className="text-[9px] text-muted-foreground flex-shrink-0">
                  {r.timestamp.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="space-y-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[120px] text-sm resize-none"
            disabled={submitting}
          />
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-muted-foreground">Ctrl+Enter로 전송</span>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!input.trim() || submitting}
              className="text-xs gap-1.5"
            >
              <Send className="h-3 w-3" />
              {submitting ? "처리중..." : "요청"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
