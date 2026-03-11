/**
 * OperatorIntegrationTab — 운영자 전용 외부 연동 탭 (Phase 8 IA)
 * 고객 비노출. /operator 내부 탭으로만 사용.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Globe, Cpu, ShoppingCart, CreditCard, Crown, Bell, RefreshCw,
  CheckCircle, XCircle, Clock, AlertTriangle, Link2, Package, Coins,
} from "lucide-react";

// ──────────────────────────────────
// Integration status types
// ──────────────────────────────────

type IntegrationStatus = "connected" | "disconnected" | "error" | "pending";

interface IntegrationItem {
  key: string;
  title: string;
  description: string;
  status: IntegrationStatus;
  icon: React.ElementType;
  color: string;
}

const statusConfig: Record<IntegrationStatus, { label: string; badge: string; icon: React.ElementType }> = {
  connected: { label: "연결됨", badge: "bg-emerald-500/20 text-emerald-400", icon: CheckCircle },
  disconnected: { label: "미연결", badge: "bg-muted text-muted-foreground", icon: XCircle },
  error: { label: "오류", badge: "bg-red-500/20 text-red-400", icon: AlertTriangle },
  pending: { label: "연결 준비", badge: "bg-amber-500/20 text-amber-400", icon: Clock },
};

// All integrations are placeholder (disconnected/pending) at Phase 8-0
const integrations: IntegrationItem[] = [
  { key: "openai", title: "OpenAI", description: "AI 생성 엔진 — 서버사이드 API 호출", status: "pending", icon: Cpu, color: "bg-emerald-500/10 text-emerald-400" },
  { key: "imweb_member", title: "아임웹 회원/주문", description: "회원 동기화 · 주문 webhook 수신", status: "disconnected", icon: ShoppingCart, color: "bg-blue-500/10 text-blue-400" },
  { key: "imweb_product_membership", title: "상품 → 멤버십 매핑", description: "아임웹 상품 ID ↔ membershipCode 매핑", status: "disconnected", icon: Crown, color: "bg-amber-500/10 text-amber-400" },
  { key: "imweb_point_credit", title: "포인트상품 → 크레딧 매핑", description: "아임웹 포인트상품 ID ↔ creditAmount 매핑", status: "disconnected", icon: Coins, color: "bg-violet-500/10 text-violet-400" },
  { key: "notification", title: "알림/발송", description: "카카오 알림톡 · SMS · 이메일 provider", status: "disconnected", icon: Bell, color: "bg-pink-500/10 text-pink-400" },
  { key: "sync_history", title: "동기화 이력 / 예외 처리", description: "동기화 실패 건 조회 · 수동 재처리", status: "disconnected", icon: RefreshCw, color: "bg-slate-500/10 text-slate-400" },
];

// ──────────────────────────────────
// Mapping placeholder tables
// ──────────────────────────────────

const productMembershipMappings = [
  { imwebProductId: "—", imwebProductName: "(상품 미연결)", membershipCode: "standard", note: "연결 대기" },
  { imwebProductId: "—", imwebProductName: "(상품 미연결)", membershipCode: "pro", note: "연결 대기" },
  { imwebProductId: "—", imwebProductName: "(상품 미연결)", membershipCode: "enterprise", note: "연결 대기" },
];

const pointCreditMappings = [
  { imwebPointProductId: "—", imwebPointProductName: "(포인트상품 미연결)", creditAmount: 100, note: "연결 대기" },
  { imwebPointProductId: "—", imwebPointProductName: "(포인트상품 미연결)", creditAmount: 500, note: "연결 대기" },
];

// ──────────────────────────────────
// Component
// ──────────────────────────────────

export default function OperatorIntegrationTab() {
  return (
    <div className="space-y-6">
      {/* 연동 상태 대시보드 */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" /> 연동 상태 대시보드
          </CardTitle>
          <CardDescription className="text-xs">각 외부 시스템의 현재 연결 상태를 확인합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {integrations.map((item) => {
              const sc = statusConfig[item.status];
              const StatusIcon = sc.icon;
              return (
                <div key={item.key} className="flex items-start gap-3 p-3 rounded-lg border border-border/30 bg-muted/10">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium">{item.title}</p>
                      <Badge className={`text-[9px] ${sc.badge}`} variant="outline">
                        <StatusIcon className="h-2.5 w-2.5 mr-0.5" />{sc.label}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* OpenAI 연동 */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" /> OpenAI 연동
            <Badge className="text-[9px] bg-amber-500/20 text-amber-400" variant="outline">연결 준비</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">Edge Function 기반 서버사이드 호출 구조. API 키는 서버 시크릿으로만 관리됩니다.</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border/30 p-3">
              <p className="text-[10px] text-muted-foreground">모델</p>
              <p className="text-xs font-medium mt-0.5">미설정</p>
            </div>
            <div className="rounded-lg border border-border/30 p-3">
              <p className="text-[10px] text-muted-foreground">API 키 상태</p>
              <p className="text-xs font-medium mt-0.5 text-muted-foreground">미등록</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="text-xs" disabled>API 키 등록 (8단계 구현 예정)</Button>
        </CardContent>
      </Card>

      {/* 아임웹 회원/주문 연동 */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" /> 아임웹 회원/주문 연동
            <Badge className="text-[9px] bg-muted text-muted-foreground" variant="outline">미연결</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">아임웹 주문 webhook 수신 → 멤버십/크레딧 자동 처리 구조</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border/30 p-3">
              <p className="text-[10px] text-muted-foreground">Webhook URL</p>
              <p className="text-xs font-medium mt-0.5 text-muted-foreground">미설정</p>
            </div>
            <div className="rounded-lg border border-border/30 p-3">
              <p className="text-[10px] text-muted-foreground">최근 이벤트</p>
              <p className="text-xs font-medium mt-0.5 text-muted-foreground">—</p>
            </div>
            <div className="rounded-lg border border-border/30 p-3">
              <p className="text-[10px] text-muted-foreground">동기화 상태</p>
              <p className="text-xs font-medium mt-0.5 text-muted-foreground">비활성</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 상품 → 멤버십 매핑 */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" /> 상품 → 멤버십 매핑
            <Badge className="text-[9px] bg-muted text-muted-foreground" variant="outline">매핑 대기</Badge>
          </CardTitle>
          <CardDescription className="text-xs">아임웹 상품 구매 시 자동으로 부여할 멤버십 등급을 매핑합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/30 text-muted-foreground">
                  <th className="text-left px-3 py-2 font-medium">아임웹 상품 ID</th>
                  <th className="text-left px-3 py-2 font-medium">상품명</th>
                  <th className="text-left px-3 py-2 font-medium">멤버십 등급</th>
                  <th className="text-left px-3 py-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {productMembershipMappings.map((m, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-muted-foreground">{m.imwebProductId}</td>
                    <td className="px-3 py-2 text-muted-foreground">{m.imwebProductName}</td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-[9px]">{m.membershipCode}</Badge></td>
                    <td className="px-3 py-2 text-muted-foreground">{m.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 포인트상품 → 크레딧 매핑 */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Coins className="h-4 w-4 text-primary" /> 포인트상품 → 크레딧 매핑
            <Badge className="text-[9px] bg-muted text-muted-foreground" variant="outline">매핑 대기</Badge>
          </CardTitle>
          <CardDescription className="text-xs">아임웹 포인트상품 구매 시 자동으로 충전할 크레딧 수량을 매핑합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/30 text-muted-foreground">
                  <th className="text-left px-3 py-2 font-medium">아임웹 포인트상품 ID</th>
                  <th className="text-left px-3 py-2 font-medium">상품명</th>
                  <th className="text-right px-3 py-2 font-medium">충전 크레딧</th>
                  <th className="text-left px-3 py-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {pointCreditMappings.map((m, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-muted-foreground">{m.imwebPointProductId}</td>
                    <td className="px-3 py-2 text-muted-foreground">{m.imwebPointProductName}</td>
                    <td className="px-3 py-2 text-right font-medium">{m.creditAmount}</td>
                    <td className="px-3 py-2 text-muted-foreground">{m.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 알림/발송 연동 */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" /> 알림/발송 연동
            <Badge className="text-[9px] bg-muted text-muted-foreground" variant="outline">미연결</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: "카카오 알림톡", status: "미연결" },
              { name: "SMS", status: "미연결" },
              { name: "이메일", status: "미연결" },
            ].map((p) => (
              <div key={p.name} className="rounded-lg border border-border/30 p-3 text-center">
                <p className="text-xs font-medium">{p.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{p.status}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 동기화 이력 / 예외 처리 */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-primary" /> 동기화 이력 / 예외 처리
            <Badge className="text-[9px] bg-muted text-muted-foreground" variant="outline">이력 없음</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <p className="text-xs text-muted-foreground">외부 연동이 활성화되면 동기화 이력과 실패 건이 여기에 표시됩니다</p>
          </div>
        </CardContent>
      </Card>

      {/* 안내 */}
      <Card className="bg-amber-500/5 border-amber-500/20">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs text-amber-400">
            ⚠️ 현재 모든 외부 연동은 "연결 준비" 또는 "미연결" 상태입니다. 
            실제 API 키 등록 및 연동 활성화는 8단계 구현 시 진행됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
