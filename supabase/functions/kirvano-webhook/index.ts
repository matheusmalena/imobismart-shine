import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const KIRVANO_WEBHOOK_SECRET = Deno.env.get("KIRVANO_WEBHOOK_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing environment variables");
    }

    // Validate webhook secret
    if (KIRVANO_WEBHOOK_SECRET) {
      const webhookSecret =
        req.headers.get("x-webhook-secret") ||
        req.headers.get("authorization");
      if (
        webhookSecret !== KIRVANO_WEBHOOK_SECRET &&
        webhookSecret !== `Bearer ${KIRVANO_WEBHOOK_SECRET}`
      ) {
        console.error("Invalid webhook secret");
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json();
    console.log("Kirvano webhook received:", JSON.stringify(body));

    const event = body.event || body.type;
    const buyerEmail =
      body.buyer?.email || body.customer?.email || body.email;
    const productName = body.product?.name || body.offer?.name || "";
    const productId = body.product?.id || body.offer?.id || "";
    const subscriptionId =
      body.subscription?.id || body.transaction?.id || "";

    if (!buyerEmail) {
      console.error("No buyer email found in webhook payload");
      return new Response(
        JSON.stringify({ received: true, warning: "no_email" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Find user by email
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", buyerEmail)
      .single();

    if (!profile) {
      console.error("User not found for email:", buyerEmail);
      return new Response(
        JSON.stringify({ received: true, warning: "user_not_found" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const userId = profile.user_id;
    const nameLower = productName.toLowerCase();

    // Determine if this is a plan or an add-on
    const isAddon =
      nameLower.includes("pacote") ||
      nameLower.includes("+10") ||
      nameLower.includes("+25") ||
      nameLower.includes("+50");

    // Activation events
    const isActivation =
      event === "purchase_approved" ||
      event === "PURCHASE_APPROVED" ||
      event === "subscription_active" ||
      event === "SUBSCRIPTION_ACTIVE" ||
      event === "payment_approved" ||
      event === "PAYMENT_APPROVED" ||
      event === "payment_confirmed" ||
      event === "PAYMENT_CONFIRMED";

    // Cancellation events
    const isCancellation =
      event === "subscription_cancelled" ||
      event === "SUBSCRIPTION_CANCELLED" ||
      event === "purchase_refunded" ||
      event === "PURCHASE_REFUNDED" ||
      event === "purchase_chargeback" ||
      event === "PURCHASE_CHARGEBACK" ||
      event === "refund" ||
      event === "REFUND" ||
      event === "chargeback" ||
      event === "CHARGEBACK";

    if (isAddon) {
      // Determine addon properties count
      let addonProperties = 0;
      if (nameLower.includes("+50") || nameLower.includes("50")) {
        addonProperties = 50;
      } else if (nameLower.includes("+25") || nameLower.includes("25")) {
        addonProperties = 25;
      } else if (nameLower.includes("+10") || nameLower.includes("10")) {
        addonProperties = 10;
      }

      if (addonProperties === 0) {
        console.error("Could not determine addon size from product name:", productName);
        return new Response(
          JSON.stringify({ received: true, warning: "unknown_addon_size" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      if (isActivation) {
        // Check if addon already exists for this subscription
        const { data: existingAddon } = await supabase
          .from("subscription_addons")
          .select("id")
          .eq("user_id", userId)
          .eq("kirvano_subscription_id", subscriptionId)
          .maybeSingle();

        if (existingAddon) {
          await supabase
            .from("subscription_addons")
            .update({ status: "active", updated_at: new Date().toISOString() })
            .eq("id", existingAddon.id);
        } else {
          await supabase.from("subscription_addons").insert({
            user_id: userId,
            addon_name: productName,
            addon_properties: addonProperties,
            addon_price: addonProperties === 10 ? 29 : addonProperties === 25 ? 59 : 99,
            kirvano_product_id: productId,
            kirvano_subscription_id: subscriptionId,
            status: "active",
          });
        }
        console.log(`Addon +${addonProperties} activated for user ${userId}`);
      }

      if (isCancellation) {
        // Cancel by subscription ID or by matching user + addon size
        if (subscriptionId) {
          await supabase
            .from("subscription_addons")
            .update({ status: "cancelled", updated_at: new Date().toISOString() })
            .eq("user_id", userId)
            .eq("kirvano_subscription_id", subscriptionId);
        } else {
          // Fallback: cancel most recent active addon of this size
          const { data: addons } = await supabase
            .from("subscription_addons")
            .select("id")
            .eq("user_id", userId)
            .eq("addon_properties", addonProperties)
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(1);

          if (addons && addons.length > 0) {
            await supabase
              .from("subscription_addons")
              .update({ status: "cancelled", updated_at: new Date().toISOString() })
              .eq("id", addons[0].id);
          }
        }
        console.log(`Addon +${addonProperties} cancelled for user ${userId}`);
      }
    } else {
      // It's a plan
      let plan = "free";
      if (nameLower.includes("enterprise")) {
        plan = "enterprise";
      } else if (nameLower.includes("plus")) {
        plan = "plus";
      } else if (nameLower.includes("pro")) {
        plan = "pro";
      } else if (nameLower.includes("starter")) {
        plan = "starter";
      }

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

      if (isActivation) {
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            plan,
            status: "active",
            kirvano_subscription_id: subscriptionId || null,
            kirvano_customer_id: body.customer?.id || null,
            payer_email: buyerEmail,
            payment_method: "kirvano",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (updateError) {
          console.error("Error updating subscription:", updateError);
          throw updateError;
        }
        console.log(`Subscription activated for user ${userId}: plan=${plan}`);
      }

      if (isCancellation) {
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            plan: "free",
            status: "cancelled",
            payment_method: "kirvano",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (updateError) {
          console.error("Error cancelling subscription:", updateError);
          throw updateError;
        }

        // Also cancel all addons for this user
        await supabase
          .from("subscription_addons")
          .update({ status: "cancelled", updated_at: new Date().toISOString() })
          .eq("user_id", userId)
          .eq("status", "active");

        console.log(`Subscription cancelled for user ${userId}, all addons cancelled`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
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
