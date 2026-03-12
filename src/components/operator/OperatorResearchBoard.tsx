/**
 * 운영자 전용 — 시장조사 보드
 * DB(research_requests)에서 직접 조회한 데이터를 DataBoard로 표시한다.
 */

import { useMemo, useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { DEV_ORG_ID } from "@/lib/repositories/constants";
import DataBoard, { type DataBoardColumn } from "./DataBoard";
import OrgBranchFilter, { type OrgFilterState } from "./OrgBranchFilter";

interface ResearchRow {
  id: string;
  query: string;
  research_type: string;
  status: string;
  request_payload: Record<string, unknown> | null;
  result_id: string | null;
  requested_at: string;
  completed_at: string | null;
}

const statusLabelMap: Record<string, string> = {
  requested: "조사 요청",
  processing: "처리 중",
  completed: "조사 완료",
  consultant_handoff: "전담 컨설턴트 전환",
  failed: "실패",
};

const statusColorMap: Record<string, string> = {
  requested: "bg-amber-500/20 text-amber-400",
  processing: "bg-blue-500/20 text-blue-400",
  completed: "bg-emerald-500/20 text-emerald-400",
  consultant_handoff: "bg-purple-500/20 text-purple-400",
  failed: "bg-destructive/20 text-destructive",
};

function shortDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString("ko-KR") : "-";
}

function payloadField(row: ResearchRow, key: string): string {
  return ((row.request_payload as Record<string, unknown>)?.[key] as string) || "-";
}

export default function OperatorResearchBoard() {
  const [rows, setRows] = useState<ResearchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrgFilterState>({ search: "", industry: "전체", membership: "전체" });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("research_requests")
        .select("id, query, research_type, status, request_payload, result_id, requested_at, completed_at")
        .eq("org_id", DEV_ORG_ID)
        .order("requested_at", { ascending: false });
      if (error) console.error("OperatorResearchBoard fetch error:", error);
      setRows((data as unknown as ResearchRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = rows;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(r =>
        payloadField(r, "businessTypeLabel").toLowerCase().includes(q) ||
        payloadField(r, "region").toLowerCase().includes(q) ||
        payloadField(r, "keyword").toLowerCase().includes(q) ||
        r.query.toLowerCase().includes(q)
      );
    }
    if (filter.industry !== "전체") {
      list = list.filter(r => payloadField(r, "businessTypeLabel").includes(filter.industry));
    }
    return list;
  }, [rows, filter]);

  const columns: DataBoardColumn<ResearchRow>[] = [
    { header: "업종", accessor: r => payloadField(r, "businessTypeLabel") },
    { header: "조사 범위", accessor: r => r.research_type || payloadField(r, "scope") },
    { header: "지역", accessor: r => payloadField(r, "region") },
    { header: "키워드", accessor: r => payloadField(r, "keyword") },
    { header: "상태", accessor: r => statusLabelMap[r.status] || r.status, render: r => {
      const color = statusColorMap[r.status] || "";
      return <Badge variant="outline" className={`text-[9px] ${color}`}>{statusLabelMap[r.status] || r.status}</Badge>;
    }},
    { header: "소스", accessor: r => payloadField(r, "sourceType") === "ai_internal" ? "AI 내부" : payloadField(r, "sourceType") },
    { header: "결과 연결", accessor: r => r.result_id ? "✔" : "-", className: "text-center" },
    { header: "요청일", accessor: r => shortDate(r.requested_at) },
    { header: "완료일", accessor: r => shortDate(r.completed_at) },
    { header: "메모", accessor: r => payloadField(r, "memo") },
  ];

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> 로딩 중...
        </div>
      ) : (
        <DataBoard
          title="시장조사 요청 이력"
          icon={<Search className="h-4 w-4 text-primary" />}
          data={filtered}
          columns={columns}
          exportFileName="시장조사_이력"
          filterSlot={<OrgBranchFilter filter={filter} onChange={setFilter} compact />}
          emptyMessage="시장조사 요청 이력이 없습니다. 시장조사 메뉴에서 조사를 실행하세요."
          maxHeight="600px"
        />
      )}
    </div>
  );
}
