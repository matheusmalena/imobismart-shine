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

    if (!MERCADOPAGO_ACCESS_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body));

    const { type, data } = body;

    // Handle subscription notifications
    if (type === "subscription_preapproval" && data?.id) {
      // Fetch subscription details from Mercado Pago
      const mpResponse = await fetch(`https://api.mercadopago.com/preapproval/${data.id}`, {
        headers: {
          "Authorization": `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        },
      });

      if (!mpResponse.ok) {
        console.error("Failed to fetch subscription details");
        throw new Error("Failed to fetch subscription details");
      }

      const subscription = await mpResponse.json();
      console.log("Subscription details:", JSON.stringify(subscription));

      // Parse external_reference: "userId:planId"
      const externalRef = subscription.external_reference;
      if (!externalRef || !externalRef.includes(":")) {
        console.error("Invalid external_reference:", externalRef);
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      const [userId, planId] = externalRef.split(":");

      // Map Mercado Pago status to our system
      const statusMap: Record<string, string> = {
        "authorized": "active",
        "pending": "trial",
        "paused": "inactive",
        "cancelled": "cancelled",
      };

      const newStatus = statusMap[subscription.status] || "trial";

      // Update user subscription
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          plan: planId,
          status: newStatus,
          mp_subscription_id: subscription.id,
          mp_payer_email: subscription.payer_email,
          payment_method: "mercadopago",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error updating subscription:", updateError);
        throw updateError;
      }

      console.log(`Subscription updated for user ${userId}: plan=${planId}, status=${newStatus}`);
    }

    // Handle payment notifications
    if (type === "payment" && data?.id) {
      // Fetch payment details
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
        headers: {
          "Authorization": `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        },
      });

      if (mpResponse.ok) {
        const payment = await mpResponse.json();
        console.log("Payment received:", JSON.stringify({
          id: payment.id,
          status: payment.status,
          external_reference: payment.external_reference,
        }));

        // If payment is approved and has external_reference, ensure subscription is active
        if (payment.status === "approved" && payment.external_reference?.includes(":")) {
          const [userId, planId] = payment.external_reference.split(":");
          
          await supabase
            .from("subscriptions")
            .update({
              plan: planId,
              status: "active",
              payment_method: "mercadopago",
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);

          console.log(`Payment approved - subscription activated for user ${userId}`);
        }
      }
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
    // Always return 200 to Mercado Pago to acknowledge receipt
    return new Response(
      JSON.stringify({ received: true, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  }
});
