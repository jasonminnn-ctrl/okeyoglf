import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, FileText, Megaphone, TrendingUp, Users, Target, Calendar, AlertTriangle, CheckCircle, Building2, Crown, CreditCard, Search, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { ConsultantCTA } from "@/components/ConsultantCTA";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { useBusinessContext } from "@/contexts/BusinessContext";

const kpiIcons = [Brain, FileText, Megaphone, MessageSquare];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { config, label } = useBusinessContext();

  const usageKpis = [
    { label: "이번 주 AI 분석", value: "12", change: "+3", icon: Brain },
    { label: "생성된 보고서", value: "8", change: "+2", icon: FileText },
    { label: "마케팅 카피", value: "24", change: "+7", icon: Megaphone },
    { label: "전담 요청", value: "2", change: "+1", icon: MessageSquare },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">운영 관제 센터</h1>
          <p className="text-muted-foreground text-sm mt-1">AI 운영 매니저가 비즈니스 현황을 분석하고 있습니다</p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-sm font-medium">2026년 3월 10일</p>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary flex items-center gap-1">
              <Building2 className="h-3 w-3" /> {label}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 flex items-center gap-1">
              <Crown className="h-3 w-3" /> 프로 멤버십
            </span>
          </div>
        </div>
      </div>

      <BusinessContextBanner />

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
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-xs text-emerald-400">{kpi.change} 이번 주</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business KPIs - dynamic */}
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

        {/* Urgent Issues - dynamic */}
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
              {[
                { text: "AI 진단 완료 - 매출 하락 원인 분석", time: "2시간 전", type: "진단" },
                { text: "마케팅 카피 생성 - 시즌 프로모션", time: "4시간 전", type: "마케팅" },
                { text: "직원 지시서 작성 - 업무 가이드", time: "어제", type: "지시서" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-3.5 w-3.5 text-primary/50" />
                    <span className="text-sm">{item.text}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              ))}
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

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              최근 시장조사
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">아직 진행된 시장조사가 없습니다</p>
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
            <p className="text-sm text-muted-foreground">아직 요청 이력이 없습니다</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              크레딧 요약
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">크레딧 시스템 준비 중</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
