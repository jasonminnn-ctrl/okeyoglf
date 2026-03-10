/**
 * FeatureVisibilityEditor — Operator-only component
 * Allows toggling feature access modes via organization overrides.
 */

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ToggleRight, Crown } from "lucide-react";
import {
  defaultFeaturePolicies, membershipTiers, FEATURE_KEYS,
  type MembershipCode, type FeatureKey, type AccessMode,
  type OrganizationFeatureOverride,
} from "@/lib/membership";

interface FeatureRow {
  label: string;
  key: FeatureKey;
}

const featureGroups: { category: string; items: FeatureRow[] }[] = [
  {
    category: "메뉴/카드 진입 — AI 비서",
    items: [
      { label: "오늘의 할 일", key: FEATURE_KEYS.ASSISTANT_DAILY },
      { label: "주간 액션 플랜", key: FEATURE_KEYS.ASSISTANT_WEEKLY },
      { label: "체크리스트", key: FEATURE_KEYS.ASSISTANT_CHECKLIST },
      { label: "빠진 항목 점검", key: FEATURE_KEYS.ASSISTANT_MISSING },
      { label: "캠페인 추천", key: FEATURE_KEYS.ASSISTANT_CAMPAIGN },
      { label: "리마인더", key: FEATURE_KEYS.ASSISTANT_REMINDER },
    ],
  },
  {
    category: "메뉴/카드 진입 — AI 운영팀",
    items: [
      { label: "AI 진단실", key: FEATURE_KEYS.OPERATIONS_DIAGNOSIS },
      { label: "가격 정책", key: FEATURE_KEYS.OPERATIONS_PRICING },
      { label: "잔여시간 관리", key: FEATURE_KEYS.OPERATIONS_REMAINING },
      { label: "시간대 관리", key: FEATURE_KEYS.OPERATIONS_TIME },
      { label: "타석 관리", key: FEATURE_KEYS.OPERATIONS_BAY },
      { label: "레슨 관리", key: FEATURE_KEYS.OPERATIONS_LESSON },
      { label: "KPI", key: FEATURE_KEYS.OPERATIONS_KPI },
    ],
  },
  {
    category: "메뉴/카드 진입 — AI 영업팀",
    items: [
      { label: "응대 문안", key: FEATURE_KEYS.SALES_RESPONSE },
      { label: "재등록 유도", key: FEATURE_KEYS.SALES_REREGISTRATION },
      { label: "고객 관리", key: FEATURE_KEYS.SALES_CUSTOMER },
      { label: "미방문 관리", key: FEATURE_KEYS.SALES_NOVISIT },
      { label: "제안서", key: FEATURE_KEYS.SALES_PROPOSAL },
      { label: "VIP 관리", key: FEATURE_KEYS.SALES_VIP },
      { label: "패키지", key: FEATURE_KEYS.SALES_PACKAGE },
    ],
  },
  {
    category: "메뉴/카드 진입 — AI 마케팅팀",
    items: [
      { label: "마케팅 카피", key: FEATURE_KEYS.MARKETING_COPY },
      { label: "이벤트 기획", key: FEATURE_KEYS.MARKETING_EVENT },
      { label: "프로모션 기획", key: FEATURE_KEYS.MARKETING_PROMOTION },
      { label: "채널 전략", key: FEATURE_KEYS.MARKETING_CHANNEL },
      { label: "시즌 마케팅", key: FEATURE_KEYS.MARKETING_SEASON },
      { label: "조사 연계", key: FEATURE_KEYS.MARKETING_RESEARCH },
    ],
  },
  {
    category: "메뉴/카드 진입 — AI 디자인팀",
    items: [
      { label: "디자인 요청", key: FEATURE_KEYS.DESIGN_REQUEST },
      { label: "카피/레이아웃", key: FEATURE_KEYS.DESIGN_COPY_LAYOUT },
      { label: "템플릿", key: FEATURE_KEYS.DESIGN_TEMPLATE },
      { label: "배너", key: FEATURE_KEYS.DESIGN_BANNER },
      { label: "업로드", key: FEATURE_KEYS.DESIGN_UPLOAD },
      { label: "결과물", key: FEATURE_KEYS.DESIGN_RESULTS },
    ],
  },
  {
    category: "메뉴/카드 진입 — AI 경영지원",
    items: [
      { label: "내부 서식 초안", key: FEATURE_KEYS.SUPPORT_DOCUMENT },
      { label: "계약/발주", key: FEATURE_KEYS.SUPPORT_CONTRACT },
      { label: "정산", key: FEATURE_KEYS.SUPPORT_SETTLEMENT },
      { label: "체크리스트", key: FEATURE_KEYS.SUPPORT_CHECKLIST },
      { label: "리스크", key: FEATURE_KEYS.SUPPORT_RISK },
    ],
  },
  {
    category: "시장조사 / 전담 컨설턴트",
    items: [
      { label: "시장조사 기본", key: FEATURE_KEYS.RESEARCH_BASIC },
      { label: "시장조사 고급", key: FEATURE_KEYS.RESEARCH_ADVANCED },
      { label: "컨설턴트 요청", key: FEATURE_KEYS.CONSULTANT_REQUEST },
    ],
  },
  {
    category: "결과 액션",
    items: [
      { label: "저장", key: FEATURE_KEYS.RESULT_SAVE },
      { label: "복사", key: FEATURE_KEYS.RESULT_COPY },
      { label: "재생성", key: FEATURE_KEYS.RESULT_REGENERATE },
      { label: "전담 컨설턴트 전환", key: FEATURE_KEYS.RESULT_CONSULTANT_TRANSFER },
    ],
  },
];

const accessModeLabel: Record<AccessMode, string> = {
  enabled: "활성",
  locked: "잠금",
  hidden: "숨김",
};

const accessModeBadge: Record<AccessMode, string> = {
  enabled: "bg-emerald-500/10 text-emerald-400",
  locked: "bg-amber-500/10 text-amber-400",
  hidden: "bg-muted/50 text-muted-foreground",
};

const tierBadgeColorMap: Record<string, string> = {
  trial: "bg-muted/50 text-muted-foreground",
  standard: "bg-blue-500/10 text-blue-400",
  pro: "bg-amber-500/10 text-amber-400",
  enterprise: "bg-violet-500/10 text-violet-400",
};

interface Props {
  membershipCode: MembershipCode;
  overrides: OrganizationFeatureOverride[];
  addOverride: (o: OrganizationFeatureOverride) => void;
  removeOverride: (key: FeatureKey) => void;
  tierBadgeColor: Record<string, string>;
}

export function FeatureVisibilityEditor({ membershipCode, overrides, addOverride, removeOverride, tierBadgeColor }: Props) {
  const [editingTier, setEditingTier] = useState<MembershipCode>(membershipCode);

  // Resolve effective access mode for a feature key
  const getEffective = (key: FeatureKey): { mode: AccessMode; isOverridden: boolean } => {
    const override = overrides.find(o => o.featureKey === key && o.isActive);
    if (override) return { mode: override.accessMode, isOverridden: true };
    const base = defaultFeaturePolicies.find(p => p.featureKey === key && p.membershipCode === editingTier && p.isActive);
    return { mode: base?.accessMode ?? "hidden", isOverridden: false };
  };

  const handleToggle = (key: FeatureKey, newMode: AccessMode) => {
    // Check if newMode matches the base policy — if so, remove override
    const base = defaultFeaturePolicies.find(p => p.featureKey === key && p.membershipCode === editingTier && p.isActive);
    if (base && base.accessMode === newMode) {
      removeOverride(key);
    } else {
      addOverride({
        organizationId: "org-001",
        featureKey: key,
        accessMode: newMode,
        isActive: true,
        note: `운영자 수동 변경: ${accessModeLabel[newMode]}`,
      });
    }
  };

  return (
    <>
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <ToggleRight className="h-4 w-4 text-primary" />기능 노출 제어
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">기준 멤버십:</span>
              <Select value={editingTier} onValueChange={(v) => setEditingTier(v as MembershipCode)}>
                <SelectTrigger className="h-7 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {membershipTiers.map(t => (
                    <SelectItem key={t.code} value={t.code}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">각 기능의 접근 상태를 활성/잠금/숨김으로 변경합니다. 변경 시 즉시 반영됩니다.</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {featureGroups.map(group => (
            <div key={group.category}>
              <p className="text-xs font-medium mb-2 text-muted-foreground">{group.category}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {group.items.map(item => {
                  const { mode, isOverridden } = getEffective(item.key);
                  return (
                    <div key={item.key} className="p-2.5 rounded-lg bg-muted/20 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[11px] truncate">{item.label}</span>
                        {isOverridden && (
                          <Badge variant="outline" className="text-[8px] bg-primary/10 text-primary flex-shrink-0">override</Badge>
                        )}
                      </div>
                      <Select value={mode} onValueChange={(v) => handleToggle(item.key, v as AccessMode)}>
                        <SelectTrigger className="h-6 w-[80px] text-[10px] border-none bg-transparent p-0 justify-end gap-1">
                          <Badge variant="outline" className={`text-[9px] ${accessModeBadge[mode]}`}>
                            {accessModeLabel[mode]}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="enabled"><span className="text-emerald-400">활성</span></SelectItem>
                          <SelectItem value="locked"><span className="text-amber-400">잠금</span></SelectItem>
                          <SelectItem value="hidden"><span className="text-muted-foreground">숨김</span></SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <Separator />

          {/* Active overrides summary */}
          <div>
            <p className="text-xs font-medium mb-2">현재 조직 Override ({overrides.filter(o => o.isActive).length}건)</p>
            {overrides.filter(o => o.isActive).length === 0 ? (
              <p className="text-[11px] text-muted-foreground">기본 정책과 동일 — 조직별 override 없음</p>
            ) : (
              <div className="space-y-1">
                {overrides.filter(o => o.isActive).map(o => (
                  <div key={o.featureKey} className="flex items-center justify-between p-2 rounded bg-primary/5 text-[11px]">
                    <span className="font-mono text-[10px] text-muted-foreground">{o.featureKey}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[9px] ${accessModeBadge[o.accessMode]}`}>{accessModeLabel[o.accessMode]}</Badge>
                      <button
                        onClick={() => removeOverride(o.featureKey)}
                        className="text-[9px] text-destructive hover:underline"
                      >
                        제거
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Membership summary */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Crown className="h-4 w-4 text-primary" />멤버십별 노출 정책 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {membershipTiers.map(tier => (
              <div key={tier.code} className="p-3 rounded-lg bg-muted/20 space-y-2">
                <Badge className={`text-[10px] ${tierBadgeColorMap[tier.code]}`} variant="outline">{tier.name}</Badge>
                <div className="space-y-1 text-[10px] text-muted-foreground">
                  <p>• 메뉴 접근: {tier.code === "trial" ? "일부" : "전체"}</p>
                  <p>• 생성 기능: {tier.code === "trial" ? "제한" : tier.code === "standard" ? "일반" : "전체"}</p>
                  <p>• 결과 복사: {tier.code === "trial" ? "제한" : "허용"}</p>
                  <p>• 재생성: {tier.code === "trial" ? "제한" : "허용"}</p>
                  <p>• 컨설턴트: {tier.code === "pro" || tier.code === "enterprise" ? "허용" : "제한"}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
