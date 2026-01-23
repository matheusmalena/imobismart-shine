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
    const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!MERCADOPAGO_ACCESS_TOKEN) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Invalid or expired token");
    }

    // Get user's subscription to find MP subscription ID
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("mp_subscription_id, mp_payer_email")
      .eq("user_id", user.id)
      .single();

    const payments: any[] = [];

    // If user has a MP subscription, fetch its payments
    if (subscription?.mp_subscription_id) {
      // Fetch payments by preapproval_id
      const paymentsResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/search?preapproval_id=${subscription.mp_subscription_id}&sort=date_created&criteria=desc&limit=10`,
        {
          headers: {
            "Authorization": `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          },
        }
      );

      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        if (paymentsData.results) {
          payments.push(...paymentsData.results);
        }
      }
    }

    // Also search by payer email if no subscription payments found
    if (payments.length === 0 && (subscription?.mp_payer_email || user.email)) {
      const email = subscription?.mp_payer_email || user.email;
      const emailPaymentsResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/search?payer.email=${encodeURIComponent(email)}&sort=date_created&criteria=desc&limit=10`,
        {
          headers: {
            "Authorization": `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          },
        }
      );

      if (emailPaymentsResponse.ok) {
        const emailPaymentsData = await emailPaymentsResponse.json();
        if (emailPaymentsData.results) {
          payments.push(...emailPaymentsData.results);
        }
      }
    }

    // Format payments for frontend
    const formattedPayments = payments.map((payment: any) => ({
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      amount: payment.transaction_amount,
      currency: payment.currency_id,
      description: payment.description || payment.reason,
      date: payment.date_created,
      payment_method: payment.payment_method_id,
      payment_type: payment.payment_type_id,
    }));

    return new Response(
      JSON.stringify({ payments: formattedPayments }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage, payments: [] }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Return 200 with empty payments to avoid breaking the UI
      }
    );
  }
});
