import { Search, Building2, MapPin, Tag, Hash, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConsultantCTA } from "@/components/ConsultantCTA";

export default function MarketResearchPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Search className="h-6 w-6 text-primary" />
          시장조사
        </h1>
        <p className="text-muted-foreground text-sm mt-1">업종·지역·키워드 기반 시장 데이터를 수집하고 분석합니다</p>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">조사 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> 업종</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="업종 선택" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="indoor">실내연습장</SelectItem>
                  <SelectItem value="course">골프장</SelectItem>
                  <SelectItem value="academy">골프아카데미</SelectItem>
                  <SelectItem value="shop">골프샵</SelectItem>
                  <SelectItem value="fitting">피팅샵</SelectItem>
                  <SelectItem value="company">골프회사</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> 지역</Label>
              <Input placeholder="예: 경기도 용인시" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> 키워드</Label>
              <Input placeholder="예: 주중 할인, 레슨 프로그램" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Hash className="h-3.5 w-3.5" /> 수집 개수</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="수집 수 선택" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10건</SelectItem>
                  <SelectItem value="20">20건</SelectItem>
                  <SelectItem value="50">50건</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="w-full md:w-auto">
            <Play className="h-4 w-4 mr-1.5" />
            조사 시작
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">최근 조사 작업</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">아직 진행된 조사가 없습니다. 위에서 조건을 설정하고 조사를 시작해주세요.</p>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">조사 결과</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">조사 결과가 여기에 표시됩니다.</p>
        </CardContent>
      </Card>

      <ConsultantCTA category="시장조사" />
    </div>
  );
}
