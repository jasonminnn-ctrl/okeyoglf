import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OutputCard } from "@/components/OutputCard";
import { PresetGroup } from "@/components/PresetButton";
import { FileText, Loader2, Sparkles } from "lucide-react";

const reportTypes = [
  { value: "ceo", label: "대표 보고용" },
  { value: "owner", label: "사장 보고용" },
  { value: "operations", label: "운영 보고용" },
  { value: "marketing", label: "마케팅 제안용" },
];

const situationPresets = [
  { label: "대표 보고자료 정리 필요", value: "ceo-report" },
  { label: "월간 운영 현황 보고", value: "monthly-ops" },
  { label: "마케팅 성과 보고", value: "marketing-result" },
];

const presetData: Record<string, { reportType: string; content: string }> = {
  "ceo-report": {
    reportType: "ceo",
    content: "3월 매출 4,800만원 (전월 대비 +12%), 신규 회원 47명, 타석 가동률 68%, 주요 이슈: 주중 오전 가동률 개선 필요, 레슨 프로 1명 충원 건의",
  },
  "monthly-ops": {
    reportType: "operations",
    content: "3월 운영 현황: 타석 가동률 68%, 회원 재등록률 72%, 고객 만족도 4.2/5.0, 시설 민원 3건 처리, 직원 근태 이상 없음",
  },
  "marketing-result": {
    reportType: "marketing",
    content: "봄 시즌 프로모션 결과: 참여자 128명, 신규 가입 전환 23명, 프로모션 비용 대비 ROI 180%, 카카오톡 발송 오픈율 45%",
  },
};

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [reportType, setReportType] = useState("");
  const [content, setContent] = useState("");

  const handlePresetSelect = (presetKey: string) => {
    const preset = presetData[presetKey];
    if (preset) {
      setReportType(preset.reportType);
      setContent(preset.content);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const typeLabel = reportTypes.find(r => r.value === reportType)?.label || "보고서";
      setResult(`[${typeLabel}]\n\n제목: 2026년 3월 운영 현황 보고\n\n1. 요약\n금월 전체 매출은 전월 대비 12% 증가한 4,800만원을 기록하였습니다.\n주중 오전 타석 가동률 개선 시책이 효과를 나타내고 있으며, 신규 회원 유입이 증가 추세입니다.\n\n2. 주요 성과\n- 총 매출: 4,800만원 (전월 대비 +12%)\n- 신규 회원 가입: 47명 (전월 대비 +15명)\n- 타석 가동률: 평균 68% (전월 62%)\n- 레슨 프로그램 참여율: 41% (전월 34%)\n- 고객 만족도: 4.2/5.0 (전월 3.9)\n\n3. 세부 분석\n\n3-1. 매출 분석\n- 타석 이용료: 3,200만원 (67%)\n- 레슨 프로그램: 1,100만원 (23%)\n- 부대 수입(음료/용품): 500만원 (10%)\n\n3-2. 회원 현황\n- 총 회원 수: 342명 (+27명)\n- 재등록률: 72% (업계 평균 75%)\n- 미방문 회원: 58명 (17%)\n\n4. 개선 필요 사항\n- 주말 오후 시간대 대기 시간 과다 (평균 25분)\n- F&B 매출 정체 (전월 대비 +2%)\n- 주차장 혼잡 민원 3건 접수\n\n5. 향후 계획\n- 4월 봄 시즌 프로모션 실행 예정\n- 타석 예약 시스템 도입 검토\n- 직원 서비스 교육 프로그램 시행\n\n6. 건의 사항\n- 야간 조명 교체 예산 승인 요청 (예상 비용: 800만원)\n- 레슨 프로 1명 추가 채용 제안\n- 주차 관리 시스템 도입 검토\n\n보고일: 2026년 3월 9일\n작성자: 운영팀`);
      setLoading(false);
    }, 1500);
  };

  const handleRegenerate = () => {
    setResult("");
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          보고서 생성기
        </h1>
        <p className="text-muted-foreground text-sm mt-1">보고 대상에 맞는 전문 보고서를 자동으로 생성합니다</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                빠른 시작
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PresetGroup title="" presets={situationPresets} onSelect={handlePresetSelect} />
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">보고서 설정</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">보고서 유형</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger><SelectValue placeholder="유형 선택" /></SelectTrigger>
                    <SelectContent>
                      {reportTypes.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">핵심 데이터 / 보고 내용</Label>
                  <Textarea placeholder="매출, 회원 수, 성과, 이슈 등 보고서에 포함할 내용" value={content} onChange={e => setContent(e.target.value)} rows={8} className="text-xs resize-none" />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />보고서 생성 중...</> : "보고서 생성"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {result ? (
            <OutputCard title="생성된 보고서" content={result} onSave={() => {}} onRegenerate={handleRegenerate} />
          ) : (
            <Card className="bg-card/50 border-border/50 h-full min-h-[400px] flex items-center justify-center">
              <div className="text-center p-8">
                <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">빠른 시작 프리셋을 선택하거나<br />보고서 정보를 입력하세요</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
