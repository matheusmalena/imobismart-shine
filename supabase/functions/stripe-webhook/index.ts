import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: unknown) => {
  const d = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${d}`);
};

// Map Stripe price IDs to plan IDs
const PRICE_TO_PLAN: Record<string, string> = {
  "price_1T40TyA9DGgSi5xOCh6NSsSg": "starter",
  "price_1T40URA9DGgSi5xOk5tRe07L": "pro",
  "price_1T40UhA9DGgSi5xOJP6h262D": "plus",
};

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // Fallback for testing
      event = JSON.parse(body);
    }

    logStep("Event received", { type: event.type, id: event.id });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const planId = session.metadata?.plan_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!userId || !planId) {
          logStep("Missing metadata", { userId, planId });
          break;
        }

        logStep("Activating subscription", { userId, planId, customerId });

        const { error } = await supabase
          .from("subscriptions")
          .update({
            plan: planId,
            status: "active",
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            started_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (error) {
          logStep("Error updating subscription", { error: error.message });
        } else {
          logStep("Subscription activated successfully");
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        logStep("Invoice paid", { customerId, amount: invoice.amount_paid });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        logStep("Payment failed", { customerId });

        // Find user by stripe_customer_id and mark as inactive
        const { error } = await supabase
          .from("subscriptions")
          .update({ status: "inactive" })
          .eq("stripe_customer_id", customerId);

        if (error) logStep("Error marking inactive", { error: error.message });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        logStep("Subscription cancelled", { customerId });

        const { error } = await supabase
          .from("subscriptions")
          .update({ plan: "free", status: "cancelled", stripe_subscription_id: null })
          .eq("stripe_customer_id", customerId);

        if (error) logStep("Error downgrading", { error: error.message });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price?.id;
        const newPlan = priceId ? PRICE_TO_PLAN[priceId] : null;

        if (newPlan) {
          logStep("Subscription updated", { customerId, newPlan });
          const { error } = await supabase
            .from("subscriptions")
            .update({
              plan: newPlan,
              status: subscription.status === "active" ? "active" : "inactive",
            })
            .eq("stripe_customer_id", customerId);

          if (error) logStep("Error updating plan", { error: error.message });
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
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
