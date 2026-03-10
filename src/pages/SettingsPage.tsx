import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, Building2, Briefcase, Users, Palette, BarChart3 } from "lucide-react";
import SettingsCompanyTab from "@/components/settings/SettingsCompanyTab";
import SettingsOperationsTab from "@/components/settings/SettingsOperationsTab";
import SettingsUsersTab from "@/components/settings/SettingsUsersTab";
import SettingsFeatureBrandTab from "@/components/settings/SettingsFeatureBrandTab";
import SettingsUsageTab from "@/components/settings/SettingsUsageTab";

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          관리자 설정
        </h1>
        <p className="text-muted-foreground text-sm mt-1">사업체 기본정보와 운영 환경을 설정하세요. 입력된 정보는 AI 모듈의 기본 맥락으로 활용됩니다.</p>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs text-primary">💡 이곳에서 입력한 조직 정보와 운영 기준은 AI 비서, AI 운영팀 등 각 모듈에서 자동으로 참조됩니다. AI 정책·프롬프트·엔진 설정은 OkeyGolf 내부 운영팀이 관리합니다.</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="w-full justify-start bg-muted/30 p-1 h-auto gap-1">
          <TabsTrigger value="company" className="text-xs px-3 py-1.5 gap-1.5">
            <Building2 className="h-3 w-3" />회사/업종
          </TabsTrigger>
          <TabsTrigger value="operations" className="text-xs px-3 py-1.5 gap-1.5">
            <Briefcase className="h-3 w-3" />운영정보
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs px-3 py-1.5 gap-1.5">
            <Users className="h-3 w-3" />사용자/권한
          </TabsTrigger>
          <TabsTrigger value="feature-brand" className="text-xs px-3 py-1.5 gap-1.5">
            <Palette className="h-3 w-3" />기능/브랜드
          </TabsTrigger>
          <TabsTrigger value="usage" className="text-xs px-3 py-1.5 gap-1.5">
            <BarChart3 className="h-3 w-3" />이용현황
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company"><SettingsCompanyTab /></TabsContent>
        <TabsContent value="operations"><SettingsOperationsTab /></TabsContent>
        <TabsContent value="users"><SettingsUsersTab /></TabsContent>
        <TabsContent value="feature-brand"><SettingsFeatureBrandTab /></TabsContent>
        <TabsContent value="usage"><SettingsUsageTab /></TabsContent>
      </Tabs>
    </div>
  );
}
