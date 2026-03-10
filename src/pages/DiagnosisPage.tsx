import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GenerationFlow } from "@/components/GenerationFlow";
import { FEATURE_KEYS } from "@/lib/membership";
import { PresetGroup } from "@/components/PresetButton";
import { Brain, Loader2, Sparkles } from "lucide-react";

const situationPresets = [
  { label: "주중 잔여타임 판매 부진", value: "weekday-sales" },
  { label: "재등록률 하락", value: "renewal-drop" },
  { label: "미방문 고객 증가", value: "inactive-members" },
  { label: "연단체 운영안 필요", value: "group-operations" },
  { label: "이벤트 기획안 필요", value: "event-planning" },
];

const presetInputs: Record<string, { currentIssue: string; goals: string; situation: string; teamStructure: string; urgency: string }> = {
  "weekday-sales": {
    currentIssue: "주중 오전(06:00-10:00) 및 오후(14:00-17:00) 시간대 가동률이 30% 미만으로 수익성이 저하되고 있습니다.",
    goals: "비수요 시간대 가동률을 60% 이상으로 끌어올리고, 평일 매출을 20% 이상 증가시키고자 합니다.",
    situation: "주중 오전 평균 이용 15명, 오후 평균 18명. 월 총 매출 4,500만원 중 주중 비중 35%.",
    teamStructure: "프론트 2명, 레슨 프로 3명, 캐디 마스터 1명, 시설관리 1명",
    urgency: "high",
  },
  "renewal-drop": {
    currentIssue: "회원 재등록률이 3개월 연속 하락 중입니다. 지난달 65%에서 이번 달 58%로 떨어졌습니다.",
    goals: "재등록률 75% 이상 회복, 이탈 예정 회원에 대한 사전 관리 시스템 구축",
    situation: "월 회원 약 300명, 월 만기 회원 평균 40-50명, 평균 유지 기간 6개월",
    teamStructure: "프론트 2명, 레슨 프로 4명, 매니저 1명",
    urgency: "high",
  },
  "inactive-members": {
    currentIssue: "등록된 회원 중 30일 이상 미방문 고객이 전체의 25%를 차지하며, 자연 이탈로 이어지고 있습니다.",
    goals: "미방문 고객 접촉률 80% 이상, 재방문 유도율 40% 달성",
    situation: "전체 회원 320명, 미방문 고객 80명, 평균 결제 금액 15만원/월",
    teamStructure: "프론트 2명, 레슨 프로 3명, CS 담당 없음",
    urgency: "medium",
  },
  "group-operations": {
    currentIssue: "기업체 및 단체 고객 유치를 위한 체계적인 프로그램과 운영 가이드가 없습니다.",
    goals: "연단체 전용 프로그램 3개 이상 개발, 월 2건 이상 단체 계약 체결",
    situation: "현재 단체 계약 1건(월 20명 고정), 단체 문의 월 평균 5건이나 계약 전환 1건 미만",
    teamStructure: "매니저 1명, 프론트 2명, 레슨 프로 4명",
    urgency: "medium",
  },
  "event-planning": {
    currentIssue: "신규 회원 유치와 기존 회원 활성화를 위한 이벤트가 부족합니다.",
    goals: "월 1회 이상 정기 이벤트 실행, 이벤트를 통한 신규 회원 월 15명 이상 확보",
    situation: "현재 이벤트 없음, 신규 가입 월 평균 25명, 주변 경쟁 시설 3곳 활발한 프로모션 진행 중",
    teamStructure: "매니저 1명, 프론트 2명, 레슨 프로 3명, 마케팅 담당 없음",
    urgency: "medium",
  },
};

export default function DiagnosisPage() {
  const [form, setForm] = useState({
    currentIssue: "", goals: "", situation: "", teamStructure: "", urgency: "",
  });

  const handlePreset = (key: string) => {
    const p = presetInputs[key];
    if (p) setForm(p);
  };

  return (
    <GenerationFlow
      pipelineKey="ai-operations/diagnosis"
      featureKey={FEATURE_KEYS.OPERATIONS_DIAGNOSIS}
      title="AI 진단실"
      description="비즈니스 현황을 분석하고 실행 계획을 제안하는 AI 컨설턴트"
      icon={<Brain className="h-6 w-6 text-primary" />}
      backUrl="/ai-operations"
    >
      {({ onGenerate, loading }) => (
        <>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                자주 발생하는 상황
              </CardTitle>
              <CardDescription className="text-xs">클릭하면 입력폼이 자동으로 채워집니다</CardDescription>
            </CardHeader>
            <CardContent>
              <PresetGroup title="" presets={situationPresets} onSelect={handlePreset} />
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">비즈니스 정보 입력</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">긴급도</Label>
                  <Select value={form.urgency} onValueChange={v => setForm(p => ({ ...p, urgency: v }))}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="선택" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">긴급</SelectItem>
                      <SelectItem value="medium">보통</SelectItem>
                      <SelectItem value="low">여유</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">현재 문제점</Label>
                  <Textarea placeholder="현재 겪고 있는 주요 문제" value={form.currentIssue} onChange={e => setForm(p => ({ ...p, currentIssue: e.target.value }))} rows={3} className="text-xs resize-none" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">달성 목표</Label>
                  <Input placeholder="달성하고자 하는 목표" value={form.goals} onChange={e => setForm(p => ({ ...p, goals: e.target.value }))} className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">현재 상황</Label>
                  <Textarea placeholder="매출, 회원 수, 가동률 등" value={form.situation} onChange={e => setForm(p => ({ ...p, situation: e.target.value }))} rows={2} className="text-xs resize-none" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">팀 구성</Label>
                  <Input placeholder="직원 수, 역할 구성" value={form.teamStructure} onChange={e => setForm(p => ({ ...p, teamStructure: e.target.value }))} className="h-9 text-xs" />
                </div>
                <Button onClick={() => onGenerate(form)} disabled={loading} className="w-full">
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />AI 분석 중...</> : "AI 진단 시작"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </GenerationFlow>
  );
}
