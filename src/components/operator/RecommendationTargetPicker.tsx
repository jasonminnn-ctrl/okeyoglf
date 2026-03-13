/**
 * RecommendationTargetPicker — 운영 권장 대상 사용자 조회/선택
 * 선택한 조직(org_id)의 프로필 목록을 조회하여 사용자 선택 가능
 *
 * 한계: profiles 테이블의 RLS는 operator만 전체 조회 가능.
 * 일반 고객은 자기 프로필만 조회 가능하므로 이 컴포넌트는 운영자 전용.
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, X, Building2, Loader2 } from "lucide-react";

interface OrgOption {
  id: string;
  name: string;
  business_type: string;
}

interface ProfileOption {
  id: string;
  email: string | null;
  display_name: string | null;
}

interface Props {
  targetOrgId: string;
  onOrgIdChange: (v: string) => void;
  targetBranch: string;
  onBranchChange: (v: string) => void;
  selectedUserIds: string[];
  onUserIdsChange: (ids: string[]) => void;
}

export default function RecommendationTargetPicker({
  targetOrgId, onOrgIdChange,
  targetBranch, onBranchChange,
  selectedUserIds, onUserIdsChange,
}: Props) {
  const [orgs, setOrgs] = useState<OrgOption[]>([]);
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all organizations (operator-only via RLS)
  useEffect(() => {
    supabase
      .from("organizations" as any)
      .select("id, name, business_type")
      .order("name")
      .then(({ data }) => {
        setOrgs((data ?? []) as unknown as OrgOption[]);
        setLoadingOrgs(false);
      });
  }, []);

  // Fetch profiles when org selected
  useEffect(() => {
    if (!targetOrgId) { setProfiles([]); return; }
    setLoadingProfiles(true);
    supabase
      .from("profiles" as any)
      .select("id, email, display_name")
      .eq("org_id", targetOrgId)
      .order("display_name")
      .then(({ data }) => {
        setProfiles((data ?? []) as unknown as ProfileOption[]);
        setLoadingProfiles(false);
      });
  }, [targetOrgId]);

  const toggleUser = (uid: string) => {
    onUserIdsChange(
      selectedUserIds.includes(uid)
        ? selectedUserIds.filter(u => u !== uid)
        : [...selectedUserIds, uid]
    );
  };

  const filteredProfiles = profiles.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (p.display_name?.toLowerCase().includes(term)) ||
      (p.email?.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-3 border border-border/30 rounded-lg p-3 bg-muted/5">
      <p className="text-xs font-medium flex items-center gap-1.5">
        <Building2 className="h-3.5 w-3.5 text-primary" />
        정밀 타겟팅
      </p>

      {/* Org selector */}
      <div>
        <Label className="text-[11px]">대상 조직</Label>
        {loadingOrgs ? (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" />조직 불러오는 중...</div>
        ) : (
          <Select value={targetOrgId || "__none__"} onValueChange={v => { onOrgIdChange(v === "__none__" ? "" : v); onUserIdsChange([]); }}>
            <SelectTrigger className="mt-1 text-xs"><SelectValue placeholder="전체 (미지정)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__" className="text-xs">전체 (미지정)</SelectItem>
              {orgs.map(o => (
                <SelectItem key={o.id} value={o.id} className="text-xs">
                  {o.name} ({o.business_type || "미분류"})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Branch code */}
      <div>
        <Label className="text-[11px]">대상 사업장 코드 (선택)</Label>
        <Input value={targetBranch} onChange={e => onBranchChange(e.target.value)} placeholder="branch_code" className="mt-1 text-xs" />
      </div>

      {/* User targeting */}
      {targetOrgId && (
        <div>
          <Label className="text-[11px] flex items-center gap-1">
            <Users className="h-3 w-3" />
            대상 사용자 ({selectedUserIds.length}명 선택)
          </Label>

          {loadingProfiles ? (
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" />사용자 불러오는 중...</div>
          ) : profiles.length === 0 ? (
            <p className="text-[10px] text-muted-foreground mt-1">해당 조직에 등록된 사용자가 없습니다</p>
          ) : (
            <>
              <div className="relative mt-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="이름/이메일 검색"
                  className="pl-7 text-xs h-7"
                />
              </div>

              {/* Selected users */}
              {selectedUserIds.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {selectedUserIds.map(uid => {
                    const p = profiles.find(pr => pr.id === uid);
                    return (
                      <Badge key={uid} variant="outline" className="text-[9px] gap-0.5 cursor-pointer bg-primary/10 text-primary border-primary/20" onClick={() => toggleUser(uid)}>
                        {p?.display_name || p?.email?.split("@")[0] || uid.slice(0, 8)}
                        <X className="h-2 w-2" />
                      </Badge>
                    );
                  })}
                </div>
              )}

              {/* User list */}
              <div className="mt-1.5 max-h-[160px] overflow-y-auto space-y-0.5 border border-border/20 rounded p-1">
                {filteredProfiles.map(p => {
                  const selected = selectedUserIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className={`w-full text-left flex items-center gap-2 py-1 px-2 rounded text-[11px] transition-colors ${selected ? "bg-primary/10 text-primary" : "hover:bg-muted/30"}`}
                      onClick={() => toggleUser(p.id)}
                    >
                      <div className={`w-3 h-3 rounded border flex items-center justify-center flex-shrink-0 ${selected ? "bg-primary border-primary" : "border-border"}`}>
                        {selected && <span className="text-primary-foreground text-[8px]">✓</span>}
                      </div>
                      <span className="truncate">{p.display_name || "(이름 없음)"}</span>
                      <span className="text-[9px] text-muted-foreground truncate">{p.email}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[9px] text-muted-foreground mt-1">선택하지 않으면 조직 전체 대상</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
