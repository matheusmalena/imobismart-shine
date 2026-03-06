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
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

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

    // Fetch current subscription to determine expires_at
    const { data: currentSub } = await supabase
      .from("subscriptions")
      .select("plan, status, started_at, expires_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!currentSub || currentSub.plan === "free") {
      throw new Error("Nenhuma assinatura ativa para cancelar");
    }

    // Calculate expires_at: use existing expires_at if in the future, otherwise 30 days from now
    let expiresAt = currentSub.expires_at ? new Date(currentSub.expires_at) : null;
    const now = new Date();

    if (!expiresAt || expiresAt <= now) {
      // Calculate next billing cycle: 30 days from started_at or from now
      const startedAt = new Date(currentSub.started_at);
      const daysSinceStart = Math.floor((now.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24));
      const currentCycle = Math.floor(daysSinceStart / 30);
      expiresAt = new Date(startedAt.getTime() + (currentCycle + 1) * 30 * 24 * 60 * 60 * 1000);

      // If calculated date is in the past, use 30 days from now
      if (expiresAt <= now) {
        expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      }
    }

    // Set status to cancelled but KEEP the current plan and set expires_at
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        status: "cancelled",
        expires_at: expiresAt.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      throw updateError;
    }

    console.log(`Subscription cancelled for user ${user.id}, plan ${currentSub.plan} active until ${expiresAt.toISOString()}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Assinatura cancelada. Você terá acesso ao plano ${currentSub.plan} até ${expiresAt.toLocaleDateString('pt-BR')}.`,
        expires_at: expiresAt.toISOString(),
        plan: currentSub.plan,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
