/**
 * CSV export utility — 운영자 콘솔용
 * 화면 데이터를 기준으로 CSV 파일을 생성·다운로드한다.
 */

export interface CsvColumn<T> {
  header: string;
  accessor: (row: T) => string | number;
}

export function buildCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const BOM = "\uFEFF"; // Excel UTF-8 BOM
  const header = columns.map(c => `"${c.header}"`).join(",");
  const body = rows.map(row =>
    columns.map(c => {
      const v = c.accessor(row);
      return typeof v === "string" ? `"${v.replace(/"/g, '""')}"` : String(v);
    }).join(",")
  ).join("\n");
  return BOM + header + "\n" + body;
}

export function downloadCsv(csvContent: string, fileName: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
