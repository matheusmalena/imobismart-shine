import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ASAAS_API_URL = "https://api.asaas.com/v3";

const logStep = (step: string, details?: unknown) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CHANGE-PLAN] ${step}${d}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { planId } = await req.json();
    logStep("Plan change requested", { planId, userId: user.id });

    const ASAAS_API_KEY = Deno.env.get("ASAAS_API_KEY");
    if (!ASAAS_API_KEY) throw new Error("ASAAS_API_KEY not configured");

    const headers = {
      "Content-Type": "application/json",
      access_token: ASAAS_API_KEY,
    };

    // Get current subscription from DB
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subError) throw new Error(`Subscription fetch error: ${subError.message}`);

    const asaasSubId = subscription?.asaas_subscription_id;

    if (!asaasSubId) {
      return new Response(
        JSON.stringify({ action: "checkout_required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Handle downgrade to FREE — cancel the Asaas subscription
    if (planId === "free") {
      logStep("Cancelling subscription for free downgrade", { asaasSubId });

      const cancelRes = await fetch(`${ASAAS_API_URL}/subscriptions/${asaasSubId}`, {
        method: "DELETE",
        headers,
      });

      const cancelData = await cancelRes.json();
      logStep("Cancel response", cancelData);

      await supabase
        .from("subscriptions")
        .update({
          plan: "free",
          status: "cancelled",
          asaas_subscription_id: null,
        })
        .eq("user_id", user.id);

      return new Response(
        JSON.stringify({ success: true, action: "cancelled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Handle upgrade/downgrade between paid plans
    const { data: newPlan, error: planError } = await supabase
      .from("plans")
      .select("id, name, price")
      .eq("id", planId)
      .single();

    if (planError || !newPlan) {
      throw new Error("Plan not found");
    }

    logStep("Updating Asaas subscription", { asaasSubId, newValue: newPlan.price });

    const updateRes = await fetch(`${ASAAS_API_URL}/subscriptions/${asaasSubId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        value: newPlan.price,
        description: `ImobiSmart - Plano ${newPlan.name}`,
        externalReference: JSON.stringify({ user_id: user.id, plan_id: planId }),
      }),
    });

    const updateData = await updateRes.json();
    logStep("Update response", updateData);

    if (updateData.errors) {
      throw new Error(`Asaas update error: ${JSON.stringify(updateData.errors)}`);
    }

    // Update DB immediately
    await supabase
      .from("subscriptions")
      .update({ plan: planId, status: "active" })
      .eq("user_id", user.id);

    return new Response(
      JSON.stringify({ success: true, action: "updated", plan: planId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    logStep("ERROR", { message: (error as Error).message });
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
