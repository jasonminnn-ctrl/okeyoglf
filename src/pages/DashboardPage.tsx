import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, FileText, Megaphone, ClipboardList, TrendingUp, Users, Activity, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const stats = [
  { label: "이번 주 AI 진단", value: "12", icon: Brain, change: "+3" },
  { label: "생성된 보고서", value: "8", icon: FileText, change: "+2" },
  { label: "마케팅 카피", value: "24", icon: Megaphone, change: "+7" },
  { label: "직원 지시서", value: "15", icon: ClipboardList, change: "+4" },
];

const quickActions = [
  { title: "AI 진단 시작", desc: "비즈니스 현황을 분석하세요", icon: Brain, url: "/diagnosis", color: "bg-primary/10 text-primary" },
  { title: "보고서 생성", desc: "대표/사장 보고서를 작성하세요", icon: FileText, url: "/reports", color: "bg-info/10 text-info" },
  { title: "마케팅 카피 작성", desc: "캠페인 문구를 생성하세요", icon: Megaphone, url: "/marketing", color: "bg-warning/10 text-warning" },
  { title: "직원 지시서 작성", desc: "명확한 업무 지시를 만드세요", icon: ClipboardList, url: "/instructions", color: "bg-accent-foreground/10 text-accent-foreground" },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
        <p className="text-muted-foreground text-sm mt-1">OkeyGolf AI Manager 운영 현황</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-xs text-success mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> {stat.change} 이번 주
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">빠른 실행</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Card
              key={action.title}
              className="cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => navigate(action.url)}
            >
              <CardContent className="pt-6">
                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm">{action.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{action.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              최근 활동
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { text: "AI 진단 완료 - 매출 하락 원인 분석", time: "2시간 전" },
                { text: "마케팅 카피 생성 - 봄 시즌 프로모션", time: "4시간 전" },
                { text: "직원 지시서 작성 - 레슨 프로 업무 가이드", time: "어제" },
                { text: "운영 보고서 생성 - 3월 월간 보고", time: "2일 전" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm">{item.text}</span>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              이용 통계
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "AI 진단", pct: 65 },
                { label: "보고서 생성", pct: 45 },
                { label: "마케팅 카피", pct: 80 },
                { label: "직원 지시서", pct: 55 },
              ].map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span>{item.label}</span>
                    <span className="text-muted-foreground">{item.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
