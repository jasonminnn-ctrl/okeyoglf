/**
 * RecommendationCoverageBoard — 메뉴별 운영 권장 현황 보드
 * 운영자가 카테고리/유형/타겟/상태별 현황을 한눈에 파악
 */

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Target, Users, Building2, User, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";

interface RecSummary {
  id: string;
  title: string;
  recommendation_type: string;
  category: string;
  priority: string;
  is_active: boolean;
  target_org_id: string | null;
  target_branch_code: string | null;
  target_user_ids: string[] | null;
  target_business_types: string[];
  start_date: string | null;
  end_date: string | null;
}

const CAT_LABELS: Record<string, string> = {
  ops_check: "운영 점검",
  checklist: "체크리스트",
  campaign: "캠페인",
  reminder: "리마인드",
  general: "공통",
};

const TYPE_LABELS: Record<string, string> = {
  ops_recommended: "운영 권장",
  risk_signal: "위험신호",
  doing_well: "잘하고 있는 점",
  must_check: "꼭 확인할 것",
  weekly_action: "이번 주 권장 액션",
};

const TYPE_COLORS: Record<string, string> = {
  ops_recommended: "bg-amber-500/10 text-amber-400",
  risk_signal: "bg-red-500/10 text-red-400",
  doing_well: "bg-emerald-500/10 text-emerald-400",
  must_check: "bg-violet-500/10 text-violet-400",
  weekly_action: "bg-blue-500/10 text-blue-400",
};

export default function RecommendationCoverageBoard() {
  const [items, setItems] = useState<RecSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("operator_recommendations" as any)
      .select("id,title,recommendation_type,category,priority,is_active,target_org_id,target_branch_code,target_user_ids,target_business_types,start_date,end_date")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setItems((data ?? []) as unknown as RecSummary[]);
        setLoading(false);
      });
  }, []);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const stats = useMemo(() => {
    const byCat: Record<string, number> = {};
    const byType: Record<string, number> = {};
    let active = 0, inactive = 0, expired = 0;
    let orgTargeted = 0, branchTargeted = 0, userTargeted = 0, globalItems = 0;

    items.forEach(r => {
      byCat[r.category] = (byCat[r.category] || 0) + 1;
      byType[r.recommendation_type] = (byType[r.recommendation_type] || 0) + 1;

      if (!r.is_active) { inactive++; }
      else if (r.end_date && r.end_date < today) { expired++; }
      else { active++; }

      const hasOrg = !!r.target_org_id;
      const hasBranch = !!r.target_branch_code;
      const hasUser = r.target_user_ids && r.target_user_ids.length > 0;

      if (hasUser) userTargeted++;
      else if (hasBranch) branchTargeted++;
      else if (hasOrg) orgTargeted++;
      else globalItems++;
    });

    return { byCat, byType, active, inactive, expired, orgTargeted, branchTargeted, userTargeted, globalItems };
  }, [items, today]);

  if (loading) return <p className="text-xs text-muted-foreground py-4 text-center">현황 불러오는 중...</p>;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard icon={CheckCircle2} label="활성" value={stats.active} color="text-emerald-400" bg="bg-emerald-500/10" />
        <SummaryCard icon={XCircle} label="비활성" value={stats.inactive} color="text-muted-foreground" bg="bg-muted/30" />
        <SummaryCard icon={Clock} label="기간 종료" value={stats.expired} color="text-amber-400" bg="bg-amber-500/10" />
        <SummaryCard icon={BarChart3} label="전체" value={items.length} color="text-primary" bg="bg-primary/10" />
      </div>

      {/* Target distribution */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs flex items-center gap-1.5"><Target className="h-3.5 w-3.5 text-primary" />대상 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <MiniStat icon={BarChart3} label="전체 공통" value={stats.globalItems} />
            <MiniStat icon={Building2} label="조직 전용" value={stats.orgTargeted} />
            <MiniStat icon={Target} label="사업장 전용" value={stats.branchTargeted} />
            <MiniStat icon={User} label="사용자 전용" value={stats.userTargeted} />
          </div>
        </CardContent>
      </Card>

      {/* Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">메뉴(카테고리)별</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {Object.entries(CAT_LABELS).map(([k, label]) => (
              <div key={k} className="flex items-center justify-between py-1 px-2 rounded bg-muted/20">
                <span className="text-[11px]">{label}</span>
                <Badge variant="outline" className="text-[10px]">{stats.byCat[k] || 0}건</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">유형별</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {Object.entries(TYPE_LABELS).map(([k, label]) => (
              <div key={k} className="flex items-center justify-between py-1 px-2 rounded bg-muted/20">
                <span className="text-[11px]">{label}</span>
                <Badge variant="outline" className={`text-[10px] ${TYPE_COLORS[k] || ""}`}>{stats.byType[k] || 0}건</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Active items by category */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs">현재 공급 중인 항목</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
            {items
              .filter(r => r.is_active && !(r.end_date && r.end_date < today))
              .map(r => (
                <div key={r.id} className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/15">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Badge variant="outline" className={`text-[8px] ${TYPE_COLORS[r.recommendation_type] || ""}`}>
                      {TYPE_LABELS[r.recommendation_type] || r.recommendation_type}
                    </Badge>
                    <span className="text-[11px] truncate">{r.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Badge variant="outline" className="text-[8px]">{CAT_LABELS[r.category] || r.category}</Badge>
                    {r.target_user_ids && r.target_user_ids.length > 0 && (
                      <Badge variant="outline" className="text-[8px] bg-violet-500/10 text-violet-400"><Users className="h-2 w-2 mr-0.5" />{r.target_user_ids.length}명</Badge>
                    )}
                    {r.target_org_id && !r.target_user_ids?.length && (
                      <Badge variant="outline" className="text-[8px] bg-blue-500/10 text-blue-400">조직</Badge>
                    )}
                  </div>
                </div>
              ))}
            {items.filter(r => r.is_active && !(r.end_date && r.end_date < today)).length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">현재 공급 중인 항목이 없습니다</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color, bg }: { icon: any; label: string; value: number; color: string; bg: string }) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="pt-3 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-xl font-bold mt-0.5">{value}</p>
          </div>
          <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
            <Icon className={`h-3.5 w-3.5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded bg-muted/15">
      <Icon className="h-3 w-3 text-muted-foreground" />
      <span className="text-[11px] flex-1">{label}</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  );
}
