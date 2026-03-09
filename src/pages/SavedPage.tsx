import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark, Brain, FileText, Megaphone, ClipboardList } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";

const savedItems = {
  diagnosis: [
    { title: "매출 하락 원인 분석", date: "2026-03-08", preview: "주중 오전 타석 가동률이 35%로 낮아..." },
    { title: "회원 이탈률 진단", date: "2026-03-05", preview: "기존 회원의 이탈률이 월 8%로..." },
  ],
  reports: [
    { title: "3월 운영 현황 보고", date: "2026-03-09", preview: "금월 전체 매출은 전월 대비 12% 증가..." },
  ],
  marketing: [
    { title: "봄 시즌 프로모션 카피", date: "2026-03-07", preview: "골프의 계절이 돌아왔습니다..." },
    { title: "신규 회원 모집 문구", date: "2026-03-03", preview: "OkeyGolf와 함께 시작하는..." },
  ],
  instructions: [
    { title: "레슨 프로 커리큘럼 지시서", date: "2026-03-06", preview: "봄 시즌 그룹 레슨 프로그램..." },
  ],
};

const categories = [
  { id: "diagnosis", label: "AI 진단", icon: Brain },
  { id: "reports", label: "보고서", icon: FileText },
  { id: "marketing", label: "마케팅", icon: Megaphone },
  { id: "instructions", label: "지시서", icon: ClipboardList },
];

export default function SavedPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bookmark className="h-6 w-6 text-primary" />
          저장된 결과
        </h1>
        <p className="text-muted-foreground text-sm mt-1">카테고리별로 저장된 AI 생성 결과를 확인하세요</p>
      </div>

      <Tabs defaultValue="diagnosis">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          {categories.map(cat => (
            <TabsTrigger key={cat.id} value={cat.id} className="gap-1.5">
              <cat.icon className="h-3.5 w-3.5" />
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(cat => (
          <TabsContent key={cat.id} value={cat.id} className="space-y-3 mt-4">
            {savedItems[cat.id as keyof typeof savedItems].map((item, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-sm">{item.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.date}</p>
                  </div>
                  <CopyButton text={item.preview} />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.preview}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
