import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { OutputCard } from "@/components/OutputCard";
import { ClipboardList, Loader2 } from "lucide-react";

export default function InstructionsPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, string> | null>(null);
  const [form, setForm] = useState({
    staffName: "", role: "", task: "", deadline: "", context: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setResults({
        "업무 지시서": `수신: ${form.staffName || "김프로"} (${form.role || "레슨 프로"})\n발신: 운영팀장\n일자: 2026년 3월 9일\n\n[업무 지시]\n\n${form.task || "봄 시즌 그룹 레슨 프로그램 커리큘럼을 작성하고 시범 운영해주세요."}\n\n본 업무는 봄 시즌 프로모션과 연계하여 신규 회원 유입을 극대화하기 위한 핵심 과제입니다. 체계적인 커리큘럼 수립을 통해 레슨 품질을 표준화하고, 회원 만족도를 향상시키는 것이 목표입니다.\n\n완료 기한: ${form.deadline || "2026년 3월 15일"}\n\n문의사항은 운영팀장에게 연락해주세요.`,
        "체크리스트": "□ 기존 레슨 프로그램 현황 분석 완료\n□ 수준별(초급/중급/고급) 커리큘럼 초안 작성\n□ 주차별 학습 목표 및 내용 정리\n□ 필요 교구 및 장비 목록 작성\n□ 운영팀장 1차 검토 및 피드백 반영\n□ 시범 그룹 레슨 1회 실시\n□ 참가자 피드백 수집\n□ 최종 커리큘럼 확정 및 제출",
        "완료 기준": "1. 초급/중급/고급 3개 과정의 8주 커리큘럼이 문서화되어야 합니다\n2. 각 주차별 학습 목표, 드릴 내용, 예상 소요 시간이 명시되어야 합니다\n3. 시범 레슨 참가자 만족도가 4.0/5.0 이상이어야 합니다\n4. 운영팀장의 최종 승인을 받아야 합니다",
        "주의 사항": "⚠ 기존 개인 레슨 스케줄과 충돌하지 않도록 시간대를 조율해주세요\n⚠ 안전 관련 주의사항을 커리큘럼에 반드시 포함해주세요\n⚠ 장비 추가 구매가 필요한 경우 사전에 운영팀에 예산 승인을 받아주세요\n⚠ 시범 레슨 일정은 최소 3일 전에 참가자에게 안내해주세요",
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" />
          직원 지시서 생성기
        </h1>
        <p className="text-muted-foreground text-sm mt-1">명확하고 체계적인 직원 업무 지시서를 자동으로 생성합니다</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">지시서 정보 입력</CardTitle>
          <CardDescription>업무 지시 대상과 내용을 입력해주세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>직원 이름</Label>
                <Input placeholder="예: 김프로" value={form.staffName} onChange={e => setForm(p => ({ ...p, staffName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>직책/역할</Label>
                <Input placeholder="예: 레슨 프로" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>업무 내용</Label>
              <Textarea placeholder="지시할 업무 내용을 상세히 입력해주세요" value={form.task} onChange={e => setForm(p => ({ ...p, task: e.target.value }))} rows={4} />
            </div>
            <div className="space-y-2">
              <Label>완료 기한</Label>
              <Input placeholder="예: 2026년 3월 15일" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>배경/맥락</Label>
              <Textarea placeholder="이 업무가 필요한 배경이나 맥락을 설명해주세요" value={form.context} onChange={e => setForm(p => ({ ...p, context: e.target.value }))} rows={3} />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />지시서 생성 중...</> : "지시서 생성"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">생성된 지시서</h2>
          {Object.entries(results).map(([title, content]) => (
            <OutputCard key={title} title={title} content={content} onSave={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}
