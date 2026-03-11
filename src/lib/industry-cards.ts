import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowUpDown,
  BarChart2,
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  Briefcase,
  Building,
  Calendar,
  CalendarCheck,
  CreditCard,
  Crown,
  DollarSign,
  FileSearch,
  Globe,
  GraduationCap,
  Handshake,
  HeadphonesIcon,
  Kanban,
  LayoutGrid,
  Lock,
  MessageCircle,
  Package,
  PartyPopper,
  PenTool,
  RefreshCcw,
  Repeat,
  Settings2,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Target,
  Timer,
  TrendingUp,
  TreePine,
  Truck,
  UserCheck,
  UserCog,
  UserX,
  Users,
  Wrench,
  Zap,
  ClipboardList,
} from "lucide-react";

import type { BusinessType } from "@/contexts/BusinessContext";
import { INDUSTRY_FEATURE_KEYS, type IndustryFeatureKey } from "@/lib/industry-feature-keys";

export type IndustryCard = {
  key: string;
  icon: LucideIcon;
  color: string;
  url?: string;
  featureKey: IndustryFeatureKey;
};

export const operationsCards: Record<BusinessType, IndustryCard[]> = {
  indoor: [
    {
      key: "이용권관리",
      icon: CreditCard,
      color: "bg-primary/10 text-primary",
      featureKey: INDUSTRY_FEATURE_KEYS.OPERATIONS_INDOOR_PASS_MANAGEMENT,
    },
    {
      key: "회원관리",
      icon: Users,
      color: "bg-amber-500/10 text-amber-400",
      featureKey: INDUSTRY_FEATURE_KEYS.OPERATIONS_INDOOR_MEMBER_MANAGEMENT,
    },
    {
      key: "프로·매니저관리",
      icon: UserCheck,
      color: "bg-blue-500/10 text-blue-400",
      featureKey:
        INDUSTRY_FEATURE_KEYS.OPERATIONS_INDOOR_PRO_MANAGER_MANAGEMENT,
    },
    {
      key: "레슨관리",
      icon: GraduationCap,
      color: "bg-violet-500/10 text-violet-400",
      featureKey: INDUSTRY_FEATURE_KEYS.OPERATIONS_INDOOR_LESSON_MANAGEMENT,
    },
    {
      key: "타석관리",
      icon: LayoutGrid,
      color: "bg-emerald-500/10 text-emerald-400",
      featureKey: INDUSTRY_FEATURE_KEYS.OPERATIONS_INDOOR_BAY_MANAGEMENT,
    },
    {
      key: "락커관리",
      icon: Lock,
      color: "bg-cyan-500/10 text-cyan-400",
      featureKey: INDUSTRY_FEATURE_KEYS.OPERATIONS_INDOOR_LOCKER_MANAGEMENT,
    },
  ],
  course: [
    {
      key: "예약·티타임관리",
      icon: CalendarCheck,
      color: "bg-primary/10 text-primary",
      featureKey:
        INDUSTRY_FEATURE_KEYS.OPERATIONS_COURSE_RESERVATION_TEETIME_MANAGEMENT,
    },
    {
      key: "운영 배정관리",
      icon: ClipboardList,
      color: "bg-amber-500/10 text-amber-400",
      featureKey:
        INDUSTRY_FEATURE_KEYS.OPERATIONS_COURSE_OPERATION_ASSIGNMENT_MANAGEMENT,
    },
    {
      key: "코스·현장관리",
      icon: TreePine,
      color: "bg-blue-500/10 text-blue-400",
      featureKey:
        INDUSTRY_FEATURE_KEYS.OPERATIONS_COURSE_COURSE_FIELD_MANAGEMENT,
    },
    {
      key: "락커·부대시설관리",
      icon: Building,
      color: "bg-violet-500/10 text-violet-400",
      featureKey:
        INDUSTRY_FEATURE_KEYS.OPERATIONS_COURSE_LOCKER_FACILITY_MANAGEMENT,
    },
    {
      key: "단체·행사 운영",
      icon: PartyPopper,
      color: "bg-emerald-500/10 text-emerald-400",
      featureKey:
        INDUSTRY_FEATURE_KEYS.OPERATIONS_COURSE_GROUP_EVENT_OPERATIONS,
    },
    {
      key: "운영 점검관리",
      icon: ShieldCheck,
      color: "bg-cyan-500/10 text-cyan-400",
      featureKey:
        INDUSTRY_FEATURE_KEYS.OPERATIONS_COURSE_OPERATION_INSPECTION_MANAGEMENT,
    },
  ],
  academy: [
    {
      key: "교육상품관리",
      icon: BookOpen,
      color: "bg-primary/10 text-primary",
      featureKey:
        INDUSTRY_FEATURE_KEYS.OPERATIONS_ACADEMY_EDUCATION_PRODUCT_MANAGEMENT,
    },
    {
      key: "수강생관리",
      icon: Users,
      color: "bg-amber-500/10 text-amber-400",
      featureKey: INDUSTRY_FEATURE_KEYS.OPERATIONS_ACADEMY_STUDENT_MANAGEMENT,
    },
    {
      key: "코치·강사관리",
      icon: UserCheck,
      color: "bg-blue-500/10 text-blue-400",
      featureKey:
        INDUSTRY_FEATURE_KEYS.OPERATIONS_ACADEMY_COACH_INSTRUCTOR_MANAGEMENT,
    },
    {
      key: "수업·시간표관리",
      icon: Timer,
      color: "bg-violet-500/10 text-violet-400",
      featureKey:
        INDUSTRY_FEATURE_KEYS.OPERATIONS_ACADEMY_CLASS_SCHEDULE_MANAGEMENT,
    },
    {
      key: "출결·보강관리",
      icon: Calendar,
      color: "bg-emerald-500/10 text-emerald-400",
      featureKey:
        INDUSTRY_FEATURE_KEYS.OPERATIONS_ACADEMY_ATTENDANCE_MAKEUP_MANAGEMENT,
    },
    {
      key: "시설·타석관리",
      icon: LayoutGrid,
      color: "bg-cyan-500/10 text-cyan-400",
      featureKey:
        INDUSTRY_FEATURE_KEYS.OPERATIONS_ACADEMY_FACILITY_BAY_MANAGEMENT,
    },
  ],
  shop: [
    {
      key: "상품관리",
      icon: Package,
      color: "bg-primary/10 text-primary",
      featureKey: INDUSTRY_FEATURE_KEYS.OPERATIONS_SHOP_PRODUCT_MANAGEMENT,
    },
    {
      key: "재고관리",
      icon: Boxes,
      color: "bg-amber-500/10 text-amber-400",
      featureKey: INDUSTRY_FEATURE_KEYS.OPERATIONS_SHOP_INVENTORY_MANAGEMENT,
    },
    {
      key: "입출고·발주관리",
      icon: ArrowUpDown,
      color: "bg-blue-500/10 text-blue-400",
      featureKey:
        INDUSTRY_FEATURE_KEYS.OPERATIONS_SHOP_INBOUND_OUTBOUND_PROCUREMENT_MANAGEMENT,
    },
    {
      key: "주문·배송관리",
      icon: Truck,
      color: "bg-violet-500/10 text-violet-400",
      featureKey:
        INDUSTRY_FEATURE_KEYS.OPERATIONS_SHOP_ORDER_DELIVERY_MANAGEMENT,
    },
    {
      key: "매장·진열관리",
      icon: Store,
      color: "bg-emerald-500/10 text-emerald-400",
      featureKey:
        INDUSTRY_FEATURE_KEYS.OPERATIONS_SHOP_STORE_DISPLAY_MANAGEMENT,
    },
    {
      key: "CS·교환반품 관리",
      icon: Repeat,
      color: "bg-cyan-500/10 text-cyan-400",
      featureKey: INDUSTRY_FEATURE_KEYS.OPERATIONS_SHOP_CS_RETURNS_MANAGEMENT,
    },
  ],
  fitting: [
    {
      key: "예약관리",
      icon: Calendar,
      color: "bg-primary/10 text-primary",
      featureKey:
        INDUSTRY_FEATURE_KEYS.OPERATIONS_FITTING_RESERVATION_MANAGEMENT,
    },
    {
      key: "피터·상담사 관리",
      icon: UserCog,
      color: "bg-amber-500/10 text-amber-400",
      featureKey:
        INDUSTRY_FEATURE_KEYS.OPERATIONS_FITTING_FITTER_COUNSELOR_MANAGEMENT,
    },
    {
      key: "피팅세션 관리",
      icon: Settings2,
      color: "bg-blue-500/10 text-blue-400",
      featureKey:
        INDUSTRY_FEATURE_KEYS.OPERATIONS_FITTING_FITTING_SESSION_MANAGEMENT,
    },
    {
      key: "장비·재고관리",
      icon: Wrench,
      color: "bg-violet-500/10 text-violet-400",
      featureKey:
        INDUSTRY_FEATURE_KEYS.OPERATIONS_FITTING_EQUIPMENT_INVENTORY_MANAGEMENT,
    },
    {
      key: "결과기록 관리",
      icon: FileSearch,
      color: "bg-emerald-500/10 text-emerald-400",
      featureKey:
        INDUSTRY_FEATURE_KEYS.OPERATIONS_FITTING_RESULT_RECORD_MANAGEMENT,
    },
    {
      key: "노쇼·사후관리",
      icon: Bell,
      color: "bg-cyan-500/10 text-cyan-400",
      featureKey:
        INDUSTRY_FEATURE_KEYS.OPERATIONS_FITTING_NO_SHOW_FOLLOWUP_MANAGEMENT,
    },
  ],
  company: [
    {
      key: "거래처관리",
      icon: Handshake,
      color: "bg-primary/10 text-primary",
      featureKey: INDUSTRY_FEATURE_KEYS.OPERATIONS_COMPANY_ACCOUNT_MANAGEMENT,
    },
    {
      key: "파트너관리",
      icon: Users,
      color: "bg-amber-500/10 text-amber-400",
      featureKey: INDUSTRY_FEATURE_KEYS.OPERATIONS_COMPANY_PARTNER_MANAGEMENT,
    },
    {
      key: "상품·브랜드 운영",
      icon: Briefcase,
      color: "bg-blue-500/10 text-blue-400",
      featureKey:
        INDUSTRY_FEATURE_KEYS.OPERATIONS_COMPANY_PRODUCT_BRAND_OPERATIONS,
    },
    {
      key: "프로젝트·캠페인 운영",
      icon: Kanban,
      color: "bg-violet-500/10 text-violet-400",
      featureKey:
        INDUSTRY_FEATURE_KEYS.OPERATIONS_COMPANY_PROJECT_CAMPAIGN_OPERATIONS,
    },
    {
      key: "채널 운영현황",
      icon: Activity,
      color: "bg-emerald-500/10 text-emerald-400",
      featureKey:
        INDUSTRY_FEATURE_KEYS.OPERATIONS_COMPANY_CHANNEL_OPERATION_STATUS,
    },
    {
      key: "진행현황 관리",
      icon: BarChart3,
      color: "bg-cyan-500/10 text-cyan-400",
      featureKey:
        INDUSTRY_FEATURE_KEYS.OPERATIONS_COMPANY_PROGRESS_STATUS_MANAGEMENT,
    },
  ],
};

export const salesCards: Record<BusinessType, IndustryCard[]> = {
  indoor: [
    {
      key: "요금결정",
      icon: DollarSign,
      color: "bg-primary/10 text-primary",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_INDOOR_PRICING,
    },
    {
      key: "KPI 관리",
      icon: TrendingUp,
      color: "bg-amber-500/10 text-amber-400",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_INDOOR_KPI_MANAGEMENT,
    },
    {
      key: "재등록관리",
      icon: RefreshCcw,
      color: "bg-blue-500/10 text-blue-400",
      url: "/ai-sales/re-registration",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_INDOOR_REREGISTRATION_MANAGEMENT,
    },
    {
      key: "미방문 관리",
      icon: UserX,
      color: "bg-violet-500/10 text-violet-400",
      featureKey:
        INDUSTRY_FEATURE_KEYS.SALES_INDOOR_INACTIVE_VISITOR_MANAGEMENT,
    },
    {
      key: "응대 문안",
      icon: MessageCircle,
      color: "bg-emerald-500/10 text-emerald-400",
      url: "/ai-sales/response-script",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_INDOOR_RESPONSE_SCRIPT,
    },
    {
      key: "상담관리",
      icon: HeadphonesIcon,
      color: "bg-cyan-500/10 text-cyan-400",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_INDOOR_CONSULTATION_MANAGEMENT,
    },
  ],
  course: [
    {
      key: "요금결정",
      icon: DollarSign,
      color: "bg-primary/10 text-primary",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_COURSE_PRICING,
    },
    {
      key: "잔여타임 판매",
      icon: Timer,
      color: "bg-amber-500/10 text-amber-400",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_COURSE_UNSOLD_TEETIME_SALES,
    },
    {
      key: "채널·OTA 관리",
      icon: Globe,
      color: "bg-blue-500/10 text-blue-400",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_COURSE_CHANNEL_OTA_MANAGEMENT,
    },
    {
      key: "패키지·단체 제안",
      icon: Package,
      color: "bg-violet-500/10 text-violet-400",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_COURSE_PACKAGE_GROUP_PROPOSAL,
    },
    {
      key: "KPI 관리",
      icon: TrendingUp,
      color: "bg-emerald-500/10 text-emerald-400",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_COURSE_KPI_MANAGEMENT,
    },
    {
      key: "응대 문안",
      icon: MessageCircle,
      color: "bg-cyan-500/10 text-cyan-400",
      url: "/ai-sales/response-script",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_COURSE_RESPONSE_SCRIPT,
    },
  ],
  academy: [
    {
      key: "체험등록 전환",
      icon: Zap,
      color: "bg-primary/10 text-primary",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_ACADEMY_TRIAL_CONVERSION,
    },
    {
      key: "재등록관리",
      icon: RefreshCcw,
      color: "bg-amber-500/10 text-amber-400",
      url: "/ai-sales/re-registration",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_ACADEMY_REREGISTRATION_MANAGEMENT,
    },
    {
      key: "이탈·미출석 관리",
      icon: UserX,
      color: "bg-blue-500/10 text-blue-400",
      featureKey:
        INDUSTRY_FEATURE_KEYS.SALES_ACADEMY_CHURN_ABSENCE_MANAGEMENT,
    },
    {
      key: "요금결정",
      icon: DollarSign,
      color: "bg-violet-500/10 text-violet-400",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_ACADEMY_PRICING,
    },
    {
      key: "KPI 관리",
      icon: TrendingUp,
      color: "bg-emerald-500/10 text-emerald-400",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_ACADEMY_KPI_MANAGEMENT,
    },
    {
      key: "상담관리",
      icon: HeadphonesIcon,
      color: "bg-cyan-500/10 text-cyan-400",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_ACADEMY_CONSULTATION_MANAGEMENT,
    },
  ],
  shop: [
    {
      key: "문의관리",
      icon: HeadphonesIcon,
      color: "bg-primary/10 text-primary",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_SHOP_INQUIRY_MANAGEMENT,
    },
    {
      key: "구매전환 관리",
      icon: Target,
      color: "bg-amber-500/10 text-amber-400",
      featureKey:
        INDUSTRY_FEATURE_KEYS.SALES_SHOP_PURCHASE_CONVERSION_MANAGEMENT,
    },
    {
      key: "객단가 제안",
      icon: DollarSign,
      color: "bg-blue-500/10 text-blue-400",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_SHOP_BASKET_SIZE_PROPOSAL,
    },
    {
      key: "VIP·단골 관리",
      icon: Crown,
      color: "bg-violet-500/10 text-violet-400",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_SHOP_VIP_REGULAR_MANAGEMENT,
    },
    {
      key: "KPI 관리",
      icon: TrendingUp,
      color: "bg-emerald-500/10 text-emerald-400",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_SHOP_KPI_MANAGEMENT,
    },
    {
      key: "응대 문안",
      icon: MessageCircle,
      color: "bg-cyan-500/10 text-cyan-400",
      url: "/ai-sales/response-script",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_SHOP_RESPONSE_SCRIPT,
    },
  ],
  fitting: [
    {
      key: "상담관리",
      icon: HeadphonesIcon,
      color: "bg-primary/10 text-primary",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_FITTING_CONSULTATION_MANAGEMENT,
    },
    {
      key: "구매전환 관리",
      icon: Target,
      color: "bg-amber-500/10 text-amber-400",
      featureKey:
        INDUSTRY_FEATURE_KEYS.SALES_FITTING_PURCHASE_CONVERSION_MANAGEMENT,
    },
    {
      key: "브랜드·제품 제안",
      icon: ShoppingBag,
      color: "bg-blue-500/10 text-blue-400",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_FITTING_BRAND_PRODUCT_PROPOSAL,
    },
    {
      key: "요금결정",
      icon: DollarSign,
      color: "bg-violet-500/10 text-violet-400",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_FITTING_PRICING,
    },
    {
      key: "KPI 관리",
      icon: TrendingUp,
      color: "bg-emerald-500/10 text-emerald-400",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_FITTING_KPI_MANAGEMENT,
    },
    {
      key: "응대 문안",
      icon: MessageCircle,
      color: "bg-cyan-500/10 text-cyan-400",
      url: "/ai-sales/response-script",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_FITTING_RESPONSE_SCRIPT,
    },
  ],
  company: [
    {
      key: "리드관리",
      icon: Target,
      color: "bg-primary/10 text-primary",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_COMPANY_LEAD_MANAGEMENT,
    },
    {
      key: "제안관리",
      icon: Briefcase,
      color: "bg-amber-500/10 text-amber-400",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_COMPANY_PROPOSAL_MANAGEMENT,
    },
    {
      key: "견적·요금결정",
      icon: DollarSign,
      color: "bg-blue-500/10 text-blue-400",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_COMPANY_QUOTATION_PRICING,
    },
    {
      key: "미응답·후속관리",
      icon: UserX,
      color: "bg-violet-500/10 text-violet-400",
      featureKey:
        INDUSTRY_FEATURE_KEYS.SALES_COMPANY_NO_RESPONSE_FOLLOWUP_MANAGEMENT,
    },
    {
      key: "KPI 관리",
      icon: TrendingUp,
      color: "bg-emerald-500/10 text-emerald-400",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_COMPANY_KPI_MANAGEMENT,
    },
    {
      key: "응대 문안",
      icon: MessageCircle,
      color: "bg-cyan-500/10 text-cyan-400",
      url: "/ai-sales/response-script",
      featureKey: INDUSTRY_FEATURE_KEYS.SALES_COMPANY_RESPONSE_SCRIPT,
    },
  ],
};

export const marketingCards: IndustryCard[] = [
  {
    key: "마케팅 카피 생성기",
    icon: PenTool,
    color: "bg-primary/10 text-primary",
    url: "/ai-marketing/copy",
    featureKey: INDUSTRY_FEATURE_KEYS.MARKETING_COPY,
  },
  {
    key: "이벤트 생성기",
    icon: PartyPopper,
    color: "bg-amber-500/10 text-amber-400",
    featureKey: INDUSTRY_FEATURE_KEYS.MARKETING_EVENT,
  },
  {
    key: "프로모션 기획",
    icon: Calendar,
    color: "bg-blue-500/10 text-blue-400",
    url: "/ai-marketing/promotion",
    featureKey: INDUSTRY_FEATURE_KEYS.MARKETING_PROMOTION,
  },
  {
    key: "시즌 캠페인 제안",
    icon: BarChart2,
    color: "bg-violet-500/10 text-violet-400",
    featureKey: INDUSTRY_FEATURE_KEYS.MARKETING_SEASON_CAMPAIGN,
  },
  {
    key: "채널 현황",
    icon: Share2,
    color: "bg-emerald-500/10 text-emerald-400",
    featureKey: INDUSTRY_FEATURE_KEYS.MARKETING_CHANNEL_STATUS,
  },
  {
    key: "콘텐츠 생성기",
    icon: Sparkles,
    color: "bg-cyan-500/10 text-cyan-400",
    featureKey: INDUSTRY_FEATURE_KEYS.MARKETING_CONTENT_GENERATOR,
  },
];
