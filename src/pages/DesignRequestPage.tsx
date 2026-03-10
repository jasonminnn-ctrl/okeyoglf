import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GenerationFlow } from "@/components/GenerationFlow";
import { PenTool, Loader2 } from "lucide-react";

export default function DesignRequestPage() {
  const [form, setForm] = useState({ type: "", purpose: "", message: "", tone: "" });

  return (
    <GenerationFlow
      pipelineKey="ai-design/request"
      title="디자인 요청"
      description="홍보물 디자인 브리프를 AI가 작성합니다"
      icon={<PenTool className="h-6 w-6 text-primary" />}
      backUrl="/ai-design"
    >
      {({ onGenerate, loading }) => (
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm">디자인 요청 정보</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">제작물 유형</Label>
                  <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="선택" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banner">배너</SelectItem>
                      <SelectItem value="poster">포스터</SelectItem>
                      <SelectItem value="flyer">전단지</SelectItem>
                      <SelectItem value="card">카드뉴스</SelectItem>
                      <SelectItem value="sns">SNS 콘텐츠</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">톤앤매너</Label>
                  <Select value={form.tone} onValueChange={v => setForm(p => ({ ...p, tone: v }))}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="선택" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bright">밝고 활기찬</SelectItem>
                      <SelectItem value="premium">프리미엄</SelectItem>
                      <SelectItem value="trust">신뢰감</SelectItem>
                      <SelectItem value="seasonal">시즌감</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">용도</Label>
                <Input placeholder="예: 봄시즌 프로모션 홍보" value={form.purpose} onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))} className="h-9 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">핵심 메시지</Label>
                <Textarea placeholder="전달하고 싶은 핵심 내용" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={3} className="text-xs resize-none" />
              </div>
              <Button onClick={() => onGenerate(form)} disabled={loading} className="w-full">
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />생성 중...</> : "디자인 브리프 생성"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </GenerationFlow>
  );
}
