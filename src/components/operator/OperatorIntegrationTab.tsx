import type { ComponentType } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  CircleDashed,
  Coins,
  Cpu,
  Crown,
  FlaskConical,
  Link2,
  Mail,
  MessageSquare,
  RefreshCw,
  ShoppingCart,
  Smartphone,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type IntegrationStatus =
  | "connected"
  | "ready"
  | "disconnected"
  | "testing"
  | "error";

type IntegrationItem = {
  key: string;
  title: string;
  description: string;
  status: IntegrationStatus;
  icon: ComponentType<{ className?: string }>;
  accentClassName: string;
  note?: string;
};

type ProductMembershipMapping = {
  externalProductName: string;
  externalProductCode: string;
  membershipCode: "standard" | "pro" | "enterprise";
  status: IntegrationStatus;
  note: string;
};

type PointCreditMapping = {
  externalPointProductName: string;
  externalPointProductCode: string;
  creditAmount: number;
  status: IntegrationStatus;
  grantMode: "auto" | "manual_review" | "manual_only";
  note: string;
};

type ProviderConfig = {
  key: "email" | "kakao" | "sms";
  name: string;
  status: IntegrationStatus;
  enabled: boolean;
  configured: boolean;
  lastTestedAt: string | null;
  note: string;
  icon: ComponentType<{ className?: string }>;
};

type SyncHistoryItem = {
  id: string;
  actionType:
    | "membership_sync"
    | "credit_grant"
    | "refund_revert"
    | "manual_override";
  status: IntegrationStatus;
  processedAt: string | null;
  processedBy: string;
  note: string;
};

type ExceptionItem = {
  id: string;
  issueType:
    | "unmapped_product"
    | "duplicate_order"
    | "sync_failed"
    | "refund_pending";
  status: IntegrationStatus;
  lastDetectedAt: string | null;
  note: string;
};

const statusConfig: Record<
  IntegrationStatus,
  {
    label: string;
    badgeClassName: string;
    icon: ComponentType<{ className?: string }>;
  }
> = {
  connected: {
    label: "연결됨",
    badgeClassName: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    icon: CheckCircle2,
  },
  ready: {
    label: "연결 준비",
    badgeClassName: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    icon: CircleDashed,
  },
  disconnected: {
    label: "미연결",
    badgeClassName: "bg-muted text-muted-foreground border-border",
    icon: Link2,
  },
  testing: {
    label: "테스트 필요",
    badgeClassName: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    icon: FlaskConical,
  },
  error: {
    label: "오류",
    badgeClassName: "bg-red-500/15 text-red-300 border-red-500/30",
    icon: AlertTriangle,
  },
};

const integrations: IntegrationItem[] = [
  {
    key: "openai",
    title: "OpenAI 연동",
    description: "서버사이드 호출 구조, 모델 설정, 최근 테스트 상태를 관리합니다",
    status: "ready",
    icon: Cpu,
    accentClassName: "bg-emerald-500/10 text-emerald-400",
    note: "프론트 직접 호출 금지. Edge/Server Function 연결 전 단계",
  },
  {
    key: "imweb-member-order",
    title: "아임웹 회원/주문 연동",
    description: "회원 매칭, 주문 이벤트 수신, 처리 상태를 관리합니다",
    status: "disconnected",
    icon: ShoppingCart,
    accentClassName: "bg-blue-500/10 text-blue-400",
    note: "로그인보다 상품/주문 운영 매핑이 우선",
  },
  {
    key: "imweb-membership-mapping",
    title: "상품 → 멤버십 매핑",
    description: "아임웹 상품과 membershipCode 매핑 상태를 관리합니다",
    status: "ready",
    icon: Crown,
    accentClassName: "bg-amber-500/10 text-amber-400",
  },
  {
    key: "imweb-credit-mapping",
    title: "포인트상품 → 크레딧 매핑",
    description: "아임웹 포인트상품과 creditAmount 매핑 상태를 관리합니다",
    status: "ready",
    icon: Coins,
    accentClassName: "bg-violet-500/10 text-violet-400",
  },
  {
    key: "notification-provider",
    title: "알림/발송 연동",
    description: "email, kakao, sms provider 설정 상태를 관리합니다",
    status: "disconnected",
    icon: Bell,
    accentClassName: "bg-pink-500/10 text-pink-400",
  },
  {
    key: "sync-history",
    title: "동기화 이력 / 예외 처리",
    description: "처리 이력, 실패 건, 수동 재처리 placeholder를 관리합니다",
    status: "ready",
    icon: RefreshCw,
    accentClassName: "bg-slate-500/10 text-slate-300",
  },
];

const productMembershipMappings: ProductMembershipMapping[] = [
  {
    externalProductName: "(상품 미연결)",
    externalProductCode: "—",
    membershipCode: "standard",
    status: "ready",
    note: "상품 연결 후 standard 부여 예정",
  },
  {
    externalProductName: "(상품 미연결)",
    externalProductCode: "—",
    membershipCode: "pro",
    status: "ready",
    note: "상품 연결 후 pro 부여 예정",
  },
  {
    externalProductName: "(상품 미연결)",
    externalProductCode: "—",
    membershipCode: "enterprise",
    status: "ready",
    note: "상품 연결 후 enterprise 부여 예정",
  },
];

const pointCreditMappings: PointCreditMapping[] = [
  {
    externalPointProductName: "(포인트상품 미연결)",
    externalPointProductCode: "—",
    creditAmount: 100,
    status: "ready",
    grantMode: "manual_review",
    note: "자동 지급 전 운영자 검토 필요",
  },
  {
    externalPointProductName: "(포인트상품 미연결)",
    externalPointProductCode: "—",
    creditAmount: 500,
    status: "ready",
    grantMode: "manual_review",
    note: "자동 지급 전 운영자 검토 필요",
  },
];

const providerConfigs: ProviderConfig[] = [
  {
    key: "email",
    name: "이메일",
    status: "disconnected",
    enabled: false,
    configured: false,
    lastTestedAt: null,
    note: "SMTP/API 키 미설정",
    icon: Mail,
  },
  {
    key: "kakao",
    name: "카카오",
    status: "disconnected",
    enabled: false,
    configured: false,
    lastTestedAt: null,
    note: "알림톡 provider 미설정",
    icon: MessageSquare,
  },
  {
    key: "sms",
    name: "SMS",
    status: "disconnected",
    enabled: false,
    configured: false,
    lastTestedAt: null,
    note: "SMS provider 미설정",
    icon: Smartphone,
  },
];

const syncHistories: SyncHistoryItem[] = [
  {
    id: "history-001",
    actionType: "membership_sync",
    status: "ready",
    processedAt: null,
    processedBy: "system",
    note: "실제 주문 연동 전. 처리 이력 placeholder",
  },
  {
    id: "history-002",
    actionType: "credit_grant",
    status: "ready",
    processedAt: null,
    processedBy: "system",
    note: "실제 포인트상품 연동 전. 수동 검토 기준만 준비",
  },
];

const exceptionItems: ExceptionItem[] = [
  {
    id: "exception-001",
    issueType: "unmapped_product",
    status: "ready",
    lastDetectedAt: null,
    note: "상품 미매핑 시 이 영역에서 확인",
  },
  {
    id: "exception-002",
    issueType: "sync_failed",
    status: "ready",
    lastDetectedAt: null,
    note: "실제 연동 실패 건 placeholder",
  },
];

function StatusBadge({ status }: { status: IntegrationStatus }) {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={config.badgeClassName}>
      {config.label}
    </Badge>
  );
}

function KeyValueRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/50 bg-background/40 px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

export default function OperatorIntegrationTab() {
  return (
    <div className="space-y-6">
      <Card className="bg-card/60 border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" />
            연동 상태
          </CardTitle>
          <CardDescription>
            실제 연결과 placeholder를 구분해 현재 상태를 오해하지 않도록 표시합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {integrations.map((item) => {
              const Icon = item.icon;
              const status = statusConfig[item.status];

              return (
                <div
                  key={item.key}
                  className="rounded-xl border border-border/60 bg-background/40 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.accentClassName}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium">{item.title}</div>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>

                  {item.note ? (
                    <p className="mt-3 text-xs text-muted-foreground">
                      {item.note}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="bg-card/60 border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-emerald-400" />
                  OpenAI 연동
                </CardTitle>
                <CardDescription>
                  프론트 직접 호출 없이 서버사이드 호출 구조로 관리합니다
                </CardDescription>
              </div>
              <StatusBadge status="ready" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <KeyValueRow label="provider" value="openai" />
            <KeyValueRow label="model" value="미설정" />
            <KeyValueRow label="API 키 등록 상태" value="미등록" />
            <KeyValueRow label="서버사이드 호출 구조" value="연결 준비" />
            <KeyValueRow label="promptVersion" value="미설정" />
            <KeyValueRow label="최근 테스트" value="없음" />
            <KeyValueRow label="최근 오류" value="없음" />

            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-3 text-xs text-amber-200">
              API 키는 프론트 코드에 직접 두지 않고, 서버 시크릿/Edge Function에서만 관리하는 전제입니다.
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" disabled>
                API 키 등록 준비
              </Button>
              <Button type="button" variant="outline" disabled>
                테스트 호출 준비
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  아임웹 회원/주문 연동
                </CardTitle>
                <CardDescription>
                  회원 매칭보다 상품/주문 운영 매핑을 우선하는 구조입니다
                </CardDescription>
              </div>
              <StatusBadge status="disconnected" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <KeyValueRow label="webhook URL" value="미설정" />
            <KeyValueRow label="회원 구조" value="placeholder" />
            <KeyValueRow label="주문 구조" value="placeholder" />
            <KeyValueRow label="최근 이벤트 수신" value="없음" />
            <KeyValueRow label="최근 동기화 상태" value="미연결" />
            <KeyValueRow label="예외 처리" value="구조만 준비" />

            <div className="flex gap-2">
              <Button type="button" variant="outline" disabled>
                webhook 준비
              </Button>
              <Button type="button" variant="outline" disabled>
                수동 재처리 준비
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="bg-card/60 border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-400" />
                  상품 → 멤버십 매핑
                </CardTitle>
                <CardDescription>
                  아임웹 상품 구매 시 어떤 membershipCode를 부여할지 관리합니다
                </CardDescription>
              </div>
              <StatusBadge status="ready" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {productMembershipMappings.map((mapping, index) => (
              <div
                key={`${mapping.membershipCode}-${index}`}
                className="rounded-xl border border-border/60 bg-background/40 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{mapping.membershipCode}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {mapping.externalProductName}
                    </div>
                  </div>
                  <StatusBadge status={mapping.status} />
                </div>

                <div className="mt-3 grid gap-2">
                  <KeyValueRow label="externalProductCode" value={mapping.externalProductCode} />
                  <KeyValueRow label="membershipCode" value={mapping.membershipCode} />
                  <KeyValueRow label="note" value={mapping.note} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-violet-400" />
                  포인트상품 → 크레딧 매핑
                </CardTitle>
                <CardDescription>
                  포인트상품 구매 시 내부 creditAmount 반영 기준을 관리합니다
                </CardDescription>
              </div>
              <StatusBadge status="ready" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pointCreditMappings.map((mapping, index) => (
              <div
                key={`${mapping.creditAmount}-${index}`}
                className="rounded-xl border border-border/60 bg-background/40 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{mapping.creditAmount} credits</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {mapping.externalPointProductName}
                    </div>
                  </div>
                  <StatusBadge status={mapping.status} />
                </div>

                <div className="mt-3 grid gap-2">
                  <KeyValueRow
                    label="externalPointProductCode"
                    value={mapping.externalPointProductCode}
                  />
                  <KeyValueRow label="grantMode" value={mapping.grantMode} />
                  <KeyValueRow label="note" value={mapping.note} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/60 border-border/60">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-pink-400" />
                알림 / 발송 provider
              </CardTitle>
              <CardDescription>
                email, kakao, sms provider별 enabled / configured / lastTestedAt 상태를 구분합니다
              </CardDescription>
            </div>
            <StatusBadge status="disconnected" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {providerConfigs.map((provider) => {
              const Icon = provider.icon;

              return (
                <div
                  key={provider.key}
                  className="rounded-xl border border-border/60 bg-background/40 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{provider.name}</span>
                    </div>
                    <StatusBadge status={provider.status} />
                  </div>

                  <div className="mt-3 grid gap-2">
                    <KeyValueRow label="enabled" value={provider.enabled ? "true" : "false"} />
                    <KeyValueRow
                      label="configured"
                      value={provider.configured ? "true" : "false"}
                    />
                    <KeyValueRow
                      label="lastTestedAt"
                      value={provider.lastTestedAt ?? "없음"}
                    />
                    <KeyValueRow label="note" value={provider.note} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="bg-card/60 border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-slate-300" />
              동기화 이력
            </CardTitle>
            <CardDescription>
              최근 처리 이력과 actionType placeholder를 확인합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {syncHistories.map((history) => (
              <div
                key={history.id}
                className="rounded-xl border border-border/60 bg-background/40 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="font-medium">{history.actionType}</div>
                  <StatusBadge status={history.status} />
                </div>

                <div className="mt-3 grid gap-2">
                  <KeyValueRow label="processedAt" value={history.processedAt ?? "없음"} />
                  <KeyValueRow label="processedBy" value={history.processedBy} />
                  <KeyValueRow label="note" value={history.note} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-300" />
              예외 처리 / 수동 재처리
            </CardTitle>
            <CardDescription>
              실패 유형 분류와 운영자 검토 placeholder를 확인합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {exceptionItems.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border/60 bg-background/40 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="font-medium">{item.issueType}</div>
                  <StatusBadge status={item.status} />
                </div>

                <div className="mt-3 grid gap-2">
                  <KeyValueRow
                    label="lastDetectedAt"
                    value={item.lastDetectedAt ?? "없음"}
                  />
                  <KeyValueRow label="note" value={item.note} />
                </div>

                <div className="mt-3">
                  <Button type="button" variant="outline" disabled>
                    수동 재처리 준비
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="pt-6">
          <p className="text-sm leading-6 text-amber-100">
            현재 외부 연동은 실제 연결과 placeholder를 분리해 표시합니다. 실제 API 키 등록,
            서버사이드 호출, 주문 이벤트 수신, 자동 멤버십/크레딧 반영, 발송 provider 활성화가
            끝나기 전에는 연결됨이나 처리 완료처럼 보이지 않도록 유지합니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
