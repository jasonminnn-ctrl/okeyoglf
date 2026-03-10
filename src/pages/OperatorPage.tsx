import { Shield, Inbox, FileText, StickyNote, Upload, Users, Clock, Settings2, Database, Cpu, BookOpen, Eye, ShieldCheck, Globe, Lock, Tag, ToggleRight, History, CreditCard, LayoutTemplate, MessageSquare, Wrench } from "lucide-react";
import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const consultantOps = [
  { title: "컨설턴트 요청 접수함", desc: "고객 요청 목록 확인 및 처리", icon: Inbox, color: "bg-primary/10 text-primary" },
  { title: "요청 상세 보기", desc: "개별 요청 상세 내용 및 진행 상태", icon: FileText, color: "bg-amber-500/10 text-amber-400" },
  { title: "내부 메모", desc: "요청 건별 내부 메모 및 코멘트 관리", icon: StickyNote, color: "bg-blue-500/10 text-blue-400" },
  { title: "결과 업로드", desc: "컨설팅 결과물 업로드 및 전달", icon: Upload, color: "bg-violet-500/10 text-violet-400" },
  { title: "고객별 요청 이력", desc: "고객 단위 요청 이력 조회 및 관리", icon: Clock, color: "bg-emerald-500/10 text-emerald-400" },
  { title: "조직별 관리", desc: "조직 단위 고객사 현황 관리", icon: Users, color: "bg-cyan-500/10 text-cyan-400" },
];

const aiPolicyOps = [
  { title: "프롬프트 운영", desc: "AI 프롬프트 작성·편집·테스트·버전 관리", icon: FileText, color: "bg-pink-500/10 text-pink-400", badge: "준비 중" },
  { title: "업종별 지침 운영", desc: "업종별 AI 응답 지침 관리", icon: BookOpen, color: "bg-violet-500/10 text-violet-400", badge: "준비 중" },
  { title: "출력 기준 운영", desc: "AI 출력물 형식·길이·톤앤매너 정책", icon: Eye, color: "bg-emerald-500/10 text-emerald-400", badge: "준비 중" },
  { title: "금지 규칙 운영", desc: "AI 사용 금지 표현·내용 정책 관리", icon: ShieldCheck, color: "bg-red-500/10 text-red-400", badge: "준비 중" },
  { title: "지식베이스 운영", desc: "텍스트·파일·PDF 등 지식 자료 관리", icon: Database, color: "bg-cyan-500/10 text-cyan-400", badge: "준비 중" },
  { title: "참고자료/출처 운영", desc: "AI 참조 자료 및 출처 관리", icon: Globe, color: "bg-pink-500/10 text-pink-400", badge: "준비 중" },
  { title: "AI 참조 허용 범위 운영", desc: "AI가 참조할 수 있는 데이터 범위 정책", icon: Lock, color: "bg-orange-500/10 text-orange-400", badge: "준비 중" },
];

const systemOps = [
  { title: "엔진 운영", desc: "ROS 엔진 상태 확인 및 파라미터 설정", icon: Cpu, color: "bg-orange-500/10 text-orange-400", badge: "준비 중" },
  { title: "ROS 정책 운영", desc: "ROS 엔진 정책 및 실행 규칙 관리", icon: Wrench, color: "bg-lime-500/10 text-lime-400", badge: "준비 중" },
  { title: "전담 컨설턴트 전환 규칙 운영", desc: "AI→컨설턴트 에스컬레이션 규칙 관리", icon: MessageSquare, color: "bg-rose-500/10 text-rose-400", badge: "준비 중" },
  { title: "크레딧 정책 운영", desc: "크레딧 차감 정책 및 요금제 관리", icon: CreditCard, color: "bg-yellow-500/10 text-yellow-400", badge: "준비 중" },
  { title: "템플릿 운영", desc: "출력 템플릿 생성·편집·관리", icon: LayoutTemplate, color: "bg-fuchsia-500/10 text-fuchsia-400", badge: "준비 중" },
  { title: "기능 정책 운영", desc: "메뉴·기능 마스터 노출 정책 관리", icon: ToggleRight, color: "bg-sky-500/10 text-sky-400", badge: "준비 중" },
  { title: "변경 이력", desc: "전체 설정 변경 이력 조회", icon: History, color: "bg-slate-500/10 text-slate-400", badge: "준비 중" },
  { title: "태그 관리", desc: "지식베이스·프롬프트 태그 체계 관리", icon: Tag, color: "bg-zinc-500/10 text-zinc-400", badge: "준비 중" },
];

export default function OperatorPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          운영자 관리
        </h1>
        <p className="text-muted-foreground text-sm mt-1">OkeyGolf 내부 운영자 전용 — AI 정책, 프롬프트, 엔진, 서비스 운영 관리</p>
      </div>

      <Card className="bg-amber-500/5 border-amber-500/20">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs text-amber-400">⚠️ 이 영역은 OkeyGolf 내부 운영자만 접근할 수 있습니다. 고객사에게는 노출되지 않습니다.</p>
        </CardContent>
      </Card>

      {/* Consultant Operations */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-primary" />
          컨설턴트 운영
        </h2>
        <MenuLandingGrid columns={3}>
          {consultantOps.map((s) => (
            <MenuLandingCard key={s.title} title={s.title} description={s.desc} icon={s.icon} color={s.color} badge={s.badge} />
          ))}
        </MenuLandingGrid>
      </div>

      {/* AI Policy Operations */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-violet-400" />
          AI 정책 운영
        </h2>
        <MenuLandingGrid columns={3}>
          {aiPolicyOps.map((s) => (
            <MenuLandingCard key={s.title} title={s.title} description={s.desc} icon={s.icon} color={s.color} badge={s.badge} />
          ))}
        </MenuLandingGrid>
      </div>

      {/* System Operations */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-amber-400" />
          시스템 및 서비스 운영
        </h2>
        <MenuLandingGrid columns={3}>
          {systemOps.map((s) => (
            <MenuLandingCard key={s.title} title={s.title} description={s.desc} icon={s.icon} color={s.color} badge={s.badge} />
          ))}
        </MenuLandingGrid>
      </div>
    </div>
  );
}
