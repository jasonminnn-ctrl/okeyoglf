import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OutputCard } from "@/components/OutputCard";
import { Megaphone, Loader2 } from "lucide-react";

export default function MarketingPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, string> | null>(null);
  const [form, setForm] = useState({
    campaignType: "", audience: "", offer: "", limitations: "", tone: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setResults({
        "문자 문안": "[OkeyGolf] 봄맞이 특별 이벤트!\n주중 오전(06-10시) 타석 이용료 30% 할인\n기간: 3/10~3/31\n선착순 100명 한정\n예약: 031-XXX-XXXX\n수신거부: 080-XXX-XXXX",
        "카카오톡 문안": "🏌️ 봄 시즌, 새로운 시작을 OkeyGolf와 함께!\n\n✅ 주중 오전 30% 할인\n✅ 신규 등록 시 무료 레슨 1회 제공\n✅ 친구 추천 시 양쪽 모두 10% 추가 할인\n\n📅 이벤트 기간: 3월 10일 ~ 3월 31일\n📞 문의: 031-XXX-XXXX\n\n▶ 지금 바로 예약하세요!",
        "이벤트 소개 문구": "골프의 계절이 돌아왔습니다.\n\nOkeyGolf에서 준비한 '봄맞이 스윙 페스티벌'로 새 시즌을 시작하세요. 주중 오전 시간대 파격 할인은 물론, 신규 회원을 위한 무료 레슨까지. 이 봄, 당신의 스윙을 한 단계 업그레이드할 기회입니다.",
        "프로모션 공지문": "【공지】봄맞이 스윙 페스티벌 안내\n\n안녕하세요, OkeyGolf입니다.\n\n감사의 마음을 담아 봄 시즌 특별 프로모션을 진행합니다.\n\n▶ 혜택 내용\n1. 주중 오전(06:00-10:00) 타석 이용료 30% 할인\n2. 신규 회원 등록 시 1:1 레슨 1회 무료\n3. 기존 회원 친구 추천 시 양쪽 10% 할인\n\n▶ 이벤트 기간: 2026년 3월 10일(화) ~ 3월 31일(화)\n▶ 적용 대상: 전 회원 및 비회원\n\n많은 참여 부탁드립니다.\n감사합니다.",
        "세일즈 설명 문구": "OkeyGolf의 봄 프로모션은 단순 할인이 아닙니다.\n\n주중 오전 비수요 시간대를 활용한 합리적인 가격으로, 여유로운 환경에서 집중 연습이 가능합니다. 프로 레슨과 결합하면 비용 대비 최고의 연습 효율을 경험하실 수 있습니다.\n\n지금 등록하시면 봄 시즌 내내 혜택을 누리실 수 있습니다.",
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-primary" />
          마케팅 카피 생성기
        </h1>
        <p className="text-muted-foreground text-sm mt-1">캠페인 정보를 입력하면 다양한 채널용 마케팅 문구를 생성합니다</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">캠페인 정보 입력</CardTitle>
          <CardDescription>마케팅 캠페인의 세부 사항을 입력해주세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>캠페인 유형</Label>
                <Select value={form.campaignType} onValueChange={v => setForm(p => ({ ...p, campaignType: v }))}>
                  <SelectTrigger><SelectValue placeholder="유형 선택" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="promotion">프로모션/할인</SelectItem>
                    <SelectItem value="event">이벤트</SelectItem>
                    <SelectItem value="new-program">신규 프로그램</SelectItem>
                    <SelectItem value="seasonal">시즌 캠페인</SelectItem>
                    <SelectItem value="membership">회원 모집</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>톤</Label>
                <Select value={form.tone} onValueChange={v => setForm(p => ({ ...p, tone: v }))}>
                  <SelectTrigger><SelectValue placeholder="톤 선택" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">격식체</SelectItem>
                    <SelectItem value="friendly">친근한</SelectItem>
                    <SelectItem value="urgent">긴급한</SelectItem>
                    <SelectItem value="premium">프리미엄</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>타겟 고객</Label>
              <Input placeholder="예: 30-50대 직장인, 초보 골퍼" value={form.audience} onChange={e => setForm(p => ({ ...p, audience: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>제공 혜택</Label>
              <Textarea placeholder="할인율, 무료 제공 내용, 특전 등" value={form.offer} onChange={e => setForm(p => ({ ...p, offer: e.target.value }))} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>제한 사항</Label>
              <Input placeholder="기간, 인원, 조건 등" value={form.limitations} onChange={e => setForm(p => ({ ...p, limitations: e.target.value }))} />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />카피 생성 중...</> : "마케팅 카피 생성"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">생성된 마케팅 카피</h2>
          {Object.entries(results).map(([title, content]) => (
            <OutputCard key={title} title={title} content={content} onSave={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}
