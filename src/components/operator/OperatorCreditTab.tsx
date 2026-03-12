/**
 * 운영자 전용 — 크레딧 운영 (DB 직접 조회)
 * credit_wallets + credit_ledger + organizations 기준
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import { Wallet, Search, Plus, Minus, History, Building2, Crown, Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ledgerTypeLabels, type LedgerType } from "@/lib/membership";
import { toast } from "@/hooks/use-toast";
import { buildCsv, downloadCsv, type CsvColumn } from "@/lib/csv-export";
import { downloadXlsx } from "@/lib/xlsx-export";
import { supabase } from "@/integrations/supabase/client";
import { DEV_ORG_ID } from "@/lib/repositories/constants";
import {
  fetchWallet,
  fetchLedger,
  grantCreditRPC,
  deductCreditRPC,
  type CreditWalletRow,
  type CreditLedgerRow,
} from "@/lib/repositories/credit-repository";

// ── Org row from DB ──
interface OrgRow {
  id: string;
  name: string;
  business_type: string;
  membership_code: string;
}

const tierBadgeColor: Record<string, string> = {
  trial: "bg-muted/50 text-muted-foreground",
  standard: "bg-blue-500/10 text-blue-400",
  pro: "bg-amber-500/10 text-amber-400",
  enterprise: "bg-violet-500/10 text-violet-400",
};

const ledgerCsvCols: CsvColumn<CreditLedgerRow & { orgName: string }>[] = [
  { header: "조직", accessor: r => r.orgName },
  { header: "유형", accessor: r => ledgerTypeLabels[r.type as LedgerType] || r.type },
  { header: "사유", accessor: r => r.reason },
  { header: "모듈", accessor: r => r.related_module || "—" },
  { header: "실행자", accessor: r => r.actor_type },
  { header: "금액", accessor: r => r.amount_delta },
  { header: "잔액", accessor: r => r.balance_after },
  { header: "일시", accessor: r => new Date(r.created_at).toLocaleString("ko-KR") },
];

export default function OperatorCreditTab() {
  const [loading, setLoading] = useState(true);
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [wallet, setWallet] = useState<CreditWalletRow | null>(null);
  const [ledger, setLedger] = useState<CreditLedgerRow[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState(DEV_ORG_ID);

  const [searchQuery, setSearchQuery] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [actionType, setActionType] = useState<"grant" | "deduct">("grant");
  const [executing, setExecuting] = useState(false);

  // ── Load orgs ──
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name, business_type, membership_code")
        .order("name");
      if (error) console.error("OperatorCreditTab org fetch error:", error);
      setOrgs((data as unknown as OrgRow[]) ?? []);
    })();
  }, []);

  // ── Load wallet + ledger for selected org ──
  const loadOrgCredit = useCallback(async (orgId: string) => {
    setLoading(true);
    const [w, l] = await Promise.all([fetchWallet(orgId), fetchLedger(orgId)]);
    setWallet(w);
    setLedger(l);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOrgCredit(selectedOrgId);
  }, [selectedOrgId, loadOrgCredit]);

  // ── Derived ──
  const filteredOrgs = useMemo(() => {
    if (!searchQuery) return orgs;
    const q = searchQuery.toLowerCase();
    return orgs.filter(o => o.name.toLowerCase().includes(q) || o.business_type.includes(q) || o.id.includes(q));
  }, [searchQuery, orgs]);

  const selectedOrg = orgs.find(o => o.id === selectedOrgId) || orgs[0];

  const totalUsedThisMonth = useMemo(() =>
    ledger.filter(e => e.amount_delta < 0).reduce((s, e) => s + Math.abs(e.amount_delta), 0)
  , [ledger]);

  const totalGrantedThisMonth = useMemo(() =>
    ledger.filter(e => e.amount_delta > 0).reduce((s, e) => s + e.amount_delta, 0)
  , [ledger]);

  // ── Execute grant/deduct via RPC ──
  const handleExecute = useCallback(async () => {
    const amt = parseInt(amount);
    if (!amt || amt <= 0) {
      toast({ title: "오류", description: "유효한 금액을 입력하세요", variant: "destructive" });
      return;
    }
    if (!reason.trim()) {
      toast({ title: "오류", description: "사유를 입력하세요", variant: "destructive" });
      return;
    }

    setExecuting(true);
    let success: boolean;
    if (actionType === "grant") {
      success = await grantCreditRPC(selectedOrgId, amt, "manual_grant", reason.trim());
    } else {
      success = await deductCreditRPC(selectedOrgId, amt, "manual_deduct", reason.trim());
    }

    if (success) {
      toast({
        title: actionType === "grant" ? "크레딧 지급 완료" : "크레딧 차감 완료",
        description: `${selectedOrg?.name || selectedOrgId}에 ${amt} 크레딧 ${actionType === "grant" ? "지급" : "차감"}`,
      });
      setAmount("");
      setReason("");
      // Reload wallet + ledger
      await loadOrgCredit(selectedOrgId);
    } else {
      toast({
        title: "실행 실패",
        description: actionType === "deduct" ? "잔액 부족이거나 서버 오류입니다" : "서버 오류가 발생했습니다",
        variant: "destructive",
      });
    }
    setExecuting(false);
  }, [amount, reason, actionType, selectedOrgId, selectedOrg, loadOrgCredit]);

  // ── Export ──
  const handleExportLedger = (format: "csv" | "xlsx" = "csv") => {
    const rows = ledger.map(e => ({ ...e, orgName: selectedOrg?.name || "" }));
    if (rows.length === 0) { toast({ title: "이력 없음", variant: "destructive" }); return; }
    const baseName = `크레딧이력_${selectedOrg?.name || "org"}_${new Date().toISOString().slice(0, 10)}`;
    if (format === "xlsx") {
      downloadXlsx(rows, ledgerCsvCols, `${baseName}.xlsx`, "크레딧이력");
    } else {
      const csv = buildCsv(rows, ledgerCsvCols);
      downloadCsv(csv, `${baseName}.csv`);
    }
    toast({ title: `${format.toUpperCase()} 다운로드 완료`, description: `${rows.length}건` });
  };

  const balance = wallet?.balance ?? 0;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-5 pb-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">선택 조직 잔액</p>
            <p className="text-2xl font-bold mt-1">{loading ? "—" : balance.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-5 pb-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">이번 달 사용</p>
            <p className="text-2xl font-bold mt-1">{loading ? "—" : totalUsedThisMonth}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-5 pb-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">이번 달 지급</p>
            <p className="text-2xl font-bold mt-1">{loading ? "—" : totalGrantedThisMonth.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-5 pb-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">총 거래 건수</p>
            <p className="text-2xl font-bold mt-1">{loading ? "—" : `${ledger.length}건`}</p>
          </CardContent>
        </Card>
      </div>

      {/* Organization search + selection */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Search className="h-4 w-4 text-primary" />고객/조직 검색</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="조직명, 업종, ID로 검색..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="text-xs" />
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
                    <TableCell className="text-xs text-muted-foreground">{org.business_type}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[9px] ${tierBadgeColor[org.membership_code] || ""}`}>{org.membership_code}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-right">
                      {selectedOrgId === org.id ? balance.toLocaleString() : "—"}
                    </TableCell>
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
          <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/20">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{selectedOrg?.name || "—"}</p>
              <p className="text-[11px] text-muted-foreground">{selectedOrg?.business_type || ""} · {selectedOrgId}</p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className={`text-[9px] ${tierBadgeColor[selectedOrg?.membership_code || ""] || ""}`}>
                <Crown className="h-2.5 w-2.5 mr-1" />{selectedOrg?.membership_code || "—"}
              </Badge>
              <p className="text-xs mt-1">잔액: <span className="font-bold text-primary">{balance.toLocaleString()}</span></p>
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
          <Button size="sm" onClick={handleExecute} disabled={executing} className={actionType === "deduct" ? "bg-destructive hover:bg-destructive/90" : ""}>
            {executing ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : actionType === "grant" ? <Plus className="h-3 w-3 mr-1" /> : <Minus className="h-3 w-3 mr-1" />}
            {actionType === "grant" ? "지급 실행" : "차감 실행"}
          </Button>
        </CardContent>
      </Card>

      {/* Ledger history table */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><History className="h-4 w-4 text-primary" />크레딧 거래 내역</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-[10px] h-7 gap-1" onClick={() => handleExportLedger("csv")}>
                <Download className="h-3 w-3" />CSV
              </Button>
              <Button variant="outline" size="sm" className="text-[10px] h-7 gap-1" onClick={() => handleExportLedger("xlsx")}>
                <Download className="h-3 w-3" />XLSX
              </Button>
              <Badge variant="outline" className="text-[10px]">{ledger.length}건</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> 로딩 중...
            </div>
          ) : ledger.length > 0 ? (
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
                      <TableCell><Badge variant="outline" className="text-[9px]">{ledgerTypeLabels[entry.type as LedgerType] || entry.type}</Badge></TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">{entry.reason}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{entry.related_module || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{entry.actor_type}</TableCell>
                      <TableCell className={`text-xs text-right font-medium ${entry.amount_delta < 0 ? "text-destructive" : "text-emerald-400"}`}>
                        {entry.amount_delta > 0 ? "+" : ""}{entry.amount_delta}
                      </TableCell>
                      <TableCell className="text-xs text-right">{entry.balance_after.toLocaleString()}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(entry.created_at).toLocaleString("ko-KR")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">이 조직의 거래 내역이 없습니다</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
