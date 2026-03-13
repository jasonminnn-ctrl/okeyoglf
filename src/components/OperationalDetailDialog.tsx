/**
 * OperationalDetailDialog — 운영형 객체 상세 보기/수정 다이얼로그
 * 모든 운영형 메뉴에서 공통 사용.
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { OperationalAttachmentSection } from "@/components/OperationalAttachmentSection";
import { OperationalMetaBadges } from "@/components/OperationalMetaBadges";

export interface DetailField {
  key: string;
  label: string;
  type: "text" | "textarea" | "date" | "readonly" | "badge";
  value: string;
  badgeClass?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  entityType: string;
  entityId: string;
  fields: DetailField[];
  onFieldChange: (key: string, value: string) => void;
  onSave: () => void;
  meta?: {
    assignee?: string | null;
    completedByName?: string | null;
    completedAt?: string | null;
    updatedAt?: string | null;
    sourceType?: string | null;
    riskSource?: string | null;
  };
}

export function OperationalDetailDialog({
  open, onOpenChange, title, entityType, entityId,
  fields, onFieldChange, onSave, meta,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {fields.map(f => {
            if (f.type === "readonly") {
              return (
                <div key={f.key}>
                  <Label className="text-xs text-muted-foreground">{f.label}</Label>
                  <p className="text-sm mt-0.5">{f.value || "—"}</p>
                </div>
              );
            }
            if (f.type === "badge") {
              return (
                <div key={f.key}>
                  <Label className="text-xs text-muted-foreground">{f.label}</Label>
                  <div className="mt-0.5">
                    <Badge variant="outline" className={`text-[10px] ${f.badgeClass || ""}`}>{f.value}</Badge>
                  </div>
                </div>
              );
            }
            if (f.type === "textarea") {
              return (
                <div key={f.key}>
                  <Label className="text-xs">{f.label}</Label>
                  <Textarea
                    value={f.value}
                    onChange={e => onFieldChange(f.key, e.target.value)}
                    className="text-sm min-h-[80px] mt-1"
                  />
                </div>
              );
            }
            return (
              <div key={f.key}>
                <Label className="text-xs">{f.label}</Label>
                <Input
                  type={f.type === "date" ? "date" : "text"}
                  value={f.value}
                  onChange={e => onFieldChange(f.key, e.target.value)}
                  className="text-sm mt-1"
                />
              </div>
            );
          })}

          {meta && (
            <div className="pt-2 border-t border-border/30">
              <OperationalMetaBadges
                assignee={meta.assignee}
                completedByName={meta.completedByName}
                completedAt={meta.completedAt}
                updatedAt={meta.updatedAt}
                sourceType={meta.sourceType}
                riskSource={meta.riskSource}
              />
            </div>
          )}

          <div className="pt-2 border-t border-border/30">
            <OperationalAttachmentSection
              entityType={entityType}
              entityId={entityId}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-xs">닫기</Button>
          <Button size="sm" onClick={onSave} className="text-xs">저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
