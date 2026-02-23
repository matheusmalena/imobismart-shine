import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: unknown) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[ASAAS-WEBHOOK] ${step}${d}`);
};

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.json();
    logStep("Event received", { event: body.event, paymentId: body.payment?.id });

    const event = body.event;
    const payment = body.payment;

    if (!payment) {
      logStep("No payment data in webhook");
      return new Response(JSON.stringify({ received: true }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    const subscriptionId = payment.subscription;

    // Parse externalReference to get user_id and plan_id
    let userId: string | null = null;
    let planId: string | null = null;

    if (payment.externalReference) {
      try {
        const ref = JSON.parse(payment.externalReference);
        userId = ref.user_id;
        planId = ref.plan_id;
      } catch {
        logStep("Could not parse externalReference", { ref: payment.externalReference });
      }
    }

    // If no userId from externalReference, find by asaas_subscription_id
    if (!userId && subscriptionId) {
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("user_id, plan")
        .eq("asaas_subscription_id", subscriptionId)
        .maybeSingle();

      if (sub) {
        userId = sub.user_id;
        if (!planId) planId = sub.plan;
      }
    }

    // Also try finding by asaas_customer_id
    if (!userId && payment.customer) {
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("user_id, plan")
        .eq("asaas_customer_id", payment.customer)
        .maybeSingle();

      if (sub) {
        userId = sub.user_id;
        if (!planId) planId = sub.plan;
      }
    }

    if (!userId) {
      logStep("Could not find user for this payment");
      return new Response(JSON.stringify({ received: true, warning: "user not found" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    switch (event) {
      case "PAYMENT_CONFIRMED":
      case "PAYMENT_RECEIVED": {
        logStep("Payment confirmed, activating subscription", { userId, planId });

        const updateData: Record<string, unknown> = {
          status: "active",
          started_at: new Date().toISOString(),
        };

        if (planId) updateData.plan = planId;
        if (subscriptionId) updateData.asaas_subscription_id = subscriptionId;
        if (payment.customer) updateData.asaas_customer_id = payment.customer;

        // Calculate next due date (approximately 30 days)
        if (payment.dueDate) {
          const dueDate = new Date(payment.dueDate);
          dueDate.setMonth(dueDate.getMonth() + 1);
          updateData.expires_at = dueDate.toISOString();
        }

        const { error } = await supabase
          .from("subscriptions")
          .update(updateData)
          .eq("user_id", userId);

        if (error) logStep("Error updating subscription", { error: error.message });
        else logStep("Subscription activated");
        break;
      }

      case "PAYMENT_OVERDUE": {
        logStep("Payment overdue", { userId });
        const { error } = await supabase
          .from("subscriptions")
          .update({ status: "inactive" })
          .eq("user_id", userId);

        if (error) logStep("Error marking inactive", { error: error.message });
        break;
      }

      case "PAYMENT_DELETED":
      case "PAYMENT_REFUNDED": {
        logStep("Payment deleted/refunded", { userId });
        // Don't immediately downgrade — just log
        break;
      }

      default:
        logStep("Unhandled event", { event });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logStep("ERROR", { message: (error as Error).message });
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
