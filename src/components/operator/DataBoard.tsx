/**
 * DataBoard — 운영자 콘솔 공용 표형 데이터 보드
 * 제목, 필터, 테이블, CSV/XLSX export를 통합 제공한다.
 */

import { type ReactNode } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildCsv, downloadCsv, type CsvColumn } from "@/lib/csv-export";
import { downloadXlsx } from "@/lib/xlsx-export";
import { toast } from "@/hooks/use-toast";

export interface DataBoardColumn<T> {
  header: string;
  accessor: (row: T) => string | number;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface DataBoardProps<T> {
  title: string;
  icon?: ReactNode;
  data: T[];
  columns: DataBoardColumn<T>[];
  exportFileName?: string;
  filterSlot?: ReactNode;
  footerSlot?: ReactNode;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  selectedRow?: (row: T) => boolean;
  maxHeight?: string;
}

export default function DataBoard<T>({
  title,
  icon,
  data,
  columns,
  exportFileName,
  filterSlot,
  footerSlot,
  emptyMessage = "데이터가 없습니다",
  onRowClick,
  selectedRow,
  maxHeight = "500px",
}: DataBoardProps<T>) {

  const csvColumns: CsvColumn<T>[] = columns.map(c => ({
    header: c.header,
    accessor: c.accessor,
  }));

  const handleCsv = () => {
    if (data.length === 0) { toast({ title: "데이터 없음", variant: "destructive" }); return; }
    const csv = buildCsv(data, csvColumns);
    downloadCsv(csv, `${exportFileName || title}_${new Date().toISOString().slice(0, 10)}.csv`);
    toast({ title: "CSV 다운로드 완료", description: `${data.length}건` });
  };

  const handleXlsx = () => {
    if (data.length === 0) { toast({ title: "데이터 없음", variant: "destructive" }); return; }
    downloadXlsx(data, csvColumns, `${exportFileName || title}_${new Date().toISOString().slice(0, 10)}.xlsx`, title);
    toast({ title: "XLSX 다운로드 완료", description: `${data.length}건` });
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {exportFileName && (
              <>
                <Button variant="outline" size="sm" className="text-[10px] h-7 gap-1" onClick={handleCsv}>
                  <Download className="h-3 w-3" />CSV
                </Button>
                <Button variant="outline" size="sm" className="text-[10px] h-7 gap-1" onClick={handleXlsx}>
                  <FileSpreadsheet className="h-3 w-3" />XLSX
                </Button>
              </>
            )}
            <Badge variant="outline" className="text-[10px]">{data.length}건</Badge>
          </div>
        </div>
        {filterSlot && <div className="mt-3">{filterSlot}</div>}
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="rounded-lg border border-border/50 overflow-hidden" style={{ maxHeight, overflowY: "auto" }}>
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col, i) => (
                    <TableHead key={i} className={`text-[10px] ${col.className || ""}`}>{col.header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, ri) => (
                  <TableRow
                    key={ri}
                    className={`${onRowClick ? "cursor-pointer" : ""} ${selectedRow?.(row) ? "bg-primary/5" : ""}`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col, ci) => (
                      <TableCell key={ci} className={`text-xs ${col.className || ""}`}>
                        {col.render ? col.render(row) : String(col.accessor(row))}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-6">{emptyMessage}</p>
        )}
        {footerSlot && <div className="mt-3">{footerSlot}</div>}
      </CardContent>
    </Card>
  );
}
