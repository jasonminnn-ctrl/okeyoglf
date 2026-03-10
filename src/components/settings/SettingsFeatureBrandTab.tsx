import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Palette, Upload, ToggleRight } from "lucide-react";

export default function SettingsFeatureBrandTab() {
  return (
    <div className="space-y-6">
      {/* 기능 및 이용 설정 */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ToggleRight className="h-4 w-4 text-primary" />
            기능 및 이용 설정
          </CardTitle>
          <CardDescription>조직 내부에서 사용하는 알림, 공유, 기본값 등을 설정하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-border/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 text-muted-foreground text-xs">
                  <th className="text-left px-4 py-2.5 font-medium">설정 항목</th>
                  <th className="text-center px-4 py-2.5 font-medium">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {[
                  { name: "AI 생성 결과 자동 저장", enabled: true },
                  { name: "생성 완료 알림 (앱 내)", enabled: true },
                  { name: "결과 카카오톡 공유 허용", enabled: false, badge: "준비 중" },
                  { name: "결과 PDF 내보내기 허용", enabled: false, badge: "준비 중" },
                  { name: "내부 메모 첨부 허용", enabled: false, badge: "준비 중" },
                ].map((row) => (
                  <tr key={row.name}>
                    <td className="px-4 py-3 font-medium">
                      {row.name}
                      {row.badge && <Badge variant="outline" className="ml-2 text-[10px]">{row.badge}</Badge>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Switch checked={row.enabled} disabled={!!row.badge} className="scale-75" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 브랜드 / 자료 설정 */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            브랜드 / 자료 설정
          </CardTitle>
          <CardDescription>브랜드 정보와 참고 자료를 등록하면 AI 결과물에 반영됩니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>브랜드명</Label>
              <Input placeholder="OkeyGolf" />
            </div>
            <div className="space-y-2">
              <Label>슬로건 / 캐치프레이즈 <Badge variant="outline" className="ml-1 text-[10px]">준비 중</Badge></Label>
              <Input placeholder="예: 골프의 시작과 끝" disabled className="opacity-60" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Upload className="h-3 w-3" /> 로고 파일 <Badge variant="outline" className="ml-1 text-[10px]">준비 중</Badge></Label>
              <div className="h-10 rounded-md border border-dashed border-border/50 flex items-center justify-center text-xs text-muted-foreground">로고 파일 업로드 (준비 중)</div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Upload className="h-3 w-3" /> 브랜드 가이드 <Badge variant="outline" className="ml-1 text-[10px]">준비 중</Badge></Label>
              <div className="h-10 rounded-md border border-dashed border-border/50 flex items-center justify-center text-xs text-muted-foreground">가이드 파일 업로드 (준비 중)</div>
            </div>
          </div>
          <Button>저장</Button>
        </CardContent>
      </Card>
    </div>
  );
}
