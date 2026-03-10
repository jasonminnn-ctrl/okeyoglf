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
import { MessageCircle, Loader2, Sparkles } from "lucide-react";

const presets = [
  { label: "재등록 안내 전화", value: "renewal-call" },
  { label: "미방문 고객 복귀 유도", value: "reactivation" },
  { label: "문의 응대 (가격/서비스)", value: "inquiry" },
  { label: "VIP 고객 감사 메시지", value: "vip-thanks" },
];

const presetInputs: Record<string, { scenario: string; channel: string; target: string; tone: string }> = {
  "renewal-call": { scenario: "재등록", channel: "phone", target: "만료 2주 전 회원", tone: "formal" },
  "reactivation": { scenario: "미방문 복귀", channel: "kakao", target: "30일 이상 미방문 고객", tone: "friendly" },
  "inquiry": { scenario: "가격/서비스 문의", channel: "phone", target: "신규 문의 고객", tone: "friendly" },
  "vip-thanks": { scenario: "VIP 감사", channel: "kakao", target: "월 20회 이상 이용 VIP", tone: "premium" },
};

export default function ResponseScriptPage() {
  const [form, setForm] = useState({ scenario: "", channel: "", target: "", tone: "" });

  const handlePreset = (key: string) => {
    const p = presetInputs[key];
    if (p) setForm(p);
  };

  return (
    <GenerationFlow
      pipelineKey="ai-sales/response-script"
      featureKey={FEATURE_KEYS.SALES_RESPONSE}
      title="응대 문안"
      description="상황별 고객 응대 스크립트를 AI가 생성합니다"
      icon={<MessageCircle className="h-6 w-6 text-primary" />}
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
            <CardHeader className="pb-3"><CardTitle className="text-sm">응대 상황 입력</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">응대 채널</Label>
                    <Select value={form.channel} onValueChange={v => setForm(p => ({ ...p, channel: v }))}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="선택" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phone">전화</SelectItem>
                        <SelectItem value="kakao">카카오톡</SelectItem>
                        <SelectItem value="sms">문자</SelectItem>
                        <SelectItem value="email">이메일</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">톤</Label>
                    <Select value={form.tone} onValueChange={v => setForm(p => ({ ...p, tone: v }))}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="선택" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="formal">격식체</SelectItem>
                        <SelectItem value="friendly">친근한</SelectItem>
                        <SelectItem value="premium">프리미엄</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">응대 상황</Label>
                  <Input placeholder="예: 재등록 안내, 미방문 복귀 유도" value={form.scenario} onChange={e => setForm(p => ({ ...p, scenario: e.target.value }))} className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">대상 고객</Label>
                  <Input placeholder="예: 만료 2주 전 회원" value={form.target} onChange={e => setForm(p => ({ ...p, target: e.target.value }))} className="h-9 text-xs" />
                </div>
                <Button onClick={() => onGenerate(form)} disabled={loading} className="w-full">
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />생성 중...</> : "응대 문안 생성"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </GenerationFlow>
  );
}
