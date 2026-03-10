/**
 * Feature Access Service (Phase 5)
 * 
 * Central service for checking feature access, credit sufficiency,
 * and resolving upsell messages. Pages call these functions 
 * instead of embedding policy logic.
 */

import type { MembershipCode, FeatureKey, AccessMode, FeaturePolicy, CreditWallet, OrganizationFeatureOverride } from "./membership";
import { defaultFeaturePolicies } from "./membership";

// ──────────────────────────────────
// Access Check Result
// ──────────────────────────────────

export interface FeatureAccessResult {
  /** Whether the feature is visible at all */
  visible: boolean;
  /** Whether the feature can be executed */
  enabled: boolean;
  /** Lock reason to display if not enabled */
  lockReason?: string;
  /** Whether credit is required */
  requiresCredit: boolean;
  /** Credit cost for this action */
  creditCost: number;
  /** Whether the user has enough credit */
  hasSufficientCredit: boolean;
}

// ──────────────────────────────────
// Feature Access Service
// ──────────────────────────────────

export function checkFeatureAccess(
  featureKey: FeatureKey,
  membershipCode: MembershipCode,
  creditBalance: number,
  overrides?: OrganizationFeatureOverride[],
): FeatureAccessResult {
  // 1. Check for org-level override first
  const override = overrides?.find(
    o => o.featureKey === featureKey && o.isActive
  );

  // 2. Find base policy
  const basePolicy = defaultFeaturePolicies.find(
    p => p.featureKey === featureKey && p.membershipCode === membershipCode && p.isActive
  );

  // 3. Merge override onto base
  const accessMode: AccessMode = override?.accessMode ?? basePolicy?.accessMode ?? "hidden";
  const requiresCredit = override?.requiresCredit ?? basePolicy?.requiresCredit ?? false;
  const creditCost = override?.creditCost ?? basePolicy?.creditCost ?? 0;
  const upsellLabel = basePolicy?.upsellLabel;

  // 4. Determine visibility and enabled state
  if (accessMode === "hidden") {
    return { visible: false, enabled: false, requiresCredit, creditCost, hasSufficientCredit: creditBalance >= creditCost };
  }

  if (accessMode === "locked") {
    return {
      visible: true,
      enabled: false,
      lockReason: upsellLabel || "현재 플랜에서는 이 기능이 제한됩니다",
      requiresCredit,
      creditCost,
      hasSufficientCredit: creditBalance >= creditCost,
    };
  }

  // enabled
  if (requiresCredit && creditBalance < creditCost) {
    return {
      visible: true,
      enabled: false,
      lockReason: `크레딧이 부족합니다 (필요: ${creditCost}, 잔액: ${creditBalance})`,
      requiresCredit: true,
      creditCost,
      hasSufficientCredit: false,
    };
  }

  return { visible: true, enabled: true, requiresCredit, creditCost, hasSufficientCredit: true };
}

// ──────────────────────────────────
// Result Action Access (batch check)
// ──────────────────────────────────

export interface ResultActionsAccess {
  save: FeatureAccessResult;
  copy: FeatureAccessResult;
  regenerate: FeatureAccessResult;
  consultantTransfer: FeatureAccessResult;
}

export function checkResultActions(
  membershipCode: MembershipCode,
  creditBalance: number,
  overrides?: OrganizationFeatureOverride[],
): ResultActionsAccess {
  return {
    save: checkFeatureAccess("result.save", membershipCode, creditBalance, overrides),
    copy: checkFeatureAccess("result.copy", membershipCode, creditBalance, overrides),
    regenerate: checkFeatureAccess("result.regenerate", membershipCode, creditBalance, overrides),
    consultantTransfer: checkFeatureAccess("result.consultant_transfer", membershipCode, creditBalance, overrides),
  };
}

// ──────────────────────────────────
// Upsell Message Resolver
// ──────────────────────────────────

export function resolveUpsellMessage(lockReason?: string): { icon: "lock" | "credit" | "upgrade"; message: string } {
  if (!lockReason) return { icon: "lock", message: "" };
  
  if (lockReason.includes("크레딧")) {
    return { icon: "credit", message: lockReason };
  }
  if (lockReason.includes("Pro")) {
    return { icon: "upgrade", message: lockReason };
  }
  if (lockReason.includes("스탠다드")) {
    return { icon: "upgrade", message: lockReason };
  }
  return { icon: "lock", message: lockReason };
}
