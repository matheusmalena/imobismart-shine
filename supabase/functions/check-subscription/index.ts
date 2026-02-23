import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const d = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${d}`);
};

// Map Stripe price IDs to plan IDs
const PRICE_TO_PLAN: Record<string, string> = {
  "price_1T40TyA9DGgSi5xOCh6NSsSg": "starter",
  "price_1T40URA9DGgSi5xOk5tRe07L": "pro",
  "price_1T40UhA9DGgSi5xOJP6h262D": "plus",
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

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ subscribed: false, plan: "free" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      logStep("No active subscription");

      // Sync DB
      await supabase
        .from("subscriptions")
        .update({ plan: "free", status: "cancelled", stripe_customer_id: customerId })
        .eq("user_id", user.id);

      return new Response(JSON.stringify({ subscribed: false, plan: "free" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const sub = subscriptions.data[0];
    const priceId = sub.items.data[0]?.price?.id;
    const plan = priceId ? PRICE_TO_PLAN[priceId] || "free" : "free";
    const subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();

    logStep("Active subscription found", { plan, customerId });

    // Sync DB
    await supabase
      .from("subscriptions")
      .update({
        plan,
        status: "active",
        stripe_customer_id: customerId,
        stripe_subscription_id: sub.id,
        expires_at: subscriptionEnd,
      })
      .eq("user_id", user.id);

    return new Response(
      JSON.stringify({ subscribed: true, plan, subscription_end: subscriptionEnd }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    logStep("ERROR", { message: (error as Error).message });
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
