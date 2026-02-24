import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Detect if product is an add-on package and return the number of properties.
 * Matches patterns like "pacote +10", "+10 imóveis", "+10", etc.
 */
function detectAddon(productName: string): { isAddon: boolean; properties: number; name: string } {
  const lower = productName.toLowerCase();
  
  if (lower.includes("+50") || lower.includes("pacote 50")) {
    return { isAddon: true, properties: 50, name: "Pacote +50 Imóveis" };
  }
  if (lower.includes("+25") || lower.includes("pacote 25")) {
    return { isAddon: true, properties: 25, name: "Pacote +25 Imóveis" };
  }
  if (lower.includes("+10") || lower.includes("pacote 10")) {
    return { isAddon: true, properties: 10, name: "Pacote +10 Imóveis" };
  }
  
  return { isAddon: false, properties: 0, name: "" };
}

/**
 * Detect base plan from product name.
 */
function detectPlan(productName: string): string {
  const lower = productName.toLowerCase();
  if (lower.includes("enterprise")) return "enterprise";
  if (lower.includes("plus")) return "plus";
  if (lower.includes("pro")) return "pro";
  if (lower.includes("starter")) return "starter";
  return "free";
}

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

    const event = body.event || body.type;
    const buyerEmail = body.buyer?.email || body.customer?.email || body.email;
    const productName = body.product?.name || body.offer?.name || "";
    const productId = body.product?.id || body.offer?.id || "";
    const transactionId = body.transaction?.id || body.subscription?.id || productId;

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

    // Detect if this is an add-on or a base plan
    const addon = detectAddon(productName);

    const isApprovalEvent = [
      "purchase_approved", "PURCHASE_APPROVED",
      "subscription_active", "SUBSCRIPTION_ACTIVE",
      "payment_approved", "PAYMENT_APPROVED",
    ].includes(event);

    const isCancelEvent = [
      "subscription_cancelled", "SUBSCRIPTION_CANCELLED",
      "purchase_refunded", "PURCHASE_REFUNDED",
      "purchase_chargeback", "PURCHASE_CHARGEBACK",
    ].includes(event);

    // ── ADD-ON FLOW ──
    if (addon.isAddon) {
      if (isApprovalEvent) {
        const { error } = await supabase
          .from("subscription_addons")
          .insert({
            user_id: userId,
            addon_name: addon.name,
            addon_properties: addon.properties,
            addon_price: addon.properties === 10 ? 29 : addon.properties === 25 ? 59 : 99,
            status: "active",
            kirvano_product_id: productId,
            kirvano_subscription_id: transactionId,
          });

        if (error) {
          console.error("Error inserting addon:", error);
          throw error;
        }
        console.log(`Add-on activated for user ${userId}: ${addon.name} (+${addon.properties})`);
      }

      if (isCancelEvent) {
        // Cancel matching active addon by product/subscription ID
        const { error } = await supabase
          .from("subscription_addons")
          .update({ status: "cancelled", updated_at: new Date().toISOString() })
          .eq("user_id", userId)
          .eq("status", "active")
          .or(`kirvano_product_id.eq.${productId},kirvano_subscription_id.eq.${transactionId}`);

        if (error) {
          console.error("Error cancelling addon:", error);
          throw error;
        }
        console.log(`Add-on cancelled for user ${userId}: ${addon.name}`);
      }

      return new Response(JSON.stringify({ received: true, type: "addon" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // ── BASE PLAN FLOW (existing logic) ──
    let plan = detectPlan(productName);

    // Fallback: check enterprise_checkout_links
    if (plan === "free" && buyerEmail) {
      const { data: enterpriseLink } = await supabase
        .from("enterprise_checkout_links")
        .select("id")
        .eq("client_email", buyerEmail)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (enterpriseLink) {
        plan = "enterprise";
        console.log(`Plan determined via enterprise_checkout_links for email: ${buyerEmail}`);
      }
    }

    if (isApprovalEvent) {
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          plan,
          status: "active",
          external_subscription_id: transactionId,
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

    if (isCancelEvent) {
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          plan: "free",
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
      JSON.stringify({ received: true, type: "plan" }),
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
