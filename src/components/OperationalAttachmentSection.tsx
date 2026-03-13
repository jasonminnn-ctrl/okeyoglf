/**
 * OperationalAttachmentSection — 운영형 객체 파일 첨부 영역
 * entity_type + entity_id 기반으로 첨부 파일 목록을 표시하고 업로드/다운로드를 제공한다.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Paperclip, Upload, Download, Trash2, FileText, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Attachment {
  id: string;
  file_name: string;
  file_path: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  created_at: string;
}

interface Props {
  entityType: string;
  entityId: string;
  orgId?: string;
}

export function OperationalAttachmentSection({ entityType, entityId, orgId }: Props) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("operational_attachments" as any)
      .select("id, file_name, file_path, file_size_bytes, mime_type, created_at")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("created_at", { ascending: false });
    setAttachments((data as unknown as Attachment[]) || []);
    setLoading(false);
  }, [entityType, entityId]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const filePath = `${entityType}/${entityId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("operational-attachments")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get org_id
      const { data: rpcData } = await supabase.rpc("get_my_org_id");
      const resolvedOrgId = orgId || rpcData || "00000000-0000-0000-0000-000000000001";

      const { data: userData } = await supabase.auth.getUser();

      await supabase.from("operational_attachments" as any).insert({
        entity_type: entityType,
        entity_id: entityId,
        org_id: resolvedOrgId,
        file_name: file.name,
        file_path: filePath,
        file_size_bytes: file.size,
        mime_type: file.type || null,
        uploaded_by: userData?.user?.id || null,
      } as any);

      toast({ title: "파일 업로드 완료" });
      load();
    } catch (err: any) {
      toast({ title: "업로드 실패", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDownload = async (att: Attachment) => {
    const { data, error } = await supabase.storage
      .from("operational-attachments")
      .download(att.file_path);

    if (error || !data) {
      toast({ title: "다운로드 실패", variant: "destructive" });
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = att.file_name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (att: Attachment) => {
    await supabase.storage.from("operational-attachments").remove([att.file_path]);
    await supabase.from("operational_attachments" as any).delete().eq("id", att.id);
    setAttachments(prev => prev.filter(a => a.id !== att.id));
    toast({ title: "파일 삭제 완료" });
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1048576).toFixed(1)}MB`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium flex items-center gap-1.5">
          <Paperclip className="h-3 w-3" /> 첨부 파일
        </span>
        <div>
          <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-[10px] gap-1"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
            업로드
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-[10px] text-muted-foreground">불러오는 중...</p>
      ) : attachments.length === 0 ? (
        <p className="text-[10px] text-muted-foreground py-2">첨부된 파일이 없습니다</p>
      ) : (
        <div className="space-y-1">
          {attachments.map(att => (
            <div key={att.id} className="flex items-center gap-2 py-1 px-2 rounded bg-muted/20 text-xs group">
              <FileText className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate flex-1">{att.file_name}</span>
              <span className="text-[9px] text-muted-foreground flex-shrink-0">{formatSize(att.file_size_bytes)}</span>
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => handleDownload(att)}>
                <Download className="h-2.5 w-2.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => handleDelete(att)}>
                <Trash2 className="h-2.5 w-2.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
