import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { OutputCard } from "@/components/OutputCard";
import { PresetGroup } from "@/components/PresetButton";
import { ClipboardList, Loader2, Sparkles } from "lucide-react";

const situationPresets = [
  { label: "직원 업무 지시 정리 필요", value: "general-task" },
  { label: "프로모션 안내 교육", value: "promo-training" },
  { label: "신규 직원 온보딩", value: "onboarding" },
  { label: "시설 점검 지시", value: "facility-check" },
];

const presetData: Record<string, { staffName: string; role: string; task: string; deadline: string; context: string }> = {
  "general-task": {
    staffName: "김프로",
    role: "레슨 프로",
    task: "봄 시즌 그룹 레슨 프로그램 커리큘럼을 작성하고 시범 운영해주세요. 초급/중급/고급 3개 과정, 각 8주 구성으로 설계해주세요.",
    deadline: "2026년 3월 15일",
    context: "봄 시즌 프로모션과 연계하여 신규 회원 유입을 극대화하기 위한 핵심 과제입니다.",
  },
  "promo-training": {
    staffName: "프론트 직원 전원",
    role: "프론트 데스크",
    task: "봄맞이 스윙 페스티벌 프로모션 내용을 숙지하고, 방문 고객 및 전화 문의 시 정확히 안내해주세요.",
    deadline: "2026년 3월 10일",
    context: "3월 10일부터 프로모션이 시작되므로 사전에 모든 직원이 내용을 숙지해야 합니다.",
  },
  "onboarding": {
    staffName: "이신입",
    role: "신규 직원",
    task: "첫 주 온보딩 프로그램을 완료해주세요. 시설 숙지, 업무 프로세스 이해, 선배 직원 동행 근무를 진행합니다.",
    deadline: "2026년 3월 16일",
    context: "첫 주 동안 OkeyGolf의 운영 방식과 고객 응대 기준을 익히는 것이 목표입니다.",
  },
  "facility-check": {
    staffName: "박관리",
    role: "시설 관리",
    task: "봄 시즌 시설 전체 점검을 실시해주세요. 타석 장비, 조명, 에어컨, 주차장 라인 등을 점검하고 수리 필요 항목을 보고해주세요.",
    deadline: "2026년 3월 12일",
    context: "봄 성수기 시작 전 모든 시설이 최상의 상태인지 확인이 필요합니다.",
  },
};

export default function InstructionsPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, string> | null>(null);
  const [form, setForm] = useState({
    staffName: "", role: "", task: "", deadline: "", context: "",
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
        "📋 업무 지시서": `[업무 지시서]\n\n수신: ${form.staffName || "담당자"}\n직책: ${form.role || "담당"}\n발신: 운영팀장\n일자: 2026년 3월 9일\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n▶ 업무 내용\n${form.task || "업무 내용"}\n\n▶ 배경 및 목적\n${form.context || "업무 배경"}\n\n본 업무는 운영 효율화 및 고객 만족도 향상을 위한 핵심 과제입니다.\n성공적인 수행을 위해 아래 체크리스트와 완료 기준을 참고해주세요.\n\n▶ 완료 기한\n${form.deadline || "기한"}\n\n▶ 보고 대상\n운영팀장 (완료 즉시 구두 또는 메시지 보고)\n\n문의사항이 있으시면 언제든 연락해주세요.`,
        "✅ 체크리스트": `□ 관련 자료 및 현황 파악 완료\n□ 실행 계획 수립 및 일정 확인\n□ 필요 인력/장비/예산 확인\n□ 관련 부서/담당자 협조 요청\n□ 1차 실행 및 중간 점검\n□ 운영팀장 중간 보고\n□ 피드백 반영 및 수정\n□ 최종 완료 및 결과 보고\n□ 관련 문서/기록 정리`,
        "🎯 완료 기준": `본 업무는 다음 기준을 충족해야 완료로 인정됩니다:\n\n1. 정량적 기준\n   - 지정된 기한 내 완료\n   - 모든 체크리스트 항목 완수\n   - 관련 문서 제출 완료\n\n2. 정성적 기준\n   - 운영팀장 최종 승인 획득\n   - 품질 기준 충족 (오류/누락 없음)\n   - 관련자 피드백 반영\n\n3. 보고 기준\n   - 완료 즉시 결과 보고\n   - 이슈 발생 시 즉시 공유\n   - 후속 조치 사항 정리`,
        "⚠️ 주의 사항": `1. 일정 관리\n   - 기한 내 완료가 어려울 경우 최소 2일 전 보고\n   - 일정 조율이 필요한 경우 사전 협의 필수\n\n2. 품질 관리\n   - 최종 제출 전 자체 점검 실시\n   - 오탈자, 수치 오류 등 기본 사항 확인\n\n3. 커뮤니케이션\n   - 업무 진행 중 이슈 발생 시 즉시 보고\n   - 관련 부서와 원활한 협조 유지\n   - 고객 영향 사항은 특히 신속 공유\n\n4. 보안/개인정보\n   - 고객 정보 취급 시 보안 규정 준수\n   - 내부 자료 외부 유출 금지`,
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
          <ClipboardList className="h-6 w-6 text-primary" />
          직원 지시서 생성기
        </h1>
        <p className="text-muted-foreground text-sm mt-1">명확하고 체계적인 업무 지시서를 자동으로 생성합니다</p>
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
              <CardTitle className="text-sm">지시서 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">직원 이름</Label>
                    <Input placeholder="예: 김프로" value={form.staffName} onChange={e => setForm(p => ({ ...p, staffName: e.target.value }))} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">직책/역할</Label>
                    <Input placeholder="예: 레슨 프로" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="h-9 text-xs" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">업무 내용</Label>
                  <Textarea placeholder="지시할 업무 내용을 상세히 입력" value={form.task} onChange={e => setForm(p => ({ ...p, task: e.target.value }))} rows={4} className="text-xs resize-none" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">완료 기한</Label>
                  <Input placeholder="예: 2026년 3월 15일" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">배경/맥락</Label>
                  <Textarea placeholder="이 업무가 필요한 배경" value={form.context} onChange={e => setForm(p => ({ ...p, context: e.target.value }))} rows={2} className="text-xs resize-none" />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />지시서 생성 중...</> : "지시서 생성"}
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
                  생성된 지시서
                </h2>
              </div>
              {Object.entries(results).map(([title, content]) => (
                <OutputCard key={title} title={title} content={content} onSave={() => {}} onRegenerate={handleRegenerate} />
              ))}
            </>
          ) : (
            <Card className="bg-card/50 border-border/50 h-full min-h-[400px] flex items-center justify-center">
              <div className="text-center p-8">
                <ClipboardList className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">상황 프리셋을 선택하거나<br />지시서 정보를 입력하세요</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
