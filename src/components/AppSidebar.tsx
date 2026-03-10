import {
  LayoutDashboard, Bot, Settings2, TrendingUp, Megaphone, Palette,
  Briefcase, Search, MessageSquare, Bookmark, Settings, LogOut,
  Shield, Building
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "대시보드", url: "/dashboard", icon: LayoutDashboard },
  { title: "AI 비서", url: "/ai-assistant", icon: Bot },
  { title: "AI 운영팀", url: "/ai-operations", icon: Settings2 },
  { title: "AI 영업팀", url: "/ai-sales", icon: TrendingUp },
  { title: "AI 마케팅팀", url: "/ai-marketing", icon: Megaphone },
  { title: "AI 디자인팀", url: "/ai-design", icon: Palette },
  { title: "AI 경영지원", url: "/ai-business-support", icon: Briefcase },
  { title: "시장조사", url: "/market-research", icon: Search },
  { title: "전담 컨설턴트", url: "/consultant", icon: MessageSquare },
];

const utilItems = [
  { title: "저장된 결과", url: "/saved", icon: Bookmark },
  { title: "관리자 설정", url: "/settings", icon: Settings },
];

const internalItems = [
  { title: "운영자 관리", url: "/operator", icon: Shield },
  { title: "엔터프라이즈", url: "/enterprise", icon: Building },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { isOperator, logout } = useAuth();
  const isActive = (path: string) => location.pathname.startsWith(path);

  const renderMenuItems = (items: typeof mainItems) =>
    items.map((item) => (
      <SidebarMenuItem key={item.url}>
        <SidebarMenuButton asChild isActive={isActive(item.url)}>
          <NavLink to={item.url} activeClassName="bg-sidebar-accent text-sidebar-accent-foreground">
            <item.icon className="h-4 w-4" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        <div className={`px-4 py-5 ${collapsed ? "px-2" : ""}`}>
          {collapsed ? (
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">O</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-bold text-sm">O</span>
              </div>
              <div>
                <h1 className="text-sidebar-accent-foreground font-semibold text-sm leading-tight">OkeyGolf</h1>
                <p className="text-sidebar-foreground text-[11px]">AI Manager</p>
              </div>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-[11px] uppercase tracking-wider">메인 메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenuItems(mainItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-[11px] uppercase tracking-wider">시스템</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenuItems(utilItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Operator-only: hidden from customer sidebar */}
        {isOperator && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-[11px] uppercase tracking-wider opacity-50">내부 관리</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderMenuItems(internalItems)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SidebarMenuButton className="text-sidebar-foreground hover:text-destructive" onClick={logout}>
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>로그아웃</span>}
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
