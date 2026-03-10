import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GenerationFlow } from "@/components/GenerationFlow";
import { FileImage, Loader2 } from "lucide-react";

export default function CopyLayoutPage() {
  const [form, setForm] = useState({ format: "", event: "", details: "", size: "" });

  return (
    <GenerationFlow
      pipelineKey="ai-design/copy-layout"
      title="홍보물 문안 + 레이아웃"
      description="홍보물의 문안과 레이아웃 구성을 AI가 함께 제안합니다"
      icon={<FileImage className="h-6 w-6 text-primary" />}
      backUrl="/ai-design"
    >
      {({ onGenerate, loading }) => (
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm">홍보물 정보</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">홍보물 형식</Label>
                  <Select value={form.format} onValueChange={v => setForm(p => ({ ...p, format: v }))}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="선택" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flyer">전단지</SelectItem>
                      <SelectItem value="poster">포스터</SelectItem>
                      <SelectItem value="banner">배너</SelectItem>
                      <SelectItem value="brochure">리플렛</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">규격</Label>
                  <Select value={form.size} onValueChange={v => setForm(p => ({ ...p, size: v }))}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="선택" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a4">A4</SelectItem>
                      <SelectItem value="a3">A3</SelectItem>
                      <SelectItem value="web">웹용</SelectItem>
                      <SelectItem value="sns">SNS용</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">이벤트/프로모션명</Label>
                <Input placeholder="예: 봄시즌 스윙 페스티벌" value={form.event} onChange={e => setForm(p => ({ ...p, event: e.target.value }))} className="h-9 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">포함할 내용</Label>
                <Textarea placeholder="혜택, 기간, 조건, 연락처 등" value={form.details} onChange={e => setForm(p => ({ ...p, details: e.target.value }))} rows={4} className="text-xs resize-none" />
              </div>
              <Button onClick={() => onGenerate(form)} disabled={loading} className="w-full">
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />생성 중...</> : "문안 + 레이아웃 생성"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </GenerationFlow>
  );
}
