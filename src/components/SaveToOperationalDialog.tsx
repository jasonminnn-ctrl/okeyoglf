/**
 * SaveToOperationalDialog — 결과를 운영 객체(작업/캠페인/리마인드/체크리스트)로 저장하는 다이얼로그.
 * 제목/상태/기한/메모를 확인 후 저장 → 해당 페이지로 이동.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Megaphone, CalendarClock, ClipboardCheck, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  insertTask,
  insertCampaign,
  insertReminder,
  insertChecklist,
  insertChecklistItem,
} from "@/lib/repositories/assistant-repository";

export type OperationalObjectType = "task" | "campaign" | "reminder" | "checklist";

interface SaveToOperationalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objectType: OperationalObjectType;
  defaultTitle: string;
  defaultMemo?: string;
  linkedResultId?: string | null;
}

const typeConfig: Record<OperationalObjectType, {
  label: string;
  icon: React.ElementType;
  navigateTo: string;
  statusOptions: { value: string; label: string }[];
}> = {
  task: {
    label: "작업으로 저장",
    icon: ClipboardList,
    navigateTo: "/ai-assistant/ops-check",
    statusOptions: [
      { value: "new", label: "신규" },
      { value: "in_progress", label: "진행 중" },
      { value: "done", label: "완료" },
    ],
  },
  campaign: {
    label: "캠페인으로 저장",
    icon: Megaphone,
    navigateTo: "/ai-assistant/campaign-planner",
    statusOptions: [
      { value: "draft", label: "초안" },
      { value: "planned", label: "계획됨" },
      { value: "active", label: "진행 중" },
    ],
  },
  reminder: {
    label: "리마인드로 저장",
    icon: CalendarClock,
    navigateTo: "/ai-assistant/reminder-board",
    statusOptions: [
      { value: "active", label: "활성" },
      { value: "snoozed", label: "보류" },
      { value: "done", label: "완료" },
    ],
  },
  checklist: {
    label: "체크리스트로 저장",
    icon: ClipboardCheck,
    navigateTo: "/ai-assistant/checklist-manager",
    statusOptions: [
      { value: "active", label: "활성" },
      { value: "completed", label: "완료" },
    ],
  },
};

export function SaveToOperationalDialog({
  open,
  onOpenChange,
  objectType,
  defaultTitle,
  defaultMemo,
  linkedResultId,
}: SaveToOperationalDialogProps) {
  const navigate = useNavigate();
  const cfg = typeConfig[objectType];
  const Icon = cfg.icon;

  const [title, setTitle] = useState(defaultTitle);
  const [status, setStatus] = useState(cfg.statusOptions[0].value);
  const [dueDate, setDueDate] = useState("");
  const [memo, setMemo] = useState(defaultMemo || "");
  const [saving, setSaving] = useState(false);

  // Reset form when dialog opens with new defaults
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setTitle(defaultTitle);
      setStatus(cfg.statusOptions[0].value);
      setDueDate("");
      setMemo(defaultMemo || "");
    }
    onOpenChange(nextOpen);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: "제목을 입력해 주세요", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      let success = false;

      if (objectType === "task") {
        const result = await insertTask({
          title: title.trim(),
          status,
          due_date: dueDate || null,
          memo: memo || null,
          source_type: "ai_generated",
          linked_result_id: linkedResultId || null,
          category: "ops_check",
          priority: "normal",
        });
        success = !!result;
      } else if (objectType === "campaign") {
        const result = await insertCampaign({
          title: title.trim(),
          status,
          start_date: dueDate || null,
          memo: memo || null,
          source_type: "ai_generated",
          linked_result_id: linkedResultId || null,
        });
        success = !!result;
      } else if (objectType === "reminder") {
        const result = await insertReminder({
          title: title.trim(),
          status,
          due_date: dueDate || null,
          memo: memo || null,
          source_type: "ai_generated",
          linked_result_id: linkedResultId || null,
          reminder_type: "general",
          is_recurring: false,
        });
        success = !!result;
      } else if (objectType === "checklist") {
        const checklist = await insertChecklist({
          title: title.trim(),
          status,
          memo: memo || null,
          source_type: "ai_generated",
          linked_result_id: linkedResultId || null,
          checklist_type: "daily",
        });
        success = !!checklist;
        // Auto-create a starter item if checklist created
        if (checklist) {
          await insertChecklistItem({
            checklist_id: checklist.id,
            label: "첫 번째 항목 (수정하세요)",
            is_checked: false,
            sort_order: 0,
          });
        }
      }

      if (success) {
        toast({
          title: "저장 완료",
          description: `${cfg.label} 완료 — 해당 페이지로 이동합니다`,
        });
        onOpenChange(false);
        navigate(cfg.navigateTo);
      } else {
        toast({ title: "저장 실패", description: "다시 시도해 주세요", variant: "destructive" });
      }
    } catch (err) {
      console.error("SaveToOperational error:", err);
      toast({ title: "저장 중 오류 발생", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Icon className="h-4 w-4 text-primary" />
            {cfg.label}
          </DialogTitle>
          <DialogDescription className="text-xs">
            AI 결과를 운영 객체로 저장합니다. 제목과 상태를 확인 후 저장하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">제목 *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="운영 객체 제목"
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">상태</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cfg.statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">
                {objectType === "campaign" ? "시작일" : "기한"}
              </Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">메모</Label>
            <Textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="추가 메모 (선택)"
              className="text-sm min-h-[60px]"
              rows={2}
            />
          </div>

          {linkedResultId && (
            <p className="text-[10px] text-muted-foreground">
              🔗 원본 결과와 연결됩니다 (linked_result_id)
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
            취소
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="text-xs gap-1.5">
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Icon className="h-3 w-3" />}
            {saving ? "저장 중..." : "저장 후 이동"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
