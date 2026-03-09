import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Building2, Users, BookOpen, FileText, ShieldCheck, Eye, History, CreditCard, Cpu, LayoutTemplate, ToggleRight, MessageSquare, Database, Globe, Lock, Tag } from "lucide-react";
import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";

const settingsSections = [
  { title: "업종 설정", desc: "현재 사용 업종 선택 및 전환", icon: Building2, color: "bg-primary/10 text-primary" },
  { title: "멤버십/권한 관리", desc: "사용자 역할 및 접근 권한 설정", icon: Users, color: "bg-amber-500/10 text-amber-400", badge: "준비 중" },
  { title: "프롬프트 관리", desc: "AI 프롬프트 작성·편집·테스트", icon: FileText, color: "bg-blue-500/10 text-blue-400", badge: "준비 중" },
  { title: "업종별 지침 관리", desc: "업종별 AI 응답 지침 설정", icon: BookOpen, color: "bg-violet-500/10 text-violet-400", badge: "준비 중" },
  { title: "출력 기준 관리", desc: "AI 출력물의 형식·길이·톤 설정", icon: Eye, color: "bg-emerald-500/10 text-emerald-400", badge: "준비 중" },
  { title: "금지 규칙 관리", desc: "AI가 사용하면 안 되는 표현·내용 설정", icon: ShieldCheck, color: "bg-red-500/10 text-red-400", badge: "준비 중" },
  { title: "지식베이스 관리", desc: "텍스트·파일·PDF 등 지식 자료 관리", icon: Database, color: "bg-cyan-500/10 text-cyan-400", badge: "준비 중" },
  { title: "참고자료/출처 관리", desc: "AI 참조 자료 및 출처 관리", icon: Globe, color: "bg-pink-500/10 text-pink-400", badge: "준비 중" },
  { title: "AI 참조 허용 범위", desc: "AI가 참조할 수 있는 데이터 범위 설정", icon: Lock, color: "bg-orange-500/10 text-orange-400", badge: "준비 중" },
  { title: "프롬프트 버전 관리", desc: "프롬프트 버전 이력 추적 및 롤백", icon: History, color: "bg-teal-500/10 text-teal-400", badge: "준비 중" },
  { title: "프롬프트 활성/비활성", desc: "프롬프트 활성화 상태 전환", icon: ToggleRight, color: "bg-indigo-500/10 text-indigo-400", badge: "준비 중" },
  { title: "변경 이력", desc: "설정 변경 이력 조회", icon: History, color: "bg-slate-500/10 text-slate-400", badge: "준비 중" },
  { title: "크레딧 정책", desc: "크레딧 차감 정책 및 요금제 설정", icon: CreditCard, color: "bg-yellow-500/10 text-yellow-400", badge: "준비 중" },
  { title: "ROS 엔진 설정", desc: "내부 운영 엔진 파라미터 설정", icon: Cpu, color: "bg-lime-500/10 text-lime-400", badge: "준비 중" },
  { title: "템플릿 관리", desc: "출력 템플릿 생성·편집·관리", icon: LayoutTemplate, color: "bg-fuchsia-500/10 text-fuchsia-400", badge: "준비 중" },
  { title: "기능 노출/비노출 설정", desc: "메뉴·기능 표시 여부 제어", icon: Eye, color: "bg-sky-500/10 text-sky-400", badge: "준비 중" },
  { title: "전담 컨설턴트 버튼 설정", desc: "컨설턴트 CTA 노출 여부 설정", icon: MessageSquare, color: "bg-rose-500/10 text-rose-400", badge: "준비 중" },
  { title: "태그 관리", desc: "지식베이스·프롬프트 태그 체계 관리", icon: Tag, color: "bg-zinc-500/10 text-zinc-400", badge: "준비 중" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          관리자 설정
        </h1>
        <p className="text-muted-foreground text-sm mt-1">조직, 프롬프트, 지식베이스, 권한 등 시스템 전반을 관리하세요</p>
      </div>

      {/* Organization Info */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            조직 정보
          </CardTitle>
          <CardDescription>기본 사업체 정보 설정</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>사업체명</Label>
              <Input placeholder="OkeyGolf 연습장" />
            </div>
            <div className="space-y-2">
              <Label>업종</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="업종 선택" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="indoor">실내연습장</SelectItem>
                  <SelectItem value="course">골프장</SelectItem>
                  <SelectItem value="academy">골프아카데미</SelectItem>
                  <SelectItem value="shop">골프샵</SelectItem>
                  <SelectItem value="fitting">피팅샵</SelectItem>
                  <SelectItem value="company">골프회사</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>연락처</Label>
              <Input placeholder="031-XXX-XXXX" />
            </div>
            <div className="space-y-2">
              <Label>이메일</Label>
              <Input placeholder="info@okeygolf.com" />
            </div>
          </div>
          <Button>저장</Button>
        </CardContent>
      </Card>

      {/* All Settings Cards */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-primary" />
          시스템 설정 항목
        </h2>
        <MenuLandingGrid columns={3}>
          {settingsSections.map((s) => (
            <MenuLandingCard key={s.title} title={s.title} description={s.desc} icon={s.icon} color={s.color} badge={s.badge} />
          ))}
        </MenuLandingGrid>
      </div>
    </div>
  );
}
