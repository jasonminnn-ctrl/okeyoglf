import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OutputCard } from "@/components/OutputCard";
import { PresetGroup } from "@/components/PresetButton";
import { Brain, Loader2, Sparkles } from "lucide-react";

const situationPresets = [
  { label: "주중 잔여타임 판매 부진", value: "weekday-sales" },
  { label: "재등록률 하락", value: "renewal-drop" },
  { label: "미방문 고객 증가", value: "inactive-members" },
  { label: "연단체 운영안 필요", value: "group-operations" },
  { label: "이벤트 기획안 필요", value: "event-planning" },
];

const presetData: Record<string, { businessType: string; currentIssue: string; goals: string; situation: string; teamStructure: string; urgency: string }> = {
  "weekday-sales": {
    businessType: "driving-range",
    currentIssue: "주중 오전(06:00-10:00) 및 오후(14:00-17:00) 시간대 타석 가동률이 30% 미만으로 수익성이 저하되고 있습니다. 주말 대비 평일 매출 격차가 커지고 있습니다.",
    goals: "주중 비수요 시간대 가동률을 60% 이상으로 끌어올리고, 평일 매출을 20% 이상 증가시키고자 합니다.",
    situation: "총 타석 50개, 주중 오전 평균 이용 15명, 오후 평균 18명. 월 총 매출 4,500만원 중 주중 비중 35%.",
    teamStructure: "프론트 2명, 레슨 프로 3명, 캐디 마스터 1명, 시설관리 1명",
    urgency: "high",
  },
  "renewal-drop": {
    businessType: "driving-range",
    currentIssue: "회원 재등록률이 3개월 연속 하락 중입니다. 지난달 65%에서 이번 달 58%로 떨어졌으며, 이탈 회원의 재가입률도 15%에 불과합니다.",
    goals: "재등록률 75% 이상 회복, 이탈 예정 회원에 대한 사전 관리 시스템 구축",
    situation: "월 회원 약 300명, 월 만기 회원 평균 40-50명, 평균 회원 유지 기간 6개월",
    teamStructure: "프론트 2명, 레슨 프로 4명, 매니저 1명",
    urgency: "high",
  },
  "inactive-members": {
    businessType: "driving-range",
    currentIssue: "등록된 회원 중 30일 이상 미방문 고객이 전체의 25%를 차지하고 있습니다. 이들 중 상당수가 자연 이탈로 이어지고 있습니다.",
    goals: "미방문 고객 접촉률 80% 이상, 재방문 유도율 40% 달성",
    situation: "전체 회원 320명, 미방문 고객 80명, 평균 결제 금액 15만원/월",
    teamStructure: "프론트 2명, 레슨 프로 3명, CS 담당 없음",
    urgency: "medium",
  },
  "group-operations": {
    businessType: "driving-range",
    currentIssue: "기업체 및 단체 고객 유치를 위한 체계적인 프로그램과 운영 가이드가 없어 문의 대응이 일관되지 않습니다.",
    goals: "연단체 전용 프로그램 3개 이상 개발, 월 2건 이상 단체 계약 체결",
    situation: "현재 단체 계약 1건(월 20명 고정), 단체 문의 월 평균 5건이나 계약 전환 1건 미만",
    teamStructure: "매니저 1명, 프론트 2명, 레슨 프로 4명",
    urgency: "medium",
  },
  "event-planning": {
    businessType: "driving-range",
    currentIssue: "신규 회원 유치와 기존 회원 활성화를 위한 이벤트가 부족합니다. 경쟁 시설 대비 프로모션이 단순합니다.",
    goals: "월 1회 이상 정기 이벤트 실행, 이벤트 참여를 통한 신규 회원 월 15명 이상 확보",
    situation: "현재 이벤트 없음, 신규 가입 월 평균 25명, 주변 경쟁 시설 3곳에서 활발한 프로모션 진행 중",
    teamStructure: "매니저 1명, 프론트 2명, 레슨 프로 3명, 마케팅 담당 없음",
    urgency: "medium",
  },
};

export default function DiagnosisPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, string> | null>(null);
  const [form, setForm] = useState({
    businessType: "", currentIssue: "", goals: "", situation: "", teamStructure: "", urgency: "",
  });

  const handlePresetSelect = (presetKey: string) => {
    const preset = presetData[presetKey];
    if (preset) setForm(preset);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setResult({
        "📊 핵심 문제 요약": `현재 가장 시급한 문제는 주중 비수요 시간대의 낮은 가동률입니다.\n\n주중 오전(06:00-10:00) 가동률이 30%로, 업계 평균 50% 대비 현저히 낮습니다. 이로 인해 전체 수익성이 저하되고 있으며, 고정비 대비 매출 효율이 떨어지고 있습니다.\n\n핵심 지표:\n- 주중 오전 가동률: 30% (목표: 60%)\n- 월 매출 손실 추정: 약 800만원\n- 영향 범위: 전체 매출의 18%`,
        "🔍 예상 원인 분석": `1. 타겟 고객 분석 부재\n   - 주중 오전 이용 가능 고객층(자영업자, 시니어, 주부) 대상 마케팅 부족\n   - 시간대별 고객 니즈 파악 미흡\n\n2. 가격 정책의 경직성\n   - 시간대별 차등 요금제 미적용\n   - 비수요 시간대 인센티브 부재\n\n3. 프로그램 다양성 부족\n   - 오전 전용 레슨 프로그램 없음\n   - 시니어/주부 대상 커뮤니티 프로그램 미운영\n\n4. 홍보 채널 한계\n   - 주변 상권 오프라인 홍보 부족\n   - SNS/카카오 마케팅 미활성`,
        "⭐ 우선순위 설정": `[긴급] 즉시 실행\n- 주중 오전 30% 할인 프로모션 기획 및 실행\n- 미방문 회원 대상 평일 이용 유도 문자 발송\n\n[높음] 1주 내 실행\n- 시니어 전용 오전 레슨 패키지 개발\n- 주변 아파트 단지 전단 배포\n\n[중간] 1개월 내 실행\n- 평일 정기권 상품 기획\n- 오전 커뮤니티 프로그램 운영 검토`,
        "📅 이번 주 실행 계획": `월요일:\n- 주중 오전 할인 프로모션 내용 확정\n- 카카오톡 발송 대상자 리스트업 (300명)\n\n화요일:\n- 프로모션 홍보 문구 작성 (마케팅 카피 생성기 활용)\n- 프론트 직원 프로모션 안내 교육\n\n수요일:\n- 카카오톡 프로모션 메시지 발송\n- 방문 고객 대상 평일 이용 혜택 안내\n\n목요일:\n- 시니어 레슨 패키지 초안 작성\n- 레슨 프로와 커리큘럼 협의\n\n금요일:\n- 주간 프로모션 반응 분석\n- 차주 계획 수정 및 보고서 작성`,
        "📆 이번 달 실행 계획": `1주차: 긴급 대응\n- 할인 프로모션 실행\n- 미방문 회원 접촉\n- 프론트 응대 스크립트 정비\n\n2주차: 프로그램 개발\n- 시니어 레슨 패키지 출시\n- 오전 단체 이용 가이드 제작\n- 주변 상권 제휴 검토\n\n3주차: 마케팅 강화\n- 아파트 단지 전단 배포 (2,000매)\n- 네이버 플레이스 리뷰 이벤트\n- 인스타그램 오전 이용 후기 캠페인\n\n4주차: 성과 분석 및 조정\n- 월간 가동률 분석\n- 프로모션 ROI 측정\n- 다음 달 전략 수립`,
        "⚠️ 예상 리스크": `1. 기존 정가 회원 불만\n   - 대응: 기존 회원 대상 추가 혜택 제공 (무료 음료, 레슨 할인)\n   - 커뮤니케이션: "감사 프로모션"으로 포지셔닝\n\n2. 할인에 따른 수익성 저하\n   - 대응: 할인 기간/대상 명확히 제한\n   - 모니터링: 주간 단위 손익 분석\n\n3. 운영 인력 부담 증가\n   - 대응: 프로모션 기간 파트타임 인력 검토\n   - 프로세스: 예약 시스템 활용 최적화`,
        "➡️ 권장 다음 단계": `1. 마케팅 카피 생성기에서 주중 오전 프로모션 문구 작성\n   → "주중 오전 할인" 프리셋 활용\n\n2. 직원 지시서 생성기에서 프론트 직원 안내 매뉴얼 작성\n   → 프로모션 응대 스크립트 포함\n\n3. 보고서 생성기에서 대표 보고용 현황 보고서 작성\n   → 문제 분석 및 실행 계획 요약\n\n4. 2주 후 재진단 실시\n   → 실행 효과 측정 및 전략 조정`,
      });
      setLoading(false);
    }, 2000);
  };

  const handleRegenerate = () => {
    setResult(null);
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI 진단실
          </h1>
          <p className="text-muted-foreground text-sm mt-1">비즈니스 현황을 분석하고 실행 계획을 제안하는 AI 컨설턴트</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                자주 발생하는 상황
              </CardTitle>
              <CardDescription className="text-xs">클릭하면 입력폼이 자동으로 채워집니다</CardDescription>
            </CardHeader>
            <CardContent>
              <PresetGroup
                title=""
                presets={situationPresets}
                onSelect={handlePresetSelect}
              />
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">비즈니스 정보 입력</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">업종</Label>
                    <Select value={form.businessType} onValueChange={v => setForm(p => ({ ...p, businessType: v }))}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="선택" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="driving-range">골프 연습장</SelectItem>
                        <SelectItem value="golf-course">골프장</SelectItem>
                        <SelectItem value="indoor-golf">스크린 골프</SelectItem>
                        <SelectItem value="golf-academy">골프 아카데미</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />AI 분석 중...</> : "AI 진단 시작"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-primary" />
                  AI 진단 결과
                </h2>
              </div>
              {Object.entries(result).map(([title, content]) => (
                <OutputCard key={title} title={title} content={content} onSave={() => {}} onRegenerate={handleRegenerate} />
              ))}
            </>
          ) : (
            <Card className="bg-card/50 border-border/50 h-full min-h-[400px] flex items-center justify-center">
              <div className="text-center p-8">
                <Brain className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">왼쪽에서 상황을 선택하거나<br />정보를 입력하고 AI 진단을 시작하세요</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
