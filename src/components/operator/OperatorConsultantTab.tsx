/**
 * 운영자 전용 — 전담 컨설턴트 요청 처리 워크플로우
 * 요청 접수함, 상태관리, 우선순위, 내부 메모, 결과 업로드, 전달 이력
 */

import { useState } from "react";
import { Inbox, FileText, StickyNote, Upload, Clock, ChevronRight, AlertCircle, CheckCircle, CircleDot, PauseCircle, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

type RequestStatus = "pending" | "in_progress" | "review" | "completed" | "on_hold";
type Priority = "urgent" | "high" | "normal" | "low";

interface ConsultantRequest {
  id: string;
  orgName: string;
  orgId: string;
  requestType: string;
  title: string;
  status: RequestStatus;
  priority: Priority;
  createdAt: string;
  assignee: string | null;
  memos: { text: string; author: string; createdAt: string }[];
  deliveries: { fileName: string; version: number; deliveredAt: string; method: string }[];
}

const statusConfig: Record<RequestStatus, { label: string; color: string; icon: typeof CircleDot }> = {
  pending: { label: "대기", color: "bg-amber-500/10 text-amber-400 border-amber-500/30", icon: CircleDot },
  in_progress: { label: "처리중", color: "bg-blue-500/10 text-blue-400 border-blue-500/30", icon: AlertCircle },
  review: { label: "검토중", color: "bg-violet-500/10 text-violet-400 border-violet-500/30", icon: Clock },
  completed: { label: "완료", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", icon: CheckCircle },
  on_hold: { label: "보류", color: "bg-muted text-muted-foreground border-border", icon: PauseCircle },
};

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  urgent: { label: "긴급", color: "bg-red-500/10 text-red-400 border-red-500/30" },
  high: { label: "높음", color: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
  normal: { label: "보통", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  low: { label: "낮음", color: "bg-muted text-muted-foreground border-border" },
};

const mockRequests: ConsultantRequest[] = [
  {
    id: "req-001",
    orgName: "그린골프연습장",
    orgId: "org-001",
    requestType: "운영 분석 요청",
    title: "3월 운영 현황 분석 및 개선안 요청",
    status: "in_progress",
    priority: "high",
    createdAt: "2026-03-10T09:00:00Z",
    assignee: "김컨설턴트",
    memos: [
      { text: "기존 3개월 데이터 확인 완료, 분석 보고서 초안 작성 중", author: "김컨설턴트", createdAt: "2026-03-11T14:00:00Z" },
    ],
    deliveries: [],
  },
  {
    id: "req-002",
    orgName: "이글아카데미",
    orgId: "org-003",
    requestType: "문서 제작 요청",
    title: "수강생 모집용 제안서 제작",
    status: "review",
    priority: "normal",
    createdAt: "2026-03-08T11:30:00Z",
    assignee: "박컨설턴트",
    memos: [
      { text: "초안 완성, 내부 검토 중", author: "박컨설턴트", createdAt: "2026-03-10T16:00:00Z" },
      { text: "디자인 보완 필요 — 디자인팀 협조 요청", author: "김매니저", createdAt: "2026-03-11T09:00:00Z" },
    ],
    deliveries: [
      { fileName: "이글아카데미_제안서_v1.pdf", version: 1, deliveredAt: "2026-03-10T17:00:00Z", method: "이메일" },
    ],
  },
  {
    id: "req-003",
    orgName: "레이크사이드CC",
    orgId: "org-002",
    requestType: "마케팅 검토 요청",
    title: "봄 시즌 마케팅 전략 검토",
    status: "pending",
    priority: "urgent",
    createdAt: "2026-03-12T08:00:00Z",
    assignee: null,
    memos: [],
    deliveries: [],
  },
  {
    id: "req-004",
    orgName: "프로골프샵 강남점",
    orgId: "org-004",
    requestType: "PPT 제작 요청",
    title: "분기 실적 보고 PPT 제작",
    status: "completed",
    priority: "normal",
    createdAt: "2026-03-01T10:00:00Z",
    assignee: "박컨설턴트",
    memos: [
      { text: "최종 전달 완료", author: "박컨설턴트", createdAt: "2026-03-05T15:00:00Z" },
    ],
    deliveries: [
      { fileName: "프로골프샵_분기보고_v1.pptx", version: 1, deliveredAt: "2026-03-04T14:00:00Z", method: "이메일" },
      { fileName: "프로골프샵_분기보고_v2.pptx", version: 2, deliveredAt: "2026-03-05T14:30:00Z", method: "링크 전달" },
    ],
  },
];

export default function OperatorConsultantTab() {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [newMemo, setNewMemo] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | RequestStatus>("all");

  const selectedRequest = mockRequests.find(r => r.id === selectedRequestId);
  const filteredRequests = statusFilter === "all" ? mockRequests : mockRequests.filter(r => r.status === statusFilter);

  const pendingCount = mockRequests.filter(r => r.status === "pending").length;
  const inProgressCount = mockRequests.filter(r => r.status === "in_progress" || r.status === "review").length;
  const completedCount = mockRequests.filter(r => r.status === "completed").length;

  const handleAddMemo = () => {
    if (!newMemo.trim()) return;
    toast({ title: "메모 추가됨", description: "내부 메모가 기록되었습니다 (데모)" });
    setNewMemo("");
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-5 pb-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">전체 요청</p>
            <p className="text-2xl font-bold mt-1">{mockRequests.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="pt-5 pb-4">
            <p className="text-[10px] text-amber-400 uppercase tracking-wider">대기</p>
            <p className="text-2xl font-bold mt-1 text-amber-400">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="pt-5 pb-4">
            <p className="text-[10px] text-blue-400 uppercase tracking-wider">처리중/검토중</p>
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
                    <SelectItem value="pending">대기</SelectItem>
                    <SelectItem value="in_progress">처리중</SelectItem>
                    <SelectItem value="review">검토중</SelectItem>
                    <SelectItem value="completed">완료</SelectItem>
                    <SelectItem value="on_hold">보류</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredRequests.map(req => {
                  const sc = statusConfig[req.status];
                  const pc = priorityConfig[req.priority];
                  return (
                    <div
                      key={req.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedRequestId === req.id ? "border-primary/50 bg-primary/5" : "border-border/30 bg-muted/20 hover:bg-muted/30"}`}
                      onClick={() => setSelectedRequestId(req.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{req.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{req.orgName} · {req.requestType}</p>
                        </div>
                        <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-1" />
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Badge variant="outline" className={`text-[8px] ${sc.color}`}>{sc.label}</Badge>
                        <Badge variant="outline" className={`text-[8px] ${pc.color}`}>{pc.label}</Badge>
                        {req.assignee && <span className="text-[9px] text-muted-foreground">· {req.assignee}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
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
                      <CardTitle className="text-base">{selectedRequest.title}</CardTitle>
                      <CardDescription className="text-xs mt-1">{selectedRequest.orgName} · {selectedRequest.requestType} · {selectedRequest.id}</CardDescription>
                    </div>
                    <Badge variant="outline" className={statusConfig[selectedRequest.status].color}>{statusConfig[selectedRequest.status].label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground">우선순위</p>
                      <Badge variant="outline" className={`text-[9px] mt-1 ${priorityConfig[selectedRequest.priority].color}`}>{priorityConfig[selectedRequest.priority].label}</Badge>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">담당자</p>
                      <p className="text-xs mt-1">{selectedRequest.assignee || "미배정"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">접수일</p>
                      <p className="text-xs mt-1">{new Date(selectedRequest.createdAt).toLocaleDateString("ko-KR")}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">전달 횟수</p>
                      <p className="text-xs mt-1">{selectedRequest.deliveries.length}회</p>
                    </div>
                  </div>

                  <Separator className="opacity-30" />

                  {/* Status change */}
                  <div className="flex items-center gap-3">
                    <Label className="text-xs">상태 변경:</Label>
                    <Select defaultValue={selectedRequest.status} onValueChange={() => toast({ title: "상태 변경됨 (데모)" })}>
                      <SelectTrigger className="w-[120px] text-xs h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Label className="text-xs">담당자:</Label>
                    <Input className="w-[120px] text-xs h-8" placeholder="이름" defaultValue={selectedRequest.assignee || ""} />
                  </div>
                </CardContent>
              </Card>

              {/* Internal memos */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2"><StickyNote className="h-4 w-4 text-primary" />내부 메모 ({selectedRequest.memos.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedRequest.memos.map((m, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-muted/20">
                      <p className="text-xs">{m.text}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{m.author} · {new Date(m.createdAt).toLocaleString("ko-KR")}</p>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Textarea className="text-xs min-h-[60px] flex-1" placeholder="내부 메모 작성..." value={newMemo} onChange={e => setNewMemo(e.target.value)} />
                  </div>
                  <Button size="sm" onClick={handleAddMemo}><StickyNote className="h-3 w-3 mr-1" />메모 추가</Button>
                </CardContent>
              </Card>

              {/* Deliveries / Result uploads */}
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
                            <TableHead className="text-[10px]">버전</TableHead>
                            <TableHead className="text-[10px]">전달 방법</TableHead>
                            <TableHead className="text-[10px]">전달일</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedRequest.deliveries.map((d, i) => (
                            <TableRow key={i}>
                              <TableCell className="text-xs font-medium">{d.fileName}</TableCell>
                              <TableCell><Badge variant="outline" className="text-[9px]">v{d.version}</Badge></TableCell>
                              <TableCell className="text-xs text-muted-foreground">{d.method}</TableCell>
                              <TableCell className="text-[10px] text-muted-foreground">{new Date(d.deliveredAt).toLocaleString("ko-KR")}</TableCell>
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
    </div>
  );
}
