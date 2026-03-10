import { Bookmark, Bot, Settings2, TrendingUp, Megaphone, Palette, Briefcase, Search, MessageSquare, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { Badge } from "@/components/ui/badge";

const categories = [
  { key: "AI 비서", icon: Bot, desc: "오늘의 할 일, 추천 액션, 체크리스트 등", examples: ["오늘의 할 일 목록", "이번 주 추천 액션", "놓치고 있는 항목"] },
  { key: "AI 운영팀", icon: Settings2, desc: "AI 진단, 요금결정, KPI 분석 결과 등", examples: ["매출 하락 원인 진단", "요금 체계 분석", "KPI 추이 리포트"] },
  { key: "AI 영업팀", icon: TrendingUp, desc: "고객관리, 재등록, 판매 제안 결과 등", examples: ["재등록 대상 분석", "미방문 고객 리스트", "VIP 관리 리포트"] },
  { key: "AI 마케팅팀", icon: Megaphone, desc: "마케팅 카피, 이벤트, 프로모션 결과 등", examples: ["프로모션 문구", "이벤트 기획안", "시즌 캠페인 제안"] },
  { key: "AI 디자인팀", icon: Palette, desc: "디자인 요청, 배너, 템플릿 결과물 등", examples: ["배너 디자인", "포스터 제작물", "템플릿 결과물"] },
  { key: "AI 경영지원", icon: Briefcase, desc: "계약서, 서식, 체크리스트 초안 등", examples: ["발주서 초안", "업무 체크리스트", "리스크 검토 결과"] },
  { key: "시장조사", icon: Search, desc: "시장조사 보고서, 경쟁사 분석 등", examples: ["경쟁사 리스트", "시장 인사이트", "추천 액션"] },
  { key: "전담 컨설턴트", icon: MessageSquare, desc: "전담 컨설턴트 결과물, 리포트 등", examples: ["컨설팅 리포트", "전략 분석 결과", "제작 결과물"] },
];

export default function SavedPage() {
  const { label } = useBusinessContext();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bookmark className="h-6 w-6 text-primary" />
          저장된 결과
        </h1>
        <p className="text-muted-foreground text-sm mt-1">저장한 AI 생성 결과를 카테고리별로 관리하세요</p>
      </div>

      <Card className="bg-muted/20 border-border/30">
        <CardContent className="pt-3 pb-3 flex items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            현재 업종: <span className="text-primary font-medium">{label}</span> · 필터 기능 준비 중
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="AI 비서" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/30 p-1">
          {categories.map((cat) => (
            <TabsTrigger key={cat.key} value={cat.key} className="text-xs px-3 py-1.5 gap-1.5">
              <cat.icon className="h-3 w-3" />
              {cat.key}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat.key} value={cat.key}>
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <cat.icon className="h-4 w-4 text-primary" />
                  {cat.key} 결과
                </CardTitle>
                <CardDescription>{cat.desc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2 mb-3">
                  {cat.examples.map((ex, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] text-muted-foreground">{ex}</Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">저장된 {cat.key} 결과가 없습니다.</p>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
