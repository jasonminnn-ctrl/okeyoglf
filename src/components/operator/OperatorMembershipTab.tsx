/**
 * 운영자 전용 — 멤버십 정책 편집 UI
 * trial/standard/pro/enterprise 기본 크레딧, 설명, 기능 범위를 편집 가능하게 한다
 */

import { useState } from "react";
import { Crown, CreditCard, Save, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { membershipTiers, type MembershipCode } from "@/lib/membership";
import { useMembership } from "@/contexts/MembershipContext";
import { toast } from "@/hooks/use-toast";

const tierBadgeColor: Record<string, string> = {
  trial: "bg-muted/50 text-muted-foreground",
  standard: "bg-blue-500/10 text-blue-400",
  pro: "bg-amber-500/10 text-amber-400",
  enterprise: "bg-violet-500/10 text-violet-400",
};

interface TierDraft {
  code: MembershipCode;
  name: string;
  description: string;
  defaultCredits: number;
  storageLimit: number;
  maxUsers: number;
}

const initialDrafts: TierDraft[] = membershipTiers.map(t => ({
  code: t.code,
  name: t.name,
  description: t.description,
  defaultCredits: t.defaultCredits,
  storageLimit: t.code === "trial" ? 20 : t.code === "standard" ? 100 : t.code === "pro" ? 500 : 9999,
  maxUsers: t.code === "trial" ? 1 : t.code === "standard" ? 3 : t.code === "pro" ? 10 : 50,
}));

export default function OperatorMembershipTab() {
  const { membershipCode, setMembershipCode, membershipName } = useMembership();
  const [drafts, setDrafts] = useState<TierDraft[]>(initialDrafts);
  const [dirty, setDirty] = useState(false);

  const updateDraft = (code: MembershipCode, field: keyof TierDraft, value: string | number) => {
    setDrafts(prev => prev.map(d => d.code === code ? { ...d, [field]: value } : d));
    setDirty(true);
  };

  const handleSave = () => {
    // Future: persist to backend
    toast({ title: "멤버십 정책 저장 완료", description: "변경 사항이 반영되었습니다 (데모)" });
    setDirty(false);
  };

  const handleReset = () => {
    setDrafts(initialDrafts);
    setDirty(false);
  };

  return (
    <div className="space-y-6">
      {/* Save bar */}
      {dirty && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4 pb-4 flex items-center justify-between">
            <p className="text-sm text-primary font-medium">변경 사항이 있습니다</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}><RotateCcw className="h-3 w-3 mr-1" />초기화</Button>
              <Button size="sm" onClick={handleSave}><Save className="h-3 w-3 mr-1" />정책 저장</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tier cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {drafts.map(draft => (
          <Card key={draft.code} className={`bg-card/50 border-border/50 ${membershipCode === draft.code ? "ring-1 ring-primary/30" : ""}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Badge className={`text-[10px] ${tierBadgeColor[draft.code]}`} variant="outline">{draft.name}</Badge>
                  {membershipCode === draft.code && <Badge className="text-[9px] bg-primary/20 text-primary" variant="outline">현재 적용</Badge>}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">등급 설명</Label>
                <Textarea
                  className="text-xs min-h-[60px]"
                  value={draft.description}
                  onChange={e => updateDraft(draft.code, "description", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1"><CreditCard className="h-3 w-3" />기본 크레딧</Label>
                  <Input
                    type="number"
                    className="text-xs"
                    value={draft.defaultCredits}
                    onChange={e => updateDraft(draft.code, "defaultCredits", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">저장 한도 (건)</Label>
                  <Input
                    type="number"
                    className="text-xs"
                    value={draft.storageLimit}
                    onChange={e => updateDraft(draft.code, "storageLimit", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">최대 사용자</Label>
                  <Input
                    type="number"
                    className="text-xs"
                    value={draft.maxUsers}
                    onChange={e => updateDraft(draft.code, "maxUsers", parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <Separator className="opacity-30" />

              <div className="space-y-2">
                <p className="text-[11px] text-muted-foreground font-medium">기능 접근 범위 요약</p>
                <div className="flex flex-wrap gap-1.5">
                  {draft.code === "trial" && (
                    <>
                      <Badge variant="outline" className="text-[9px]">AI 비서 (일부)</Badge>
                      <Badge variant="outline" className="text-[9px]">저장/복사 제한</Badge>
                      <Badge variant="outline" className="text-[9px] text-muted-foreground">전담 컨설턴트 잠금</Badge>
                    </>
                  )}
                  {draft.code === "standard" && (
                    <>
                      <Badge variant="outline" className="text-[9px]">전체 AI 모듈</Badge>
                      <Badge variant="outline" className="text-[9px]">내보내기/공유</Badge>
                      <Badge variant="outline" className="text-[9px] text-muted-foreground">전담 컨설턴트 잠금</Badge>
                    </>
                  )}
                  {draft.code === "pro" && (
                    <>
                      <Badge variant="outline" className="text-[9px]">전체 기능</Badge>
                      <Badge variant="outline" className="text-[9px]">전담 컨설턴트</Badge>
                      <Badge variant="outline" className="text-[9px]">전달 허용</Badge>
                    </>
                  )}
                  {draft.code === "enterprise" && (
                    <>
                      <Badge variant="outline" className="text-[9px]">전체 기능</Badge>
                      <Badge variant="outline" className="text-[9px]">멀티브랜치</Badge>
                      <Badge variant="outline" className="text-[9px]">고급 권한</Badge>
                      <Badge variant="outline" className="text-[9px]">무제한 저장</Badge>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Demo tier switcher */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Crown className="h-4 w-4 text-primary" />테스트: 멤버십 등급 변경 (데모)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">현재 조직의 멤버십 등급을 변경하여 기능 잠금/노출 정책을 확인합니다</p>
          <div className="flex items-center gap-3">
            <Select value={membershipCode} onValueChange={(v) => setMembershipCode(v as MembershipCode)}>
              <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {membershipTiers.map(t => (
                  <SelectItem key={t.code} value={t.code}>{t.name} ({t.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">현재: <span className="text-primary font-medium">{membershipName}</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
