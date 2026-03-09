import { Shield, Inbox, FileText, StickyNote, Upload, Users, Clock, Settings2, Database, Cpu } from "lucide-react";
import { MenuLandingCard, MenuLandingGrid } from "@/components/MenuLandingCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const operatorSections = [
  { title: "컨설턴트 요청 접수함", desc: "고객 요청 목록 확인 및 처리", icon: Inbox, color: "bg-primary/10 text-primary" },
  { title: "요청 상세 보기", desc: "개별 요청 상세 내용 및 진행 상태", icon: FileText, color: "bg-amber-500/10 text-amber-400" },
  { title: "내부 메모", desc: "요청 건별 내부 메모 및 코멘트 관리", icon: StickyNote, color: "bg-blue-500/10 text-blue-400" },
  { title: "결과 업로드", desc: "컨설팅 결과물 업로드 및 전달", icon: Upload, color: "bg-violet-500/10 text-violet-400" },
  { title: "고객별 요청 이력", desc: "고객 단위 요청 이력 조회 및 관리", icon: Clock, color: "bg-emerald-500/10 text-emerald-400" },
  { title: "조직별 관리", desc: "조직 단위 고객사 현황 관리", icon: Users, color: "bg-cyan-500/10 text-cyan-400" },
  { title: "프롬프트 운영", desc: "AI 프롬프트 현황 모니터링 및 관리", icon: Settings2, color: "bg-pink-500/10 text-pink-400", badge: "준비 중" },
  { title: "엔진 운영", desc: "ROS 엔진 상태 확인 및 설정", icon: Cpu, color: "bg-orange-500/10 text-orange-400", badge: "준비 중" },
  { title: "지식베이스 운영", desc: "지식베이스 데이터 관리 및 업데이트", icon: Database, color: "bg-yellow-500/10 text-yellow-400", badge: "준비 중" },
];

export default function OperatorPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          운영자 관리
        </h1>
        <p className="text-muted-foreground text-sm mt-1">OkeyGolf 내부 운영자 전용 관리 영역</p>
      </div>

      <Card className="bg-amber-500/5 border-amber-500/20">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs text-amber-400">⚠️ 이 영역은 OkeyGolf 내부 운영자만 접근할 수 있습니다</p>
        </CardContent>
      </Card>

      <MenuLandingGrid columns={3}>
        {operatorSections.map((s) => (
          <MenuLandingCard key={s.title} title={s.title} description={s.desc} icon={s.icon} color={s.color} badge={s.badge} />
        ))}
      </MenuLandingGrid>
    </div>
  );
}
