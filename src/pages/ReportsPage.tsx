import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OutputCard } from "@/components/OutputCard";
import { FileText, Loader2 } from "lucide-react";

const reportTypes = [
  { value: "ceo", label: "대표 보고용" },
  { value: "owner", label: "사장 보고용" },
  { value: "operations", label: "운영 보고용" },
  { value: "marketing", label: "마케팅 제안용" },
];

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [reportType, setReportType] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setResult(`[${reportTypes.find(r => r.value === reportType)?.label}]\n\n제목: 2026년 3월 운영 현황 보고\n\n1. 요약\n금월 전체 매출은 전월 대비 12% 증가한 4,800만원을 기록하였으며, 주중 오전 타석 가동률 개선 시책이 효과를 나타내고 있습니다.\n\n2. 주요 성과\n- 신규 회원 가입: 47명 (전월 대비 +15명)\n- 타석 가동률: 평균 68% (전월 62%)\n- 레슨 프로그램 참여율: 34% → 41%\n- 고객 만족도: 4.2/5.0 (전월 3.9)\n\n3. 개선 필요 사항\n- 주말 오후 시간대 대기 시간 과다 (평균 25분)\n- F&B 매출 정체 (전월 대비 +2%)\n- 주차장 혼잡 민원 3건 접수\n\n4. 향후 계획\n- 4월 봄 시즌 프로모션 실행 예정\n- 타석 예약 시스템 도입 검토\n- 직원 서비스 교육 프로그램 시행\n\n5. 건의 사항\n- 야간 조명 교체 예산 승인 요청 (예상 비용: 800만원)\n- 레슨 프로 1명 추가 채용 제안\n\n보고일: 2026년 3월 9일\n작성자: 운영팀`);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          보고서 생성기
        </h1>
        <p className="text-muted-foreground text-sm mt-1">보고 유형에 맞는 전문 보고서를 자동으로 생성합니다</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">보고서 설정</CardTitle>
          <CardDescription>보고서 유형과 내용을 입력해주세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>보고서 유형</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger><SelectValue placeholder="보고서 유형 선택" /></SelectTrigger>
                <SelectContent>
                  {reportTypes.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>보고 내용 / 핵심 데이터</Label>
              <Textarea placeholder="보고서에 포함할 핵심 내용, 데이터, 성과 등을 입력해주세요" value={content} onChange={e => setContent(e.target.value)} rows={6} />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />보고서 생성 중...</> : "보고서 생성"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && <OutputCard title="생성된 보고서" content={result} onSave={() => {}} />}
    </div>
  );
}
