import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!MERCADOPAGO_ACCESS_TOKEN) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");
    }

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    // Verify user token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Invalid or expired token");
    }

    const { planId, backUrl } = await req.json();

    if (!planId || !["pro", "plus"].includes(planId)) {
      throw new Error("Invalid plan. Only 'pro' and 'plus' are available for subscription.");
    }

    // Get plan details from database
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      throw new Error("Plan not found");
    }

    const appUrl = backUrl || "https://imobismart-shine.lovable.app";

    // Create Mercado Pago preapproval (subscription)
    const mpResponse = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        reason: `ImobiSmart - Plano ${plan.name}`,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: Number(plan.price),
          currency_id: "BRL",
        },
        back_url: `${appUrl}/plans?status=success&plan=${planId}`,
        payer_email: user.email,
        external_reference: `${user.id}:${planId}`,
        status: "pending",
      }),
    });

    if (!mpResponse.ok) {
      const errorData = await mpResponse.text();
      console.error("Mercado Pago error:", errorData);
      throw new Error(`Failed to create subscription: ${mpResponse.status}`);
    }

    const subscription = await mpResponse.json();

    console.log("Subscription created:", subscription.id);
    console.log("Sandbox URL:", subscription.sandbox_init_point);
    console.log("Production URL:", subscription.init_point);

    // TODO: Mudar para init_point em produção
    // Usando sandbox_init_point para modo de teste
    const checkoutUrl = subscription.sandbox_init_point || subscription.init_point;

    return new Response(
      JSON.stringify({
        checkoutUrl,
        subscriptionId: subscription.id,
        mode: subscription.sandbox_init_point ? "sandbox" : "production",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
