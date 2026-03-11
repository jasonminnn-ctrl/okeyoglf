/**
 * OkeyGolf OS — 업종별 운영팀/영업팀/마케팅팀 카드 정의
 * 
 * 운영팀과 영업팀은 6개 업종별로 완전히 다른 카드 세트를 사용한다.
 * 마케팅팀은 공통 카드 세트를 사용한다.
 * 시장조사는 독립 메뉴이며 마케팅팀에 메인 카드로 포함하지 않는다.
 */

import type { BusinessType } from "@/contexts/BusinessContext";
import type { LucideIcon } from "lucide-react";
import {
  // Operations icons
  CreditCard, Users, UserCheck, GraduationCap, LayoutGrid, Lock as LockIcon,
  CalendarCheck, ClipboardList, TreePine, Building, PartyPopper, ShieldCheck,
  BookOpen, Timer, Clock, Layers,
  Package, Boxes, ArrowUpDown, Truck, Store, RefreshCcw as Repeat,
  Calendar, UserCog, Settings2, Wrench, FileSearch, Bell,
  Handshake, Briefcase, BarChart3, Activity, Kanban,
  // Sales icons
  DollarSign, TrendingUp, RefreshCcw, UserX, MessageCircle, HeadphonesIcon,
  Repeat2, Target, ShoppingBag, Crown, Zap,
  Globe, Megaphone, CreditCard as CreditCardIcon,
  // Marketing icons
  PenTool, Calendar as CalendarIcon, Share2, BarChart2, Sparkles,
} from "lucide-react";

export interface IndustryCard {
  key: string;
  icon: LucideIcon;
  color: string;
  /** If set, card navigates to this url */
  url?: string;
  /** Feature key for access control. If omitted, card shows as "준비중" */
  featureKey?: string;
}

// ════════════════════════════════════════
// 운영팀 카드 (업종별 분기)
// ════════════════════════════════════════

export const operationsCards: Record<BusinessType, IndustryCard[]> = {
  indoor: [
    { key: "이용권관리", icon: CreditCard, color: "bg-primary/10 text-primary" },
    { key: "회원관리", icon: Users, color: "bg-amber-500/10 text-amber-400" },
    { key: "프로·매니저관리", icon: UserCheck, color: "bg-blue-500/10 text-blue-400" },
    { key: "레슨관리", icon: GraduationCap, color: "bg-violet-500/10 text-violet-400" },
    { key: "타석관리", icon: LayoutGrid, color: "bg-emerald-500/10 text-emerald-400" },
    { key: "락커관리", icon: LockIcon, color: "bg-cyan-500/10 text-cyan-400" },
  ],
  course: [
    { key: "예약·티타임관리", icon: CalendarCheck, color: "bg-primary/10 text-primary" },
    { key: "운영 배정관리", icon: ClipboardList, color: "bg-amber-500/10 text-amber-400" },
    { key: "코스·현장관리", icon: TreePine, color: "bg-blue-500/10 text-blue-400" },
    { key: "락커·부대시설관리", icon: Building, color: "bg-violet-500/10 text-violet-400" },
    { key: "단체·행사 운영", icon: PartyPopper, color: "bg-emerald-500/10 text-emerald-400" },
    { key: "운영 점검관리", icon: ShieldCheck, color: "bg-cyan-500/10 text-cyan-400" },
  ],
  academy: [
    { key: "교육상품관리", icon: BookOpen, color: "bg-primary/10 text-primary" },
    { key: "수강생관리", icon: Users, color: "bg-amber-500/10 text-amber-400" },
    { key: "코치·강사관리", icon: UserCheck, color: "bg-blue-500/10 text-blue-400" },
    { key: "수업·시간표관리", icon: Timer, color: "bg-violet-500/10 text-violet-400" },
    { key: "출결·보강관리", icon: Clock, color: "bg-emerald-500/10 text-emerald-400" },
    { key: "시설·타석관리", icon: LayoutGrid, color: "bg-cyan-500/10 text-cyan-400" },
  ],
  shop: [
    { key: "상품관리", icon: Package, color: "bg-primary/10 text-primary" },
    { key: "재고관리", icon: Boxes, color: "bg-amber-500/10 text-amber-400" },
    { key: "입출고·발주관리", icon: ArrowUpDown, color: "bg-blue-500/10 text-blue-400" },
    { key: "주문·배송관리", icon: Truck, color: "bg-violet-500/10 text-violet-400" },
    { key: "매장·진열관리", icon: Store, color: "bg-emerald-500/10 text-emerald-400" },
    { key: "CS·교환반품 관리", icon: Repeat, color: "bg-cyan-500/10 text-cyan-400" },
  ],
  fitting: [
    { key: "예약관리", icon: Calendar, color: "bg-primary/10 text-primary" },
    { key: "피터·상담사 관리", icon: UserCog, color: "bg-amber-500/10 text-amber-400" },
    { key: "피팅세션 관리", icon: Settings2, color: "bg-blue-500/10 text-blue-400" },
    { key: "장비·재고관리", icon: Wrench, color: "bg-violet-500/10 text-violet-400" },
    { key: "결과기록 관리", icon: FileSearch, color: "bg-emerald-500/10 text-emerald-400" },
    { key: "노쇼·사후관리", icon: Bell, color: "bg-cyan-500/10 text-cyan-400" },
  ],
  company: [
    { key: "거래처관리", icon: Handshake, color: "bg-primary/10 text-primary" },
    { key: "파트너관리", icon: Users, color: "bg-amber-500/10 text-amber-400" },
    { key: "상품·브랜드 운영", icon: Briefcase, color: "bg-blue-500/10 text-blue-400" },
    { key: "프로젝트·캠페인 운영", icon: Kanban, color: "bg-violet-500/10 text-violet-400" },
    { key: "채널 운영현황", icon: Activity, color: "bg-emerald-500/10 text-emerald-400" },
    { key: "진행현황 관리", icon: BarChart3, color: "bg-cyan-500/10 text-cyan-400" },
  ],
};

// ════════════════════════════════════════
// 영업팀 카드 (업종별 분기)
// ════════════════════════════════════════

export const salesCards: Record<BusinessType, IndustryCard[]> = {
  indoor: [
    { key: "요금결정", icon: DollarSign, color: "bg-primary/10 text-primary" },
    { key: "KPI 관리", icon: TrendingUp, color: "bg-amber-500/10 text-amber-400" },
    { key: "재등록관리", icon: RefreshCcw, color: "bg-blue-500/10 text-blue-400", url: "/ai-sales/re-registration" },
    { key: "미방문 관리", icon: UserX, color: "bg-violet-500/10 text-violet-400" },
    { key: "응대 문안", icon: MessageCircle, color: "bg-emerald-500/10 text-emerald-400", url: "/ai-sales/response-script" },
    { key: "상담관리", icon: HeadphonesIcon, color: "bg-cyan-500/10 text-cyan-400" },
  ],
  course: [
    { key: "요금결정", icon: DollarSign, color: "bg-primary/10 text-primary" },
    { key: "잔여타임 판매", icon: Timer, color: "bg-amber-500/10 text-amber-400" },
    { key: "채널·OTA 관리", icon: Globe, color: "bg-blue-500/10 text-blue-400" },
    { key: "패키지·단체 제안", icon: Package, color: "bg-violet-500/10 text-violet-400" },
    { key: "KPI 관리", icon: TrendingUp, color: "bg-emerald-500/10 text-emerald-400" },
    { key: "응대 문안", icon: MessageCircle, color: "bg-cyan-500/10 text-cyan-400", url: "/ai-sales/response-script" },
  ],
  academy: [
    { key: "체험등록 전환", icon: Zap, color: "bg-primary/10 text-primary" },
    { key: "재등록관리", icon: RefreshCcw, color: "bg-amber-500/10 text-amber-400", url: "/ai-sales/re-registration" },
    { key: "이탈·미출석 관리", icon: UserX, color: "bg-blue-500/10 text-blue-400" },
    { key: "요금결정", icon: DollarSign, color: "bg-violet-500/10 text-violet-400" },
    { key: "KPI 관리", icon: TrendingUp, color: "bg-emerald-500/10 text-emerald-400" },
    { key: "상담관리", icon: HeadphonesIcon, color: "bg-cyan-500/10 text-cyan-400" },
  ],
  shop: [
    { key: "문의관리", icon: HeadphonesIcon, color: "bg-primary/10 text-primary" },
    { key: "구매전환 관리", icon: Target, color: "bg-amber-500/10 text-amber-400" },
    { key: "객단가 제안", icon: DollarSign, color: "bg-blue-500/10 text-blue-400" },
    { key: "VIP·단골 관리", icon: Crown, color: "bg-violet-500/10 text-violet-400" },
    { key: "KPI 관리", icon: TrendingUp, color: "bg-emerald-500/10 text-emerald-400" },
    { key: "응대 문안", icon: MessageCircle, color: "bg-cyan-500/10 text-cyan-400", url: "/ai-sales/response-script" },
  ],
  fitting: [
    { key: "상담관리", icon: HeadphonesIcon, color: "bg-primary/10 text-primary" },
    { key: "구매전환 관리", icon: Target, color: "bg-amber-500/10 text-amber-400" },
    { key: "브랜드·제품 제안", icon: ShoppingBag, color: "bg-blue-500/10 text-blue-400" },
    { key: "요금결정", icon: DollarSign, color: "bg-violet-500/10 text-violet-400" },
    { key: "KPI 관리", icon: TrendingUp, color: "bg-emerald-500/10 text-emerald-400" },
    { key: "응대 문안", icon: MessageCircle, color: "bg-cyan-500/10 text-cyan-400", url: "/ai-sales/response-script" },
  ],
  company: [
    { key: "리드관리", icon: Target, color: "bg-primary/10 text-primary" },
    { key: "제안관리", icon: Briefcase, color: "bg-amber-500/10 text-amber-400" },
    { key: "견적·요금결정", icon: DollarSign, color: "bg-blue-500/10 text-blue-400" },
    { key: "미응답·후속관리", icon: UserX, color: "bg-violet-500/10 text-violet-400" },
    { key: "KPI 관리", icon: TrendingUp, color: "bg-emerald-500/10 text-emerald-400" },
    { key: "응대 문안", icon: MessageCircle, color: "bg-cyan-500/10 text-cyan-400", url: "/ai-sales/response-script" },
  ],
};

// ════════════════════════════════════════
// 마케팅팀 카드 (공통)
// ════════════════════════════════════════

export const marketingCards: IndustryCard[] = [
  { key: "마케팅 카피 생성기", icon: PenTool, color: "bg-primary/10 text-primary", url: "/ai-marketing/copy" },
  { key: "이벤트 생성기", icon: PartyPopper, color: "bg-amber-500/10 text-amber-400" },
  { key: "프로모션 기획", icon: CalendarIcon, color: "bg-blue-500/10 text-blue-400", url: "/ai-marketing/promotion" },
  { key: "시즌 캠페인 제안", icon: BarChart2, color: "bg-violet-500/10 text-violet-400" },
  { key: "채널 현황", icon: Share2, color: "bg-emerald-500/10 text-emerald-400" },
  { key: "콘텐츠 생성기", icon: Sparkles, color: "bg-cyan-500/10 text-cyan-400" },
];
