export type ExternalConnectionStatus =
  | "connected"
  | "pending"
  | "disconnected"
  | "testing"
  | "test_connected"
  | "error";

export const externalStatusMeta: Record<
  ExternalConnectionStatus,
  { label: string; badgeClassName: string }
> = {
  connected: {
    label: "운영 연결",
    badgeClassName: "bg-emerald-500/20 text-emerald-400",
  },
  test_connected: {
    label: "테스트 연결",
    badgeClassName: "bg-blue-500/20 text-blue-400",
  },
  pending: {
    label: "연결 준비",
    badgeClassName: "bg-amber-500/20 text-amber-400",
  },
  disconnected: {
    label: "미연결",
    badgeClassName: "bg-muted text-muted-foreground",
  },
  testing: {
    label: "테스트 필요",
    badgeClassName: "bg-blue-500/20 text-blue-400",
  },
  error: {
    label: "오류",
    badgeClassName: "bg-red-500/20 text-red-400",
  },
};

export interface OpenAIIntegrationSummary {
  provider: "openai";
  model: string;
  promptVersion: string;
  apiKeyConfigured: boolean;
  serverSideReady: boolean;
  status: ExternalConnectionStatus;
  lastTestedAt: string | null;
  note: string;
}

export interface ImwebMemberSyncSummary {
  externalProvider: "imweb";
  webhookUrl: string | null;
  syncStatus: ExternalConnectionStatus;
  lastSyncedAt: string | null;
  lastEventLabel: string;
  note: string;
}

export interface ProductMembershipMapping {
  externalProductName: string;
  externalProductCode: string;
  mappedMembershipCode: "standard" | "pro" | "enterprise";
  mappedMembershipLabel: string;
  isActive: boolean;
  note: string;
}

export interface PointCreditMapping {
  externalPointProductName: string;
  externalPointProductCode: string;
  mappedCreditAmount: number;
  grantMode: "auto" | "manual_review" | "manual_only";
  isActive: boolean;
  note: string;
}

export interface NotificationProviderSummary {
  provider: "email" | "kakao" | "sms";
  enabled: boolean;
  configured: boolean;
  status: ExternalConnectionStatus;
  lastTestedAt: string | null;
  note: string;
}

export interface ExternalSyncHistoryItem {
  historyId: string;
  externalProvider: "imweb" | "openai" | "notification";
  externalOrderId: string | null;
  actionType:
    | "membership_sync"
    | "credit_grant"
    | "refund_revert"
    | "manual_override"
    | "ai_generate";
  status: ExternalConnectionStatus;
  processedAt: string | null;
  processedBy: string;
  note: string;
}

export interface ExternalSyncExceptionItem {
  exceptionId: string;
  exceptionType:
    | "unmapped_product"
    | "duplicate_order"
    | "sync_failed"
    | "refund_pending";
  status: ExternalConnectionStatus;
  note: string;
  canRetry: boolean;
}

export const openAIIntegrationSummary: OpenAIIntegrationSummary = {
  provider: "openai",
  model: "미설정",
  promptVersion: "draft",
  apiKeyConfigured: false,
  serverSideReady: false,
  status: "pending",
  lastTestedAt: null,
  note: "서버사이드 Edge Function 자리만 확보된 상태입니다. 실제 호출 전에는 연결됨으로 표기하지 않습니다.",
};

export const imwebMemberSyncSummary: ImwebMemberSyncSummary = {
  externalProvider: "imweb",
  webhookUrl: null,
  syncStatus: "disconnected",
  lastSyncedAt: null,
  lastEventLabel: "—",
  note: "상품/주문 매핑 구조를 먼저 준비하고, 로그인 연계는 후순위로 둡니다.",
};

export const productMembershipMappings: ProductMembershipMapping[] = [
  {
    externalProductName: "(상품 미연결)",
    externalProductCode: "—",
    mappedMembershipCode: "standard",
    mappedMembershipLabel: "스탠다드",
    isActive: false,
    note: "연결 준비",
  },
  {
    externalProductName: "(상품 미연결)",
    externalProductCode: "—",
    mappedMembershipCode: "pro",
    mappedMembershipLabel: "프로",
    isActive: false,
    note: "연결 준비",
  },
  {
    externalProductName: "(상품 미연결)",
    externalProductCode: "—",
    mappedMembershipCode: "enterprise",
    mappedMembershipLabel: "엔터프라이즈",
    isActive: false,
    note: "연결 준비",
  },
];

export const pointCreditMappings: PointCreditMapping[] = [
  {
    externalPointProductName: "(포인트상품 미연결)",
    externalPointProductCode: "—",
    mappedCreditAmount: 100,
    grantMode: "manual_review",
    isActive: false,
    note: "연결 준비",
  },
  {
    externalPointProductName: "(포인트상품 미연결)",
    externalPointProductCode: "—",
    mappedCreditAmount: 500,
    grantMode: "manual_review",
    isActive: false,
    note: "연결 준비",
  },
];

export const notificationProviders: NotificationProviderSummary[] = [
  {
    provider: "email",
    enabled: false,
    configured: false,
    status: "disconnected",
    lastTestedAt: null,
    note: "설정 전",
  },
  {
    provider: "kakao",
    enabled: false,
    configured: false,
    status: "disconnected",
    lastTestedAt: null,
    note: "설정 전",
  },
  {
    provider: "sms",
    enabled: false,
    configured: false,
    status: "disconnected",
    lastTestedAt: null,
    note: "설정 전",
  },
];

export const externalSyncHistory: ExternalSyncHistoryItem[] = [
  {
    historyId: "placeholder-ai-001",
    externalProvider: "openai",
    externalOrderId: null,
    actionType: "ai_generate",
    status: "pending",
    processedAt: null,
    processedBy: "system",
    note: "호출 로그 구조만 준비됨",
  },
];

export const externalSyncExceptions: ExternalSyncExceptionItem[] = [
  {
    exceptionId: "placeholder-imweb-001",
    exceptionType: "unmapped_product",
    status: "pending",
    note: "실제 주문 수신 전 placeholder",
    canRetry: false,
  },
];
