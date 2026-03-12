/**
 * Credit Repository (Phase 10)
 * Reads wallet/ledger directly; writes via RPC only.
 */

import { supabase } from "@/integrations/supabase/client";
import { DEV_ORG_ID } from "./constants";

export interface CreditWalletRow {
  id: string;
  org_id: string;
  balance: number;
  lifetime_granted: number;
  lifetime_used: number;
  updated_at: string;
}

export interface CreditLedgerRow {
  id: string;
  wallet_id: string;
  org_id: string;
  type: string;
  amount_delta: number;
  balance_after: number;
  reason: string;
  related_module: string | null;
  related_result_id: string | null;
  actor_type: string;
  actor_id: string | null;
  created_at: string;
}

export async function fetchWallet(orgId: string = DEV_ORG_ID): Promise<CreditWalletRow | null> {
  const { data, error } = await supabase
    .from("credit_wallets")
    .select("*")
    .eq("org_id", orgId)
    .maybeSingle();
  if (error) { console.error("fetchWallet error:", error); return null; }
  return data as CreditWalletRow | null;
}

export async function fetchLedger(orgId: string = DEV_ORG_ID, limit = 100): Promise<CreditLedgerRow[]> {
  const { data, error } = await supabase
    .from("credit_ledger")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) { console.error("fetchLedger error:", error); return []; }
  return (data ?? []) as CreditLedgerRow[];
}

export async function deductCreditRPC(
  orgId: string,
  amount: number,
  type: string,
  reason: string,
  module?: string,
  resultId?: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("deduct_credit", {
    _org_id: orgId,
    _amount: amount,
    _type: type,
    _reason: reason,
    _module: module ?? null,
    _result_id: resultId ?? null,
  });
  if (error) { console.error("deductCreditRPC error:", error); return false; }
  return data === true;
}

export async function grantCreditRPC(
  orgId: string,
  amount: number,
  type: string,
  reason: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("grant_credit", {
    _org_id: orgId,
    _amount: amount,
    _type: type,
    _reason: reason,
  });
  if (error) { console.error("grantCreditRPC error:", error); return false; }
  return data === true;
}
