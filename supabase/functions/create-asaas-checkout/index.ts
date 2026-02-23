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
  console.log(`[CREATE-ASAAS-CHECKOUT] ${step}${d}`);
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

    const { planId, cpfCnpj } = await req.json();
    logStep("Plan requested", { planId, email: user.email });

    // Get plan details from DB
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("id, name, price")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      throw new Error("Plan not found");
    }

    const ASAAS_API_KEY = Deno.env.get("ASAAS_API_KEY");
    if (!ASAAS_API_KEY) throw new Error("ASAAS_API_KEY not configured");

    const headers = {
      "Content-Type": "application/json",
      access_token: ASAAS_API_KEY,
    };

    // Check if user already has an Asaas customer ID
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("asaas_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let asaasCustomerId = subscription?.asaas_customer_id;

    // Create or find customer in Asaas
    if (!asaasCustomerId) {
      // Try to find existing customer by email
      const searchRes = await fetch(`${ASAAS_API_URL}/customers?email=${encodeURIComponent(user.email)}`, { headers });
      const searchData = await searchRes.json();

      if (searchData.data && searchData.data.length > 0) {
        asaasCustomerId = searchData.data[0].id;
        logStep("Found existing Asaas customer", { asaasCustomerId });
      } else {
        // Create new customer - requires CPF/CNPJ
        if (!cpfCnpj || cpfCnpj === "existing") {
          throw new Error("CPF ou CNPJ é obrigatório para novos clientes");
        }
        const createRes = await fetch(`${ASAAS_API_URL}/customers`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            name: user.user_metadata?.full_name || user.email.split("@")[0],
            email: user.email,
            cpfCnpj: cpfCnpj.replace(/\D/g, ""),
            notificationDisabled: false,
          }),
        });

        const createData = await createRes.json();
        if (createData.errors) {
          throw new Error(`Asaas customer error: ${JSON.stringify(createData.errors)}`);
        }
        asaasCustomerId = createData.id;
        logStep("Created Asaas customer", { asaasCustomerId });
      }

      // Save customer ID
      await supabase
        .from("subscriptions")
        .update({ asaas_customer_id: asaasCustomerId })
        .eq("user_id", user.id);
    }

    // Create subscription in Asaas
    const today = new Date();
    const nextDueDate = today.toISOString().split("T")[0];

    const subRes = await fetch(`${ASAAS_API_URL}/subscriptions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        customer: asaasCustomerId,
        billingType: "UNDEFINED", // Allows PIX, Boleto, Card
        value: plan.price,
        cycle: "MONTHLY",
        nextDueDate,
        description: `ImobiSmart - Plano ${plan.name}`,
        externalReference: JSON.stringify({ user_id: user.id, plan_id: planId }),
      }),
    });

    const subData = await subRes.json();
    logStep("Asaas subscription response", subData);

    if (subData.errors) {
      throw new Error(`Asaas subscription error: ${JSON.stringify(subData.errors)}`);
    }

    // Save Asaas subscription ID
    await supabase
      .from("subscriptions")
      .update({
        asaas_subscription_id: subData.id,
        asaas_customer_id: asaasCustomerId,
      })
      .eq("user_id", user.id);

    // Get the payment link from the first payment
    const paymentsRes = await fetch(
      `${ASAAS_API_URL}/subscriptions/${subData.id}/payments?limit=1`,
      { headers }
    );
    const paymentsData = await paymentsRes.json();

    let checkoutUrl = "";
    if (paymentsData.data && paymentsData.data.length > 0) {
      const paymentId = paymentsData.data[0].id;
      checkoutUrl = `https://www.asaas.com/i/${paymentId}`;
    }

    logStep("Checkout URL generated", { checkoutUrl });

    return new Response(
      JSON.stringify({ url: checkoutUrl, subscriptionId: subData.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    logStep("ERROR", { message: (error as Error).message });
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
