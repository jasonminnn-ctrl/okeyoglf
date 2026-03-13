/**
 * ResultActionBar — Standardized action bar for AI/research result cards.
 *
 * Button order: 저장 → 내보내기 → 전달 → 다시 생성 → 전담 컨설턴트 요청
 * Secondary: 문맥별 운영 객체 저장 (작업/캠페인/리마인드/체크리스트)
 *
 * - TXT download is inside ExportDialog only (no standalone button).
 * - Share (공유) is NOT exposed in Phase 1.
 * - Copy (복사) is NOT in the primary bar; available per-section.
 * - Deliver (전달) shows shell dialog with "준비중" status.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Bookmark, Download, Send, RefreshCw, MessageSquare, Lock, ExternalLink, Mail, Users, Check, ClipboardList, Megaphone, CalendarClock, ClipboardCheck } from "lucide-react";
import { useMembership } from "@/contexts/MembershipContext";
import { ExportDialog } from "@/components/ExportDialog";
import { SaveToOperationalDialog, type OperationalObjectType } from "@/components/SaveToOperationalDialog";
import type { ExportableResult } from "@/lib/export-utils";

export interface ResultActionBarProps {
  exportable: ExportableResult;
  savedResultId?: string | null;
  onSave?: () => void;
  onRegenerate?: () => void;
  onConsultantTransfer?: () => void;
  onOpenSaved?: () => void;
  isSaved?: boolean;
  compact?: boolean;
}

// ── Context-based operational action mapping ──

interface OperationalAction {
  type: OperationalObjectType;
  label: string;
  icon: React.ElementType;
}

/**
 * Determine which operational save actions are relevant for a given result,
 * based on module/subtool/category context. Returns empty array if none match.
 */
function getOperationalActions(exportable: ExportableResult): OperationalAction[] {
  const { module, subtool, category } = exportable;
  const m = (module || "").toLowerCase();
  const s = (subtool || "").toLowerCase();
  const c = (category || "").toLowerCase();

  const actions: OperationalAction[] = [];

  // 운영 점검 / 진단 / 할 일 → 작업으로 저장
  if (
    s.includes("운영") || s.includes("점검") || s.includes("진단") ||
    s.includes("할 일") || s.includes("추천 액션") ||
    m.includes("운영팀") ||
    c.includes("운영")
  ) {
    actions.push({ type: "task", label: "작업으로 저장", icon: ClipboardList });
  }

  // 캠페인 / 프로모션 / 마케팅 → 캠페인으로 저장
  if (
    s.includes("캠페인") || s.includes("프로모션") || s.includes("카피") ||
    m.includes("마케팅") ||
    c.includes("캠페인") || c.includes("마케팅")
  ) {
    actions.push({ type: "campaign", label: "캠페인으로 저장", icon: Megaphone });
  }

  // 일정 / 마감 / 리마인드 / 재등록 → 리마인드로 저장
  if (
    s.includes("리마인드") || s.includes("일정") || s.includes("마감") ||
    s.includes("재등록") ||
    c.includes("리마인드") || c.includes("일정")
  ) {
    actions.push({ type: "reminder", label: "리마인드로 저장", icon: CalendarClock });
  }

  // 체크리스트 → 체크리스트로 저장
  if (
    s.includes("체크리스트") ||
    c.includes("체크리스트")
  ) {
    actions.push({ type: "checklist", label: "체크리스트로 저장", icon: ClipboardCheck });
  }

  return actions;
}

// ── Deliver Shell Dialog ──

interface DeliverShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
}

function DeliverShellDialog({ open, onOpenChange, title }: DeliverShellProps) {
  const channels = [
    { key: "email", label: "이메일 전달", icon: <Mail className="h-4 w-4" />, status: "준비중" as const },
    { key: "internal", label: "내부 전달", icon: <Users className="h-4 w-4" />, status: "준비중" as const },
  ];
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Send className="h-4 w-4 text-primary" />
            전달
          </DialogTitle>
          <DialogDescription className="text-xs">{title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {channels.map((ch) => (
            <button
              key={ch.key}
              onClick={() => setSelected(ch.key)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                selected === ch.key
                  ? "border-primary bg-primary/5"
                  : "border-border/30 bg-muted/10 hover:bg-muted/20"
              }`}
            >
              <span className="text-muted-foreground">{ch.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{ch.label}</span>
                  <Badge variant="outline" className="text-[9px] h-4 px-1 bg-muted/30 text-muted-foreground border-border/30">
                    {ch.status}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">서버 연결 후 실제 발송이 활성화됩니다</p>
              </div>
              {selected === ch.key && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-xs">닫기</Button>
          <Button size="sm" disabled className="text-xs gap-1.5 opacity-60">
            <Send className="h-3 w-3" /> 전달 (준비중)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Component ──

export function ResultActionBar({
  exportable,
  savedResultId,
  onSave,
  onRegenerate,
  onConsultantTransfer,
  onOpenSaved,
  isSaved = false,
  compact = false,
}: ResultActionBarProps) {
  const { getResultActions } = useMembership();
  const actions = getResultActions();

  const [exportOpen, setExportOpen] = useState(false);
  const [deliverOpen, setDeliverOpen] = useState(false);

  // Operational save dialog state
  const [opDialogOpen, setOpDialogOpen] = useState(false);
  const [opDialogType, setOpDialogType] = useState<OperationalObjectType>("task");

  const operationalActions = getOperationalActions(exportable);

  const btnSize = compact ? "h-7 text-[10px]" : "h-8 text-xs";
  const gapClass = compact ? "gap-1" : "gap-1.5";

  const handleOpenOpDialog = (type: OperationalObjectType) => {
    setOpDialogType(type);
    setOpDialogOpen(true);
  };

  return (
    <>
      {/* Primary actions */}
      <div className="flex flex-wrap gap-2">
        {onSave && actions.save.visible && (
          <Button variant="outline" size="sm" className={`${btnSize} ${gapClass}`} onClick={onSave} disabled={!actions.save.enabled || isSaved}>
            <Bookmark className="h-3 w-3" /> {isSaved ? "저장됨" : "저장"}
          </Button>
        )}

        {isSaved && onOpenSaved && (
          <Button variant="outline" size="sm" className={`${btnSize} ${gapClass}`} onClick={onOpenSaved}>
            <ExternalLink className="h-3 w-3" /> 저장된 결과 열기
          </Button>
        )}

        <Button variant="outline" size="sm" className={`${btnSize} ${gapClass}`} onClick={() => setExportOpen(true)}>
          <Download className="h-3 w-3" /> 내보내기
        </Button>

        <Button variant="outline" size="sm" className={`${btnSize} ${gapClass}`} onClick={() => setDeliverOpen(true)}>
          <Send className="h-3 w-3" /> 전달
        </Button>

        {onRegenerate && actions.regenerate.visible && (
          <Button variant="outline" size="sm" className={`${btnSize} ${gapClass}`} onClick={onRegenerate} disabled={!actions.regenerate.enabled}>
            {actions.regenerate.enabled ? <RefreshCw className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            다시 생성
            {actions.regenerate.requiresCredit && actions.regenerate.enabled && (
              <span className="text-[9px] text-muted-foreground">({actions.regenerate.creditCost})</span>
            )}
          </Button>
        )}

        {onConsultantTransfer && actions.consultantTransfer.visible && (
          <Button variant="outline" size="sm" className={`${btnSize} ${gapClass}`} onClick={onConsultantTransfer} disabled={!actions.consultantTransfer.enabled}>
            {actions.consultantTransfer.enabled ? <MessageSquare className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            전담 컨설턴트 요청
          </Button>
        )}
      </div>

      {/* Secondary actions — contextual operational object save */}
      {operationalActions.length > 0 && (
        <>
          <Separator className="my-2" />
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] text-muted-foreground self-center mr-1">운영 객체 전환 ▸</span>
            {operationalActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <Button
                  key={action.type}
                  variant="ghost"
                  size="sm"
                  className={`${btnSize} ${gapClass} border border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5`}
                  onClick={() => handleOpenOpDialog(action.type)}
                >
                  <ActionIcon className="h-3 w-3" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        </>
      )}

      {/* Dialogs */}
      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        result={exportable}
        savedResultId={savedResultId ?? undefined}
      />

      <DeliverShellDialog
        open={deliverOpen}
        onOpenChange={setDeliverOpen}
        title={`${exportable.title} · v${exportable.version ?? 1}`}
      />

      <SaveToOperationalDialog
        open={opDialogOpen}
        onOpenChange={setOpDialogOpen}
        objectType={opDialogType}
        defaultTitle={exportable.title}
        defaultMemo={`AI 생성 결과에서 전환됨 — ${exportable.module || ""} / ${exportable.subtool || ""}`}
        linkedResultId={savedResultId}
      />
    </>
  );
}
