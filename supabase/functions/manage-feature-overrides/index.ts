/**
 * Edge Function: manage-feature-overrides
 * Handles INSERT/UPDATE/DELETE for feature_overrides via service_role.
 * Operator-only — no client-side direct write.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const { action, payload } = body as {
      action: "upsert" | "delete";
      payload: {
        org_id: string;
        feature_key: string;
        membership_code?: string;
        enabled?: boolean;
        access_mode?: string;
        custom_credit_cost?: number | null;
        reason?: string;
      };
    };

    if (action === "upsert") {
      const { org_id, feature_key, membership_code, enabled, access_mode, custom_credit_cost, reason } = payload;

      // Check if existing row
      const { data: existing } = await supabase
        .from("feature_overrides")
        .select("id")
        .eq("org_id", org_id)
        .eq("feature_key", feature_key)
        .eq("membership_code", membership_code ?? "")
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("feature_overrides")
          .update({
            enabled: enabled ?? true,
            access_mode: access_mode ?? "enabled",
            custom_credit_cost: custom_credit_cost ?? null,
            reason: reason ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) throw error;
        return new Response(JSON.stringify({ success: true, action: "updated" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else {
        const { error } = await supabase
          .from("feature_overrides")
          .insert({
            org_id,
            feature_key,
            membership_code: membership_code ?? null,
            enabled: enabled ?? true,
            access_mode: access_mode ?? "enabled",
            custom_credit_cost: custom_credit_cost ?? null,
            reason: reason ?? null,
          });

        if (error) throw error;
        return new Response(JSON.stringify({ success: true, action: "inserted" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (action === "delete") {
      const { org_id, feature_key, membership_code } = payload;
      let query = supabase
        .from("feature_overrides")
        .delete()
        .eq("org_id", org_id)
        .eq("feature_key", feature_key);

      if (membership_code) {
        query = query.eq("membership_code", membership_code);
      }

      const { error } = await query;
      if (error) throw error;

      return new Response(JSON.stringify({ success: true, action: "deleted" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("manage-feature-overrides error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
