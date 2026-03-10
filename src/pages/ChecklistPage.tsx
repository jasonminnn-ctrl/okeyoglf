import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GenerationFlow } from "@/components/GenerationFlow";
import { ClipboardCheck, Loader2 } from "lucide-react";
import { FEATURE_KEYS } from "@/lib/membership";

export default function ChecklistPage() {
  const [form, setForm] = useState({ scope: "daily", focus: "" });

  return (
    <GenerationFlow
      pipelineKey="ai-assistant/checklist"
      featureKey={FEATURE_KEYS.ASSISTANT_CHECKLIST}
      title="업종별 체크리스트"
      description="업종에 맞는 운영 체크리스트를 AI가 생성합니다"
      icon={<ClipboardCheck className="h-6 w-6 text-primary" />}
      backUrl="/ai-assistant"
    >
      {({ onGenerate, loading }) => (
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm">체크리스트 설정</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">점검 주기</Label>
                <Select value={form.scope} onValueChange={v => setForm(p => ({ ...p, scope: v }))}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">일일 체크리스트</SelectItem>
                    <SelectItem value="weekly">주간 체크리스트</SelectItem>
                    <SelectItem value="monthly">월간 체크리스트</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">집중 영역 (선택)</Label>
                <Select value={form.focus} onValueChange={v => setForm(p => ({ ...p, focus: v }))}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="전체" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="facility">시설 관리</SelectItem>
                    <SelectItem value="customer">고객 관리</SelectItem>
                    <SelectItem value="sales">매출 관리</SelectItem>
                    <SelectItem value="staff">직원 관리</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => onGenerate(form)} disabled={loading} className="w-full">
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />생성 중...</> : "체크리스트 생성"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </GenerationFlow>
  );
}
