import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark, Brain, FileText, Megaphone, ClipboardList, Trash2 } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import { Button } from "@/components/ui/button";

const savedItems = {
  diagnosis: [
    { title: "매출 하락 원인 분석", date: "2026-03-08", preview: "주중 오전 타석 가동률이 35%로 낮아 전체 매출의 병목이 되고 있습니다. 레슨 프로그램과 연동된 고객 유지 전략이 부재하며..." },
    { title: "회원 이탈률 진단", date: "2026-03-05", preview: "기존 회원의 이탈률이 월 8%로 업계 평균(5%) 대비 높습니다. 주요 원인으로는 레슨 커리큘럼 체계 부족..." },
  ],
  reports: [
    { title: "3월 운영 현황 보고", date: "2026-03-09", preview: "금월 전체 매출은 전월 대비 12% 증가한 4,800만원을 기록하였습니다. 주요 성과로는 신규 회원 47명 가입..." },
    { title: "2월 대표 보고서", date: "2026-02-28", preview: "2월 매출 4,280만원으로 전년 동기 대비 8% 성장하였습니다. 시설 개선 투자 효과가 나타나고 있습니다..." },
  ],
  marketing: [
    { title: "봄 시즌 프로모션 카피", date: "2026-03-07", preview: "골프의 계절이 돌아왔습니다. OkeyGolf에서 준비한 봄맞이 스윙 페스티벌로 새 시즌을 시작하세요..." },
    { title: "신규 회원 모집 문구", date: "2026-03-03", preview: "OkeyGolf와 함께 시작하는 골프 라이프. 초보자를 위한 체계적인 레슨과 편안한 환경을 제공합니다..." },
    { title: "재등록 유도 캠페인", date: "2026-02-25", preview: "소중한 회원님, 함께한 시간이 아쉽습니다. 조기 재등록 시 1개월 무료 연장 혜택을 드립니다..." },
  ],
  instructions: [
    { title: "레슨 프로 커리큘럼 지시서", date: "2026-03-06", preview: "봄 시즌 그룹 레슨 프로그램 커리큘럼을 작성하고 시범 운영해주세요. 초급/중급/고급 3개 과정..." },
    { title: "프론트 프로모션 안내 교육", date: "2026-03-04", preview: "봄맞이 스윙 페스티벌 프로모션 내용을 숙지하고, 방문 고객 및 전화 문의 시 정확히 안내해주세요..." },
  ],
};

const categories = [
  { id: "diagnosis", label: "AI 진단", icon: Brain, count: savedItems.diagnosis.length },
  { id: "reports", label: "보고서", icon: FileText, count: savedItems.reports.length },
  { id: "marketing", label: "마케팅", icon: Megaphone, count: savedItems.marketing.length },
  { id: "instructions", label: "지시서", icon: ClipboardList, count: savedItems.instructions.length },
];

export default function SavedPage() {
  const totalCount = Object.values(savedItems).flat().length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bookmark className="h-6 w-6 text-primary" />
            저장된 결과
          </h1>
          <p className="text-muted-foreground text-sm mt-1">총 {totalCount}개의 AI 생성 결과가 저장되어 있습니다</p>
        </div>
      </div>

      <Tabs defaultValue="diagnosis">
        <TabsList className="grid grid-cols-4 w-full max-w-xl bg-muted/30">
          {categories.map(cat => (
            <TabsTrigger key={cat.id} value={cat.id} className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <cat.icon className="h-3.5 w-3.5" />
              <span>{cat.label}</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-background/50">{cat.count}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(cat => (
          <TabsContent key={cat.id} value={cat.id} className="space-y-3 mt-6">
            {savedItems[cat.id as keyof typeof savedItems].map((item, i) => (
              <Card key={i} className="bg-card/50 border-border/50 hover:border-primary/20 transition-colors">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.date}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <CopyButton text={item.preview} />
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.preview}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
