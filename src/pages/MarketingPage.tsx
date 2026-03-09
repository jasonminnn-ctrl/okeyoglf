import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OutputCard } from "@/components/OutputCard";
import { PresetGroup } from "@/components/PresetButton";
import { Megaphone, Loader2, Sparkles } from "lucide-react";

const situationPresets = [
  { label: "주중 잔여타임 판매 부진", value: "weekday-promo" },
  { label: "재등록률 하락 - 유지 캠페인", value: "retention-campaign" },
  { label: "미방문 고객 재방문 유도", value: "reactivation" },
  { label: "이벤트 기획안 필요", value: "event-planning" },
];

const presetData: Record<string, { campaignType: string; audience: string; offer: string; limitations: string; tone: string }> = {
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
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, string> | null>(null);
  const [form, setForm] = useState({
    campaignType: "", audience: "", offer: "", limitations: "", tone: "",
  });

  const handlePresetSelect = (presetKey: string) => {
    const preset = presetData[presetKey];
    if (preset) setForm(preset);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setResults({
        "📱 문자 메시지 (SMS)": `[OkeyGolf] 봄맞이 특별 혜택!\n\n주중 오전 30% 할인\n기간: 3/10~3/31\n선착순 100명 한정\n\n예약: 031-XXX-XXXX\n\n수신거부 080-XXX-XXXX`,
        "💬 카카오톡 알림톡": `🏌️ 봄 시즌, 새로운 시작을 OkeyGolf와 함께!\n\n✅ 주중 오전(06:00-10:00) 30% 할인\n✅ 음료 1잔 무료 제공\n✅ 사전 예약 시 우선 배정\n\n📅 이벤트 기간\n3월 10일(화) ~ 3월 31일(화)\n\n⏰ 선착순 100명 한정\n\n📞 예약 문의: 031-XXX-XXXX\n\n▶ 지금 바로 예약하세요!`,
        "📢 이벤트 소개 문구": `[봄맞이 스윙 페스티벌]\n\n골프의 계절이 돌아왔습니다.\n\nOkeyGolf에서 준비한 특별 프로모션으로 새 시즌을 시작하세요.\n\n주중 오전 파격 할인은 물론, 음료 서비스까지.\n\n여유로운 오전 시간, 최적의 컨디션에서 연습하세요.\n\n이 봄, 당신의 스윙을 한 단계 업그레이드할 기회입니다.`,
        "📋 프로모션 공지문": `【공지】봄맞이 스윙 페스티벌 안내\n\n안녕하세요, OkeyGolf입니다.\n\n감사의 마음을 담아 봄 시즌 특별 프로모션을 진행합니다.\n\n▶ 혜택 내용\n1. 주중 오전(06:00-10:00) 타석 이용료 30% 할인\n2. 이용 시 음료 1잔 무료 제공\n3. 사전 예약 고객 우선 배정\n\n▶ 이벤트 기간\n2026년 3월 10일(화) ~ 3월 31일(화)\n\n▶ 참여 방법\n- 전화 또는 카카오톡으로 사전 예약\n- 선착순 100명 한정\n\n▶ 유의사항\n- 타 할인과 중복 적용 불가\n- 예약 미이행 시 다음 이용 제한\n\n많은 참여 부탁드립니다.\n감사합니다.\n\nOkeyGolf 운영팀 드림`,
        "💼 세일즈 설명 문구": `왜 주중 오전인가요?\n\n▶ 여유로운 환경\n- 대기 없이 바로 연습 시작\n- 집중력 높은 조용한 분위기\n\n▶ 최적의 컨디션\n- 오전 시간대 신체 활성화\n- 일과 전 효율적인 연습\n\n▶ 합리적인 비용\n- 30% 할인된 가격\n- 음료 서비스 포함\n\n이 가격으로 이런 환경은 지금뿐입니다.\n\n선착순 100명 한정이니 서둘러 예약하세요.`,
      });
      setLoading(false);
    }, 1500);
  };

  const handleRegenerate = () => {
    setResults(null);
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-primary" />
          마케팅 카피 생성기
        </h1>
        <p className="text-muted-foreground text-sm mt-1">다양한 채널에 맞는 마케팅 문구를 한 번에 생성합니다</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                자주 쓰는 상황
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PresetGroup title="" presets={situationPresets} onSelect={handlePresetSelect} />
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">캠페인 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
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
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />카피 생성 중...</> : "마케팅 카피 생성"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {results ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-primary" />
                  생성된 마케팅 카피
                </h2>
              </div>
              {Object.entries(results).map(([title, content]) => (
                <OutputCard key={title} title={title} content={content} onSave={() => {}} onRegenerate={handleRegenerate} />
              ))}
            </>
          ) : (
            <Card className="bg-card/50 border-border/50 h-full min-h-[400px] flex items-center justify-center">
              <div className="text-center p-8">
                <Megaphone className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">상황 프리셋을 선택하거나<br />캠페인 정보를 입력하세요</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
