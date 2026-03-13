/**
 * MembershipContext (Phase 11 — Auth-connected)
 * 
 * Reads org_id from AuthContext instead of DEV_ORG_ID.
 * Falls back to DEV_ORG_ID when not authenticated (shouldn't happen behind RouteGuard).
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type {
  MembershipCode, CreditLedgerEntry, LedgerType,
  FeatureKey, AccessMode, OrganizationFeatureOverride,
} from "@/lib/membership";
import { getMembershipTier } from "@/lib/membership";
import { checkFeatureAccess, checkResultActions, type FeatureAccessResult, type ResultActionsAccess } from "@/lib/feature-access";
import { fetchOrganization } from "@/lib/repositories/organization-repository";
import { fetchWallet, fetchLedger, deductCreditRPC, grantCreditRPC, type CreditLedgerRow } from "@/lib/repositories/credit-repository";
import { fetchFeatureOverrides, type FeatureOverrideRow } from "@/lib/repositories/feature-override-repository";
import { useAuth } from "@/contexts/AuthContext";

const FALLBACK_ORG_ID = "00000000-0000-0000-0000-000000000001";

// ── Context Interface (unchanged public API) ──

interface MembershipContextValue {
  membershipCode: MembershipCode;
  membershipName: string;
  membershipDescription: string;
  setMembershipCode: (code: MembershipCode) => void;
  creditBalance: number;
  ledger: CreditLedgerEntry[];
  deductCredit: (amount: number, type: LedgerType, reason: string, module?: string, resultId?: string) => boolean;
  grantCredit: (amount: number, type: LedgerType, reason: string) => void;
  checkAccess: (featureKey: FeatureKey) => FeatureAccessResult;
  getResultActions: () => ResultActionsAccess;
  overrides: OrganizationFeatureOverride[];
  addOverride: (override: OrganizationFeatureOverride) => void;
  removeOverride: (featureKey: FeatureKey, membershipCode?: MembershipCode) => void;
}

const MembershipContext = createContext<MembershipContextValue | undefined>(undefined);

// ── Helpers ──

function ledgerRowToEntry(row: CreditLedgerRow): CreditLedgerEntry {
  return {
    id: row.id,
    organizationId: row.org_id,
    type: row.type as LedgerType,
    amountDelta: row.amount_delta,
    balanceAfter: row.balance_after,
    reason: row.reason,
    relatedModule: row.related_module ?? undefined,
    relatedResultId: row.related_result_id ?? undefined,
    actorType: row.actor_type as CreditLedgerEntry["actorType"],
    createdAt: row.created_at,
  };
}

// ── Provider ──

export function MembershipProvider({ children }: { children: ReactNode }) {
  const { orgId: authOrgId, isAuthenticated } = useAuth();
  const orgId = authOrgId ?? FALLBACK_ORG_ID;

  const [membershipCode, setMembershipCode] = useState<MembershipCode>("pro");
  const [creditBalance, setCreditBalance] = useState(0);
  const [ledger, setLedger] = useState<CreditLedgerEntry[]>([]);
  const [overrides, setOverrides] = useState<OrganizationFeatureOverride[]>([]);

  const tier = getMembershipTier(membershipCode);

  // Reload from DB whenever orgId changes (or on first auth)
  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    async function init() {
      const [org, wallet, ledgerRows, overrideRows] = await Promise.all([
        fetchOrganization(orgId),
        fetchWallet(orgId),
        fetchLedger(orgId),
        fetchFeatureOverrides(orgId),
      ]);

      if (cancelled) return;

      if (org) setMembershipCode(org.membership_code);
      if (wallet) setCreditBalance(wallet.balance);
      setLedger(ledgerRows.map(ledgerRowToEntry));

      if (overrideRows.length > 0) {
        const mapped: OrganizationFeatureOverride[] = overrideRows.map((row: FeatureOverrideRow) => ({
          organizationId: row.org_id,
          featureKey: row.feature_key as FeatureKey,
          membershipCode: (row.membership_code ?? "trial") as MembershipCode,
          accessMode: ((row as any).access_mode ?? (row.enabled ? "enabled" : "hidden")) as AccessMode,
          creditCost: row.custom_credit_cost ?? undefined,
          note: row.reason ?? undefined,
          isActive: true,
        }));
        setOverrides(mapped);
      }
    }

    init();
    return () => { cancelled = true; };
  }, [orgId, isAuthenticated]);

  const deductCredit = useCallback((amount: number, type: LedgerType, reason: string, module?: string, resultId?: string): boolean => {
    if (creditBalance < amount) return false;
    const newBalance = creditBalance - amount;

    setCreditBalance(newBalance);
    setLedger(prev => [{
      id: `led-${Date.now()}`,
      organizationId: orgId,
      type,
      amountDelta: -amount,
      balanceAfter: newBalance,
      reason,
      relatedModule: module,
      relatedResultId: resultId,
      actorType: "user",
      createdAt: new Date().toISOString(),
    }, ...prev]);

    deductCreditRPC(orgId, amount, type, reason, module, resultId).then(success => {
      if (!success) console.warn("deductCreditRPC returned false");
    });

    return true;
  }, [creditBalance, orgId]);

  const grantCredit = useCallback((amount: number, type: LedgerType, reason: string) => {
    const newBalance = creditBalance + amount;

    setCreditBalance(newBalance);
    setLedger(prev => [{
      id: `led-${Date.now()}`,
      organizationId: orgId,
      type,
      amountDelta: amount,
      balanceAfter: newBalance,
      reason,
      actorType: "operator",
      createdAt: new Date().toISOString(),
    }, ...prev]);

    grantCreditRPC(orgId, amount, type, reason).then(success => {
      if (!success) console.warn("grantCreditRPC returned false");
    });
  }, [creditBalance, orgId]);

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

  const removeOverride = useCallback((featureKey: FeatureKey, mc?: MembershipCode) => {
    setOverrides(prev => prev.filter(o => {
      if (o.featureKey !== featureKey) return true;
      if (mc && o.membershipCode !== mc) return true;
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
