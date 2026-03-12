/**
 * 운영자 전용 — 크레딧 운영 고도화
 * 고객/조직 검색 + 멤버십/잔액 표시 + 수동 지급/차감 + 사유 + ledger 이력
 */

import { useState, useMemo } from "react";
import { Wallet, Search, Plus, Minus, History, Building2, CreditCard, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMembership } from "@/contexts/MembershipContext";
import { ledgerTypeLabels, type LedgerType } from "@/lib/membership";
import { toast } from "@/hooks/use-toast";

// Mock organization list for search
const mockOrganizations = [
  { id: "org-001", name: "그린골프연습장", industry: "골프연습장", membershipCode: "pro" as const, creditBalance: 986 },
  { id: "org-002", name: "레이크사이드CC", industry: "골프장", membershipCode: "enterprise" as const, creditBalance: 4200 },
  { id: "org-003", name: "이글아카데미", industry: "골프아카데미", membershipCode: "standard" as const, creditBalance: 150 },
  { id: "org-004", name: "프로골프샵 강남점", industry: "골프샵", membershipCode: "standard" as const, creditBalance: 88 },
  { id: "org-005", name: "피팅마스터", industry: "피팅샵", membershipCode: "trial" as const, creditBalance: 20 },
  { id: "org-006", name: "(주)골프이노베이션", industry: "골프회사", membershipCode: "pro" as const, creditBalance: 720 },
];

const tierBadgeColor: Record<string, string> = {
  trial: "bg-muted/50 text-muted-foreground",
  standard: "bg-blue-500/10 text-blue-400",
  pro: "bg-amber-500/10 text-amber-400",
  enterprise: "bg-violet-500/10 text-violet-400",
};

export default function OperatorCreditTab() {
  const { creditBalance, ledger, grantCredit, deductCredit } = useMembership();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState("org-001");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [actionType, setActionType] = useState<"grant" | "deduct">("grant");

  const filteredOrgs = useMemo(() => {
    if (!searchQuery) return mockOrganizations;
    const q = searchQuery.toLowerCase();
    return mockOrganizations.filter(o => o.name.toLowerCase().includes(q) || o.industry.includes(q) || o.id.includes(q));
  }, [searchQuery]);

  const selectedOrg = mockOrganizations.find(o => o.id === selectedOrgId) || mockOrganizations[0];

  const handleExecute = () => {
    const amt = parseInt(amount);
    if (!amt || amt <= 0) {
      toast({ title: "오류", description: "유효한 금액을 입력하세요", variant: "destructive" });
      return;
    }
    if (!reason.trim()) {
      toast({ title: "오류", description: "사유를 입력하세요", variant: "destructive" });
      return;
    }

    if (actionType === "grant") {
      grantCredit(amt, "manual_grant", reason);
      toast({ title: "크레딧 지급 완료", description: `${selectedOrg.name}에 ${amt} 크레딧 지급` });
    } else {
      const ok = deductCredit(amt, "manual_deduct", reason);
      if (!ok) {
        toast({ title: "잔액 부족", description: "차감할 크레딧이 부족합니다", variant: "destructive" });
        return;
      }
      toast({ title: "크레딧 차감 완료", description: `${selectedOrg.name}에서 ${amt} 크레딧 차감` });
    }
    setAmount("");
    setReason("");
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-5 pb-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">선택 조직 잔액</p>
            <p className="text-2xl font-bold mt-1">{creditBalance.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-5 pb-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">이번 달 사용</p>
            <p className="text-2xl font-bold mt-1">{ledger.filter(e => e.amountDelta < 0).reduce((s, e) => s + Math.abs(e.amountDelta), 0)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-5 pb-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">이번 달 지급</p>
            <p className="text-2xl font-bold mt-1">{ledger.filter(e => e.amountDelta > 0).reduce((s, e) => s + e.amountDelta, 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-5 pb-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">총 거래 건수</p>
            <p className="text-2xl font-bold mt-1">{ledger.length}건</p>
          </CardContent>
        </Card>
      </div>

      {/* Organization search + selection */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Search className="h-4 w-4 text-primary" />고객/조직 검색</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="조직명, 업종, ID로 검색..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="text-xs"
          />
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">조직명</TableHead>
                  <TableHead className="text-[10px]">업종</TableHead>
                  <TableHead className="text-[10px]">멤버십</TableHead>
                  <TableHead className="text-[10px] text-right">잔액</TableHead>
                  <TableHead className="text-[10px] w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrgs.map(org => (
                  <TableRow key={org.id} className={selectedOrgId === org.id ? "bg-primary/5" : ""}>
                    <TableCell className="text-xs font-medium">{org.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{org.industry}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[9px] ${tierBadgeColor[org.membershipCode]}`}>{org.membershipCode}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-right">{org.creditBalance.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button variant={selectedOrgId === org.id ? "default" : "ghost"} size="sm" className="text-[10px] h-6 px-2" onClick={() => setSelectedOrgId(org.id)}>
                        {selectedOrgId === org.id ? "선택됨" : "선택"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Selected org info + manual grant/deduct */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" />수동 크레딧 지급 / 차감</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected org summary */}
          <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/20">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{selectedOrg.name}</p>
              <p className="text-[11px] text-muted-foreground">{selectedOrg.industry} · {selectedOrg.id}</p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className={`text-[9px] ${tierBadgeColor[selectedOrg.membershipCode]}`}>
                <Crown className="h-2.5 w-2.5 mr-1" />{selectedOrg.membershipCode}
              </Badge>
              <p className="text-xs mt-1">잔액: <span className="font-bold text-primary">{creditBalance.toLocaleString()}</span></p>
            </div>
          </div>

          <Separator className="opacity-30" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">구분</Label>
              <Select value={actionType} onValueChange={(v) => setActionType(v as "grant" | "deduct")}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="grant"><Plus className="h-3 w-3 inline mr-1" />지급</SelectItem>
                  <SelectItem value="deduct"><Minus className="h-3 w-3 inline mr-1" />차감</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">크레딧 수량</Label>
              <Input type="number" placeholder="100" value={amount} onChange={e => setAmount(e.target.value)} className="text-xs" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs">사유 (필수)</Label>
              <Input placeholder="예: 프로모션 보상 지급 / 오류 환불" value={reason} onChange={e => setReason(e.target.value)} className="text-xs" />
            </div>
          </div>
          <Button size="sm" onClick={handleExecute} className={actionType === "deduct" ? "bg-destructive hover:bg-destructive/90" : ""}>
            {actionType === "grant" ? <><Plus className="h-3 w-3 mr-1" />지급 실행</> : <><Minus className="h-3 w-3 mr-1" />차감 실행</>}
          </Button>
        </CardContent>
      </Card>

      {/* Ledger history table */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><History className="h-4 w-4 text-primary" />크레딧 거래 내역</CardTitle>
            <Badge variant="outline" className="text-[10px]">{ledger.length}건</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">유형</TableHead>
                  <TableHead className="text-[10px]">사유</TableHead>
                  <TableHead className="text-[10px]">모듈</TableHead>
                  <TableHead className="text-[10px]">실행자</TableHead>
                  <TableHead className="text-[10px] text-right">금액</TableHead>
                  <TableHead className="text-[10px] text-right">잔액</TableHead>
                  <TableHead className="text-[10px]">일시</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.map(entry => (
                  <TableRow key={entry.id}>
                    <TableCell><Badge variant="outline" className="text-[9px]">{ledgerTypeLabels[entry.type]}</Badge></TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate">{entry.reason}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{entry.relatedModule || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{entry.actorType}</TableCell>
                    <TableCell className={`text-xs text-right font-medium ${entry.amountDelta < 0 ? "text-destructive" : "text-emerald-400"}`}>
                      {entry.amountDelta > 0 ? "+" : ""}{entry.amountDelta}
                    </TableCell>
                    <TableCell className="text-xs text-right">{entry.balanceAfter.toLocaleString()}</TableCell>
                    <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(entry.createdAt).toLocaleString("ko-KR")}</TableCell>
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
