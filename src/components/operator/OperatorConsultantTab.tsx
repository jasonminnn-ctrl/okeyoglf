/**
 * 운영자 전용 — 전담 컨설턴트 요청 처리 워크플로우
 * Phase 10: DB 직접 조회 기반 (consultant_requests + organizations + result_deliveries)
 */

import { useState, useEffect, useCallback } from "react";
import { Inbox, StickyNote, Upload, Clock, ChevronRight, AlertCircle, CheckCircle, CircleDot, PauseCircle, Send, Download, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { buildCsv, downloadCsv, type CsvColumn } from "@/lib/csv-export";
import { downloadXlsx } from "@/lib/xlsx-export";
import { supabase } from "@/integrations/supabase/client";
import { DEV_ORG_ID } from "@/lib/repositories/constants";
import type { ConsultantRequestRow } from "@/lib/repositories/consultant-repository";
import { fetchConsultantRequests, updateConsultantStatus } from "@/lib/repositories/consultant-repository";

/* ── DB status enum mapping ── */
type DbStatus = "requested" | "in_progress" | "completed" | "cancelled";

const statusConfig: Record<DbStatus, { label: string; color: string; icon: typeof CircleDot }> = {
  requested:   { label: "대기",   color: "bg-amber-500/10 text-amber-400 border-amber-500/30",   icon: CircleDot },
  in_progress: { label: "처리중", color: "bg-blue-500/10 text-blue-400 border-blue-500/30",      icon: AlertCircle },
  completed:   { label: "완료",   color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", icon: CheckCircle },
  cancelled:   { label: "취소",   color: "bg-muted text-muted-foreground border-border",          icon: PauseCircle },
};

const requestTypeLabel: Record<string, string> = {
  request: "일반 요청", ppt: "PPT 제작", analysis: "분석 요청", review: "검토 요청", custom: "기타",
};

/* ── Delivery row from result_deliveries ── */
interface DeliveryRow {
  id: string;
  result_id: string;
  method: string;
  file_name: string | null;
  note: string | null;
  status: string;
  created_at: string;
}

/* ── Enriched row for UI ── */
interface EnrichedRequest extends ConsultantRequestRow {
  org_name: string;
  deliveries: DeliveryRow[];
  result_title: string | null;
}

/* ── CSV columns ── */
const requestCsvCols: CsvColumn<EnrichedRequest>[] = [
  { header: "요청ID", accessor: r => r.id },
  { header: "조직명", accessor: r => r.org_name },
  { header: "유형", accessor: r => requestTypeLabel[r.request_type] || r.request_type },
  { header: "연결 결과물", accessor: r => r.result_title || "-" },
  { header: "상태", accessor: r => statusConfig[r.status as DbStatus]?.label || r.status },
  { header: "담당자", accessor: r => r.assigned_to || "미배정" },
  { header: "요청 메모", accessor: r => r.request_note || "" },
  { header: "컨설턴트 메모", accessor: r => r.consultant_note || "" },
  { header: "전달횟수", accessor: r => r.deliveries.length },
  { header: "접수일", accessor: r => new Date(r.created_at).toLocaleString("ko-KR") },
];

const deliveryCsvCols: CsvColumn<DeliveryRow & { reqId: string }>[] = [
  { header: "요청ID", accessor: r => r.reqId },
  { header: "파일명", accessor: r => r.file_name || "-" },
  { header: "전달 방법", accessor: r => r.method },
  { header: "상태", accessor: r => r.status },
  { header: "전달일", accessor: r => new Date(r.created_at).toLocaleString("ko-KR") },
];

export default function OperatorConsultantTab() {
  const [requests, setRequests] = useState<EnrichedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [newMemo, setNewMemo] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DbStatus>("all");

  /* ── Data fetch ── */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1) consultant_requests
      const rows = await fetchConsultantRequests(DEV_ORG_ID);

      // 2) org names
      const { data: orgs } = await supabase
        .from("organizations")
        .select("id, name");
      const orgMap = new Map((orgs ?? []).map(o => [o.id, o.name]));

      // 3) result titles for linked results
      const resultIds = rows.map(r => r.result_id).filter(Boolean) as string[];
      let resultMap = new Map<string, string>();
      if (resultIds.length > 0) {
        const { data: results } = await supabase
          .from("saved_results")
          .select("id, title")
          .in("id", resultIds);
        resultMap = new Map((results ?? []).map(r => [r.id, r.title]));
      }

      // 4) deliveries for linked results
      let deliveryMap = new Map<string, DeliveryRow[]>();
      if (resultIds.length > 0) {
        const { data: deliveries } = await supabase
          .from("result_deliveries")
          .select("id, result_id, method, file_name, note, status, created_at")
          .in("result_id", resultIds)
          .order("created_at", { ascending: false });
        for (const d of deliveries ?? []) {
          const arr = deliveryMap.get(d.result_id) ?? [];
          arr.push(d as DeliveryRow);
          deliveryMap.set(d.result_id, arr);
        }
      }

      // 5) Enrich
      const enriched: EnrichedRequest[] = rows.map(r => ({
        ...r,
        org_name: orgMap.get(r.org_id) || r.org_id,
        result_title: r.result_id ? (resultMap.get(r.result_id) ?? null) : null,
        deliveries: r.result_id ? (deliveryMap.get(r.result_id) ?? []) : [],
      }));

      setRequests(enriched);
    } catch (e) {
      console.error("OperatorConsultantTab loadData error:", e);
      toast({ title: "데이터 로딩 실패", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const selectedRequest = requests.find(r => r.id === selectedRequestId);
  const filteredRequests = statusFilter === "all" ? requests : requests.filter(r => r.status === statusFilter);

  const requestedCount = requests.filter(r => r.status === "requested").length;
  const inProgressCount = requests.filter(r => r.status === "in_progress").length;
  const completedCount = requests.filter(r => r.status === "completed").length;

  /* ── Handlers ── */
  const handleStatusChange = async (newStatus: DbStatus) => {
    if (!selectedRequestId) return;
    const ok = await updateConsultantStatus(selectedRequestId, newStatus);
    if (ok) {
      setRequests(prev => prev.map(r => r.id === selectedRequestId ? { ...r, status: newStatus, updated_at: new Date().toISOString() } : r));
      toast({ title: "상태 변경 완료", description: `→ ${statusConfig[newStatus].label}` });
    } else {
      toast({ title: "상태 변경 실패", variant: "destructive" });
    }
  };

  const handleAssigneeChange = async (assignee: string) => {
    if (!selectedRequestId) return;
    const { error } = await supabase
      .from("consultant_requests")
      .update({ assigned_to: assignee || null, updated_at: new Date().toISOString() })
      .eq("id", selectedRequestId);
    if (error) {
      console.error("assignee update error:", error);
      toast({ title: "담당자 변경 실패", variant: "destructive" });
      return;
    }
    setRequests(prev => prev.map(r => r.id === selectedRequestId ? { ...r, assigned_to: assignee || null } : r));
  };

  const handleAddMemo = async () => {
    if (!newMemo.trim() || !selectedRequestId) return;
    const ok = await updateConsultantStatus(selectedRequestId, selectedRequest!.status, newMemo.trim());
    if (ok) {
      setRequests(prev => prev.map(r => r.id === selectedRequestId ? { ...r, consultant_note: newMemo.trim(), updated_at: new Date().toISOString() } : r));
      toast({ title: "컨설턴트 메모 저장됨" });
      setNewMemo("");
    } else {
      toast({ title: "메모 저장 실패", variant: "destructive" });
    }
  };

  /* ── CSV / XLSX Export ── */
  const handleExportRequests = (format: "csv" | "xlsx" = "csv") => {
    if (format === "xlsx") {
      downloadXlsx(filteredRequests, requestCsvCols, `컨설턴트_요청목록_${new Date().toISOString().slice(0, 10)}.xlsx`, "요청목록");
    } else {
      const csv = buildCsv(filteredRequests, requestCsvCols);
      downloadCsv(csv, `컨설턴트_요청목록_${new Date().toISOString().slice(0, 10)}.csv`);
    }
    toast({ title: `${format.toUpperCase()} 다운로드 완료`, description: `${filteredRequests.length}건` });
  };

  const handleExportDeliveries = (format: "csv" | "xlsx" = "csv") => {
    const rows = requests.flatMap(r => r.deliveries.map(d => ({ ...d, reqId: r.id })));
    if (rows.length === 0) { toast({ title: "전달 이력 없음", variant: "destructive" }); return; }
    if (format === "xlsx") {
      downloadXlsx(rows, deliveryCsvCols, `전달이력_${new Date().toISOString().slice(0, 10)}.xlsx`, "전달이력");
    } else {
      const csv = buildCsv(rows, deliveryCsvCols);
      downloadCsv(csv, `전달이력_${new Date().toISOString().slice(0, 10)}.csv`);
    }
    toast({ title: `${format.toUpperCase()} 다운로드 완료`, description: `${rows.length}건` });
  };

  /* ── Render ── */
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-5 pb-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">전체 요청</p>
            <p className="text-2xl font-bold mt-1">{requests.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="pt-5 pb-4">
            <p className="text-[10px] text-amber-400 uppercase tracking-wider">대기</p>
            <p className="text-2xl font-bold mt-1 text-amber-400">{requestedCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="pt-5 pb-4">
            <p className="text-[10px] text-blue-400 uppercase tracking-wider">처리중</p>
            <p className="text-2xl font-bold mt-1 text-blue-400">{inProgressCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="pt-5 pb-4">
            <p className="text-[10px] text-emerald-400 uppercase tracking-wider">완료</p>
            <p className="text-2xl font-bold mt-1 text-emerald-400">{completedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Export + Refresh */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => loadData()}>
          <RefreshCw className="h-3 w-3" />새로고침
        </Button>
        <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => handleExportRequests("csv")}>
          <Download className="h-3 w-3" />요청 CSV
        </Button>
        <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => handleExportRequests("xlsx")}>
          <Download className="h-3 w-3" />요청 XLSX
        </Button>
        <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => handleExportDeliveries("csv")}>
          <Download className="h-3 w-3" />전달 CSV
        </Button>
        <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => handleExportDeliveries("xlsx")}>
          <Download className="h-3 w-3" />전달 XLSX
        </Button>
      </div>

      {loading ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-12 pb-12 text-center">
            <RefreshCw className="h-6 w-6 text-muted-foreground mx-auto mb-2 animate-spin" />
            <p className="text-sm text-muted-foreground">데이터 로딩 중...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Request list */}
          <div className="xl:col-span-2 space-y-4">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2"><Inbox className="h-4 w-4 text-primary" />요청 접수함</CardTitle>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                    <SelectTrigger className="w-[100px] text-[10px] h-7"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="requested">대기</SelectItem>
                      <SelectItem value="in_progress">처리중</SelectItem>
                      <SelectItem value="completed">완료</SelectItem>
                      <SelectItem value="cancelled">취소</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {filteredRequests.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">조건에 맞는 요청이 없습니다</p>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {filteredRequests.map(req => {
                      const sc = statusConfig[req.status as DbStatus] ?? statusConfig.requested;
                      return (
                        <div
                          key={req.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedRequestId === req.id ? "border-primary/50 bg-primary/5" : "border-border/30 bg-muted/20 hover:bg-muted/30"}`}
                          onClick={() => setSelectedRequestId(req.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium truncate">
                                {req.result_title || (requestTypeLabel[req.request_type] || req.request_type)}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {req.org_name} · {requestTypeLabel[req.request_type] || req.request_type}
                              </p>
                            </div>
                            <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-1" />
                          </div>
                          <div className="flex items-center gap-1.5 mt-2">
                            <Badge variant="outline" className={`text-[8px] ${sc.color}`}>{sc.label}</Badge>
                            {req.assigned_to && <span className="text-[9px] text-muted-foreground">· {req.assigned_to}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Request detail */}
          <div className="xl:col-span-3 space-y-4">
            {selectedRequest ? (
              <>
                {/* Header */}
                <Card className="bg-card/50 border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {selectedRequest.result_title || (requestTypeLabel[selectedRequest.request_type] || selectedRequest.request_type)}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {selectedRequest.org_name} · {requestTypeLabel[selectedRequest.request_type] || selectedRequest.request_type} · {selectedRequest.id.slice(0, 8)}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className={(statusConfig[selectedRequest.status as DbStatus] ?? statusConfig.requested).color}>
                        {(statusConfig[selectedRequest.status as DbStatus] ?? statusConfig.requested).label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground">유형</p>
                        <p className="text-xs mt-1">{requestTypeLabel[selectedRequest.request_type] || selectedRequest.request_type}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">담당자</p>
                        <p className="text-xs mt-1">{selectedRequest.assigned_to || "미배정"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">접수일</p>
                        <p className="text-xs mt-1">{new Date(selectedRequest.created_at).toLocaleDateString("ko-KR")}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">전달 횟수</p>
                        <p className="text-xs mt-1">{selectedRequest.deliveries.length}회</p>
                      </div>
                    </div>

                    {/* Request note (from customer) */}
                    {selectedRequest.request_note && (
                      <div className="p-2.5 rounded-lg bg-muted/20">
                        <p className="text-[10px] text-muted-foreground mb-1">요청 메모 (고객)</p>
                        <p className="text-xs">{selectedRequest.request_note}</p>
                      </div>
                    )}

                    <Separator className="opacity-30" />

                    {/* Status / Assignee change */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Label className="text-xs">상태:</Label>
                        <Select value={selectedRequest.status} onValueChange={(v) => handleStatusChange(v as DbStatus)}>
                          <SelectTrigger className="w-[110px] text-xs h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusConfig).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{v.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Label className="text-xs">담당자:</Label>
                        <Input
                          className="w-[120px] text-xs h-8"
                          placeholder="이름"
                          value={selectedRequest.assigned_to || ""}
                          onChange={e => handleAssigneeChange(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Consultant memo (single field) */}
                <Card className="bg-card/50 border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2"><StickyNote className="h-4 w-4 text-primary" />컨설턴트 메모</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedRequest.consultant_note && (
                      <div className="p-2.5 rounded-lg bg-muted/20">
                        <p className="text-xs">{selectedRequest.consultant_note}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">마지막 수정: {new Date(selectedRequest.updated_at).toLocaleString("ko-KR")}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Textarea className="text-xs min-h-[60px] flex-1" placeholder="컨설턴트 메모 작성/수정..." value={newMemo} onChange={e => setNewMemo(e.target.value)} />
                    </div>
                    <Button size="sm" onClick={handleAddMemo}><StickyNote className="h-3 w-3 mr-1" />메모 저장</Button>
                  </CardContent>
                </Card>

                {/* Deliveries */}
                <Card className="bg-card/50 border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2"><Send className="h-4 w-4 text-primary" />결과물 전달 이력 ({selectedRequest.deliveries.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedRequest.deliveries.length > 0 ? (
                      <div className="rounded-lg border border-border/50 overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-[10px]">파일명</TableHead>
                              <TableHead className="text-[10px]">전달 방법</TableHead>
                              <TableHead className="text-[10px]">상태</TableHead>
                              <TableHead className="text-[10px]">전달일</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedRequest.deliveries.map(d => (
                              <TableRow key={d.id}>
                                <TableCell className="text-xs font-medium">{d.file_name || "-"}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{d.method}</TableCell>
                                <TableCell><Badge variant="outline" className="text-[9px]">{d.status}</Badge></TableCell>
                                <TableCell className="text-[10px] text-muted-foreground">{new Date(d.created_at).toLocaleString("ko-KR")}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">아직 전달된 결과물이 없습니다</p>
                    )}

                    <Separator className="opacity-30" />
                    <div className="space-y-2">
                      <Label className="text-xs">결과물 업로드 (준비중)</Label>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled><Upload className="h-3 w-3 mr-1" />파일 업로드</Button>
                        <Button variant="outline" size="sm" disabled><Send className="h-3 w-3 mr-1" />고객에게 전달</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-card/50 border-border/50">
                <CardContent className="pt-12 pb-12 text-center">
                  <Inbox className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">왼쪽에서 요청을 선택하면 상세 내용이 표시됩니다</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
