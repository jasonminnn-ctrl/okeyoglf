import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, Phone, Mail, MapPin } from "lucide-react";
import { useBusinessContext, businessTypeLabels, BusinessType } from "@/contexts/BusinessContext";

export default function SettingsCompanyTab() {
  const { businessType, setBusinessType } = useBusinessContext();

  return (
    <div className="space-y-6">
      {/* 조직 기본정보 */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            조직 기본정보
          </CardTitle>
          <CardDescription>사업체의 기본 정보를 입력하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>회사명 / 사업장명</Label>
              <Input placeholder="OkeyGolf 연습장" />
            </div>
            <div className="space-y-2">
              <Label>대표자명 <Badge variant="outline" className="ml-1 text-[10px]">준비 중</Badge></Label>
              <Input placeholder="홍길동" disabled className="opacity-60" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Phone className="h-3 w-3" /> 연락처</Label>
              <Input placeholder="031-XXX-XXXX" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Mail className="h-3 w-3" /> 이메일</Label>
              <Input placeholder="info@okeygolf.com" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><MapPin className="h-3 w-3" /> 주소</Label>
              <Input placeholder="경기도 용인시 ..." />
            </div>
            <div className="space-y-2">
              <Label>지점명 / 조직명</Label>
              <Input placeholder="본점" />
            </div>
          </div>
          <Button>저장</Button>
        </CardContent>
      </Card>

      {/* 업종 선택 */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            업종 및 운영 형태
          </CardTitle>
          <CardDescription>대표 업종과 운영 방식을 선택하세요. AI 모듈이 업종에 맞는 분석을 제공합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>대표 업종 선택</Label>
              <Select value={businessType} onValueChange={(v) => setBusinessType(v as BusinessType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(businessTypeLabels) as [BusinessType, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>다중 업종 여부 <Badge variant="outline" className="ml-1 text-[10px]">준비 중</Badge></Label>
              <Input placeholder="해당 시 복수 선택" disabled className="opacity-60" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>운영 형태 <Badge variant="outline" className="ml-1 text-[10px]">준비 중</Badge></Label>
              <Input placeholder="B2C / B2B / 혼합" disabled className="opacity-60" />
            </div>
            <div className="space-y-2">
              <Label>지점 형태</Label>
              <Select defaultValue="single">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">단일 지점</SelectItem>
                  <SelectItem value="multi">다지점</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>예약 운영 여부 <Badge variant="outline" className="ml-1 text-[10px]">준비 중</Badge></Label>
              <Input placeholder="예약제 / 선착순" disabled className="opacity-60" />
            </div>
          </div>
          <Button>저장</Button>
        </CardContent>
      </Card>
    </div>
  );
}
