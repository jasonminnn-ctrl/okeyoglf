/**
 * MembershipContext (Phase 5 + 6-1)
 * 
 * Provides membership tier, credit wallet, ledger,
 * feature access checks, and credit operations to the entire app.
 * Currently uses mock/local state; designed for future Supabase migration.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type {
  MembershipCode, CreditWallet, CreditLedgerEntry, LedgerType,
  FeatureKey, OrganizationFeatureOverride, UsageEvent,
} from "@/lib/membership";
import { getMembershipTier, membershipTiers, FEATURE_KEYS } from "@/lib/membership";
import { checkFeatureAccess, checkResultActions, type FeatureAccessResult, type ResultActionsAccess } from "@/lib/feature-access";

// ──────────────────────────────────
// Context Interface
// ──────────────────────────────────

interface MembershipContextValue {
  // Membership
  membershipCode: MembershipCode;
  membershipName: string;
  membershipDescription: string;
  setMembershipCode: (code: MembershipCode) => void;

  // Credits
  creditBalance: number;
  ledger: CreditLedgerEntry[];

  // Credit operations
  deductCredit: (amount: number, type: LedgerType, reason: string, module?: string, resultId?: string) => boolean;
  grantCredit: (amount: number, type: LedgerType, reason: string) => void;

  // Feature access
  checkAccess: (featureKey: FeatureKey) => FeatureAccessResult;
  getResultActions: () => ResultActionsAccess;

  // Overrides (operator managed)
  overrides: OrganizationFeatureOverride[];
  addOverride: (override: OrganizationFeatureOverride) => void;
  removeOverride: (featureKey: FeatureKey, membershipCode?: MembershipCode) => void;
}

const MembershipContext = createContext<MembershipContextValue | undefined>(undefined);

// ──────────────────────────────────
// Mock initial data
// ──────────────────────────────────

const MOCK_ORG_ID = "org-001";

const initialLedger: CreditLedgerEntry[] = [
  { id: "led-1", organizationId: MOCK_ORG_ID, type: "manual_grant", amountDelta: 1000, balanceAfter: 1000, reason: "프로 멤버십 월간 크레딧 지급", actorType: "system", createdAt: "2026-03-01T00:00:00Z" },
  { id: "led-2", organizationId: MOCK_ORG_ID, type: "generate", amountDelta: -3, balanceAfter: 997, reason: "AI 비서 — 오늘의 할 일 생성", relatedModule: "AI 비서", actorType: "user", createdAt: "2026-03-05T10:30:00Z" },
  { id: "led-3", organizationId: MOCK_ORG_ID, type: "generate", amountDelta: -3, balanceAfter: 994, reason: "AI 마케팅팀 — 마케팅 카피 생성", relatedModule: "AI 마케팅팀", actorType: "user", createdAt: "2026-03-07T14:20:00Z" },
  { id: "led-4", organizationId: MOCK_ORG_ID, type: "generate", amountDelta: -5, balanceAfter: 989, reason: "AI 운영팀 — AI 진단실 생성", relatedModule: "AI 운영팀", actorType: "user", createdAt: "2026-03-08T09:15:00Z" },
  { id: "led-5", organizationId: MOCK_ORG_ID, type: "regenerate", amountDelta: -3, balanceAfter: 986, reason: "AI 영업팀 — 응대 문안 재생성", relatedModule: "AI 영업팀", actorType: "user", createdAt: "2026-03-09T16:45:00Z" },
];

// ──────────────────────────────────
// Provider
// ──────────────────────────────────

export function MembershipProvider({ children }: { children: ReactNode }) {
  const [membershipCode, setMembershipCode] = useState<MembershipCode>("pro");
  const [creditBalance, setCreditBalance] = useState(986);
  const [ledger, setLedger] = useState<CreditLedgerEntry[]>(initialLedger);
  const [overrides, setOverrides] = useState<OrganizationFeatureOverride[]>([]);

  const tier = getMembershipTier(membershipCode);

  const deductCredit = useCallback((amount: number, type: LedgerType, reason: string, module?: string, resultId?: string): boolean => {
    if (creditBalance < amount) return false;
    const newBalance = creditBalance - amount;
    setCreditBalance(newBalance);
    setLedger(prev => [
      {
        id: `led-${Date.now()}`,
        organizationId: MOCK_ORG_ID,
        type,
        amountDelta: -amount,
        balanceAfter: newBalance,
        reason,
        relatedModule: module,
        relatedResultId: resultId,
        actorType: "user",
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    return true;
  }, [creditBalance]);

  const grantCredit = useCallback((amount: number, type: LedgerType, reason: string) => {
    const newBalance = creditBalance + amount;
    setCreditBalance(newBalance);
    setLedger(prev => [
      {
        id: `led-${Date.now()}`,
        organizationId: MOCK_ORG_ID,
        type,
        amountDelta: amount,
        balanceAfter: newBalance,
        reason,
        actorType: "operator",
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, [creditBalance]);

  const checkAccess = useCallback((featureKey: FeatureKey): FeatureAccessResult => {
    return checkFeatureAccess(featureKey, membershipCode, creditBalance, overrides);
  }, [membershipCode, creditBalance, overrides]);

  const getResultActions = useCallback((): ResultActionsAccess => {
    return checkResultActions(membershipCode, creditBalance, overrides);
  }, [membershipCode, creditBalance, overrides]);

  const addOverride = useCallback((override: OrganizationFeatureOverride) => {
    setOverrides(prev => [
      ...prev.filter(o => !(o.featureKey === override.featureKey && o.membershipCode === override.membershipCode)),
      override,
    ]);
  }, []);

  const removeOverride = useCallback((featureKey: FeatureKey, membershipCode?: MembershipCode) => {
    setOverrides(prev => prev.filter(o => {
      if (o.featureKey !== featureKey) return true;
      if (membershipCode && o.membershipCode !== membershipCode) return true;
      return false;
    }));
  }, []);

  return (
    <MembershipContext.Provider value={{
      membershipCode,
      membershipName: tier.name,
      membershipDescription: tier.description,
      setMembershipCode,
      creditBalance,
      ledger,
      deductCredit,
      grantCredit,
      checkAccess,
      getResultActions,
      overrides,
      addOverride,
      removeOverride,
    }}>
      {children}
    </MembershipContext.Provider>
  );
}

export function useMembership() {
  const ctx = useContext(MembershipContext);
  if (!ctx) throw new Error("useMembership must be inside MembershipProvider");
  return ctx;
}
