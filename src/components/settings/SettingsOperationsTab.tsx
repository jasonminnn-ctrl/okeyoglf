import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    { label: "주요 고객층", placeholder: "예: 30~50대 직장인 (준비 중)" },
    { label: "예약 운영 여부", placeholder: "예: 앱 예약 (준비 중)" },
  ],
  course: [
    { label: "코스 수", placeholder: "예: 18홀 (준비 중)" },
    { label: "운영시간 / 티타임 운영 시간", placeholder: "예: 06:00 ~ 18:00" },
    { label: "주중/주말 운영 구분", placeholder: "예: 요금 차등 (준비 중)" },
    { label: "부대시설 여부", placeholder: "예: 클럽하우스, 사우나 (준비 중)" },
    { label: "패키지 운영 여부", placeholder: "예: 숙박+라운드 패키지" },
    { label: "판매 채널 구조", placeholder: "예: 자체+OTA (준비 중)" },
    { label: "주요 고객층", placeholder: "예: 40~60대 동호회 (준비 중)" },
  ],
  academy: [
    { label: "강사 수", placeholder: "예: 3명" },
    { label: "수업 운영 시간", placeholder: "예: 10:00 ~ 21:00" },
    { label: "반 운영 여부", placeholder: "예: 초급/중급/상급반" },
    { label: "체험레슨 여부", placeholder: "예: 무료 체험 1회" },
    { label: "정규반 여부", placeholder: "예: 주 2회 정규반" },
    { label: "주요 대상군", placeholder: "예: 입문자, 주부 (준비 중)" },
    { label: "교육 프로그램 요약", placeholder: "예: 8주 커리큘럼 (준비 중)" },
    { label: "상담/등록 운영 방식", placeholder: "예: 전화+방문 상담 (준비 중)" },
  ],
  shop: [
    { label: "주요 판매 카테고리", placeholder: "예: 클럽, 의류, 용품" },
    { label: "온라인/오프라인 운영 여부", placeholder: "예: 온+오프라인" },
    { label: "브랜드 취급 현황", placeholder: "예: 캘러웨이, 타이틀리스트" },
    { label: "시즌 기획 운영 여부", placeholder: "예: 분기별 기획전" },
    { label: "평균 판매가", placeholder: "예: 35만원 (준비 중)" },
    { label: "주요 고객층", placeholder: "예: 30~50대 (준비 중)" },
    { label: "대표 상품군", placeholder: "예: 드라이버, 아이언세트 (준비 중)" },
  ],
  fitting: [
    { label: "예약 운영 여부", placeholder: "예: 온라인 예약제" },
    { label: "피팅 가능 인원/슬롯", placeholder: "예: 일 8슬롯 (준비 중)" },
    { label: "브랜드 취급 현황", placeholder: "예: 핑, 미즈노, 타이틀리스트" },
    { label: "상담 프로세스 요약", placeholder: "예: 상담→분석→피팅→주문 (준비 중)" },
    { label: "구매 전환 추적 여부", placeholder: "예: 추적 중 (준비 중)" },
    { label: "후기 수집 운영 여부", placeholder: "예: 카카오 후기 (준비 중)" },
  ],
  company: [
    { label: "회사 유형", placeholder: "예: 브랜드사/유통사/회원권사 (준비 중)" },
    { label: "주요 상품/서비스", placeholder: "예: 골프용품 유통" },
    { label: "B2B / B2C 여부", placeholder: "예: B2B + B2C" },
    { label: "거래처/파트너 운영 여부", placeholder: "예: 거래처 50개" },
    { label: "제안서 운영 여부", placeholder: "예: 분기별 제안" },
    { label: "영업 프로세스 요약", placeholder: "예: 리드→미팅→제안→계약 (준비 중)" },
  ],
};

export default function SettingsOperationsTab() {
  const { businessType, label } = useBusinessContext();
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((f) => {
              const isPlaceholder = f.placeholder?.includes("준비 중");
              return (
                <div key={f.label} className="space-y-2">
                  <Label>{f.label} {isPlaceholder && <Badge variant="outline" className="ml-1 text-[10px]">준비 중</Badge>}</Label>
                  <Input placeholder={f.placeholder} disabled={!!isPlaceholder} className={isPlaceholder ? "opacity-60" : ""} />
                </div>
              );
            })}
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Upload className="h-3 w-3" /> 가격표 업로드 <Badge variant="outline" className="ml-1 text-[10px]">준비 중</Badge></Label>
            <div className="h-16 rounded-md border border-dashed border-border/50 flex items-center justify-center text-xs text-muted-foreground">가격표 파일 업로드 영역 (준비 중)</div>
          </div>
          <Button>저장</Button>
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
            <Label>자주 쓰는 용어 <Badge variant="outline" className="ml-1 text-[10px]">준비 중</Badge></Label>
            <Textarea placeholder="예: 타석 → 베이, 프론트 → 접수 데스크" disabled className="opacity-60 min-h-[60px]" />
          </div>
          <div className="space-y-2">
            <Label>내부 운영 메모 <Badge variant="outline" className="ml-1 text-[10px]">준비 중</Badge></Label>
            <Textarea placeholder="예: 주중 오전 할인은 반드시 안내, VIP 고객 별도 관리" disabled className="opacity-60 min-h-[60px]" />
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
