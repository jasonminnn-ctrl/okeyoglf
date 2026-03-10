import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GenerationFlow } from "@/components/GenerationFlow";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { PresetGroup } from "@/components/PresetButton";

const presets = [
  { label: "업무 지시서", value: "instruction" },
  { label: "공지사항 초안", value: "notice" },
  { label: "보고서 양식", value: "report" },
  { label: "회의록 양식", value: "minutes" },
];

const presetInputs: Record<string, Record<string, string>> = {
  instruction: { docType: "instruction", purpose: "직원 업무 지시", contents: "프로모션 운영 지침, 고객 응대 변경사항, 시설 관리 항목" },
  notice: { docType: "notice", purpose: "전체 공지", contents: "운영시간 변경, 시설 보수, 이벤트 안내" },
  report: { docType: "report", purpose: "주간/월간 보고", contents: "매출 현황, KPI 달성률, 주요 이슈, 다음 주 계획" },
  minutes: { docType: "minutes", purpose: "회의록 작성", contents: "회의 일시, 참석자, 안건, 결정사항, 후속 조치" },
};

export default function DocumentDraftPage() {
  const [form, setForm] = useState({ docType: "", purpose: "", contents: "" });

  const handlePreset = (key: string) => {
    const p = presetInputs[key];
    if (p) setForm(p);
  };

  return (
    <GenerationFlow
      pipelineKey="ai-support/document-draft"
      title="내부 서식 초안"
      description="내부 문서와 서식을 AI가 초안을 작성합니다"
      icon={<FileSpreadsheet className="h-6 w-6 text-primary" />}
      backUrl="/ai-business-support"
    >
      {({ onGenerate, loading }) => (
        <>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3"><CardTitle className="text-sm">빠른 시작</CardTitle></CardHeader>
            <CardContent>
              <PresetGroup title="" presets={presets} onSelect={handlePreset} />
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3"><CardTitle className="text-sm">서식 정보</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">서식 유형</Label>
                  <Select value={form.docType} onValueChange={v => setForm(p => ({ ...p, docType: v }))}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="선택" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instruction">업무 지시서</SelectItem>
                      <SelectItem value="notice">공지사항</SelectItem>
                      <SelectItem value="report">보고서</SelectItem>
                      <SelectItem value="minutes">회의록</SelectItem>
                      <SelectItem value="checklist">체크리스트</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">용도</Label>
                  <Input placeholder="예: 주간 업무 보고" value={form.purpose} onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))} className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">포함할 내용</Label>
                  <Textarea placeholder="문서에 포함할 항목" value={form.contents} onChange={e => setForm(p => ({ ...p, contents: e.target.value }))} rows={4} className="text-xs resize-none" />
                </div>
                <Button onClick={() => onGenerate(form)} disabled={loading} className="w-full">
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />생성 중...</> : "서식 초안 생성"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </GenerationFlow>
  );
}
