/**
 * ExportDialog — Download format selection for results.
 * TXT is real download; DOC/PDF/PPT are disabled with "준비중" badge.
 * Unsupported formats do NOT show success toasts or record completion.
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, File, FileSpreadsheet, Check } from "lucide-react";
import { useResultStore } from "@/contexts/ResultStoreContext";
import { getRecommendedFormats, buildPlainTextExport, downloadAsTextFile, buildFileName, type ExportFormat, type ExportableResult } from "@/lib/export-utils";
import { toast } from "@/hooks/use-toast";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: ExportableResult;
  savedResultId?: string;
}

const formatIcons: Record<ExportFormat, React.ReactNode> = {
  txt: <FileText className="h-4 w-4" />,
  doc: <File className="h-4 w-4" />,
  pdf: <File className="h-4 w-4" />,
  ppt: <FileSpreadsheet className="h-4 w-4" />,
  xlsx: <FileSpreadsheet className="h-4 w-4" />,
};

export function ExportDialog({ open, onOpenChange, result, savedResultId }: ExportDialogProps) {
  const { markResultExported } = useResultStore();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null);
  const formats = getRecommendedFormats(result);

  const selectedOption = formats.find(f => f.format === selectedFormat);

  const handleExport = () => {
    if (!selectedFormat || !selectedOption) return;

    // Only actually download if format is available
    if (!selectedOption.available) return;

    const fileName = buildFileName(result, selectedFormat);
    const content = buildPlainTextExport(result);
    downloadAsTextFile(content, fileName);

    // Record export history only for saved results
    if (savedResultId) {
      // Cast to ExportFileRecord format type (xlsx not yet in DB enum)
      const recordFormat = selectedFormat as "txt" | "doc" | "pdf" | "ppt" | "csv";
      markResultExported(savedResultId, {
        id: `exp-${Date.now()}`,
        format: recordFormat,
        fileName,
        exportedAt: new Date().toISOString(),
      });
    }

    toast({
      title: "다운로드 완료",
      description: `${fileName} 파일이 다운로드되었습니다`,
    });

    setSelectedFormat(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Download className="h-4 w-4 text-primary" />
            내보내기
          </DialogTitle>
          <DialogDescription className="text-xs">
            {result.title} · v{result.version ?? 1}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {formats.map((f) => (
            <button
              key={f.format}
              onClick={() => f.available ? setSelectedFormat(f.format) : undefined}
              disabled={!f.available}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                !f.available
                  ? "border-border/20 bg-muted/5 opacity-60 cursor-not-allowed"
                  : selectedFormat === f.format
                    ? "border-primary bg-primary/5"
                    : "border-border/30 bg-muted/10 hover:bg-muted/20"
              }`}
            >
              <span className="text-muted-foreground">{formatIcons[f.format]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{f.label}</span>
                  {f.recommended && f.available && (
                    <Badge variant="outline" className="text-[9px] h-4 px-1 bg-primary/10 text-primary border-primary/20">추천</Badge>
                  )}
                  {f.available && (
                    <Badge variant="outline" className="text-[9px] h-4 px-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">즉시 가능</Badge>
                  )}
                  {!f.available && (
                    <Badge variant="outline" className="text-[9px] h-4 px-1 bg-muted/30 text-muted-foreground border-border/30">준비중</Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{f.description}</p>
              </div>
              {selectedFormat === f.format && f.available && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
            취소
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            disabled={!selectedFormat || !selectedOption?.available}
            className="text-xs gap-1.5"
          >
            <Download className="h-3 w-3" />
            다운로드
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
