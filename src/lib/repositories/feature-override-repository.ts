/**
 * Feature Override Repository (Phase 10)
 * Reads from feature_overrides table, writes via Edge Function.
 */

import { supabase } from "@/integrations/supabase/client";
import { DEV_ORG_ID } from "./constants";
import type { AccessMode, MembershipCode } from "@/lib/membership";

export interface FeatureOverrideRow {
  id: string;
  org_id: string;
  feature_key: string;
  membership_code: MembershipCode | null;
  enabled: boolean;
  access_mode: string;
  custom_credit_cost: number | null;
  reason: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchFeatureOverrides(orgId: string = DEV_ORG_ID): Promise<FeatureOverrideRow[]> {
  const { data, error } = await supabase
    .from("feature_overrides")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchFeatureOverrides error:", error);
    return [];
  }
  return (data ?? []) as unknown as FeatureOverrideRow[];
}

export async function upsertFeatureOverride(
  orgId: string,
  featureKey: string,
  membershipCode: MembershipCode,
  accessMode: AccessMode,
  customCreditCost?: number | null,
  reason?: string,
): Promise<boolean> {
  const { data, error } = await supabase.functions.invoke("manage-feature-overrides", {
    body: {
      action: "upsert",
      payload: {
        org_id: orgId,
        feature_key: featureKey,
        membership_code: membershipCode,
        enabled: accessMode !== "hidden",
        access_mode: accessMode,
        custom_credit_cost: customCreditCost ?? null,
        reason: reason ?? null,
      },
    },
  });
  if (error) {
    console.error("upsertFeatureOverride error:", error);
    return false;
  }
  return data?.success === true;
}

export async function deleteFeatureOverride(
  orgId: string,
  featureKey: string,
  membershipCode?: MembershipCode,
): Promise<boolean> {
  const { data, error } = await supabase.functions.invoke("manage-feature-overrides", {
    body: {
      action: "delete",
      payload: {
        org_id: orgId,
        feature_key: featureKey,
        membership_code: membershipCode ?? null,
      },
    },
  });
  if (error) {
    console.error("deleteFeatureOverride error:", error);
    return false;
  }
  return data?.success === true;
}
