import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, FileText, Megaphone, TrendingUp, TrendingDown, Users, Target, Calendar, AlertTriangle, CheckCircle, Building2, Crown, CreditCard, Search, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { ConsultantCTA } from "@/components/ConsultantCTA";

const kpiData = [
  { label: "이번 주 AI 분석", value: "12", change: "+3", trend: "up", icon: Brain },
  { label: "생성된 보고서", value: "8", change: "+2", trend: "up", icon: FileText },
  { label: "마케팅 카피", value: "24", change: "+7", trend: "up", icon: Megaphone },
  { label: "전담 요청", value: "2", change: "+1", trend: "up", icon: MessageSquare },
];

const businessMetrics = [
  { label: "타석 가동률", value: "68%", target: "75%", progress: 68, status: "warning" },
  { label: "회원 재등록률", value: "72%", target: "80%", progress: 72, status: "warning" },
  { label: "월간 매출 달성", value: "89%", target: "100%", progress: 89, status: "good" },
  { label: "고객 만족도", value: "4.2", target: "4.5", progress: 84, status: "good" },
];

const urgentIssues = [
  { title: "주중 오전 가동률 35% 미달", priority: "긴급" },
  { title: "3월 재등록 대상 47명 미접촉", priority: "높음" },
  { title: "레슨 프로 휴가 대체 인력 필요", priority: "보통" },
];

const recentOutputs = [
  { text: "AI 진단 완료 - 매출 하락 원인 분석", time: "2시간 전", type: "진단" },
  { text: "마케팅 카피 생성 - 봄 시즌 프로모션", time: "4시간 전", type: "마케팅" },
  { text: "직원 지시서 작성 - 레슨 프로 업무 가이드", time: "어제", type: "지시서" },
];

const recommendedActions = [
  { action: "주중 오전 할인 프로모션 문구 생성", tool: "마케팅 카피", url: "/ai-marketing/copy" },
  { action: "재등록 대상 회원 접촉 지시서 작성", tool: "AI 운영팀", url: "/ai-operations" },
  { action: "대표님 보고용 3월 현황 보고서", tool: "보고서 생성", url: "/reports" },
  { action: "가동률 개선을 위한 AI 진단", tool: "AI 진단실", url: "/ai-operations/diagnosis" },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">운영 관제 센터</h1>
          <p className="text-muted-foreground text-sm mt-1">AI 운영 매니저가 비즈니스 현황을 분석하고 있습니다</p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-sm font-medium">2026년 3월 9일</p>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary flex items-center gap-1">
              <Building2 className="h-3 w-3" /> 실내연습장
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 flex items-center gap-1">
              <Crown className="h-3 w-3" /> 프로 멤버십
            </span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi) => (
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
        {/* Business Metrics */}
        <Card className="lg:col-span-2 bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              핵심 KPI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {businessMetrics.map((m) => (
                <div key={m.label} className="p-3 rounded-lg bg-muted/30">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-muted-foreground">{m.label}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${m.status === "good" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                      목표 {m.target}
                    </span>
                  </div>
                  <span className="text-xl font-bold">{m.value}</span>
                  <Progress value={m.progress} className="h-1.5 mt-2" />
                </div>
              ))}
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
              {urgentIssues.map((issue, i) => (
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
              {recentOutputs.map((item, i) => (
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
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendedActions.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => navigate(item.url)}>
                  <span className="text-sm">{item.action}</span>
                  <span className="text-xs text-primary px-2 py-0.5 rounded bg-primary/10">{item.tool}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholders */}
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
