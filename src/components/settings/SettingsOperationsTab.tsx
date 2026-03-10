import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, Upload } from "lucide-react";
import { useBusinessContext } from "@/contexts/BusinessContext";

const businessTypeFields: Record<string, { label: string; placeholder?: string }[]> = {
  indoor: [
    { label: "타석 수", placeholder: "예: 60" },
    { label: "운영시간", placeholder: "예: 06:00 ~ 24:00" },
    { label: "휴무일", placeholder: "예: 연중무휴" },
    { label: "레슨 운영 여부", placeholder: "예: 운영 중" },
    { label: "프로/강사 수", placeholder: "예: 5명" },
    { label: "회원권 운영 여부", placeholder: "예: 월정액 회원권" },
    { label: "시간권 운영 여부", placeholder: "예: 1시간권 / 30분권" },
  ],
  course: [
    { label: "코스 수", placeholder: "예: 18홀" },
    { label: "운영시간 / 티타임 운영 시간", placeholder: "예: 06:00 ~ 18:00" },
    { label: "패키지 운영 여부", placeholder: "예: 숙박+라운드 패키지" },
  ],
  academy: [
    { label: "강사 수", placeholder: "예: 3명" },
    { label: "수업 운영 시간", placeholder: "예: 10:00 ~ 21:00" },
    { label: "반 운영 여부", placeholder: "예: 초급/중급/상급반" },
    { label: "체험레슨 여부", placeholder: "예: 무료 체험 1회" },
    { label: "정규반 여부", placeholder: "예: 주 2회 정규반" },
  ],
  shop: [
    { label: "주요 판매 카테고리", placeholder: "예: 클럽, 의류, 용품" },
    { label: "온라인/오프라인 운영 여부", placeholder: "예: 온+오프라인" },
    { label: "브랜드 취급 현황", placeholder: "예: 캘러웨이, 타이틀리스트" },
    { label: "시즌 기획 운영 여부", placeholder: "예: 분기별 기획전" },
  ],
  fitting: [
    { label: "예약 운영 여부", placeholder: "예: 온라인 예약제" },
    { label: "브랜드 취급 현황", placeholder: "예: 핑, 미즈노, 타이틀리스트" },
  ],
  company: [
    { label: "주요 상품/서비스", placeholder: "예: 골프용품 유통" },
    { label: "B2B / B2C 여부", placeholder: "예: B2B + B2C" },
    { label: "거래처/파트너 운영 여부", placeholder: "예: 거래처 50개" },
    { label: "제안서 운영 여부", placeholder: "예: 분기별 제안" },
  ],
};

export default function SettingsOperationsTab() {
  const { businessType, label, orgProfile, updateOrgProfile, updateOperationField } = useBusinessContext();
  const fields = businessTypeFields[businessType] || [];

  return (
    <div className="space-y-6">
      {/* 업종별 운영 기본정보 */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-primary" />
            업종별 운영 기본정보
            <Badge className="ml-2 bg-primary/10 text-primary text-[10px]">{label}</Badge>
          </CardTitle>
          <CardDescription>선택한 업종({label})에 맞는 운영 기본 정보를 입력하세요. AI 모듈이 이 정보를 기반으로 분석합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>운영시간</Label>
            <Input
              placeholder="예: 06:00 ~ 24:00"
              value={orgProfile.operatingHours}
              onChange={e => updateOrgProfile({ operatingHours: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.label} className="space-y-2">
                <Label>{f.label}</Label>
                <Input
                  placeholder={f.placeholder}
                  value={orgProfile.operationFields[f.label] || ""}
                  onChange={e => updateOperationField(f.label, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Upload className="h-3 w-3" /> 가격표 업로드 <Badge variant="outline" className="ml-1 text-[10px]">준비 중</Badge></Label>
            <div className="h-16 rounded-md border border-dashed border-border/50 flex items-center justify-center text-xs text-muted-foreground">가격표 파일 업로드 영역 (준비 중)</div>
          </div>
        </CardContent>
      </Card>

      {/* 내부 실무 기준정보 */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base">내부 실무 기준정보</CardTitle>
          <CardDescription>사업장에서 자주 쓰는 용어, 운영 메모 등을 입력하세요. AI가 결과 생성 시 참조합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>자주 쓰는 용어</Label>
            <Textarea
              placeholder="예: 타석 → 베이, 프론트 → 접수 데스크"
              value={orgProfile.internalTerms}
              onChange={e => updateOrgProfile({ internalTerms: e.target.value })}
              className="min-h-[60px]"
            />
          </div>
          <div className="space-y-2">
            <Label>내부 운영 메모</Label>
            <Textarea
              placeholder="예: 주중 오전 할인은 반드시 안내, VIP 고객 별도 관리"
              value={orgProfile.internalNotes}
              onChange={e => updateOrgProfile({ internalNotes: e.target.value })}
              className="min-h-[60px]"
            />
          </div>
          <Card className="bg-muted/30 border-border/30">
            <CardContent className="pt-3 pb-3">
              <p className="text-[11px] text-muted-foreground">ℹ️ 이 항목들은 프롬프트 규칙이 아닌 사업장 맥락 정보입니다. AI 정책 및 프롬프트 규칙은 OkeyGolf 운영팀이 내부적으로 관리합니다.</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
