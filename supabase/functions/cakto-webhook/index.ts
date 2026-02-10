import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CAKTO_WEBHOOK_SECRET = Deno.env.get("CAKTO_WEBHOOK_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing environment variables");
    }

    // Validate webhook secret if configured
    if (CAKTO_WEBHOOK_SECRET) {
      const webhookSecret = req.headers.get("x-webhook-secret") || req.headers.get("authorization");
      if (webhookSecret !== CAKTO_WEBHOOK_SECRET && webhookSecret !== `Bearer ${CAKTO_WEBHOOK_SECRET}`) {
        console.error("Invalid webhook secret");
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json();
    console.log("Cakto webhook received:", JSON.stringify(body));

    // Cakto sends events like purchase_approved, subscription_cancelled, etc.
    const event = body.event || body.type;
    const buyerEmail = body.buyer?.email || body.customer?.email || body.email;
    const productName = body.product?.name || body.offer?.name || "";
    const productId = body.product?.id || body.offer?.id || "";

    if (!buyerEmail) {
      console.error("No buyer email found in webhook payload");
      return new Response(JSON.stringify({ received: true, warning: "no_email" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Find user by email in profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", buyerEmail)
      .single();

    if (!profile) {
      console.error("User not found for email:", buyerEmail);
      return new Response(JSON.stringify({ received: true, warning: "user_not_found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const userId = profile.user_id;

    // Determine plan from product name/id
    let plan = "starter";
    const nameLower = productName.toLowerCase();
    if (nameLower.includes("enterprise")) {
      plan = "enterprise";
    } else if (nameLower.includes("plus")) {
      plan = "plus";
    } else if (nameLower.includes("pro")) {
      plan = "pro";
    }

    // Handle different event types
    if (event === "purchase_approved" || event === "PURCHASE_APPROVED" || 
        event === "subscription_active" || event === "SUBSCRIPTION_ACTIVE" ||
        event === "payment_approved" || event === "PAYMENT_APPROVED") {
      
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          plan,
          status: "active",
          external_subscription_id: body.transaction?.id || body.subscription?.id || productId,
          payer_email: buyerEmail,
          payment_method: "cakto",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error updating subscription:", updateError);
        throw updateError;
      }

      console.log(`Subscription activated for user ${userId}: plan=${plan}`);
    }

    if (event === "subscription_cancelled" || event === "SUBSCRIPTION_CANCELLED" ||
        event === "purchase_refunded" || event === "PURCHASE_REFUNDED" ||
        event === "purchase_chargeback" || event === "PURCHASE_CHARGEBACK") {
      
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          plan: "starter",
          status: "cancelled",
          payment_method: "cakto",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error cancelling subscription:", updateError);
        throw updateError;
      }

      console.log(`Subscription cancelled for user ${userId}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook error:", errorMessage);
    return new Response(
      JSON.stringify({ received: true, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  }
});
