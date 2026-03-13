import { useEffect, useMemo, useState, type ComponentType } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import {
  externalStatusMeta,
  notificationProviders,
  openAIIntegrationSummary,
  productMembershipMappings as fallbackProductMembershipMappings,
  pointCreditMappings as fallbackPointCreditMappings,
  externalSyncHistory as fallbackExternalSyncHistory,
  externalSyncExceptions as fallbackExternalSyncExceptions,
  type ExternalConnectionStatus,
  type ExternalSyncExceptionItem,
  type ExternalSyncHistoryItem,
  type NotificationProviderSummary,
  type PointCreditMapping,
  type ProductMembershipMapping,
  type ImwebMemberSyncSummary,
} from "@/lib/external-integrations";
import {
  getImwebMemberSyncSummary,
  getPointCreditMappings,
  getProductMembershipMappings,
  getSyncExceptionItems,
  getSyncHistoryItems,
} from "@/lib/repositories/imweb-repository";

type IntegrationStatus = ExternalConnectionStatus;
type ProviderKey = "email" | "kakao" | "sms";

type IntegrationItem = {
  key: string;
  title: string;
  description: string;
  status: IntegrationStatus;
  icon: ComponentType<{ className?: string }>;
  accentClassName: string;
  note?: string;
};

const providerIconMap: Record<ProviderKey, ComponentType<{ className?: string }>> = {
  email: Mail,
  kakao: MessageSquare,
  sms: Smartphone,
};

const statusIconMap: Record<IntegrationStatus, ComponentType<{ className?: string }>> = {
  connected: CheckCircle2,
  test_connected: FlaskConical,
  pending: CircleDashed,
  disconnected: Link2,
  testing: FlaskConical,
  error: AlertTriangle,
};

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function StatusBadge({ status }: { status: IntegrationStatus }) {
  const meta = externalStatusMeta[status];
  const Icon = statusIconMap[status];

  return (
    <Badge variant="outline" className={meta.badgeClassName}>
      <Icon className="mr-1 h-3.5 w-3.5" />
      {meta.label}
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
    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export default function OperatorIntegrationTab() {
  const { orgId, isLoading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [imwebSummary, setImwebSummary] =
    useState<ImwebMemberSyncSummary | null>(null);
  const [membershipMappings, setMembershipMappings] = useState<
    ProductMembershipMapping[]
  >(fallbackProductMembershipMappings);
  const [pointMappings, setPointMappings] = useState<PointCreditMapping[]>(
    fallbackPointCreditMappings,
  );
  const [syncHistories, setSyncHistories] = useState<ExternalSyncHistoryItem[]>(
    fallbackExternalSyncHistory,
  );
  const [exceptionItems, setExceptionItems] = useState<
    ExternalSyncExceptionItem[]
  >(fallbackExternalSyncExceptions);

  useEffect(() => {
    if (authLoading) return;
    if (!orgId) {
      setIsLoading(false);
      setLoadError("조직 정보가 없어 외부 연동 상태를 불러올 수 없습니다.");
      return;
    }

    let isMounted = true;

    async function load() {
      try {
        setIsLoading(true);
        setLoadError(null);

        const [
          summary,
          productRows,
          pointRows,
          historyRows,
          exceptionRows,
        ] = await Promise.all([
          getImwebMemberSyncSummary(orgId),
          getProductMembershipMappings({ orgId }),
          getPointCreditMappings({ orgId }),
          getSyncHistoryItems({ orgId, limit: 10 }),
          getSyncExceptionItems({ orgId, limit: 10 }),
        ]);

        if (!isMounted) return;

        setImwebSummary(summary);

        setMembershipMappings(
          productRows.length > 0
            ? productRows
            : fallbackProductMembershipMappings,
        );

        setPointMappings(
          pointRows.length > 0 ? pointRows : fallbackPointCreditMappings,
        );

        setSyncHistories(
          historyRows.length > 0 ? historyRows : fallbackExternalSyncHistory,
        );

        setExceptionItems(
          exceptionRows.length > 0
            ? exceptionRows
            : fallbackExternalSyncExceptions,
        );
      } catch (error) {
        console.error("OperatorIntegrationTab load failed", error);

        if (!isMounted) return;

        setLoadError("외부 연동 상태를 불러오지 못했습니다.");
        setImwebSummary(null);
        setMembershipMappings(fallbackProductMembershipMappings);
        setPointMappings(fallbackPointCreditMappings);
        setSyncHistories(fallbackExternalSyncHistory);
        setExceptionItems(fallbackExternalSyncExceptions);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [authLoading, orgId]);

  const imwebStatus = imwebSummary?.syncStatus === "connected" ? "test_connected" as IntegrationStatus : (imwebSummary?.syncStatus ?? "disconnected") as IntegrationStatus;
  const membershipStatus: IntegrationStatus = membershipMappings.some((item) => item.isActive)
    ? "test_connected"
    : "pending";
  const pointStatus: IntegrationStatus = pointMappings.some((item) => item.isActive)
    ? "test_connected"
    : "pending";
  const syncStatus: IntegrationStatus = exceptionItems.some((item) => item.status === "error")
    ? "error"
    : syncHistories.some((item) => item.status === "connected")
      ? "test_connected"
      : "pending";

  const integrations: IntegrationItem[] = useMemo(
    () => [
      {
        key: "openai",
        title: "OpenAI 연동",
        description:
          "서버사이드 호출 구조, 모델 설정, 최근 테스트 상태를 관리합니다",
        status: openAIIntegrationSummary.status,
        icon: Cpu,
        accentClassName: "bg-emerald-500/10 text-emerald-400",
        note: openAIIntegrationSummary.note,
      },
      {
        key: "imweb-member-order",
        title: "아임웹 회원/주문 연동",
        description: "회원 매칭, 주문 이벤트 수신, 처리 상태를 관리합니다",
        status: imwebStatus,
        icon: ShoppingCart,
        accentClassName: "bg-blue-500/10 text-blue-400",
        note:
          imwebSummary?.note ??
          "로그인보다 상품/주문 운영 매핑이 우선입니다.",
      },
      {
        key: "imweb-membership-mapping",
        title: "상품 → 멤버십 매핑",
        description: "아임웹 상품과 membershipCode 매핑 상태를 관리합니다",
        status: membershipStatus,
        icon: Crown,
        accentClassName: "bg-amber-500/10 text-amber-400",
        note: "기간형 멤버십 상품만 매핑 대상으로 봅니다.",
      },
      {
        key: "imweb-credit-mapping",
        title: "포인트상품 → 크레딧 매핑",
        description: "아임웹 포인트상품과 creditAmount 매핑 상태를 관리합니다",
        status: pointStatus,
        icon: Coins,
        accentClassName: "bg-violet-500/10 text-violet-400",
        note: "실제 AI 호출 / 사용량형 기능용 크레딧만 대상으로 봅니다.",
      },
      {
        key: "notification-provider",
        title: "알림/발송 연동",
        description: "email, kakao, sms provider 설정 상태를 관리합니다",
        status: notificationProviders.some((provider) => provider.enabled)
          ? "connected"
          : "disconnected",
        icon: Bell,
        accentClassName: "bg-pink-500/10 text-pink-400",
        note: "발송 provider는 아직 placeholder 상태를 유지합니다.",
      },
      {
        key: "sync-history",
        title: "동기화 이력 / 예외 처리",
        description: "처리 이력, 실패 건, 수동 재처리 준비 상태를 관리합니다",
        status: syncStatus,
        icon: RefreshCw,
        accentClassName: "bg-slate-500/10 text-slate-300",
        note: "실제 주문 웹훅 연결 전에는 일부 placeholder가 남아 있을 수 있습니다.",
      },
    ],
    [imwebStatus, membershipStatus, pointStatus, syncStatus, imwebSummary],
  );

  const notificationProviderRows: Array<
    NotificationProviderSummary & { icon: ComponentType<{ className?: string }> }
  > = useMemo(
    () =>
      notificationProviders.map((provider) => ({
        ...provider,
        icon: providerIconMap[provider.provider],
      })),
    [],
  );

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>연동 상태</CardTitle>
          <CardDescription>
            실제 연결과 placeholder를 구분해 현재 상태를 오해하지 않도록 표시합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadError ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {loadError}
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            {integrations.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.key}
                  className="rounded-2xl border border-border/60 bg-background/60 p-4"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`rounded-xl p-2 ${item.accentClassName}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">
                          {item.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>

                  {item.note ? (
                    <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                      {item.note}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            {isLoading
              ? "외부 연동 상태를 불러오는 중입니다."
              : "현재 외부 연동은 실제 연결 상태와 placeholder 상태를 분리해 표시합니다. 실제 API 키 등록, 서버사이드 호출, 주문 이벤트 수신, 자동 멤버십/크레딧 반영, 발송 provider 활성화가 끝나기 전에는 연결됨이나 처리 완료처럼 보이지 않도록 유지합니다."}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>OpenAI 연동</CardTitle>
            <CardDescription>
              프론트 직접 호출 없이 서버사이드 호출 구조로 관리합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <KeyValueRow
              label="모델"
              value={openAIIntegrationSummary.model}
            />
            <KeyValueRow
              label="프롬프트 버전"
              value={openAIIntegrationSummary.promptVersion}
            />
            <KeyValueRow
              label="API 키 등록"
              value={openAIIntegrationSummary.apiKeyConfigured ? "완료" : "준비"}
            />
            <KeyValueRow
              label="서버사이드 준비"
              value={openAIIntegrationSummary.serverSideReady ? "완료" : "준비"}
            />
            <KeyValueRow
              label="최근 테스트"
              value={formatDateTime(openAIIntegrationSummary.lastTestedAt)}
            />
            <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
              {openAIIntegrationSummary.note}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>아임웹 회원/주문 연동</CardTitle>
            <CardDescription>
              회원 매칭보다 상품/주문 운영 매핑을 우선하는 구조입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <KeyValueRow
              label="상태"
              value={externalStatusMeta[imwebStatus].label}
            />
            <KeyValueRow
              label="Webhook URL"
              value={imwebSummary?.webhookUrl ?? "—"}
            />
            <KeyValueRow
              label="최근 동기화"
              value={formatDateTime(imwebSummary?.lastSyncedAt)}
            />
            <KeyValueRow
              label="최근 이벤트"
              value={imwebSummary?.lastEventLabel ?? "—"}
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                webhook 준비
              </Button>
              <Button variant="outline" size="sm" disabled>
                수동 재처리 준비
              </Button>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
              {imwebSummary?.note ??
                "연동 데이터가 없으면 미연결/연결 준비 상태로 유지합니다."}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>상품 → 멤버십 매핑</CardTitle>
            <CardDescription>
              아임웹 상품 구매 시 어떤 membershipCode를 부여할지 관리합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {membershipMappings.map((mapping, index) => (
              <div
                key={`${mapping.externalProductCode}-${index}`}
                className="rounded-xl border border-border/60 bg-background/50 px-4 py-3"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {mapping.mappedMembershipCode}
                    </Badge>
                    <span className="text-sm font-medium text-foreground">
                      {mapping.mappedMembershipLabel}
                    </span>
                  </div>
                  <StatusBadge
                    status={mapping.isActive ? "test_connected" : "pending"}
                  />
                </div>
                <p className="text-sm font-medium text-foreground">
                  {mapping.externalProductName}
                </p>
                <p className="text-xs text-muted-foreground">
                  코드: {mapping.externalProductCode}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {mapping.note}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>포인트상품 → 크레딧 매핑</CardTitle>
            <CardDescription>
              포인트상품 구매 시 내부 creditAmount 반영 기준을 관리합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pointMappings.map((mapping, index) => (
              <div
                key={`${mapping.externalPointProductCode}-${index}`}
                className="rounded-xl border border-border/60 bg-background/50 px-4 py-3"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {mapping.mappedCreditAmount} credits
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {mapping.grantMode}
                    </span>
                  </div>
                  <StatusBadge
                    status={mapping.isActive ? "connected" : "pending"}
                  />
                </div>
                <p className="text-sm font-medium text-foreground">
                  {mapping.externalPointProductName}
                </p>
                <p className="text-xs text-muted-foreground">
                  코드: {mapping.externalPointProductCode}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {mapping.note}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>알림 / 발송 provider</CardTitle>
            <CardDescription>
              email, kakao, sms provider별 enabled / configured / lastTestedAt
              상태를 구분합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {notificationProviderRows.map((provider) => {
              const Icon = provider.icon;

              return (
                <div
                  key={provider.provider}
                  className="rounded-xl border border-border/60 bg-background/50 px-4 py-3"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium capitalize text-foreground">
                        {provider.provider}
                      </span>
                    </div>
                    <StatusBadge status={provider.status} />
                  </div>
                  <div className="grid gap-2 md:grid-cols-3">
                    <KeyValueRow
                      label="Enabled"
                      value={provider.enabled ? "true" : "false"}
                    />
                    <KeyValueRow
                      label="Configured"
                      value={provider.configured ? "true" : "false"}
                    />
                    <KeyValueRow
                      label="Last Tested"
                      value={formatDateTime(provider.lastTestedAt)}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {provider.note}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>동기화 이력</CardTitle>
            <CardDescription>
              최근 처리 이력과 actionType 상태를 확인합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {syncHistories.map((history) => (
              <div
                key={history.historyId}
                className="rounded-xl border border-border/60 bg-background/50 px-4 py-3"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <Badge variant="outline">{history.actionType}</Badge>
                  <StatusBadge status={history.status} />
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <KeyValueRow
                    label="처리시각"
                    value={formatDateTime(history.processedAt)}
                  />
                  <KeyValueRow
                    label="처리주체"
                    value={history.processedBy}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {history.note}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>예외 처리 / 수동 재처리</CardTitle>
          <CardDescription>
            실패 유형 분류와 운영자 검토 대상을 확인합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {exceptionItems.map((item) => (
            <div
              key={item.exceptionId}
              className="rounded-xl border border-border/60 bg-background/50 px-4 py-3"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <Badge variant="outline">{item.exceptionType}</Badge>
                <StatusBadge status={item.status} />
              </div>
              <p className="text-sm text-muted-foreground">{item.note}</p>
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!item.canRetry}
                >
                  수동 재처리 준비
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
