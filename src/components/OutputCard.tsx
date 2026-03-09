import { useState } from "react";
import { Copy, Check, Bookmark, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OutputSectionProps {
  title: string;
  content: string;
  onRegenerate?: () => void;
  onSave?: () => void;
}

export function OutputSection({ title, content, onRegenerate, onSave }: OutputSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!content) return null;

  // Parse content for better structure
  const lines = content.split('\n');
  
  return (
    <Card className="animate-fade-in border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-primary" />
          <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 text-xs hover:bg-primary/10">
            {copied ? <Check className="h-3 w-3 mr-1 text-success" /> : <Copy className="h-3 w-3 mr-1" />}
            {copied ? "복사됨" : "복사하기"}
          </Button>
          {onSave && (
            <Button variant="ghost" size="sm" onClick={onSave} className="h-7 px-2 text-xs hover:bg-primary/10">
              <Bookmark className="h-3 w-3 mr-1" />
              저장하기
            </Button>
          )}
          {onRegenerate && (
            <Button variant="ghost" size="sm" onClick={onRegenerate} className="h-7 px-2 text-xs hover:bg-primary/10">
              <RefreshCw className="h-3 w-3 mr-1" />
              다시 생성
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          {lines.map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={i} className="h-2" />;
            
            // Numbered items
            if (/^[0-9]+[.)]/.test(trimmed)) {
              return (
                <div key={i} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
                  <span className="text-primary font-medium min-w-[1.5rem]">{trimmed.match(/^[0-9]+[.)]/)?.[0]}</span>
                  <span>{trimmed.replace(/^[0-9]+[.)]\s*/, '')}</span>
                </div>
              );
            }
            
            // Bullet points
            if (/^[-•□▶✅⚠]/.test(trimmed)) {
              const bullet = trimmed.match(/^[-•□▶✅⚠]/)?.[0] || '•';
              return (
                <div key={i} className="flex gap-2 text-sm text-muted-foreground leading-relaxed pl-1">
                  <span className="text-primary/70">{bullet}</span>
                  <span>{trimmed.replace(/^[-•□▶✅⚠]\s*/, '')}</span>
                </div>
              );
            }
            
            // Section headers (lines ending with :)
            if (trimmed.endsWith(':') && trimmed.length < 50) {
              return (
                <p key={i} className="text-sm font-medium text-foreground mt-3 first:mt-0">{trimmed}</p>
              );
            }
            
            // Bold headers within brackets
            if (/^\[.+\]$/.test(trimmed)) {
              return (
                <p key={i} className="text-sm font-semibold text-primary mt-3 first:mt-0">{trimmed}</p>
              );
            }
            
            // Regular text
            return (
              <p key={i} className="text-sm text-muted-foreground leading-relaxed">{trimmed}</p>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface OutputCardProps {
  title: string;
  content: string;
  onSave?: () => void;
  onRegenerate?: () => void;
}

export function OutputCard({ title, content, onSave, onRegenerate }: OutputCardProps) {
  return <OutputSection title={title} content={content} onSave={onSave} onRegenerate={onRegenerate} />;
}
