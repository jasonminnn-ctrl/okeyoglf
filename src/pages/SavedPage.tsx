import { useState } from "react";
import { Bookmark, Bot, Settings2, TrendingUp, Megaphone, Palette, Briefcase, Search, MessageSquare, Filter, Eye, Clock, FileText, Download, Share2, Send, HardDrive, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { useResultStore, type SavedResult } from "@/contexts/ResultStoreContext";
import { useMembership } from "@/contexts/MembershipContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ResultDetailDrawer } from "@/components/ResultDetailDrawer";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { calculateStorageMetrics, getStorageQuota } from "@/lib/market-research";
import { toast } from "@/hooks/use-toast";

const categories = [
  { key: "AI 비서 결과", icon: Bot, module: "AI 비서" },
  { key: "AI 운영팀 결과", icon: Settings2, module: "AI 운영팀" },
  { key: "AI 영업팀 결과", icon: TrendingUp, module: "AI 영업팀" },
  { key: "AI 마케팅팀 결과", icon: Megaphone, module: "AI 마케팅팀" },
  { key: "AI 디자인팀 결과", icon: Palette, module: "AI 디자인팀" },
  { key: "AI 경영지원 결과", icon: Briefcase, module: "AI 경영지원" },
  { key: "시장조사 결과", icon: Search, module: "시장조사" },
  { key: "전담 컨설턴트 결과", icon: MessageSquare, module: "전담 컨설턴트" },
];

const categoryDescriptions: Record<string, string> = {
  "AI 비서 결과": "할 일, 추천 액션, 체크리스트 등 AI 비서가 생성한 결과물",
  "AI 운영팀 결과": "AI 진단, 요금결정, KPI 분석 등 운영 관련 결과물",
  "AI 영업팀 결과": "고객관리, 재등록, 판매 제안 등 영업 관련 결과물",
  "AI 마케팅팀 결과": "마케팅 카피, 이벤트, 프로모션 등 마케팅 결과물",
  "AI 디자인팀 결과": "배너, 포스터, 템플릿 등 디자인 결과물",
  "AI 경영지원 결과": "계약서, 서식, 체크리스트 등 경영지원 결과물",
  "시장조사 결과": "시장조사 보고서, 경쟁사 분석, 인사이트 등",
  "전담 컨설턴트 결과": "전담 컨설턴트 요청 결과물 및 회신 리포트",
};

const statusColors: Record<string, string> = {
  "임시 저장": "bg-muted text-muted-foreground",
  "검토 필요": "bg-amber-500/20 text-amber-400",
  "완료": "bg-emerald-500/20 text-emerald-400",
  "전달 완료": "bg-blue-500/20 text-blue-400",
  "보관됨": "bg-muted text-muted-foreground",
};

const typeLabels: Record<string, string> = {
  generation: "생성",
  research: "조사",
  consultant: "컨설턴트",
  manual: "수동",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

function DeliveryBadges({ result }: { result: SavedResult }) {
  const exportCount = result.exportFiles?.length ?? 0;
  const shareCount = result.shareHistory?.length ?? 0;
  const deliveryCount = result.deliveryHistory?.length ?? 0;
  if (exportCount + shareCount + deliveryCount === 0) return null;

  return (
    <>
      {exportCount > 0 && (
        <Badge variant="outline" className="text-[8px] h-3.5 px-1 gap-0.5">
          <Download className="h-2 w-2" />{exportCount}
        </Badge>
      )}
      {shareCount > 0 && (
        <Badge variant="outline" className="text-[8px] h-3.5 px-1 gap-0.5">
          <Share2 className="h-2 w-2" />{shareCount}
        </Badge>
      )}
      {deliveryCount > 0 && (
        <Badge variant="outline" className="text-[8px] h-3.5 px-1 gap-0.5">
          <Send className="h-2 w-2" />{deliveryCount}
        </Badge>
      )}
    </>
  );
}

export default function SavedPage() {
  const { label } = useBusinessContext();
  const { getResultsByCategory, countByCategory, results, deleteResult } = useResultStore();
  const { membershipCode } = useMembership();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetTitle, setDeleteTargetTitle] = useState<string>("");

  // Storage usage metrics
  const storageMetrics = calculateStorageMetrics(results);
  const storageQuota = getStorageQuota(membershipCode);
  const usagePercent = Math.min(100, Math.round((storageMetrics.totalSavedCount / storageQuota.maxResults) * 100));

  const handleOpenDetail = (id: string) => {
    setSelectedResultId(id);
    setDrawerOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    setDeleteTargetId(id);
    setDeleteTargetTitle(title);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      deleteResult(deleteTargetId);
      setDeleteOpen(false);
      setDeleteTargetId(null);
      toast({ title: "삭제 완료", description: "결과가 삭제되었습니다" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bookmark className="h-6 w-6 text-primary" />
          저장된 결과
        </h1>
        <p className="text-muted-foreground text-sm mt-1">저장한 AI 생성 결과를 카테고리별로 관리하고 재열람·재활용하세요</p>
      </div>

      {/* Storage usage summary */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">저장공간 사용량</span>
            </div>
            <span className="text-xs text-muted-foreground">{storageQuota.label}</span>
          </div>
          <Progress value={usagePercent} className="h-1.5 mb-2" />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>{storageMetrics.totalSavedCount}건 / {storageQuota.maxResults === 9999 ? "무제한" : `${storageQuota.maxResults}건`} · 약 {storageMetrics.estimatedStorageLabel}</span>
            <div className="flex items-center gap-3">
              <span>생성 {storageMetrics.totalGenerationCount}</span>
              <span>조사 {storageMetrics.totalResearchCount}</span>
              <span>컨설턴트 {storageMetrics.totalConsultantCount}</span>
            </div>
          </div>
          {usagePercent >= 80 && usagePercent < 100 && (
            <p className="text-[10px] text-amber-400 mt-1.5">⚠️ 저장공간이 {usagePercent}% 사용 중입니다. 불필요한 결과를 정리하거나 업그레이드를 고려하세요.</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/20 border-border/30">
        <CardContent className="pt-3 pb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              현재 업종: <span className="text-primary font-medium">{label}</span> · 전체 저장 결과가 표시됩니다
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="AI 비서 결과" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/30 p-1">
          {categories.map((cat) => {
            const count = countByCategory(cat.key);
            return (
              <TabsTrigger key={cat.key} value={cat.key} className="text-xs px-3 py-1.5 gap-1.5">
                <cat.icon className="h-3 w-3" />
                {cat.key.replace(" 결과", "")}
                {count > 0 && <Badge variant="outline" className="text-[9px] ml-1 h-4 px-1">{count}</Badge>}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((cat) => {
          const catResults = getResultsByCategory(cat.key);

          return (
            <TabsContent key={cat.key} value={cat.key}>
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <cat.icon className="h-4 w-4 text-primary" />
                      {cat.key}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px]">{catResults.length}건</Badge>
                  </div>
                  <CardDescription>{categoryDescriptions[cat.key]}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {catResults.length > 0 ? (
                    catResults.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer border border-border/20"
                        onClick={() => handleOpenDetail(r.id)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm truncate">{r.title}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-[10px] text-muted-foreground">{r.subtool || r.sourceTool || ""}</span>
                              <span className="text-[10px] text-muted-foreground">·</span>
                              <span className="text-[10px] text-muted-foreground">{formatDate(r.updatedAt)}</span>
                              <Badge className={`${statusColors[r.status] || ""} text-[9px] h-4`} variant="outline">{r.status}</Badge>
                              {r.type && <Badge variant="outline" className="text-[9px] h-4">{typeLabels[r.type] || r.type}</Badge>}
                              {r.version && r.version > 1 && <Badge variant="outline" className="text-[9px] h-4">v{r.version}</Badge>}
                              <DeliveryBadges result={r} />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                            <Eye className="h-3 w-3 mr-1" /> 보기
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            onClick={(e) => handleDeleteClick(e, r.id, r.title)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-2 py-6 justify-center">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">저장된 {cat.key}가 없습니다. 각 모듈에서 결과를 생성하고 저장하면 여기에 표시됩니다.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      <ResultDetailDrawer open={drawerOpen} onOpenChange={setDrawerOpen} resultId={selectedResultId} />
      <DeleteConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={handleDeleteConfirm} title={deleteTargetTitle} />
    </div>
  );
}
