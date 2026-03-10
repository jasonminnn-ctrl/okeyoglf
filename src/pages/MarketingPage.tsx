import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GenerationFlow } from "@/components/GenerationFlow";
import { PresetGroup } from "@/components/PresetButton";
import { Megaphone, Loader2, Sparkles } from "lucide-react";

const situationPresets = [
  { label: "주중 잔여타임 판매 부진", value: "weekday-promo" },
  { label: "재등록률 하락 - 유지 캠페인", value: "retention-campaign" },
  { label: "미방문 고객 재방문 유도", value: "reactivation" },
  { label: "이벤트 기획안 필요", value: "event-planning" },
];

const presetInputs: Record<string, { campaignType: string; audience: string; offer: string; limitations: string; tone: string }> = {
  "weekday-promo": {
    campaignType: "promotion",
    audience: "기존 회원 중 주말 이용 패턴 고객, 주변 자영업자, 시니어 골퍼",
    offer: "주중 오전(06:00-10:00) 타석 이용료 30% 할인, 음료 1잔 무료 제공",
    limitations: "3월 10일~31일, 선착순 100명, 사전 예약 필수",
    tone: "friendly",
  },
  "retention-campaign": {
    campaignType: "membership",
    audience: "만기 1개월 내 회원, 최근 이용 빈도 감소 회원",
    offer: "조기 재등록 시 1개월 무료 연장, 레슨 2회 무료 제공, 가족 회원 20% 할인",
    limitations: "만기 2주 전 등록 시에만 적용, 12개월 등록자 한정",
    tone: "formal",
  },
  "reactivation": {
    campaignType: "event",
    audience: "30일 이상 미방문 회원",
    offer: "컴백 특별 이용권(1회 무료), 레슨 프로 1:1 스윙 체크, 골프 용품 할인 쿠폰",
    limitations: "메시지 수신 후 7일 이내 방문 시 적용",
    tone: "friendly",
  },
  "event-planning": {
    campaignType: "event",
    audience: "전 회원 및 비회원, 가족 단위 방문객",
    offer: "가족 골프 체험 데이 - 어린이 무료 체험, 가족 사진 촬영, 미니 대회 및 경품",
    limitations: "4월 첫째 주 토요일, 사전 신청 50가족 한정",
    tone: "friendly",
  },
};

export default function MarketingPage() {
  const [form, setForm] = useState({
    campaignType: "", audience: "", offer: "", limitations: "", tone: "",
  });

  const handlePreset = (key: string) => {
    const p = presetInputs[key];
    if (p) setForm(p);
  };

  return (
    <GenerationFlow
      pipelineKey="ai-marketing/copy"
      title="마케팅 카피 생성기"
      description="다양한 채널에 맞는 마케팅 문구를 한 번에 생성합니다"
      icon={<Megaphone className="h-6 w-6 text-primary" />}
      backUrl="/ai-marketing"
    >
      {({ onGenerate, loading }) => (
        <>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                자주 쓰는 상황
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PresetGroup title="" presets={situationPresets} onSelect={handlePreset} />
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">캠페인 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">캠페인 유형</Label>
                    <Select value={form.campaignType} onValueChange={v => setForm(p => ({ ...p, campaignType: v }))}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="선택" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="promotion">프로모션/할인</SelectItem>
                        <SelectItem value="event">이벤트</SelectItem>
                        <SelectItem value="new-program">신규 프로그램</SelectItem>
                        <SelectItem value="seasonal">시즌 캠페인</SelectItem>
                        <SelectItem value="membership">회원 모집</SelectItem>
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
                        <SelectItem value="urgent">긴급한</SelectItem>
                        <SelectItem value="premium">프리미엄</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">타겟 고객</Label>
                  <Input placeholder="예: 30-50대 직장인, 초보 골퍼" value={form.audience} onChange={e => setForm(p => ({ ...p, audience: e.target.value }))} className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">제공 혜택</Label>
                  <Textarea placeholder="할인율, 무료 제공, 특전 등" value={form.offer} onChange={e => setForm(p => ({ ...p, offer: e.target.value }))} rows={3} className="text-xs resize-none" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">제한 사항</Label>
                  <Input placeholder="기간, 인원, 조건 등" value={form.limitations} onChange={e => setForm(p => ({ ...p, limitations: e.target.value }))} className="h-9 text-xs" />
                </div>
                <Button onClick={() => onGenerate(form)} disabled={loading} className="w-full">
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />카피 생성 중...</> : "마케팅 카피 생성"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </GenerationFlow>
  );
}
