/**
 * Organization Repository (Phase 10)
 * Read-only in 1st phase (seed-based).
 */

import { supabase } from "@/integrations/supabase/client";
import { DEV_ORG_ID } from "./constants";
import type { MembershipCode } from "@/lib/membership";

export interface OrganizationRow {
  id: string;
  name: string;
  business_type: string;
  branch_code: string | null;
  parent_org_id: string | null;
  membership_code: MembershipCode;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export async function fetchOrganization(orgId: string = DEV_ORG_ID): Promise<OrganizationRow | null> {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .maybeSingle();
  if (error) { console.error("fetchOrganization error:", error); return null; }
  return data as OrganizationRow | null;
}
