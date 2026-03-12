/**
 * 브랜치/조직 필터 — 운영자 콘솔 공용 컴포넌트
 * 조직명, 업종, 멤버십으로 필터링
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Building2 } from "lucide-react";

export interface OrgFilterState {
  search: string;
  industry: string;
  membership: string;
}

interface OrgBranchFilterProps {
  filter: OrgFilterState;
  onChange: (filter: OrgFilterState) => void;
  industries?: string[];
  memberships?: string[];
  compact?: boolean;
}

const defaultIndustries = ["전체", "골프연습장", "골프장", "골프아카데미", "골프샵", "피팅샵", "골프회사"];
const defaultMemberships = ["전체", "trial", "standard", "pro", "enterprise"];

export default function OrgBranchFilter({
  filter,
  onChange,
  industries = defaultIndustries,
  memberships = defaultMemberships,
  compact = false,
}: OrgBranchFilterProps) {
  return (
    <div className={`flex ${compact ? "gap-2" : "gap-3"} flex-wrap items-center`}>
      <div className="relative flex-1 min-w-[160px] max-w-[240px]">
        <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-muted-foreground" />
        <Input
          placeholder="조직명 검색..."
          value={filter.search}
          onChange={e => onChange({ ...filter, search: e.target.value })}
          className="text-xs pl-7 h-8"
        />
      </div>
      <Select value={filter.industry} onValueChange={v => onChange({ ...filter, industry: v })}>
        <SelectTrigger className="w-[120px] text-xs h-8">
          <Building2 className="h-3 w-3 mr-1 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {industries.map(i => <SelectItem key={i} value={i} className="text-xs">{i}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filter.membership} onValueChange={v => onChange({ ...filter, membership: v })}>
        <SelectTrigger className="w-[110px] text-xs h-8"><SelectValue /></SelectTrigger>
        <SelectContent>
          {memberships.map(m => <SelectItem key={m} value={m} className="text-xs">{m === "전체" ? "전체" : m}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
