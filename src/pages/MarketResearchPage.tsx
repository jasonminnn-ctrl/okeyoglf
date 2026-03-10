import { Search, Building2, MapPin, Tag, Hash, Play, FileText, Lightbulb, Target, MessageSquare, Bookmark, Paperclip } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ConsultantCTA } from "@/components/ConsultantCTA";
import { BusinessContextBanner } from "@/components/BusinessContextBanner";
import { useBusinessContext, businessTypeLabels, BusinessType } from "@/contexts/BusinessContext";

export default function MarketResearchPage() {
  const { config, label, businessType } = useBusinessContext();

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Search className="h-6 w-6 text-primary" />
          시장조사
        </h1>
        <p className="text-muted-foreground text-sm mt-1">업종·지역·키워드 기반 시장 데이터를 수집하고 분석합니다</p>
      </div>

      <BusinessContextBanner module="시장조사" />

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">조사 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> 업종</Label>
              <Select defaultValue={businessType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(businessTypeLabels) as [BusinessType, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> 지역</Label>
              <Input placeholder={`예: ${config.researchExamples.region}`} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> 키워드</Label>
              <Input placeholder={`예: ${config.researchExamples.keyword}`} />
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

          <Card className="bg-muted/20 border-border/30">
            <CardContent className="pt-3 pb-3">
              <p className="text-[11px] text-muted-foreground">
                💡 추천 조사 포인트: <span className="text-primary">{config.researchExamples.focus}</span>
              </p>
            </CardContent>
          </Card>

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

      {/* Result structure - storage-ready */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">조사 결과</CardTitle>
            <Badge variant="outline" className="text-[10px]">저장 → 시장조사 결과</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Condition summary */}
          <Card className="bg-muted/20 border-border/30">
            <CardContent className="pt-3 pb-3">
              <p className="text-[11px] font-medium mb-1">조사 조건 요약</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-[10px]">업종: {label}</Badge>
                <Badge variant="outline" className="text-[10px]">지역: {config.researchExamples.region}</Badge>
                <Badge variant="outline" className="text-[10px]">키워드: {config.researchExamples.keyword}</Badge>
                <Badge variant="outline" className="text-[10px]">수집: 20건</Badge>
              </div>
            </CardContent>
          </Card>

          {[
            { icon: FileText, label: "조사 요약", desc: "수집된 데이터 요약 리포트", resultType: "조사 결과" },
            { icon: Target, label: "경쟁사 리스트", desc: "주요 경쟁사 현황 정리", resultType: "분석 요약" },
            { icon: Lightbulb, label: "인사이트", desc: "데이터 기반 핵심 인사이트", resultType: "분석 요약" },
            { icon: MessageSquare, label: "추천 액션", desc: "조사 결과 기반 실행 제안", resultType: "제안 요약" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Badge variant="outline" className="text-[9px] text-muted-foreground">{item.resultType}</Badge>
              <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted/30">준비 중</span>
            </div>
          ))}

          {/* Attachment placeholder */}
          <div className="mt-2">
            <p className="text-[11px] text-muted-foreground font-medium mb-2 flex items-center gap-1">
              <Paperclip className="h-3 w-3" /> 첨부파일 / 조사 원본
            </p>
            <div className="h-14 rounded-md border border-dashed border-border/50 flex items-center justify-center text-xs text-muted-foreground">
              조사 원본 파일 · PDF · 스프레드시트 (준비 중)
            </div>
          </div>

          {/* Save + handoff CTAs */}
          <div className="flex items-center gap-2 pt-2">
            <Button variant="outline" size="sm" className="text-xs gap-1.5" disabled>
              <Bookmark className="h-3 w-3" /> 결과 저장
            </Button>
            <Button variant="outline" size="sm" className="text-xs gap-1.5" disabled>
              <MessageSquare className="h-3 w-3" /> 전담 컨설턴트 전환
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConsultantCTA category="시장조사" />
    </div>
  );
}
