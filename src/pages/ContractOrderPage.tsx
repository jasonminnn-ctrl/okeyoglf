import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GenerationFlow } from "@/components/GenerationFlow";
import { FileSignature, Loader2 } from "lucide-react";
import { PresetGroup } from "@/components/PresetButton";

const presets = [
  { label: "장비 발주서 정리", value: "equipment" },
  { label: "협력사 계약 정리", value: "partner" },
  { label: "소모품 구매 정리", value: "supplies" },
];

const presetInputs: Record<string, Record<string, string>> = {
  equipment: { category: "장비 발주", vendor: "장비 업체 A", details: "시뮬레이터 교체 3대, 매트 교체 10장, 타격판 5개" },
  partner: { category: "협력사 계약", vendor: "레슨 프로 / 유지보수 업체", details: "프로 계약 갱신 2건, 유지보수 계약 1건" },
  supplies: { category: "소모품 구매", vendor: "사무용품 / 비품 업체", details: "골프공 500개, 티 1000개, 청소용품 세트" },
};

export default function ContractOrderPage() {
  const [form, setForm] = useState({ category: "", vendor: "", details: "" });

  const handlePreset = (key: string) => {
    const p = presetInputs[key];
    if (p) setForm(p);
  };

  return (
    <GenerationFlow
      pipelineKey="ai-support/contract-order"
      title="계약/발주/구매 정리"
      description="계약서, 발주서, 구매 내역을 AI가 정리합니다"
      icon={<FileSignature className="h-6 w-6 text-primary" />}
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
            <CardHeader className="pb-3"><CardTitle className="text-sm">계약/발주 정보</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">구분</Label>
                  <Input placeholder="예: 장비 발주, 계약 갱신" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">거래처/업체</Label>
                  <Input placeholder="예: 장비 업체 A" value={form.vendor} onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))} className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">상세 내역</Label>
                  <Textarea placeholder="발주/구매 항목, 수량, 조건 등" value={form.details} onChange={e => setForm(p => ({ ...p, details: e.target.value }))} rows={4} className="text-xs resize-none" />
                </div>
                <Button onClick={() => onGenerate(form)} disabled={loading} className="w-full">
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />정리 중...</> : "계약/발주 정리"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </GenerationFlow>
  );
}
