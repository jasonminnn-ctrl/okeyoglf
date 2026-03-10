import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GenerationFlow } from "@/components/GenerationFlow";
import { PresetGroup } from "@/components/PresetButton";
import { RefreshCcw, Loader2, Sparkles } from "lucide-react";

const presets = [
  { label: "만기 임박 회원 재등록 유도", value: "expiring" },
  { label: "이탈 위험 회원 특별 관리", value: "at-risk" },
  { label: "장기 미접촉 회원 복귀", value: "long-inactive" },
];

const presetInputs: Record<string, { targetGroup: string; currentRate: string; incentive: string }> = {
  "expiring": { targetGroup: "만기 2주 이내 회원 47명", currentRate: "재등록률 65%, 전월 대비 7% 하락", incentive: "조기 재등록 시 1개월 무료 연장" },
  "at-risk": { targetGroup: "방문 빈도 50% 이상 감소 회원 16명", currentRate: "이탈 예상률 35%", incentive: "1:1 상담 + 맞춤 혜택 제공" },
  "long-inactive": { targetGroup: "60일 이상 미방문 회원 22명", currentRate: "자연 이탈률 80%", incentive: "컴백 특별 이용권 + 무료 체험" },
};

export default function ReRegistrationPage() {
  const [form, setForm] = useState({ targetGroup: "", currentRate: "", incentive: "" });

  const handlePreset = (key: string) => {
    const p = presetInputs[key];
    if (p) setForm(p);
  };

  return (
    <GenerationFlow
      pipelineKey="ai-sales/re-registration"
      title="재등록 관리"
      description="재등록 대상 고객 분석 및 유도 전략을 AI가 제안합니다"
      icon={<RefreshCcw className="h-6 w-6 text-primary" />}
      backUrl="/ai-sales"
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
            <CardHeader className="pb-3"><CardTitle className="text-sm">재등록 관리 정보</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">대상 고객군</Label>
                  <Textarea placeholder="예: 만기 2주 이내 회원 47명" value={form.targetGroup} onChange={e => setForm(p => ({ ...p, targetGroup: e.target.value }))} rows={2} className="text-xs resize-none" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">현재 재등록률</Label>
                  <Input placeholder="예: 65%" value={form.currentRate} onChange={e => setForm(p => ({ ...p, currentRate: e.target.value }))} className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">제공 가능 인센티브</Label>
                  <Input placeholder="예: 1개월 무료 연장" value={form.incentive} onChange={e => setForm(p => ({ ...p, incentive: e.target.value }))} className="h-9 text-xs" />
                </div>
                <Button onClick={() => onGenerate(form)} disabled={loading} className="w-full">
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />분석 중...</> : "재등록 전략 생성"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </GenerationFlow>
  );
}
