/**
 * OperationalExportMenu — 운영형 데이터 CSV/XLSX 내보내기 드롭다운
 */

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

interface Props {
  onCsv: () => void;
  onXlsx: () => void;
  disabled?: boolean;
}

export function OperationalExportMenu({ onCsv, onXlsx, disabled }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" disabled={disabled} className="text-xs gap-1.5 h-7">
          <Download className="h-3 w-3" /> 내보내기
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onCsv} className="text-xs gap-2">
          <FileText className="h-3.5 w-3.5" /> CSV 다운로드
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onXlsx} className="text-xs gap-2">
          <FileSpreadsheet className="h-3.5 w-3.5" /> XLSX 다운로드
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
