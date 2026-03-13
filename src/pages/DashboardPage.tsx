import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, FileText, Megaphone, TrendingUp, Users, Target, Calendar, AlertTriangle, CheckCircle, Building2, Crown, CreditCard, Search, MessageSquare, Wallet, ArrowUpRight, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { ConsultantCTA } from "@/components/ConsultantCTA";
import { ResultDetailDrawer } from "@/components/ResultDetailDrawer";

import { useBusinessContext } from "@/contexts/BusinessContext";
import { useMembership } from "@/contexts/MembershipContext";
import { useResultStore } from "@/contexts/ResultStoreContext";
import { Badge } from "@/components/ui/badge";
import { getMembershipTier, ledgerTypeLabels } from "@/lib/membership";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { config, label } = useBusinessContext();
  const { membershipCode, membershipName, creditBalance, ledger } = useMembership();
  const { recentResults, recentByType, totalCount } = useResultStore();
  const tier = getMembershipTier(membershipCode);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);

  const handleOpenResult = (id: string) => {
    setSelectedResultId(id);
    setDrawerOpen(true);
  };

  const recentGenerated = recentResults(3);
  const recentResearch = recentByType("research", 3);
  const recentConsultant = recentByType("consultant", 3);

  const usageKpis = [
    { label: "이번 주 AI 분석", value: totalCount > 0 ? String(totalCount) : "—", change: totalCount > 0 ? `${totalCount}건` : "—", icon: Brain },
    { label: "생성된 보고서", value: recentGenerated.length > 0 ? String(recentGenerated.length) : "—", change: "", icon: FileText },
    { label: "시장조사", value: recentResearch.length > 0 ? String(recentResearch.length) : "—", change: "", icon: Search },
    { label: "전담 요청", value: recentConsultant.length > 0 ? String(recentConsultant.length) : "—", change: "", icon: MessageSquare },
  ];

  const tierBadgeColor: Record<string, string> = {
    trial: "bg-muted/50 text-muted-foreground",
    standard: "bg-blue-500/10 text-blue-400",
    pro: "bg-amber-500/10 text-amber-400",
    enterprise: "bg-violet-500/10 text-violet-400",
  };

  const recentLedger = ledger.slice(0, 5);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
    return `${Math.floor(diff / 86400000)}일 전`;
  };

  // Dynamic date
  const todayStr = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">운영 관제 센터</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground text-sm">AI 운영 매니저가 비즈니스 현황을 분석하고 있습니다</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">운영 프로필 반영 중</span>
          </div>
        </div>
        <div className="text-right space-y-1">
          <p className="text-sm font-medium">{todayStr}</p>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary flex items-center gap-1">
              <Building2 className="h-3 w-3" /> {label}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${tierBadgeColor[membershipCode]}`}>
              <Crown className="h-3 w-3" /> {membershipName} 멤버십
            </span>
          </div>
        </div>
      </div>

      {/* Top 3 summary cards: Industry / Membership / Credit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Card 1: Current Industry */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">현재 업종</p>
                <p className="text-xl font-bold mt-1">{label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">운영 프로필 기반 AI 컨텍스트 적용 중</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Current Membership */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">현재 멤버십</p>
                <p className="text-xl font-bold mt-1">{membershipName}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{tier.description}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tierBadgeColor[membershipCode]}`}>
                <Crown className="h-5 w-5" />
              </div>
            </div>
            {membershipCode !== "enterprise" && (
              <div className="mt-3 flex items-center gap-1.5">
                <ArrowUpRight className="h-3 w-3 text-primary" />
                <span className="text-[11px] text-primary cursor-pointer hover:underline">플랜 업그레이드 안내</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 3: Credit Balance */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">크레딧 잔액</p>
                <p className="text-xl font-bold mt-1">{creditBalance.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">월 기본 {tier.defaultCredits.toLocaleString()} 크레딧</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
            </div>
            <Progress value={(creditBalance / tier.defaultCredits) * 100} className="h-1.5 mt-3" />
          </CardContent>
        </Card>
      </div>

      {/* Usage KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {usageKpis.map((kpi) => (
          <Card key={kpi.label} className="bg-card/50 border-border/50">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <kpi.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              {kpi.change && (
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                  <span className="text-xs text-emerald-400">{kpi.change}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business KPIs */}
        <Card className="lg:col-span-2 bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              핵심 KPI
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary ml-1">{label}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {config.kpis.map((m) => {
                const status = m.progress >= 80 ? "good" : "warning";
                return (
                  <div key={m.label} className="p-3 rounded-lg bg-muted/30">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-muted-foreground">{m.label}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${status === "good" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                        목표 {m.target}
                      </span>
                    </div>
                    <span className="text-xl font-bold">{m.value}</span>
                    <Progress value={m.progress} className="h-1.5 mt-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Urgent Issues */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              주요 이슈
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {config.issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => navigate("/ai-operations/diagnosis")}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${issue.priority === "긴급" ? "bg-destructive" : issue.priority === "높음" ? "bg-amber-400" : "bg-blue-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{issue.title}</p>
                    <p className="text-xs text-muted-foreground">{issue.priority}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent + Recommended */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              최근 생성 결과
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentGenerated.length > 0 ? (
                recentGenerated.map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0 cursor-pointer hover:bg-muted/20 rounded px-1 transition-colors" onClick={() => handleOpenResult(r.id)}>
                    <div className="flex items-center gap-3 min-w-0">
                      <CheckCircle className="h-3.5 w-3.5 text-primary/50 flex-shrink-0" />
                      <span className="text-sm truncate">{r.title}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground">{formatDate(r.updatedAt)}</span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-3">아직 생성된 결과가 없습니다</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              이번 주 추천 액션
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary ml-1">{label}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {config.recommendations.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => navigate(item.url)}>
                  <span className="text-sm">{item.action}</span>
                  <span className="text-xs text-primary px-2 py-0.5 rounded bg-primary/10">{item.tool}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row — data-driven */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              최근 시장조사
            </CardTitle>
          </CardHeader>
          <CardContent>
              {recentResearch.length > 0 ? (
              <div className="space-y-1.5">
                {recentResearch.map(r => (
                  <div key={r.id} className="flex items-center justify-between text-[11px] cursor-pointer hover:bg-muted/20 rounded px-1 py-0.5 transition-colors" onClick={() => handleOpenResult(r.id)}>
                    <span className="text-muted-foreground truncate mr-2">{r.title}</span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Badge className={`${r.status === "전달 완료" ? "bg-blue-500/20 text-blue-400" : "bg-muted text-muted-foreground"} text-[9px]`} variant="outline">{r.status}</Badge>
                      <ChevronRight className="h-2.5 w-2.5 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">아직 진행된 시장조사가 없습니다</p>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              최근 전담 컨설턴트 요청
            </CardTitle>
          </CardHeader>
          <CardContent>
              {recentConsultant.length > 0 ? (
              <div className="space-y-1.5">
                {recentConsultant.map(r => (
                  <div key={r.id} className="flex items-center justify-between text-[11px] cursor-pointer hover:bg-muted/20 rounded px-1 py-0.5 transition-colors" onClick={() => handleOpenResult(r.id)}>
                    <span className="text-muted-foreground truncate mr-2">{r.title}</span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Badge className="bg-muted text-muted-foreground text-[9px]" variant="outline">{r.status}</Badge>
                      <ChevronRight className="h-2.5 w-2.5 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">아직 요청 이력이 없습니다</p>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              크레딧 사용 내역
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {recentLedger.slice(0, 3).map(entry => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between text-[11px] ${entry.relatedResultId ? "cursor-pointer hover:bg-muted/20 rounded px-1 py-0.5 transition-colors" : "px-1 py-0.5"}`}
                  onClick={() => entry.relatedResultId && handleOpenResult(entry.relatedResultId)}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Badge variant="outline" className="text-[9px] flex-shrink-0">{ledgerTypeLabels[entry.type]}</Badge>
                    <span className="text-muted-foreground truncate">{entry.relatedModule || "시스템"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={entry.amountDelta < 0 ? "text-destructive" : "text-emerald-400"}>
                      {entry.amountDelta > 0 ? "+" : ""}{entry.amountDelta}
                    </span>
                    {entry.relatedResultId && <ChevronRight className="h-2.5 w-2.5 text-muted-foreground" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <ResultDetailDrawer open={drawerOpen} onOpenChange={setDrawerOpen} resultId={selectedResultId} />
    </div>
  );
}
