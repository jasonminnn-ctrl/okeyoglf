/**
 * MembershipContext (Phase 10 — DB-backed)
 * 
 * Reads membership from organizations table, credits from credit_wallets/ledger.
 * Credit operations go through deduct_credit/grant_credit RPC.
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type {
  MembershipCode, CreditLedgerEntry, LedgerType,
  FeatureKey, OrganizationFeatureOverride,
} from "@/lib/membership";
import { getMembershipTier } from "@/lib/membership";
import { checkFeatureAccess, checkResultActions, type FeatureAccessResult, type ResultActionsAccess } from "@/lib/feature-access";
import { fetchOrganization } from "@/lib/repositories/organization-repository";
import { fetchWallet, fetchLedger, deductCreditRPC, grantCreditRPC, type CreditLedgerRow } from "@/lib/repositories/credit-repository";
import { DEV_ORG_ID } from "@/lib/repositories/constants";

// ──────────────────────────────────
// Context Interface (unchanged public API)
// ──────────────────────────────────

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

// ──────────────────────────────────
// Helpers: DB row → context shape
// ──────────────────────────────────

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

// ──────────────────────────────────
// Provider
// ──────────────────────────────────

export function MembershipProvider({ children }: { children: ReactNode }) {
  const [membershipCode, setMembershipCode] = useState<MembershipCode>("pro");
  const [creditBalance, setCreditBalance] = useState(0);
  const [ledger, setLedger] = useState<CreditLedgerEntry[]>([]);
  const [overrides, setOverrides] = useState<OrganizationFeatureOverride[]>([]);
  const [loaded, setLoaded] = useState(false);

  const tier = getMembershipTier(membershipCode);

  // Initial load from DB
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const [org, wallet, ledgerRows] = await Promise.all([
        fetchOrganization(DEV_ORG_ID),
        fetchWallet(DEV_ORG_ID),
        fetchLedger(DEV_ORG_ID),
      ]);

      if (cancelled) return;

      if (org) {
        setMembershipCode(org.membership_code);
      }
      if (wallet) {
        setCreditBalance(wallet.balance);
      }
      setLedger(ledgerRows.map(ledgerRowToEntry));
      setLoaded(true);
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const deductCredit = useCallback((amount: number, type: LedgerType, reason: string, module?: string, resultId?: string): boolean => {
    if (creditBalance < amount) return false;
    const newBalance = creditBalance - amount;

    // Optimistic update
    setCreditBalance(newBalance);
    setLedger(prev => [
      {
        id: `led-${Date.now()}`,
        organizationId: DEV_ORG_ID,
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

    // Fire RPC (async, no await — fire-and-forget with error logging)
    deductCreditRPC(DEV_ORG_ID, amount, type, reason, module, resultId).then(success => {
      if (!success) {
        console.warn("deductCreditRPC returned false — may need to refresh balance");
      }
    });

    return true;
  }, [creditBalance]);

  const grantCredit = useCallback((amount: number, type: LedgerType, reason: string) => {
    const newBalance = creditBalance + amount;

    // Optimistic update
    setCreditBalance(newBalance);
    setLedger(prev => [
      {
        id: `led-${Date.now()}`,
        organizationId: DEV_ORG_ID,
        type,
        amountDelta: amount,
        balanceAfter: newBalance,
        reason,
        actorType: "operator",
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    grantCreditRPC(DEV_ORG_ID, amount, type, reason).then(success => {
      if (!success) {
        console.warn("grantCreditRPC returned false — may need to refresh balance");
      }
    });
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
