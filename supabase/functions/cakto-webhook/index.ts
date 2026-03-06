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

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json();
    
    console.log("=== CAKTO WEBHOOK START ===");
    console.log("Full payload:", JSON.stringify(body, null, 2));
    console.log("Event:", body.event || body.type || "NO_EVENT");
    console.log("Has body.data:", !!body.data);
    console.log("Has body.secret:", !!body.secret);

    // Validate webhook secret - Cakto sends it in the JSON body as body.secret
    if (CAKTO_WEBHOOK_SECRET) {
      const bodySecret = body.secret;
      console.log("Secret validation:", bodySecret ? "secret_present" : "secret_missing");
      if (bodySecret !== CAKTO_WEBHOOK_SECRET) {
        console.error("❌ SECRET MISMATCH - webhook rejected");
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }
      console.log("✅ Secret validated");
    } else {
      console.warn("⚠️ CAKTO_WEBHOOK_SECRET not configured - skipping validation");
    }

    // Cakto nests data under body.data
    const data = body.data || {};
    const event = body.event || body.type;
    const buyerEmail = data.customer?.email || data.buyer?.email || body.email;
    const productName = data.product?.name || data.offer?.name || "";
    const productId = data.product?.id || data.offer?.id || "";

    console.log("Parsed fields:", JSON.stringify({ event, buyerEmail, productName, productId, dataKeys: Object.keys(data) }));

    if (!buyerEmail) {
      console.error("❌ No buyer email found. data.customer:", JSON.stringify(data.customer), "data.buyer:", JSON.stringify(data.buyer));
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
      console.error(`❌ User not found for email: ${buyerEmail}`);
      return new Response(JSON.stringify({ received: true, warning: "user_not_found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const userId = profile.user_id;
    console.log(`✅ User found: ${userId} (email: ${buyerEmail})`);

    // Determine plan from product name/id
    let plan = "free";
    const nameLower = productName.toLowerCase();
    if (nameLower.includes("enterprise")) {
      plan = "enterprise";
    } else if (nameLower.includes("plus")) {
      plan = "plus";
    } else if (nameLower.includes("pro")) {
      plan = "pro";
    } else if (nameLower.includes("starter") || nameLower.includes("-s")) {
      plan = "starter";
    }

    console.log(`Plan resolution: productName="${productName}" → plan="${plan}"`);

    // Fallback: if no plan matched by name, check enterprise_checkout_links by buyer email
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
        console.log(`✅ Plan overridden via enterprise_checkout_links → enterprise`);
      } else {
        console.log("⚠️ No enterprise link found, plan stays:", plan);
      }
    }

    // Payment info
    let paymentStatus = "approved";
    const amount = data.amount || data.price || body.amount || 0;
    const transactionId = data.id || data.transaction?.id || productId;
    // Capture actual payment method from Cakto payload (e.g. "pix", "credit_card", "boleto")
    const actualPaymentMethod = data.paymentMethod || data.subscription?.paymentMethod || "cakto";

    console.log(`Payment info: amount=${amount}, transactionId=${transactionId}, event=${event}`);

    // Handle different event types
    if (event === "purchase_approved" || event === "PURCHASE_APPROVED" || 
        event === "subscription_active" || event === "SUBSCRIPTION_ACTIVE" ||
        event === "payment_approved" || event === "PAYMENT_APPROVED") {
      
      paymentStatus = "approved";

      const updatePayload = {
        plan,
        status: "active",
        started_at: new Date().toISOString(),
        expires_at: null,
        external_subscription_id: transactionId,
        payer_email: buyerEmail,
        payment_method: actualPaymentMethod,
        updated_at: new Date().toISOString(),
      };
      console.log(`Activating subscription for user ${userId}:`, JSON.stringify(updatePayload));

      const { error: updateError, count } = await supabase
        .from("subscriptions")
        .update(updatePayload)
        .eq("user_id", userId);

      if (updateError) {
        console.error("❌ Error updating subscription:", JSON.stringify(updateError));
        throw updateError;
      }

      console.log(`✅ Subscription activated: user=${userId}, plan=${plan}, rows_affected=${count}`);
    } else if (event === "subscription_cancelled" || event === "SUBSCRIPTION_CANCELLED" ||
        event === "purchase_refunded" || event === "PURCHASE_REFUNDED" ||
        event === "purchase_chargeback" || event === "PURCHASE_CHARGEBACK") {
      
      paymentStatus = event.toLowerCase().includes("refund") ? "refunded" 
        : event.toLowerCase().includes("chargeback") ? "chargeback" 
        : "cancelled";

      console.log(`Cancelling subscription for user ${userId}: paymentStatus=${paymentStatus}`);

      // Calculate expires_at from Cakto's next_payment_date or 30 days from now
      let expiresAt: string;
      const nextPaymentDate = data.subscription?.next_payment_date;
      if (nextPaymentDate) {
        expiresAt = new Date(nextPaymentDate).toISOString();
        console.log(`Using Cakto next_payment_date for expires_at: ${expiresAt}`);
      } else {
        expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        console.log(`No next_payment_date, using 30 days from now: ${expiresAt}`);
      }

      // Keep the current plan — user retains access until expires_at
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          status: "cancelled",
          expires_at: expiresAt,
          payment_method: actualPaymentMethod,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error("❌ Error cancelling subscription:", JSON.stringify(updateError));
        throw updateError;
      }

      console.log(`✅ Subscription cancelled for user ${userId}`);
    } else {
      console.warn(`⚠️ Unhandled event type: "${event}" — logging only, no subscription change`);
    }

    // Insert payment history record
    const { error: historyError } = await supabase
      .from("payment_history")
      .insert({
        user_id: userId,
        event: event || "unknown",
        plan,
        status: paymentStatus,
        amount,
        transaction_id: transactionId,
        payer_email: buyerEmail,
        raw_payload: body,
      });

    if (historyError) {
      console.error("❌ Error inserting payment history:", JSON.stringify(historyError));
    } else {
      console.log("✅ Payment history recorded");
    }

    console.log("=== CAKTO WEBHOOK END (success) ===");

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("=== CAKTO WEBHOOK END (error) ===", errorMessage);
    return new Response(
      JSON.stringify({ received: true, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  }
});
