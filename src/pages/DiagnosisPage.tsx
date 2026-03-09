import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OutputCard } from "@/components/OutputCard";
import { Brain, Loader2 } from "lucide-react";

export default function DiagnosisPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, string> | null>(null);
  const [form, setForm] = useState({
    businessType: "", currentIssue: "", goals: "", situation: "", teamStructure: "", urgency: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: call AI edge function
    setTimeout(() => {
      setResult({
        "핵심 문제 요약": "주중 오전 타석 가동률이 35%로 낮아 전체 매출의 병목이 되고 있습니다. 레슨 프로그램과 연동된 고객 유지 전략이 부재하며, 기존 회원의 이탈률이 월 8%로 업계 평균(5%) 대비 높습니다.",
        "예상 원인": "1. 주중 오전 시간대 타겟 마케팅 부재\n2. 레슨 프로그램의 체계적 커리큘럼 미비\n3. 회원 피드백 수집 및 반영 시스템 부재\n4. 경쟁 시설 대비 부가 서비스 차별화 부족",
        "우선 순위": "1. 주중 오전 가동률 개선 (긴급)\n2. 회원 이탈 방지 프로그램 도입 (높음)\n3. 레슨 커리큘럼 표준화 (중간)\n4. 고객 만족도 조사 시행 (중간)",
        "이번 주 실행 계획": "- 월: 주중 오전 할인 프로모션 기획 완료\n- 화: 이탈 회원 30명 대상 전화 설문 실시\n- 수: 레슨 프로와 커리큘럼 회의\n- 목: 카카오톡 마케팅 메시지 발송\n- 금: 주간 실행 결과 정리 및 보고",
        "이번 달 실행 계획": "1주차: 현황 분석 및 단기 프로모션 실행\n2주차: 회원 리텐션 프로그램 설계\n3주차: 레슨 커리큘럼 1차 수정 적용\n4주차: 월간 성과 분석 및 다음 달 계획 수립",
        "예상 리스크": "- 할인 프로모션이 기존 정가 회원의 불만을 야기할 수 있음\n- 레슨 프로의 변화 저항 가능성\n- 단기적 비용 증가로 인한 수익성 압박",
        "권장 다음 단계": "1. AI 마케팅 카피 생성기로 주중 오전 프로모션 문구 작성\n2. 직원 지시서 생성기로 프론트 데스크 안내 매뉴얼 작성\n3. 2주 후 재진단으로 개선 효과 측정",
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          AI 진단실
        </h1>
        <p className="text-muted-foreground text-sm mt-1">비즈니스 현황을 입력하면 AI가 문제를 분석하고 실행 계획을 제안합니다</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">비즈니스 정보 입력</CardTitle>
          <CardDescription>정확한 진단을 위해 가능한 상세히 입력해주세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>업종</Label>
                <Select value={form.businessType} onValueChange={v => setForm(p => ({ ...p, businessType: v }))}>
                  <SelectTrigger><SelectValue placeholder="업종 선택" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="driving-range">골프 연습장</SelectItem>
                    <SelectItem value="golf-course">골프장</SelectItem>
                    <SelectItem value="indoor-golf">스크린 골프</SelectItem>
                    <SelectItem value="golf-academy">골프 아카데미</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>긴급도</Label>
                <Select value={form.urgency} onValueChange={v => setForm(p => ({ ...p, urgency: v }))}>
                  <SelectTrigger><SelectValue placeholder="긴급도 선택" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">긴급</SelectItem>
                    <SelectItem value="medium">보통</SelectItem>
                    <SelectItem value="low">여유</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>현재 문제점</Label>
              <Textarea placeholder="현재 겪고 있는 주요 문제를 설명해주세요" value={form.currentIssue} onChange={e => setForm(p => ({ ...p, currentIssue: e.target.value }))} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>목표</Label>
              <Input placeholder="달성하고자 하는 목표" value={form.goals} onChange={e => setForm(p => ({ ...p, goals: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>현재 상황</Label>
              <Textarea placeholder="매출, 회원 수, 가동률 등 현재 상황" value={form.situation} onChange={e => setForm(p => ({ ...p, situation: e.target.value }))} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>팀 구성</Label>
              <Input placeholder="직원 수, 역할 구성 등" value={form.teamStructure} onChange={e => setForm(p => ({ ...p, teamStructure: e.target.value }))} />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />AI 분석 중...</> : "AI 진단 시작"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">진단 결과</h2>
          {Object.entries(result).map(([title, content]) => (
            <OutputCard key={title} title={title} content={content} onSave={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}
