import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, CreditCard, BarChart3, Lock, CheckCircle2, Eye, HardDrive } from "lucide-react";
import { useMembership } from "@/contexts/MembershipContext";
import { useResultStore } from "@/contexts/ResultStoreContext";
import { FEATURE_KEYS } from "@/lib/membership";
import { ledgerTypeLabels } from "@/lib/membership";
import { calculateStorageMetrics, getStorageQuota } from "@/lib/market-research";

/** Feature key groups for summary display */
const featureGroups = [
  {
    group: "AI 비서",
    keys: [
      { key: FEATURE_KEYS.ASSISTANT_DAILY, label: "오늘의 할 일" },
      { key: FEATURE_KEYS.ASSISTANT_WEEKLY, label: "주간 액션" },
      { key: FEATURE_KEYS.ASSISTANT_CHECKLIST, label: "체크리스트" },
      { key: FEATURE_KEYS.ASSISTANT_CAMPAIGN, label: "캠페인 추천" },
    ],
  },
  {
    group: "AI 운영팀",
    keys: [
      { key: FEATURE_KEYS.OPERATIONS_DIAGNOSIS, label: "AI 진단실" },
      { key: FEATURE_KEYS.OPERATIONS_KPI, label: "KPI 분석" },
    ],
  },
  {
    group: "AI 영업팀",
    keys: [
      { key: FEATURE_KEYS.SALES_RESPONSE, label: "응대 문안" },
      { key: FEATURE_KEYS.SALES_REREGISTRATION, label: "재등록 캠페인" },
    ],
  },
  {
    group: "AI 마케팅팀",
    keys: [
      { key: FEATURE_KEYS.MARKETING_COPY, label: "마케팅 카피" },
      { key: FEATURE_KEYS.MARKETING_PROMOTION, label: "프로모션 기획" },
    ],
  },
  {
    group: "결과 액션",
    keys: [
      { key: FEATURE_KEYS.RESULT_SAVE, label: "저장" },
      { key: FEATURE_KEYS.RESULT_COPY, label: "복사" },
      { key: FEATURE_KEYS.RESULT_REGENERATE, label: "재생성" },
      { key: FEATURE_KEYS.RESULT_CONSULTANT_TRANSFER, label: "컨설턴트 전환" },
    ],
  },
];

export default function SettingsUsageTab() {
  const { membershipCode, membershipName, membershipDescription, creditBalance, ledger, checkAccess } = useMembership();
  const { results } = useResultStore();

  const recentLedger = ledger.slice(0, 8);
  const storageMetrics = calculateStorageMetrics(results);
  const storageQuota = getStorageQuota(membershipCode);
  const usagePercent = Math.min(100, Math.round((storageMetrics.totalSavedCount / storageQuota.maxResults) * 100));

  return (
    <div className="space-y-6">
      {/* 멤버십 현황 (조회 전용) */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Crown className="h-4 w-4 text-primary" />
            현재 멤버십
            <Badge className="ml-2 bg-primary/10 text-primary text-[10px]">조회 전용</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-lg font-bold text-primary">{membershipName}</p>
              <p className="text-xs text-muted-foreground mt-1">{membershipDescription}</p>
            </div>
          </div>
          {membershipCode !== "enterprise" && (
            <Card className="bg-muted/20 border-border/30">
              <CardContent className="pt-3 pb-3 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">더 많은 기능과 생성 크레딧이 필요하신가요?</p>
                <Button size="sm" variant="outline" className="text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
                  <Crown className="h-3 w-3" />
                  업그레이드 안내
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* 크레딧 현황 (조회 전용) */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            크레딧 잔액
            <Badge className="ml-2 bg-primary/10 text-primary text-[10px]">조회 전용</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-2xl font-bold text-primary">{creditBalance.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">크레딧</span></p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">최근 사용내역</p>
            <div className="rounded-md border border-border/50 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/30 text-muted-foreground">
                    <th className="text-left px-3 py-2 font-medium">일시</th>
                    <th className="text-left px-3 py-2 font-medium">유형</th>
                    <th className="text-left px-3 py-2 font-medium">사유</th>
                    <th className="text-right px-3 py-2 font-medium">변동</th>
                    <th className="text-right px-3 py-2 font-medium">잔액</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {recentLedger.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-3 py-2 text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className="text-[9px]">{ledgerTypeLabels[entry.type]}</Badge>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground truncate max-w-[180px]">{entry.reason}</td>
                      <td className={`px-3 py-2 text-right font-medium ${entry.amountDelta > 0 ? "text-green-500" : "text-red-400"}`}>
                        {entry.amountDelta > 0 ? "+" : ""}{entry.amountDelta}
                      </td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{entry.balanceAfter}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 활성/제한 기능 요약 (조회 전용) */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            현재 활성/제한 기능 요약
            <Badge className="ml-2 bg-primary/10 text-primary text-[10px]">조회 전용</Badge>
          </CardTitle>
          <CardDescription>현재 멤버십({membershipName})에서 각 기능의 접근 상태를 확인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {featureGroups.map((grp) => (
              <div key={grp.group}>
                <p className="text-xs font-medium text-muted-foreground mb-2">{grp.group}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {grp.keys.map((item) => {
                    const access = checkAccess(item.key);
                    return (
                      <div key={item.key} className="flex items-center gap-1.5 text-xs rounded-md border border-border/30 px-2.5 py-1.5">
                        {!access.visible ? (
                          <Eye className="h-3 w-3 text-muted-foreground/50" />
                        ) : access.enabled ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <Lock className="h-3 w-3 text-yellow-500" />
                        )}
                        <span className={!access.visible ? "text-muted-foreground/50" : access.enabled ? "text-foreground" : "text-muted-foreground"}>
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <Card className="bg-muted/20 border-border/30 mt-4">
            <CardContent className="pt-3 pb-3">
              <p className="text-[11px] text-muted-foreground">ℹ️ 기능 활성/제한 정책은 OkeyGolf 운영팀에서 관리합니다. 변경이 필요하시면 담당자에게 문의하세요.</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
