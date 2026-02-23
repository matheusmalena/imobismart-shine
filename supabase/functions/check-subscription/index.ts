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
  console.log(`[CHECK-SUBSCRIPTION] ${step}${d}`);
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
    if (!user?.email) throw new Error("User not authenticated");

    // Get subscription from DB
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const asaasSubId = subscription?.asaas_subscription_id;

    if (!asaasSubId) {
      logStep("No Asaas subscription found");
      return new Response(
        JSON.stringify({ subscribed: false, plan: "free" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const ASAAS_API_KEY = Deno.env.get("ASAAS_API_KEY");
    if (!ASAAS_API_KEY) throw new Error("ASAAS_API_KEY not configured");

    const headers = {
      "Content-Type": "application/json",
      access_token: ASAAS_API_KEY,
    };

    // Check subscription status in Asaas
    const subRes = await fetch(`${ASAAS_API_URL}/subscriptions/${asaasSubId}`, { headers });
    const subData = await subRes.json();

    logStep("Asaas subscription status", { status: subData.status, id: subData.id });

    if (subData.status === "ACTIVE") {
      // Parse plan from externalReference
      let plan = subscription?.plan || "free";
      if (subData.externalReference) {
        try {
          const ref = JSON.parse(subData.externalReference);
          if (ref.plan_id) plan = ref.plan_id;
        } catch {
          // ignore
        }
      }

      // Sync DB
      await supabase
        .from("subscriptions")
        .update({
          plan,
          status: "active",
          asaas_subscription_id: asaasSubId,
        })
        .eq("user_id", user.id);

      return new Response(
        JSON.stringify({ subscribed: true, plan }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    if (subData.status === "INACTIVE" || subData.status === "EXPIRED") {
      // Subscription no longer active
      await supabase
        .from("subscriptions")
        .update({
          plan: "free",
          status: "cancelled",
          asaas_subscription_id: null,
        })
        .eq("user_id", user.id);

      return new Response(
        JSON.stringify({ subscribed: false, plan: "free" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Default: return current DB state
    return new Response(
      JSON.stringify({
        subscribed: subscription?.status === "active",
        plan: subscription?.plan || "free",
      }),
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
