import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Users, Shield, UserPlus, Trash2 } from "lucide-react";

export default function SettingsUsersTab() {
  return (
    <div className="space-y-6">
      {/* 사용자 관리 */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                사용자 관리
              </CardTitle>
              <CardDescription>조직 내 사용자 계정을 관리하세요</CardDescription>
            </div>
            <Button size="sm" className="gap-1.5 text-xs">
              <UserPlus className="h-3.5 w-3.5" />사용자 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 text-muted-foreground text-xs">
                  <th className="text-left px-4 py-2.5 font-medium">이름</th>
                  <th className="text-left px-4 py-2.5 font-medium">이메일</th>
                  <th className="text-left px-4 py-2.5 font-medium">역할</th>
                  <th className="text-left px-4 py-2.5 font-medium">상태</th>
                  <th className="text-right px-4 py-2.5 font-medium">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                <tr>
                  <td className="px-4 py-3 font-medium">관리자</td>
                  <td className="px-4 py-3 text-muted-foreground">admin@okeygolf.com</td>
                  <td className="px-4 py-3"><Badge className="bg-primary/10 text-primary text-[10px]">관리자</Badge></td>
                  <td className="px-4 py-3"><Badge variant="outline" className="text-[10px] text-green-500 border-green-500/30">활성</Badge></td>
                  <td className="px-4 py-3 text-right text-muted-foreground text-xs">—</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">김매니저</td>
                  <td className="px-4 py-3 text-muted-foreground">manager@okeygolf.com</td>
                  <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">매니저</Badge></td>
                  <td className="px-4 py-3"><Badge variant="outline" className="text-[10px] text-green-500 border-green-500/30">활성</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">박직원</td>
                  <td className="px-4 py-3 text-muted-foreground">staff@okeygolf.com</td>
                  <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">직원</Badge></td>
                  <td className="px-4 py-3"><Badge variant="outline" className="text-[10px] text-yellow-500 border-yellow-500/30">초대 중</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 역할별 권한 */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            역할별 권한 설정
          </CardTitle>
          <CardDescription>각 역할이 접근할 수 있는 기능 범위를 설정하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 text-muted-foreground text-xs">
                  <th className="text-left px-4 py-2.5 font-medium">기능</th>
                  <th className="text-center px-4 py-2.5 font-medium">관리자</th>
                  <th className="text-center px-4 py-2.5 font-medium">매니저</th>
                  <th className="text-center px-4 py-2.5 font-medium">직원</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {[
                  { name: "AI 생성 실행", admin: true, manager: true, staff: true },
                  { name: "결과 저장/복사", admin: true, manager: true, staff: true },
                  { name: "결과 재생성", admin: true, manager: true, staff: false },
                  { name: "전담 컨설턴트 전환", admin: true, manager: false, staff: false },
                  { name: "사용자 관리", admin: true, manager: false, staff: false },
                  { name: "관리자 설정 변경", admin: true, manager: false, staff: false },
                ].map((row) => (
                  <tr key={row.name}>
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-4 py-3 text-center"><Switch checked={row.admin} disabled className="scale-75" /></td>
                    <td className="px-4 py-3 text-center"><Switch checked={row.manager} className="scale-75" /></td>
                    <td className="px-4 py-3 text-center"><Switch checked={row.staff} className="scale-75" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button className="mt-4">저장</Button>
        </CardContent>
      </Card>
    </div>
  );
}
