import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    // 1. Get current subscription from DB
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subError) throw new Error(`Subscription fetch error: ${subError.message}`);

    const stripeSubId = subscription?.stripe_subscription_id;

    if (!stripeSubId) {
      // No active Stripe subscription — tell frontend to use checkout instead
      return new Response(
        JSON.stringify({ action: "checkout_required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // 2. Handle downgrade to FREE — cancel the Stripe subscription
    if (planId === "free") {
      logStep("Cancelling subscription for free downgrade", { stripeSubId });

      await stripe.subscriptions.cancel(stripeSubId);

      // DB will be updated by the webhook (customer.subscription.deleted)
      // But we also update immediately for instant UI feedback
      await supabase
        .from("subscriptions")
        .update({ plan: "free", status: "cancelled", stripe_subscription_id: null })
        .eq("user_id", user.id);

      return new Response(
        JSON.stringify({ success: true, action: "cancelled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // 3. Handle upgrade/downgrade between paid plans
    // Get the new plan's stripe_price_id
    const { data: newPlan, error: planError } = await supabase
      .from("plans")
      .select("stripe_price_id, name")
      .eq("id", planId)
      .single();

    if (planError || !newPlan?.stripe_price_id) {
      throw new Error("Plan not found or no Stripe price configured");
    }

    logStep("Updating subscription", { stripeSubId, newPriceId: newPlan.stripe_price_id });

    // Get current subscription items from Stripe
    const currentSub = await stripe.subscriptions.retrieve(stripeSubId);
    const currentItemId = currentSub.items.data[0]?.id;

    if (!currentItemId) {
      throw new Error("No subscription item found in current subscription");
    }

    // Update the subscription with the new price
    const updatedSub = await stripe.subscriptions.update(stripeSubId, {
      items: [
        {
          id: currentItemId,
          price: newPlan.stripe_price_id,
        },
      ],
      proration_behavior: "create_prorations",
    });

    logStep("Subscription updated", { newStatus: updatedSub.status });

    // Update DB immediately for instant UI feedback
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
