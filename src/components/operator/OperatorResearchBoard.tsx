/**
 * 운영자 전용 — 시장조사 보드
 * localStorage에 저장된 시장조사 요청 이력을 DataBoard로 표시한다.
 */

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DataBoard, { type DataBoardColumn } from "./DataBoard";
import OrgBranchFilter, { type OrgFilterState } from "./OrgBranchFilter";
import type { ResearchRequest } from "@/lib/market-research";
import { researchStatusLabels, researchStatusColors } from "@/lib/market-research";

const REQUESTS_STORAGE_KEY = "okeygolf_research_requests";

function loadRequests(): ResearchRequest[] {
  try {
    const raw = localStorage.getItem(REQUESTS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ResearchRequest[];
  } catch { return []; }
}

function shortDate(iso: string) {
  return iso ? new Date(iso).toLocaleDateString("ko-KR") : "-";
}

export default function OperatorResearchBoard() {
  const [requests] = useState<ResearchRequest[]>(loadRequests);
  const [filter, setFilter] = useState<OrgFilterState>({ search: "", industry: "전체", membership: "전체" });

  const filtered = useMemo(() => {
    let list = requests;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(r =>
        (r.businessTypeLabel || "").toLowerCase().includes(q) ||
        (r.region || "").toLowerCase().includes(q) ||
        (r.keyword || "").toLowerCase().includes(q)
      );
    }
    if (filter.industry !== "전체") {
      list = list.filter(r => (r.businessTypeLabel || "").includes(filter.industry));
    }
    return list;
  }, [requests, filter]);

  const columns: DataBoardColumn<ResearchRequest>[] = [
    { header: "업종", accessor: r => r.businessTypeLabel || r.businessType },
    { header: "조사 범위", accessor: r => r.scope || "-" },
    { header: "지역", accessor: r => r.region || "-" },
    { header: "키워드", accessor: r => r.keyword || "-" },
    { header: "상태", accessor: r => researchStatusLabels[r.status] || r.status, render: r => {
      const color = researchStatusColors[r.status] || "";
      return <Badge variant="outline" className={`text-[9px] ${color}`}>{researchStatusLabels[r.status] || r.status}</Badge>;
    }},
    { header: "소스", accessor: r => r.sourceType === "ai_internal" ? "AI 내부" : r.sourceType || "-" },
    { header: "생성일", accessor: r => shortDate(r.createdAt) },
    { header: "수정일", accessor: r => shortDate(r.updatedAt) },
    { header: "메모", accessor: r => r.memo || "-" },
  ];

  return (
    <div className="space-y-4">
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
    </div>
  );
}
