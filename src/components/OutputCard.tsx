import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/CopyButton";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OutputCardProps {
  title: string;
  content: string;
  onSave?: () => void;
}

export function OutputCard({ title, content, onSave }: OutputCardProps) {
  if (!content) return null;

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <div className="flex gap-2">
          <CopyButton text={content} />
          {onSave && (
            <Button variant="outline" size="sm" onClick={onSave}>
              <Bookmark className="h-3.5 w-3.5 mr-1.5" />
              저장
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">{content}</div>
      </CardContent>
    </Card>
  );
}
