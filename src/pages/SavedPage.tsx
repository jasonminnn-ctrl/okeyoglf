import { Bookmark } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const categories = [
  "AI 비서",
  "AI 운영팀",
  "AI 영업팀",
  "AI 마케팅팀",
  "AI 디자인팀",
  "AI 경영지원",
  "시장조사",
  "전담 컨설턴트",
];

export default function SavedPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bookmark className="h-6 w-6 text-primary" />
          저장된 결과
        </h1>
        <p className="text-muted-foreground text-sm mt-1">저장한 AI 생성 결과를 카테고리별로 관리하세요</p>
      </div>

      <Tabs defaultValue="AI 비서" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/30 p-1">
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="text-xs px-3 py-1.5">
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat} value={cat}>
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{cat} 결과</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">저장된 {cat} 결과가 없습니다.</p>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
