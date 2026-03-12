/**
 * 운영자 전용 — 조직별 관리 / Override 탭
 * 9단계 잔수정: CSV export 추가
 */

import { useState } from "react";
import { Users, Crown, ShieldCheck, Plus, X, FileText, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useMembership } from "@/contexts/MembershipContext";
import { membershipTiers, type MembershipCode, type AccessMode, type FeatureKey } from "@/lib/membership";
import { toast } from "@/hooks/use-toast";
import { buildCsv, downloadCsv, type CsvColumn } from "@/lib/csv-export";
import { downloadXlsx } from "@/lib/xlsx-export";

interface OrgOverrideRecord {
  id: string;
  orgId: string;
  orgName: string;
  featureKey: string;
  previousMode: AccessMode;
  newMode: AccessMode;
  reason: string;
  createdAt: string;
  createdBy: string;
}

const mockOverrideHistory: OrgOverrideRecord[] = [
  {
    id: "ovr-001", orgId: "org-003", orgName: "이글아카데미",
    featureKey: "consultant.request", previousMode: "locked", newMode: "enabled",
    reason: "프로모션 기간 컨설턴트 체험 허용", createdAt: "2026-03-10T10:00:00Z", createdBy: "admin@okeygolf.com",
  },
  {
    id: "ovr-002", orgId: "org-005", orgName: "피팅마스터",
    featureKey: "result.export", previousMode: "locked", newMode: "enabled",
    reason: "체험판 기간 내보내기 임시 허용", createdAt: "2026-03-08T15:30:00Z", createdBy: "admin@okeygolf.com",
  },
];

const tierBadgeColor: Record<string, string> = {
  trial: "bg-muted/50 text-muted-foreground",
  standard: "bg-blue-500/10 text-blue-400",
  pro: "bg-amber-500/10 text-amber-400",
  enterprise: "bg-violet-500/10 text-violet-400",
};

const mockOrgs = [
  { id: "org-001", name: "그린골프연습장", membershipCode: "pro" as const },
  { id: "org-002", name: "레이크사이드CC", membershipCode: "enterprise" as const },
  { id: "org-003", name: "이글아카데미", membershipCode: "standard" as const },
  { id: "org-004", name: "프로골프샵 강남점", membershipCode: "standard" as const },
  { id: "org-005", name: "피팅마스터", membershipCode: "trial" as const },
  { id: "org-006", name: "(주)골프이노베이션", membershipCode: "pro" as const },
];

const overrideHistoryCsvCols: CsvColumn<OrgOverrideRecord>[] = [
  { header: "조직", accessor: r => r.orgName },
  { header: "featureKey", accessor: r => r.featureKey },
  { header: "이전", accessor: r => r.previousMode },
  { header: "변경", accessor: r => r.newMode },
  { header: "사유", accessor: r => r.reason },
  { header: "처리자", accessor: r => r.createdBy },
  { header: "일시", accessor: r => new Date(r.createdAt).toLocaleString("ko-KR") },
];

export default function OperatorOrgManageTab() {
  const { overrides, addOverride, removeOverride } = useMembership();
  const [selectedOrgId, setSelectedOrgId] = useState("org-003");
  const [overrideFeatureKey, setOverrideFeatureKey] = useState("");
  const [overrideMode, setOverrideMode] = useState<AccessMode>("enabled");
  const [overrideReason, setOverrideReason] = useState("");
  const [forceMembership, setForceMembership] = useState<MembershipCode | "">("");
  const [forceReason, setForceReason] = useState("");

  const selectedOrg = mockOrgs.find(o => o.id === selectedOrgId) || mockOrgs[0];

  const handleAddOverride = () => {
    if (!overrideFeatureKey.trim()) {
      toast({ title: "오류", description: "featureKey를 입력하세요", variant: "destructive" });
      return;
    }
    if (!overrideReason.trim()) {
      toast({ title: "오류", description: "예외 사유를 입력하세요", variant: "destructive" });
      return;
    }

    addOverride({
      organizationId: selectedOrgId,
      featureKey: overrideFeatureKey as FeatureKey,
      membershipCode: selectedOrg.membershipCode,
      accessMode: overrideMode,
      note: overrideReason,
      isActive: true,
    });

    toast({ title: "예외 적용 완료", description: `${selectedOrg.name}에 ${overrideFeatureKey} → ${overrideMode} 적용` });
    setOverrideFeatureKey("");
    setOverrideReason("");
  };

  const handleForceMembership = () => {
    if (!forceMembership) return;
    toast({ title: "멤버십 강제 변경", description: `${selectedOrg.name} → ${forceMembership} (데모)` });
    setForceMembership("");
    setForceReason("");
  };

  const handleExportOverrideHistory = (format: "csv" | "xlsx" = "csv") => {
    if (mockOverrideHistory.length === 0) { toast({ title: "이력 없음", variant: "destructive" }); return; }
    const baseName = `Override이력_${new Date().toISOString().slice(0, 10)}`;
    if (format === "xlsx") {
      downloadXlsx(mockOverrideHistory, overrideHistoryCsvCols, `${baseName}.xlsx`, "Override이력");
    } else {
      const csv = buildCsv(mockOverrideHistory, overrideHistoryCsvCols);
      downloadCsv(csv, `${baseName}.csv`);
    }
    toast({ title: `${format.toUpperCase()} 다운로드 완료`, description: `${mockOverrideHistory.length}건` });
  };

  return (
    <div className="space-y-6">
      {/* Org selector */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-primary" />조직 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">조직명</TableHead>
                  <TableHead className="text-[10px]">멤버십</TableHead>
                  <TableHead className="text-[10px]">활성 Override</TableHead>
                  <TableHead className="text-[10px] w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOrgs.map(org => {
                  const orgOverrides = overrides.filter(o => o.organizationId === org.id);
                  return (
                    <TableRow key={org.id} className={selectedOrgId === org.id ? "bg-primary/5" : ""}>
                      <TableCell className="text-xs font-medium">{org.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[9px] ${tierBadgeColor[org.membershipCode]}`}>{org.membershipCode}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">{orgOverrides.length > 0 ? <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-400">{orgOverrides.length}건</Badge> : "—"}</TableCell>
                      <TableCell>
                        <Button variant={selectedOrgId === org.id ? "default" : "ghost"} size="sm" className="text-[10px] h-6 px-2" onClick={() => setSelectedOrgId(org.id)}>
                          {selectedOrgId === org.id ? "선택됨" : "선택"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Force membership change */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Crown className="h-4 w-4 text-primary" />멤버십 강제 조정</CardTitle>
          <CardDescription className="text-xs">선택한 조직의 멤버십 등급을 강제로 변경합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
            <p className="text-xs">대상: <span className="font-medium">{selectedOrg.name}</span></p>
            <Badge variant="outline" className={`text-[9px] ${tierBadgeColor[selectedOrg.membershipCode]}`}>현재: {selectedOrg.membershipCode}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">변경할 등급</Label>
              <Select value={forceMembership} onValueChange={(v) => setForceMembership(v as MembershipCode)}>
                <SelectTrigger className="text-xs"><SelectValue placeholder="선택" /></SelectTrigger>
                <SelectContent>
                  {membershipTiers.map(t => (
                    <SelectItem key={t.code} value={t.code}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs">변경 사유</Label>
              <Input placeholder="예: 계약 갱신에 따른 등급 상향" value={forceReason} onChange={e => setForceReason(e.target.value)} className="text-xs" />
            </div>
          </div>
          <Button size="sm" onClick={handleForceMembership} disabled={!forceMembership}>등급 변경 실행</Button>
        </CardContent>
      </Card>

      {/* Feature override */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />기능 예외 허용</CardTitle>
          <CardDescription className="text-xs">특정 기능을 해당 조직에만 예외적으로 허용/차단합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">featureKey</Label>
              <Input placeholder="consultant.request" value={overrideFeatureKey} onChange={e => setOverrideFeatureKey(e.target.value)} className="text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">적용 모드</Label>
              <Select value={overrideMode} onValueChange={(v) => setOverrideMode(v as AccessMode)}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">허용 (enabled)</SelectItem>
                  <SelectItem value="locked">잠금 (locked)</SelectItem>
                  <SelectItem value="hidden">숨김 (hidden)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs">예외 사유 (필수)</Label>
              <Input placeholder="예: 프로모션 기간 한시 허용" value={overrideReason} onChange={e => setOverrideReason(e.target.value)} className="text-xs" />
            </div>
          </div>
          <Button size="sm" onClick={handleAddOverride}><Plus className="h-3 w-3 mr-1" />예외 추가</Button>

          {overrides.length > 0 && (
            <>
              <Separator className="opacity-30" />
              <p className="text-xs font-medium text-muted-foreground">현재 활성 Override ({overrides.length}건)</p>
              <div className="space-y-2">
                {overrides.map((o, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20">
                    <div>
                      <p className="text-xs font-medium">{o.featureKey} → <Badge variant="outline" className="text-[9px]">{o.accessMode}</Badge></p>
                      <p className="text-[10px] text-muted-foreground">{o.note || "사유 없음"} · {o.membershipCode}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeOverride(o.featureKey, o.membershipCode)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Override history */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />예외 처리 이력</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-[10px] h-7 gap-1" onClick={() => handleExportOverrideHistory("csv")}>
                <Download className="h-3 w-3" />CSV
              </Button>
              <Button variant="outline" size="sm" className="text-[10px] h-7 gap-1" onClick={() => handleExportOverrideHistory("xlsx")}>
                <Download className="h-3 w-3" />XLSX
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">조직</TableHead>
                  <TableHead className="text-[10px]">featureKey</TableHead>
                  <TableHead className="text-[10px]">변경</TableHead>
                  <TableHead className="text-[10px]">사유</TableHead>
                  <TableHead className="text-[10px]">처리자</TableHead>
                  <TableHead className="text-[10px]">일시</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOverrideHistory.map(h => (
                  <TableRow key={h.id}>
                    <TableCell className="text-xs font-medium">{h.orgName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{h.featureKey}</TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="outline" className="text-[9px]">{h.previousMode}</Badge>
                      <span className="mx-1">→</span>
                      <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-400">{h.newMode}</Badge>
                    </TableCell>
                    <TableCell className="text-xs max-w-[160px] truncate">{h.reason}</TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">{h.createdBy}</TableCell>
                    <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(h.createdAt).toLocaleString("ko-KR")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
