import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !STRIPE_SECRET_KEY) {
      throw new Error("Missing environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // 1. Get all plans with their limits and metered price IDs
    const { data: plans, error: plansError } = await supabase
      .from("plans")
      .select("id, property_limit, stripe_metered_price_id")
      .not("stripe_metered_price_id", "is", null);

    if (plansError) throw plansError;

    const planLimits: Record<string, { limit: number; meteredPriceId: string }> = {};
    for (const plan of plans || []) {
      if (plan.stripe_metered_price_id) {
        planLimits[plan.id] = {
          limit: plan.property_limit,
          meteredPriceId: plan.stripe_metered_price_id,
        };
      }
    }

    if (Object.keys(planLimits).length === 0) {
      return new Response(
        JSON.stringify({ message: "No plans with metered pricing configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // 2. Get all active subscriptions with stripe_subscription_id
    const { data: subscriptions, error: subsError } = await supabase
      .from("subscriptions")
      .select("user_id, plan, stripe_subscription_id")
      .eq("status", "active")
      .not("stripe_subscription_id", "is", null);

    if (subsError) throw subsError;

    const results: Array<{ userId: string; plan: string; active: number; limit: number; excess: number; reported: boolean }> = [];

    for (const sub of subscriptions || []) {
      const planConfig = planLimits[sub.plan];
      if (!planConfig) continue; // Plan has no metered pricing

      // 3. Count active (non-archived) properties for this user
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

      const result = {
        userId: sub.user_id,
        plan: sub.plan,
        active: activeCount,
        limit: planConfig.limit,
        excess,
        reported: false,
      };

      // 4. Report usage to Stripe if there are excess properties
      if (excess > 0 && sub.stripe_subscription_id) {
        try {
          // Find the metered subscription item
          const subscription = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
          const meteredItem = subscription.items.data.find(
            (item: any) => item.price.id === planConfig.meteredPriceId
          );

          if (meteredItem) {
            await stripe.subscriptionItems.createUsageRecord(meteredItem.id, {
              quantity: excess,
              action: "set",
            });
            result.reported = true;
            console.log(`Reported ${excess} excess properties for user ${sub.user_id}`);
          } else {
            console.warn(`No metered item found for user ${sub.user_id}, subscription ${sub.stripe_subscription_id}`);
          }
        } catch (stripeError) {
          console.error(`Stripe error for user ${sub.user_id}:`, stripeError);
        }
      }

      // If no excess, report 0 to reset usage
      if (excess === 0 && sub.stripe_subscription_id) {
        try {
          const subscription = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
          const meteredItem = subscription.items.data.find(
            (item: any) => item.price.id === planConfig.meteredPriceId
          );

          if (meteredItem) {
            await stripe.subscriptionItems.createUsageRecord(meteredItem.id, {
              quantity: 0,
              action: "set",
            });
            result.reported = true;
          }
        } catch (stripeError) {
          console.error(`Stripe reset error for user ${sub.user_id}:`, stripeError);
        }
      }

      results.push(result);
    }

    // 5. Update extra_properties_count and extra_properties_amount in subscriptions
    for (const r of results) {
      const planConfig = planLimits[r.plan];
      if (!planConfig) continue;

      await supabase
        .from("subscriptions")
        .update({
          extra_properties_count: r.excess,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", r.userId);
    }

    console.log(`Usage report completed. Processed ${results.length} subscriptions.`);

    return new Response(
      JSON.stringify({
        processed: results.length,
        reported: results.filter((r) => r.reported).length,
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
