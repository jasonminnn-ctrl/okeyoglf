/**
 * 운영자 전용 — 저장 결과 보드
 * DB(saved_results)에서 직접 조회한 데이터를 DataBoard로 표시한다.
 */

import { useMemo, useState, useEffect } from "react";
import { FileText, Eye, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { DEV_ORG_ID } from "@/lib/repositories/constants";
import { ResultDetailDrawer } from "@/components/ResultDetailDrawer";
import DataBoard, { type DataBoardColumn } from "./DataBoard";
import OrgBranchFilter, { type OrgFilterState } from "./OrgBranchFilter";

interface ResultRow {
  id: string;
  title: string;
  category: string;
  business_type: string;
  type: string;
  status: string;
  version: number;
  source_tool: string | null;
  module: string | null;
  created_at: string;
  updated_at: string;
}

const statusLabelMap: Record<string, string> = {
  draft: "임시 저장",
  review: "검토 필요",
  done: "완료",
  delivered: "전달 완료",
  archived: "보관됨",
};

const statusColor: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  review: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  done: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  delivered: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  archived: "bg-muted text-muted-foreground",
};

function shortDate(iso: string) {
  return iso ? new Date(iso).toLocaleDateString("ko-KR") : "-";
}

export default function OperatorResultsBoard() {
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrgFilterState>({ search: "", industry: "전체", membership: "전체" });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("saved_results")
        .select("id, title, category, business_type, type, status, version, source_tool, module, created_at, updated_at")
        .eq("org_id", DEV_ORG_ID)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false });
      if (error) console.error("OperatorResultsBoard fetch error:", error);
      setRows((data as ResultRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = rows;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(r => r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q) || (r.source_tool || "").toLowerCase().includes(q));
    }
    if (filter.industry !== "전체") {
      list = list.filter(r => r.business_type.includes(filter.industry));
    }
    return list;
  }, [rows, filter]);

  const columns: DataBoardColumn<ResultRow>[] = [
    { header: "제목", accessor: r => r.title, render: r => <span className="font-medium truncate max-w-[200px] block">{r.title}</span> },
    { header: "카테고리", accessor: r => r.category, render: r => <Badge variant="outline" className="text-[9px]">{r.category}</Badge> },
    { header: "업종", accessor: r => r.business_type },
    { header: "유형", accessor: r => r.type, render: r => <Badge variant="outline" className="text-[9px]">{r.type}</Badge> },
    { header: "상태", accessor: r => statusLabelMap[r.status] || r.status, render: r => <Badge variant="outline" className={`text-[9px] ${statusColor[r.status] || ""}`}>{statusLabelMap[r.status] || r.status}</Badge> },
    { header: "생성일", accessor: r => shortDate(r.created_at) },
    { header: "수정일", accessor: r => shortDate(r.updated_at) },
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
      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> 로딩 중...
        </div>
      ) : (
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
      )}

      <ResultDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        resultId={selectedId}
      />
    </div>
  );
}
