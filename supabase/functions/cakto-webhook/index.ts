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
    console.log("Event:", body.event || body.type || "NO_EVENT");

    // Validate webhook secret
    if (CAKTO_WEBHOOK_SECRET) {
      if (body.secret !== CAKTO_WEBHOOK_SECRET) {
        console.error("❌ SECRET MISMATCH");
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }
      console.log("✅ Secret validated");
    }

    const data = body.data || {};
    const event = body.event || body.type;
    const buyerEmail = data.customer?.email || data.buyer?.email || data.customerEmail || body.email;
    const productName = data.product?.name || data.offer?.name || "";
    const productId = data.product?.id || data.offer?.id || "";

    console.log("Parsed:", JSON.stringify({ event, buyerEmail, productName, productId }));

    if (!buyerEmail) {
      console.error("❌ No buyer email found");
      return new Response(JSON.stringify({ received: true, warning: "no_email" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Find user by email — try profiles first, then fallback to src_email from checkoutUrl
    let userId: string | null = null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", buyerEmail)
      .single();

    if (profile) {
      userId = profile.user_id;
      console.log(`✅ User found by buyer email: ${userId}`);
    }

    // Fallback: extract src_email from checkoutUrl in the payload
    if (!userId && data.checkoutUrl) {
      try {
        const url = new URL(data.checkoutUrl);
        const srcEmail = url.searchParams.get("src_email");
        if (srcEmail) {
          console.log(`Trying fallback src_email: ${srcEmail}`);
          const { data: fallbackProfile } = await supabase
            .from("profiles")
            .select("user_id")
            .eq("email", srcEmail)
            .single();
          if (fallbackProfile) {
            userId = fallbackProfile.user_id;
            console.log(`✅ User found by src_email: ${userId}`);
          }
        }
      } catch (e) {
        console.warn("Could not parse checkoutUrl:", e);
      }
    }

    // Fallback: search auth.users by email
    if (!userId) {
      const { data: authData } = await supabase.auth.admin.listUsers();
      const authUser = authData?.users?.find(u => u.email === buyerEmail);
      if (authUser) {
        userId = authUser.id;
        console.log(`✅ User found in auth.users: ${userId}`);
      }
    }

    if (!userId) {
      console.error(`❌ User not found for email: ${buyerEmail}`);
      return new Response(JSON.stringify({ received: true, warning: "user_not_found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Determine plan from product name
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

    console.log(`Plan: "${productName}" → ${plan}`);

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
        console.log("✅ Plan overridden via enterprise_checkout_links → enterprise");
      }
    }

    // Payment info
    let paymentStatus = "approved";
    const amount = data.amount || data.price || body.amount || 0;
    const transactionId = data.id || data.transaction?.id || productId;
    const actualPaymentMethod = data.paymentMethod || data.subscription?.paymentMethod || "cakto";

    // Handle events
    if (event === "purchase_approved" || event === "PURCHASE_APPROVED" || 
        event === "subscription_active" || event === "SUBSCRIPTION_ACTIVE" ||
        event === "payment_approved" || event === "PAYMENT_APPROVED") {
      
      paymentStatus = "approved";

      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          plan,
          status: "active",
          started_at: new Date().toISOString(),
          expires_at: null,
          external_subscription_id: transactionId,
          payer_email: buyerEmail,
          payment_method: actualPaymentMethod,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error("❌ Error updating subscription:", JSON.stringify(updateError));
        throw updateError;
      }

      console.log(`✅ Subscription activated: user=${userId}, plan=${plan}`);
    } else if (event === "subscription_cancelled" || event === "SUBSCRIPTION_CANCELLED" ||
        event === "purchase_refunded" || event === "PURCHASE_REFUNDED" ||
        event === "purchase_chargeback" || event === "PURCHASE_CHARGEBACK") {
      
      paymentStatus = event.toLowerCase().includes("refund") ? "refunded" 
        : event.toLowerCase().includes("chargeback") ? "chargeback" 
        : "cancelled";

      let expiresAt: string;
      const nextPaymentDate = data.subscription?.next_payment_date;
      if (nextPaymentDate) {
        expiresAt = new Date(nextPaymentDate).toISOString();
      } else {
        expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      }

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
      console.warn(`⚠️ Unhandled event: "${event}"`);
    }

    // Insert payment history
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
    }

    console.log("=== CAKTO WEBHOOK END (success) ===");

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("=== CAKTO WEBHOOK END (error) ===", errorMessage);
    return new Response(
      JSON.stringify({ received: true, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});
