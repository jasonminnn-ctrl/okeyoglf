/**
 * OkeyGolf Membership & Credit Policy System (Phase 5)
 * 
 * Central policy layer for membership tiers, credit wallet,
 * feature access control, and operator visibility management.
 */

// ──────────────────────────────────
// Membership Tiers
// ──────────────────────────────────

export type MembershipCode = "trial" | "standard" | "pro" | "enterprise";

export interface MembershipTier {
  code: MembershipCode;
  name: string;
  description: string;
  defaultCredits: number;
  isActive: boolean;
}

export const membershipTiers: MembershipTier[] = [
  { code: "trial", name: "체험판", description: "기본 기능 체험 — 제한된 생성 및 저장", defaultCredits: 30, isActive: true },
  { code: "standard", name: "스탠다드", description: "일반 생성 기능 및 저장/복사 허용", defaultCredits: 200, isActive: true },
  { code: "pro", name: "프로", description: "전체 기능 + 전담 컨설턴트 전환 허용", defaultCredits: 1000, isActive: true },
  { code: "enterprise", name: "엔터프라이즈", description: "전체 기능 + 멀티브랜치 + 고급 권한", defaultCredits: 5000, isActive: true },
];

export function getMembershipTier(code: MembershipCode): MembershipTier {
  return membershipTiers.find(t => t.code === code) || membershipTiers[0];
}

// ──────────────────────────────────
// Organization Subscription (mock)
// ──────────────────────────────────

export interface OrganizationSubscription {
  organizationId: string;
  membershipCode: MembershipCode;
  startedAt: string;
  expiresAt: string;
  status: "active" | "expired" | "cancelled";
}

// ──────────────────────────────────
// Credit Wallet
// ──────────────────────────────────

export interface CreditWallet {
  organizationId: string;
  balance: number;
  updatedAt: string;
}

export type LedgerType = "generate" | "regenerate" | "manual_grant" | "manual_deduct" | "refund" | "bonus";

export const ledgerTypeLabels: Record<LedgerType, string> = {
  generate: "생성",
  regenerate: "재생성",
  manual_grant: "수동 지급",
  manual_deduct: "수동 차감",
  refund: "환불",
  bonus: "보너스",
};

export interface CreditLedgerEntry {
  id: string;
  organizationId: string;
  type: LedgerType;
  amountDelta: number;
  balanceAfter: number;
  reason: string;
  relatedModule?: string;
  relatedResultId?: string;
  actorType: "system" | "operator" | "user";
  createdAt: string;
}

// ──────────────────────────────────
// Feature Keys (central constants)
// ──────────────────────────────────

export const FEATURE_KEYS = {
  // Dashboard
  DASHBOARD_MEMBERSHIP_VIEW: "dashboard.membership_summary.view",
  DASHBOARD_CREDIT_VIEW: "dashboard.credit_summary.view",

  // AI 비서
  ASSISTANT_DAILY: "assistant.daily_tasks.generate",
  ASSISTANT_WEEKLY: "assistant.weekly_actions.generate",
  ASSISTANT_MISSING: "assistant.missing_items.generate",
  ASSISTANT_CAMPAIGN: "assistant.campaign_recommend.generate",
  ASSISTANT_REMINDER: "assistant.reminder.generate",
  ASSISTANT_CHECKLIST: "assistant.checklist.generate",

  // AI 운영팀
  OPERATIONS_DIAGNOSIS: "operations.diagnosis.generate",
  OPERATIONS_PRICING: "operations.pricing.generate",
  OPERATIONS_REMAINING: "operations.remaining_time.generate",
  OPERATIONS_TIME: "operations.time_mgmt.generate",
  OPERATIONS_BAY: "operations.bay_mgmt.generate",
  OPERATIONS_LESSON: "operations.lesson_mgmt.generate",
  OPERATIONS_KPI: "operations.kpi.generate",

  // AI 영업팀
  SALES_CUSTOMER: "sales.customer_mgmt.generate",
  SALES_REREGISTRATION: "sales.re_registration.generate",
  SALES_NOVISIT: "sales.no_visit.generate",
  SALES_PROPOSAL: "sales.proposal.generate",
  SALES_VIP: "sales.vip.generate",
  SALES_PACKAGE: "sales.package.generate",
  SALES_RESPONSE: "sales.response_script.generate",

  // AI 마케팅팀
  MARKETING_COPY: "marketing.copy.generate",
  MARKETING_EVENT: "marketing.event.generate",
  MARKETING_PROMOTION: "marketing.promotion.generate",
  MARKETING_CHANNEL: "marketing.channel.generate",
  MARKETING_SEASON: "marketing.season.generate",
  MARKETING_RESEARCH: "marketing.research_link.generate",

  // AI 디자인팀
  DESIGN_REQUEST: "design.request.generate",
  DESIGN_TEMPLATE: "design.template.generate",
  DESIGN_COPY_LAYOUT: "design.copy_layout.generate",
  DESIGN_BANNER: "design.banner.generate",
  DESIGN_UPLOAD: "design.upload_form.generate",
  DESIGN_RESULTS: "design.results.generate",

  // AI 경영지원
  SUPPORT_CONTRACT: "support.contract_order.generate",
  SUPPORT_SETTLEMENT: "support.settlement.generate",
  SUPPORT_DOCUMENT: "support.document_draft.generate",
  SUPPORT_CHECKLIST: "support.checklist.generate",
  SUPPORT_RISK: "support.risk.generate",

  // 시장조사
  RESEARCH_BASIC: "market_research.generate_basic",
  RESEARCH_ADVANCED: "market_research.generate_advanced",

  // 전담 컨설턴트
  CONSULTANT_REQUEST: "consultant.request",
  CONSULTANT_DOCUMENT: "consultant.document",
  CONSULTANT_PPT: "consultant.ppt",
  CONSULTANT_ANALYSIS: "consultant.analysis",
  CONSULTANT_MARKETING: "consultant.marketing_review",
  CONSULTANT_DESIGN: "consultant.design",

  // Result Actions
  RESULT_SAVE: "result.save",
  RESULT_COPY: "result.copy",
  RESULT_REGENERATE: "result.regenerate",
  RESULT_CONSULTANT_TRANSFER: "result.consultant_transfer",
} as const;

export type FeatureKey = typeof FEATURE_KEYS[keyof typeof FEATURE_KEYS];

// ──────────────────────────────────
// Feature Access Modes
// ──────────────────────────────────

export type AccessMode = "enabled" | "locked" | "hidden";

export interface FeaturePolicy {
  featureKey: FeatureKey;
  membershipCode: MembershipCode;
  accessMode: AccessMode;
  requiresCredit: boolean;
  creditCost: number;
  upsellLabel?: string;
  industryScope?: string[]; // empty = all industries
  isActive: boolean;
}

// ──────────────────────────────────
// Default Feature Policies
// ──────────────────────────────────

function buildDefaultPolicies(): FeaturePolicy[] {
  const policies: FeaturePolicy[] = [];

  const allGenerateKeys: FeatureKey[] = [
    FEATURE_KEYS.ASSISTANT_DAILY, FEATURE_KEYS.ASSISTANT_WEEKLY, FEATURE_KEYS.ASSISTANT_CHECKLIST,
    FEATURE_KEYS.OPERATIONS_DIAGNOSIS,
    FEATURE_KEYS.SALES_RESPONSE, FEATURE_KEYS.SALES_REREGISTRATION,
    FEATURE_KEYS.MARKETING_COPY, FEATURE_KEYS.MARKETING_PROMOTION,
    FEATURE_KEYS.DESIGN_REQUEST, FEATURE_KEYS.DESIGN_COPY_LAYOUT,
    FEATURE_KEYS.SUPPORT_DOCUMENT, FEATURE_KEYS.SUPPORT_CONTRACT,
    FEATURE_KEYS.RESEARCH_BASIC,
  ];

  const advancedKeys: FeatureKey[] = [
    FEATURE_KEYS.ASSISTANT_MISSING, FEATURE_KEYS.ASSISTANT_CAMPAIGN, FEATURE_KEYS.ASSISTANT_REMINDER,
    FEATURE_KEYS.OPERATIONS_PRICING, FEATURE_KEYS.OPERATIONS_REMAINING, FEATURE_KEYS.OPERATIONS_TIME,
    FEATURE_KEYS.OPERATIONS_BAY, FEATURE_KEYS.OPERATIONS_LESSON, FEATURE_KEYS.OPERATIONS_KPI,
    FEATURE_KEYS.SALES_CUSTOMER, FEATURE_KEYS.SALES_NOVISIT, FEATURE_KEYS.SALES_PROPOSAL,
    FEATURE_KEYS.SALES_VIP, FEATURE_KEYS.SALES_PACKAGE,
    FEATURE_KEYS.MARKETING_EVENT, FEATURE_KEYS.MARKETING_CHANNEL, FEATURE_KEYS.MARKETING_SEASON,
    FEATURE_KEYS.MARKETING_RESEARCH,
    FEATURE_KEYS.DESIGN_TEMPLATE, FEATURE_KEYS.DESIGN_BANNER, FEATURE_KEYS.DESIGN_UPLOAD, FEATURE_KEYS.DESIGN_RESULTS,
    FEATURE_KEYS.SUPPORT_SETTLEMENT, FEATURE_KEYS.SUPPORT_CHECKLIST, FEATURE_KEYS.SUPPORT_RISK,
    FEATURE_KEYS.RESEARCH_ADVANCED,
  ];

  const consultantKeys: FeatureKey[] = [
    FEATURE_KEYS.CONSULTANT_REQUEST, FEATURE_KEYS.CONSULTANT_DOCUMENT, FEATURE_KEYS.CONSULTANT_PPT,
    FEATURE_KEYS.CONSULTANT_ANALYSIS, FEATURE_KEYS.CONSULTANT_MARKETING, FEATURE_KEYS.CONSULTANT_DESIGN,
  ];

  const tiers: MembershipCode[] = ["trial", "standard", "pro", "enterprise"];

  for (const tier of tiers) {
    // Basic generate features
    for (const key of allGenerateKeys) {
      policies.push({
        featureKey: key,
        membershipCode: tier,
        accessMode: tier === "trial" ? "locked" : "enabled",
        requiresCredit: true,
        creditCost: tier === "trial" ? 5 : 3,
        upsellLabel: tier === "trial" ? "스탠다드 플랜에서 사용 가능" : undefined,
        isActive: true,
      });
    }
    // Trial gets a few unlocked
    if (tier === "trial") {
      const trialAllowed: FeatureKey[] = [FEATURE_KEYS.ASSISTANT_DAILY, FEATURE_KEYS.ASSISTANT_CHECKLIST];
      for (const key of trialAllowed) {
        const idx = policies.findIndex(p => p.featureKey === key && p.membershipCode === "trial");
        if (idx !== -1) {
          policies[idx].accessMode = "enabled";
          policies[idx].upsellLabel = undefined;
        }
      }
    }

    // Advanced features
    for (const key of advancedKeys) {
      policies.push({
        featureKey: key,
        membershipCode: tier,
        accessMode: tier === "trial" ? "hidden" : tier === "standard" ? "locked" : "enabled",
        requiresCredit: true,
        creditCost: 5,
        upsellLabel: tier === "trial" ? "스탠다드 플랜에서 사용 가능" : tier === "standard" ? "Pro 플랜에서 사용 가능" : undefined,
        isActive: true,
      });
    }

    // Consultant features
    for (const key of consultantKeys) {
      policies.push({
        featureKey: key,
        membershipCode: tier,
        accessMode: tier === "pro" || tier === "enterprise" ? "enabled" : "locked",
        requiresCredit: false,
        creditCost: 0,
        upsellLabel: tier !== "pro" && tier !== "enterprise" ? "Pro 플랜에서 사용 가능" : undefined,
        isActive: true,
      });
    }

    // Result actions
    policies.push(
      { featureKey: FEATURE_KEYS.RESULT_SAVE, membershipCode: tier, accessMode: "enabled", requiresCredit: false, creditCost: 0, isActive: true },
      { featureKey: FEATURE_KEYS.RESULT_COPY, membershipCode: tier, accessMode: tier === "trial" ? "locked" : "enabled", requiresCredit: false, creditCost: 0, upsellLabel: tier === "trial" ? "스탠다드 플랜에서 사용 가능" : undefined, isActive: true },
      { featureKey: FEATURE_KEYS.RESULT_REGENERATE, membershipCode: tier, accessMode: tier === "trial" ? "locked" : "enabled", requiresCredit: true, creditCost: 3, upsellLabel: tier === "trial" ? "스탠다드 플랜에서 사용 가능" : undefined, isActive: true },
      { featureKey: FEATURE_KEYS.RESULT_CONSULTANT_TRANSFER, membershipCode: tier, accessMode: tier === "pro" || tier === "enterprise" ? "enabled" : "locked", requiresCredit: false, creditCost: 0, upsellLabel: tier !== "pro" && tier !== "enterprise" ? "Pro 플랜에서 사용 가능" : undefined, isActive: true },
    );

    // Dashboard views
    policies.push(
      { featureKey: FEATURE_KEYS.DASHBOARD_MEMBERSHIP_VIEW, membershipCode: tier, accessMode: "enabled", requiresCredit: false, creditCost: 0, isActive: true },
      { featureKey: FEATURE_KEYS.DASHBOARD_CREDIT_VIEW, membershipCode: tier, accessMode: "enabled", requiresCredit: false, creditCost: 0, isActive: true },
    );
  }

  return policies;
}

export const defaultFeaturePolicies: FeaturePolicy[] = buildDefaultPolicies();

// ──────────────────────────────────
// Organization Feature Override
// ──────────────────────────────────

export interface OrganizationFeatureOverride {
  organizationId: string;
  featureKey: FeatureKey;
  membershipCode: MembershipCode; // scoped to specific tier
  accessMode: AccessMode;
  requiresCredit?: boolean;
  creditCost?: number;
  note?: string;
  isActive: boolean;
}

// ──────────────────────────────────
// Usage Event
// ──────────────────────────────────

export interface UsageEvent {
  id: string;
  organizationId: string;
  userId?: string;
  featureKey: FeatureKey;
  actionType: "generate" | "regenerate" | "save" | "copy" | "consultant_transfer";
  success: boolean;
  creditDelta: number;
  createdAt: string;
}
