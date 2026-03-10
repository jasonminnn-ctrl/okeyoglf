import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GenerationFlow } from "@/components/GenerationFlow";
import { PresetGroup } from "@/components/PresetButton";
import { Calendar, Loader2, Sparkles } from "lucide-react";

const presets = [
  { label: "비수요 시간대 활성화 프로모션", value: "off-peak" },
  { label: "시즌 신규 고객 유치", value: "season-new" },
  { label: "기존 고객 재방문 유도", value: "retention" },
  { label: "제휴/협업 이벤트", value: "partnership" },
];

const presetInputs: Record<string, { goal: string; budget: string; duration: string; target: string }> = {
  "off-peak": { goal: "비수요 시간대 가동률 60% 달성", budget: "50만원 이내", duration: "2weeks", target: "주변 자영업자, 시니어, 주부" },
  "season-new": { goal: "신규 고객 월 30명 유치", budget: "100만원 이내", duration: "1month", target: "골프 입문자, 20-30대" },
  "retention": { goal: "미방문 고객 30% 복귀", budget: "30만원 이내", duration: "2weeks", target: "30일 이상 미방문 기존 고객" },
  "partnership": { goal: "제휴처 3곳 확보, 상호 프로모션", budget: "50만원 이내", duration: "1month", target: "주변 상권 제휴 대상" },
};

export default function PromotionPlanPage() {
  const [form, setForm] = useState({ goal: "", budget: "", duration: "", target: "" });

  const handlePreset = (key: string) => {
    const p = presetInputs[key];
    if (p) setForm(p);
  };

  return (
    <GenerationFlow
      pipelineKey="ai-marketing/promotion"
      featureKey={FEATURE_KEYS.MARKETING_PROMOTION}
      title="프로모션 기획"
      description="프로모션 기획안을 AI가 구조화하여 제안합니다"
      icon={<Calendar className="h-6 w-6 text-primary" />}
      backUrl="/ai-marketing"
    >
      {({ onGenerate, loading }) => (
        <>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> 빠른 시작</CardTitle>
            </CardHeader>
            <CardContent>
              <PresetGroup title="" presets={presets} onSelect={handlePreset} />
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3"><CardTitle className="text-sm">프로모션 정보</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">프로모션 목표</Label>
                  <Textarea placeholder="예: 비수요 시간대 가동률 60% 달성" value={form.goal} onChange={e => setForm(p => ({ ...p, goal: e.target.value }))} rows={2} className="text-xs resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">예산</Label>
                    <Input placeholder="예: 50만원" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">기간</Label>
                    <Select value={form.duration} onValueChange={v => setForm(p => ({ ...p, duration: v }))}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="선택" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1week">1주</SelectItem>
                        <SelectItem value="2weeks">2주</SelectItem>
                        <SelectItem value="1month">1개월</SelectItem>
                        <SelectItem value="season">시즌</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">타겟 고객</Label>
                  <Input placeholder="예: 주변 자영업자, 시니어" value={form.target} onChange={e => setForm(p => ({ ...p, target: e.target.value }))} className="h-9 text-xs" />
                </div>
                <Button onClick={() => onGenerate(form)} disabled={loading} className="w-full">
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />기획 중...</> : "프로모션 기획안 생성"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </GenerationFlow>
  );
}
