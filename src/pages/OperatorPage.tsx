import { useState, useMemo } from "react";
import { Shield, Inbox, FileText, StickyNote, Upload, Users, Clock, Database, Cpu, BookOpen, Eye, ShieldCheck, Globe, Lock, Tag, ToggleRight, History, CreditCard, LayoutTemplate, MessageSquare, Wrench, CheckCircle, AlertCircle, Zap, Activity, Crown, Wallet, Settings2, Link2 } from "lucide-react";
import { FeatureVisibilityEditor } from "@/components/FeatureVisibilityEditor";
import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";
import OperatorIntegrationTab from "@/components/operator/OperatorIntegrationTab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { promptRegistry } from "@/lib/prompt-registry";
import { rosRoutes } from "@/lib/ros-routing";
import { membershipTiers, ledgerTypeLabels, defaultFeaturePolicies, FEATURE_KEYS, type MembershipCode, type FeatureKey, type AccessMode } from "@/lib/membership";
import { useMembership } from "@/contexts/MembershipContext";
import { toast } from "@/hooks/use-toast";

const consultantOps = [
  { title: "컨설턴트 요청 접수함", desc: "고객 요청 목록 확인 및 처리", icon: Inbox, color: "bg-primary/10 text-primary" },
  { title: "요청 상세 보기", desc: "개별 요청 상세 내용 및 진행 상태", icon: FileText, color: "bg-amber-500/10 text-amber-400" },
  { title: "내부 메모", desc: "요청 건별 내부 메모 및 코멘트 관리", icon: StickyNote, color: "bg-blue-500/10 text-blue-400" },
  { title: "결과 업로드", desc: "컨설팅 결과물 업로드 및 전달", icon: Upload, color: "bg-violet-500/10 text-violet-400" },
  { title: "고객별 요청 이력", desc: "고객 단위 요청 이력 조회 및 관리", icon: Clock, color: "bg-emerald-500/10 text-emerald-400" },
  { title: "조직별 관리", desc: "조직 단위 고객사 현황 관리", icon: Users, color: "bg-cyan-500/10 text-cyan-400" },
];

const aiPolicyOps = [
  { title: "프롬프트 운영", desc: "AI 프롬프트 작성·편집·테스트·버전 관리", icon: FileText, color: "bg-pink-500/10 text-pink-400" },
  { title: "업종별 지침 운영", desc: "업종별 AI 응답 지침 관리", icon: BookOpen, color: "bg-violet-500/10 text-violet-400" },
  { title: "출력 기준 운영", desc: "AI 출력물 형식·길이·톤앤매너 정책", icon: Eye, color: "bg-emerald-500/10 text-emerald-400" },
  { title: "금지 규칙 운영", desc: "AI 사용 금지 표현·내용 정책 관리", icon: ShieldCheck, color: "bg-red-500/10 text-red-400" },
  { title: "지식베이스 운영", desc: "텍스트·파일·PDF 등 지식 자료 관리", icon: Database, color: "bg-cyan-500/10 text-cyan-400" },
  { title: "참고자료/출처 운영", desc: "AI 참조 자료 및 출처 관리", icon: Globe, color: "bg-pink-500/10 text-pink-400" },
  { title: "AI 참조 허용 범위 운영", desc: "AI가 참조할 수 있는 데이터 범위 정책", icon: Lock, color: "bg-orange-500/10 text-orange-400" },
];

const systemOps = [
  { title: "엔진 운영", desc: "ROS 엔진 상태 확인 및 파라미터 설정", icon: Cpu, color: "bg-orange-500/10 text-orange-400" },
  { title: "ROS 정책 운영", desc: "ROS 엔진 정책 및 실행 규칙 관리", icon: Wrench, color: "bg-lime-500/10 text-lime-400" },
  { title: "전담 컨설턴트 전환 규칙 운영", desc: "AI→컨설턴트 에스컬레이션 규칙 관리", icon: MessageSquare, color: "bg-rose-500/10 text-rose-400" },
  { title: "템플릿 운영", desc: "출력 템플릿 생성·편집·관리", icon: LayoutTemplate, color: "bg-fuchsia-500/10 text-fuchsia-400" },
  { title: "변경 이력", desc: "전체 설정 변경 이력 조회", icon: History, color: "bg-slate-500/10 text-slate-400" },
  { title: "태그 관리", desc: "지식베이스·프롬프트 태그 체계 관리", icon: Tag, color: "bg-zinc-500/10 text-zinc-400" },
];

const statusColor: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400",
  testing: "bg-amber-500/20 text-amber-400",
  inactive: "bg-muted text-muted-foreground",
  deprecated: "bg-red-500/20 text-red-400",
};
const statusLabel: Record<string, string> = { active: "활성", testing: "테스트 중", inactive: "비활성", deprecated: "폐기" };

const tierBadgeColor: Record<string, string> = {
  trial: "bg-muted/50 text-muted-foreground",
  standard: "bg-blue-500/10 text-blue-400",
  pro: "bg-amber-500/10 text-amber-400",
  enterprise: "bg-violet-500/10 text-violet-400",
};

export default function OperatorPage() {
  const activePrompts = promptRegistry.filter(p => p.status === "active").length;
  const testingPrompts = promptRegistry.filter(p => p.status === "testing").length;
  const routeEntries = Object.values(rosRoutes);
  const { membershipCode, setMembershipCode, membershipName, creditBalance, ledger, grantCredit, overrides, addOverride, removeOverride } = useMembership();

  const [grantAmount, setGrantAmount] = useState("");
  const [grantReason, setGrantReason] = useState("");

  const handleGrant = () => {
    const amount = parseInt(grantAmount);
    if (!amount || amount <= 0) { toast({ title: "오류", description: "유효한 금액을 입력하세요", variant: "destructive" }); return; }
    grantCredit(amount, "manual_grant", grantReason || "운영자 수동 지급");
    toast({ title: "크레딧 지급 완료", description: `${amount} 크레딧이 지급되었습니다` });
    setGrantAmount("");
    setGrantReason("");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          운영자 관리
        </h1>
        <p className="text-muted-foreground text-sm mt-1">OkeyGolf 내부 운영자 전용 — AI 정책, 프롬프트, 엔진, 멤버십, 크레딧, 기능 노출 관리</p>
      </div>

      <Card className="bg-amber-500/5 border-amber-500/20">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs text-amber-400">⚠️ 이 영역은 OkeyGolf 내부 운영자만 접근할 수 있습니다. 고객사에게는 노출되지 않습니다.</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/30 p-1">
          <TabsTrigger value="dashboard" className="text-xs px-3 py-1.5 gap-1.5"><Activity className="h-3 w-3" />시스템 현황</TabsTrigger>
          <TabsTrigger value="membership" className="text-xs px-3 py-1.5 gap-1.5"><Crown className="h-3 w-3" />멤버십 정책</TabsTrigger>
          <TabsTrigger value="credit" className="text-xs px-3 py-1.5 gap-1.5"><Wallet className="h-3 w-3" />크레딧 운영</TabsTrigger>
          <TabsTrigger value="feature" className="text-xs px-3 py-1.5 gap-1.5"><ToggleRight className="h-3 w-3" />기능 노출 제어</TabsTrigger>
          <TabsTrigger value="ai-policy" className="text-xs px-3 py-1.5 gap-1.5"><ShieldCheck className="h-3 w-3" />AI 정책</TabsTrigger>
          <TabsTrigger value="system" className="text-xs px-3 py-1.5 gap-1.5"><Cpu className="h-3 w-3" />시스템 운영</TabsTrigger>
          <TabsTrigger value="consultant" className="text-xs px-3 py-1.5 gap-1.5"><MessageSquare className="h-3 w-3" />컨설턴트</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">활성 프롬프트</p>
                    <p className="text-2xl font-bold mt-1">{activePrompts}</p>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center"><CheckCircle className="h-4 w-4 text-emerald-400" /></div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">테스트 중</p>
                    <p className="text-2xl font-bold mt-1">{testingPrompts}</p>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center"><AlertCircle className="h-4 w-4 text-amber-400" /></div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">엔진 라우트</p>
                    <p className="text-2xl font-bold mt-1">{routeEntries.length}</p>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><Zap className="h-4 w-4 text-primary" /></div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">시스템 상태</p>
                    <p className="text-sm font-medium mt-2 text-emerald-400">정상 운영</p>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Activity className="h-4 w-4 text-emerald-400" /></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prompt Registry */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />프롬프트 레지스트리 현황</CardTitle>
                <Badge variant="outline" className="text-[10px]">{promptRegistry.length}건 등록</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {promptRegistry.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{p.module} — {p.subtool}</p>
                      <p className="text-[10px] text-muted-foreground">{p.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="outline" className="text-[9px]">{p.version}</Badge>
                      <Badge className={`text-[9px] ${statusColor[p.status]}`} variant="outline">{statusLabel[p.status]}</Badge>
                      <span className="text-[9px] text-muted-foreground">{p.lastTested || "-"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ROS Routing */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><Cpu className="h-4 w-4 text-primary" />ROS 엔진 라우팅 현황</CardTitle>
                <Badge variant="outline" className="text-[10px]">{routeEntries.length}개 모듈</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {routeEntries.map(r => (
                  <div key={r.module} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20">
                    <div>
                      <p className="text-xs font-medium">{r.module}</p>
                      <p className="text-[10px] text-muted-foreground">{r.engineLabel} · {r.outputStyle}</p>
                    </div>
                    <Badge variant="outline" className={`text-[9px] ${r.riskLevel === "low" ? "text-emerald-400" : r.riskLevel === "medium" ? "text-amber-400" : "text-red-400"}`}>
                      위험도: {r.riskLevel}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Membership Tab */}
        <TabsContent value="membership" className="space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Crown className="h-4 w-4 text-primary" />멤버십 등급 정책</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {membershipTiers.map(tier => (
                  <div key={tier.code} className={`p-4 rounded-lg border transition-colors ${membershipCode === tier.code ? "border-primary/50 bg-primary/5" : "border-border/30 bg-muted/20"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[10px] ${tierBadgeColor[tier.code]}`} variant="outline">{tier.name}</Badge>
                        {membershipCode === tier.code && <Badge className="text-[9px] bg-primary/20 text-primary" variant="outline">현재 적용</Badge>}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{tier.description}</p>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <CreditCard className="h-3 w-3" /> 기본 크레딧: {tier.defaultCredits.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Simulate membership change */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Settings2 className="h-4 w-4 text-primary" />테스트: 멤버십 등급 변경 (데모)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">운영자 전용 테스트 기능 — 현재 조직의 멤버십 등급을 변경하여 기능 잠금/노출 정책을 확인합니다</p>
              <div className="flex items-center gap-3">
                <Select value={membershipCode} onValueChange={(v) => setMembershipCode(v as MembershipCode)}>
                  <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {membershipTiers.map(t => (
                      <SelectItem key={t.code} value={t.code}>{t.name} ({t.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">현재: <span className="text-primary font-medium">{membershipName}</span></p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credit Tab */}
        <TabsContent value="credit" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-5">
                <p className="text-xs text-muted-foreground">현재 잔액</p>
                <p className="text-2xl font-bold mt-1">{creditBalance.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-5">
                <p className="text-xs text-muted-foreground">이번 달 사용</p>
                <p className="text-2xl font-bold mt-1">{ledger.filter(e => e.amountDelta < 0).reduce((s, e) => s + Math.abs(e.amountDelta), 0)}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-5">
                <p className="text-xs text-muted-foreground">총 거래 건수</p>
                <p className="text-2xl font-bold mt-1">{ledger.length}건</p>
              </CardContent>
            </Card>
          </div>

          {/* Manual grant */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" />수동 크레딧 지급</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">지급 크레딧</Label>
                  <Input type="number" placeholder="100" value={grantAmount} onChange={e => setGrantAmount(e.target.value)} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-xs">사유</Label>
                  <Input placeholder="예: 프로모션 보상 지급" value={grantReason} onChange={e => setGrantReason(e.target.value)} />
                </div>
              </div>
              <Button size="sm" onClick={handleGrant}>지급 실행</Button>
            </CardContent>
          </Card>

          {/* Ledger */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><History className="h-4 w-4 text-primary" />크레딧 사용 내역</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {ledger.map(entry => (
                  <div key={entry.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20">
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge variant="outline" className="text-[9px] flex-shrink-0">{ledgerTypeLabels[entry.type]}</Badge>
                      <div className="min-w-0">
                        <p className="text-xs truncate">{entry.reason}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(entry.createdAt).toLocaleString("ko-KR")} · {entry.actorType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-xs font-medium ${entry.amountDelta < 0 ? "text-destructive" : "text-emerald-400"}`}>
                        {entry.amountDelta > 0 ? "+" : ""}{entry.amountDelta}
                      </span>
                      <span className="text-[10px] text-muted-foreground">잔액 {entry.balanceAfter}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Visibility Tab */}
        <TabsContent value="feature" className="space-y-6">
          <FeatureVisibilityEditor
            membershipCode={membershipCode}
            overrides={overrides}
            addOverride={addOverride}
            removeOverride={removeOverride}
            tierBadgeColor={tierBadgeColor}
          />
        </TabsContent>

        {/* AI Policy Tab */}
        <TabsContent value="ai-policy" className="space-y-6">
          <MenuLandingGrid columns={3}>
            {aiPolicyOps.map((s) => (
              <MenuLandingCard key={s.title} title={s.title} description={s.desc} icon={s.icon} color={s.color} />
            ))}
          </MenuLandingGrid>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <MenuLandingGrid columns={3}>
            {systemOps.map((s) => (
              <MenuLandingCard key={s.title} title={s.title} description={s.desc} icon={s.icon} color={s.color} />
            ))}
          </MenuLandingGrid>
        </TabsContent>

        {/* Consultant Tab */}
        <TabsContent value="consultant" className="space-y-6">
          <MenuLandingGrid columns={3}>
            {consultantOps.map((s) => (
              <MenuLandingCard key={s.title} title={s.title} description={s.desc} icon={s.icon} color={s.color} />
            ))}
          </MenuLandingGrid>
        </TabsContent>
      </Tabs>
    </div>
  );
}
