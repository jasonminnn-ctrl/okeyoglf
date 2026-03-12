/**
 * 운영자 전용 — 저장 결과 보드
 * ResultStoreContext의 데이터를 DataBoard로 표시한다.
 */

import { useMemo, useState } from "react";
import { FileText, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useResultStore, type SavedResult } from "@/contexts/ResultStoreContext";
import { ResultDetailDrawer } from "@/components/ResultDetailDrawer";
import DataBoard, { type DataBoardColumn } from "./DataBoard";
import OrgBranchFilter, { type OrgFilterState } from "./OrgBranchFilter";

const statusColor: Record<string, string> = {
  "임시 저장": "bg-muted text-muted-foreground",
  "검토 필요": "bg-amber-500/10 text-amber-400 border-amber-500/30",
  "완료": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  "전달 완료": "bg-blue-500/10 text-blue-400 border-blue-500/30",
  "보관됨": "bg-muted text-muted-foreground",
};

function shortDate(iso: string) {
  return iso ? new Date(iso).toLocaleDateString("ko-KR") : "-";
}

export default function OperatorResultsBoard() {
  const { results } = useResultStore();
  const [filter, setFilter] = useState<OrgFilterState>({ search: "", industry: "전체", membership: "전체" });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = results;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(r => r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q) || (r.sourceTool || "").toLowerCase().includes(q));
    }
    if (filter.industry !== "전체") {
      list = list.filter(r => r.businessType.includes(filter.industry));
    }
    return list;
  }, [results, filter]);

  const columns: DataBoardColumn<SavedResult>[] = [
    { header: "제목", accessor: r => r.title, render: r => <span className="font-medium truncate max-w-[200px] block">{r.title}</span> },
    { header: "카테고리", accessor: r => r.category, render: r => <Badge variant="outline" className="text-[9px]">{r.category}</Badge> },
    { header: "업종", accessor: r => r.businessType },
    { header: "유형", accessor: r => r.type, render: r => <Badge variant="outline" className="text-[9px]">{r.type}</Badge> },
    { header: "상태", accessor: r => r.status, render: r => <Badge variant="outline" className={`text-[9px] ${statusColor[r.status] || ""}`}>{r.status}</Badge> },
    { header: "생성일", accessor: r => shortDate(r.createdAt) },
    { header: "수정일", accessor: r => shortDate(r.updatedAt) },
    { header: "버전", accessor: r => r.version ?? 1, className: "text-center" },
    {
      header: "상세",
      accessor: () => "",
      render: r => (
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={e => { e.stopPropagation(); setSelectedId(r.id); setDrawerOpen(true); }}>
          <Eye className="h-3 w-3" />
        </Button>
      ),
      className: "text-center w-[50px]",
    },
  ];

  return (
    <div className="space-y-4">
      <DataBoard
        title="저장 결과 보드"
        icon={<FileText className="h-4 w-4 text-primary" />}
        data={filtered}
        columns={columns}
        exportFileName="저장결과"
        filterSlot={<OrgBranchFilter filter={filter} onChange={setFilter} compact />}
        emptyMessage="저장된 결과가 없습니다. AI 팀 메뉴에서 결과를 생성하고 저장하세요."
        maxHeight="600px"
      />

      <ResultDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        resultId={selectedId}
      />
    </div>
  );
}
