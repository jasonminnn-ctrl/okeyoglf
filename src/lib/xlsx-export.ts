/**
 * XLSX export utility — 운영자 콘솔용
 * csv-export.ts와 동일한 CsvColumn 인터페이스를 공유하여
 * CSV/XLSX 양쪽 다운로드를 지원한다.
 */

import * as XLSX from "xlsx";
import type { CsvColumn } from "./csv-export";

export function buildXlsx<T>(rows: T[], columns: CsvColumn<T>[], sheetName = "Sheet1"): XLSX.WorkBook {
  const header = columns.map(c => c.header);
  const data = rows.map(row => columns.map(c => c.accessor(row)));
  const ws = XLSX.utils.aoa_to_sheet([header, ...data]);

  // Auto column widths
  ws["!cols"] = columns.map((c, i) => {
    const maxLen = Math.max(
      c.header.length,
      ...data.map(row => String(row[i] ?? "").length)
    );
    return { wch: Math.min(maxLen + 2, 40) };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  return wb;
}

export function downloadXlsx<T>(rows: T[], columns: CsvColumn<T>[], fileName: string, sheetName = "Sheet1") {
  const wb = buildXlsx(rows, columns, sheetName);
  XLSX.writeFile(wb, fileName);
}
