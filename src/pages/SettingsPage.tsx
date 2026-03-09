import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Building2, Users, Bell } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          관리자 설정
        </h1>
        <p className="text-muted-foreground text-sm mt-1">조직 및 사용자 설정을 관리하세요</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            조직 정보
          </CardTitle>
          <CardDescription>골프장/연습장 기본 정보</CardDescription>
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
                  <SelectItem value="driving-range">골프 연습장</SelectItem>
                  <SelectItem value="golf-course">골프장</SelectItem>
                  <SelectItem value="indoor">스크린 골프</SelectItem>
                  <SelectItem value="academy">골프 아카데미</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>주소</Label>
            <Input placeholder="경기도 용인시..." />
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            사용자 관리
          </CardTitle>
          <CardDescription>팀원 역할 및 권한 설정</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "박대표", email: "park@okeygolf.com", role: "Admin" },
              { name: "이매니저", email: "lee@okeygolf.com", role: "Manager" },
              { name: "최주임", email: "choi@okeygolf.com", role: "Viewer" },
            ].map((user, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Select defaultValue={user.role.toLowerCase()}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-4">팀원 초대</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            알림 설정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">알림 기능은 추후 업데이트 예정입니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}
