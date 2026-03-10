import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { GenerationFlow } from "@/components/GenerationFlow";
import { PresetGroup } from "@/components/PresetButton";
import { Zap, Loader2, Sparkles } from "lucide-react";

const presets = [
  { label: "매출 개선 + 고객 관리 집중 주간", value: "revenue-focus" },
  { label: "프로모션 실행 + 채널 활성화", value: "promo-channel" },
  { label: "운영 효율화 + 비용 절감", value: "efficiency" },
];

const presetInputs: Record<string, Record<string, string>> = {
  "revenue-focus": { weekGoal: "주간 매출 10% 증가, 미방문 고객 20명 접촉", currentStatus: "이번 주 매출 전주 대비 5% 하락, 미방문 고객 34명" },
  "promo-channel": { weekGoal: "봄시즌 프로모션 실행, SNS 콘텐츠 3건 게시", currentStatus: "프로모션 기획 완료, 콘텐츠 소재 준비 중" },
  "efficiency": { weekGoal: "인력 배치 최적화, 불필요 비용 항목 검토", currentStatus: "주중 오전 인력 과잉, 주말 인력 부족" },
};

export default function WeeklyActionsPage() {
  const [form, setForm] = useState({ weekGoal: "", currentStatus: "" });

  const handlePreset = (key: string) => {
    const p = presetInputs[key];
    if (p) setForm(p);
  };

  return (
    <GenerationFlow
      pipelineKey="ai-assistant/weekly-actions"
      title="이번 주 추천 액션"
      description="이번 주에 집중해야 할 핵심 액션을 AI가 제안합니다"
      icon={<Zap className="h-6 w-6 text-primary" />}
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
            </CardHeader>
            <CardContent>
              <PresetGroup title="" presets={presets} onSelect={handlePreset} />
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3"><CardTitle className="text-sm">주간 목표 입력</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">이번 주 목표</Label>
                  <Textarea placeholder="이번 주 달성하고 싶은 목표" value={form.weekGoal} onChange={e => setForm(p => ({ ...p, weekGoal: e.target.value }))} rows={3} className="text-xs resize-none" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">현재 상황</Label>
                  <Textarea placeholder="현재 운영 상황, 지난 주 이슈 등" value={form.currentStatus} onChange={e => setForm(p => ({ ...p, currentStatus: e.target.value }))} rows={3} className="text-xs resize-none" />
                </div>
                <Button onClick={() => onGenerate(form)} disabled={loading} className="w-full">
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />생성 중...</> : "추천 액션 생성"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </GenerationFlow>
  );
}
