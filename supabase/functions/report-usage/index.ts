import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all plans with their limits
    const { data: plans, error: plansError } = await supabase
      .from("plans")
      .select("id, property_limit, extra_property_price");

    if (plansError) throw plansError;

    const planLimits: Record<string, { limit: number; extraPrice: number }> = {};
    for (const plan of plans || []) {
      planLimits[plan.id] = {
        limit: plan.property_limit,
        extraPrice: plan.extra_property_price || 0,
      };
    }

    // Get all active subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from("subscriptions")
      .select("user_id, plan, asaas_subscription_id")
      .eq("status", "active");

    if (subsError) throw subsError;

    const results: Array<{
      userId: string;
      plan: string;
      active: number;
      limit: number;
      excess: number;
    }> = [];

    for (const sub of subscriptions || []) {
      const planConfig = planLimits[sub.plan];
      if (!planConfig) continue;

      // Count active (non-archived) properties for this user
      const { count, error: countError } = await supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("user_id", sub.user_id)
        .or("is_archived.is.null,is_archived.eq.false");

      if (countError) {
        console.error(`Error counting properties for ${sub.user_id}:`, countError);
        continue;
      }

      const activeCount = count || 0;
      const excess = Math.max(0, activeCount - planConfig.limit);
      const extraAmount = excess * planConfig.extraPrice;

      results.push({
        userId: sub.user_id,
        plan: sub.plan,
        active: activeCount,
        limit: planConfig.limit,
        excess,
      });

      // Update extra_properties_count and extra_properties_amount
      await supabase
        .from("subscriptions")
        .update({
          extra_properties_count: excess,
          extra_properties_amount: extraAmount,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", sub.user_id);
    }

    console.log(`Usage report completed. Processed ${results.length} subscriptions.`);

    return new Response(
      JSON.stringify({
        processed: results.length,
        details: results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Report usage error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
