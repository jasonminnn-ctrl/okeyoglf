/**
 * RecommendationSupplyPanel — 고객 운영형 페이지에 운영 권장 DB 항목을 자동 표시
 * operator_recommendations 테이블에서 실시간으로 가져와 보여줌 (mock 아님)
 * target_org_id / target_branch_code 정밀 타겟팅 적용
 */

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, AlertTriangle, CheckCircle2, Eye, Zap, Plus, ExternalLink, Loader2 } from "lucide-react";
import { fetchRecommendations, type OperatorRecommendation } from "@/lib/repositories/assistant-repository";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { useAuth } from "@/contexts/AuthContext";

const typeMeta: Record<string, { label: string; icon: typeof ShieldAlert; color: string }> = {
  ops_recommended: { label: "운영 권장", icon: ShieldAlert, color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  risk_signal: { label: "위험신호", icon: AlertTriangle, color: "bg-red-500/10 text-red-400 border-red-500/20" },
  doing_well: { label: "잘하고 있는 점", icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  must_check: { label: "꼭 확인할 것", icon: Eye, color: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  weekly_action: { label: "이번 주 권장 액션", icon: Zap, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
};

const priorityLabel: Record<string, string> = { high: "높음", normal: "보통", low: "낮음" };

interface Props {
  /** DB category: ops_check, checklist, campaign, reminder */
  category: string;
  /** Callback when user clicks "추가" on a recommendation */
  onAdd?: (rec: OperatorRecommendation) => Promise<void>;
  /** Already-added titles to disable duplicate adds */
  addedTitles?: string[];
  /** Label shown on header */
  headerLabel?: string;
}

export function RecommendationSupplyPanel({ category, onAdd, addedTitles = [], headerLabel = "운영팀 권장 항목" }: Props) {
  const { label: bizLabel } = useBusinessContext();
  const { orgId, user } = useAuth();
  const [recs, setRecs] = useState<OperatorRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  /**
   * branchCode: currently resolved from org context.
   * TODO: When organization hierarchy is fully implemented,
   * fetch branch_code from organizations table via orgId.
   * For now, null means "match all branches" which is correct
   * for single-branch orgs.
   */
  const [branchCode] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchRecommendations(category, bizLabel, orgId, branchCode, user?.id ?? null).then(data => {
      if (mounted) { setRecs(data); setLoading(false); }
    });
    return () => { mounted = false; };
  }, [category, bizLabel, orgId, branchCode, user?.id]);

  const handleAdd = async (rec: OperatorRecommendation) => {
    if (!onAdd) return;
    setAddingId(rec.id);
    try { await onAdd(rec); } finally { setAddingId(null); }
  };

  if (loading) {
    return (
      <Card className="bg-amber-500/5 border-amber-500/20">
        <CardContent className="py-4 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
          <span className="text-xs text-muted-foreground">운영 권장 불러오는 중...</span>
        </CardContent>
      </Card>
    );
  }

  if (recs.length === 0) {
    return (
      <Card className="bg-amber-500/5 border-amber-500/20">
        <CardContent className="py-4 text-center">
          <p className="text-xs text-muted-foreground">현재 등록된 운영 권장 항목이 없습니다</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-amber-500/5 border-amber-500/20">
      <CardContent className="py-3 px-4">
        <p className="text-xs font-medium mb-2.5 flex items-center gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
          {headerLabel}
          <Badge variant="outline" className="text-[9px] ml-1">{recs.length}건</Badge>
        </p>
        <div className="space-y-1.5">
          {recs.map(rec => {
            const meta = typeMeta[rec.recommendation_type] || typeMeta.ops_recommended;
            const Icon = meta.icon;
            const alreadyAdded = addedTitles.includes(rec.title);

            return (
              <div key={rec.id} className="flex items-start gap-2 py-2 px-2.5 rounded-md bg-background/50 border border-border/20">
                <Icon className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${meta.color.split(" ")[1]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-medium">{rec.title}</span>
                    <Badge variant="outline" className={`text-[8px] ${meta.color}`}>{meta.label}</Badge>
                    {rec.priority === "high" && (
                      <Badge variant="outline" className="text-[8px] bg-red-500/10 text-red-400 border-red-500/20">{priorityLabel[rec.priority]}</Badge>
                    )}
                  </div>
                  {rec.description && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{rec.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {rec.start_date && (
                      <span className="text-[9px] text-muted-foreground">
                        {rec.start_date}{rec.end_date ? ` ~ ${rec.end_date}` : ""}
                      </span>
                    )}
                    {rec.link_url && (
                      <a href={rec.link_url} target="_blank" rel="noopener noreferrer" className="text-[9px] text-primary flex items-center gap-0.5 hover:underline">
                        <ExternalLink className="h-2.5 w-2.5" />
                        {rec.link_label || "바로가기"}
                      </a>
                    )}
                  </div>
                </div>
                {onAdd && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[10px] h-6 px-2 flex-shrink-0"
                    disabled={alreadyAdded || addingId === rec.id}
                    onClick={() => handleAdd(rec)}
                  >
                    {addingId === rec.id ? <Loader2 className="h-3 w-3 animate-spin" /> : alreadyAdded ? "추가됨" : <><Plus className="h-2.5 w-2.5" /> 추가</>}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
