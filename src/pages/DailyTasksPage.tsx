import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { GenerationFlow } from "@/components/GenerationFlow";
import { PresetGroup } from "@/components/PresetButton";
import { ListChecks, Loader2, Sparkles } from "lucide-react";

const presets = [
  { label: "미방문 고객 접촉 + 프로모션 점검", value: "contact-promo" },
  { label: "재등록 대상 관리 + 시설 점검", value: "renewal-facility" },
  { label: "이벤트 마감 관리 + 직원 교육", value: "event-training" },
];

const presetInputs: Record<string, Record<string, string>> = {
  "contact-promo": { context: "미방문 30일 이상 고객 34명, 진행 중 프로모션 2건, 주중 오전 가동률 30%", priority: "미방문 고객 복귀 및 가동률 개선" },
  "renewal-facility": { context: "이번 달 재등록 대상 47명, 시설 정기점검 예정, 장비 교체 필요", priority: "재등록률 확보 및 시설 관리" },
  "event-training": { context: "봄시즌 이벤트 마감 D-5, 신규 직원 2명 교육 필요, 프론트 응대 품질 개선", priority: "이벤트 실행 및 서비스 품질" },
};

export default function DailyTasksPage() {
  const [form, setForm] = useState({ context: "", priority: "" });

  const handlePreset = (key: string) => {
    const p = presetInputs[key];
    if (p) setForm(p);
  };

  return (
    <GenerationFlow
      pipelineKey="ai-assistant/daily-tasks"
      title="오늘의 할 일"
      description="비즈니스 현황 기반으로 오늘 우선 처리할 항목을 AI가 정리합니다"
      icon={<ListChecks className="h-6 w-6 text-primary" />}
      backUrl="/ai-assistant"
    >
      {({ onGenerate, loading }) => (
        <>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                빠른 시작
              </CardTitle>
              <CardDescription className="text-xs">상황을 선택하면 자동으로 입력됩니다</CardDescription>
            </CardHeader>
            <CardContent>
              <PresetGroup title="" presets={presets} onSelect={handlePreset} />
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">현재 상황 입력</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">현재 운영 상황</Label>
                  <Textarea placeholder="오늘 처리해야 할 사항, 현재 이슈 등" value={form.context} onChange={e => setForm(p => ({ ...p, context: e.target.value }))} rows={4} className="text-xs resize-none" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">우선순위 / 집중 영역</Label>
                  <Textarea placeholder="오늘 가장 중요한 영역" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} rows={2} className="text-xs resize-none" />
                </div>
                <Button onClick={() => onGenerate(form)} disabled={loading} className="w-full">
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />생성 중...</> : "오늘의 할 일 생성"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </GenerationFlow>
  );
}
