import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FREE_PLAN_LIMIT = 2;

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

    // Update local subscription status to cancelled/free
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        status: "cancelled",
        plan: "free",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      throw updateError;
    }

    // Cancel all active addons
    await supabase
      .from("subscription_addons")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("status", "active");

    // Archive excess properties (keep only 2 most recent)
    const { data: activeProperties } = await supabase
      .from("properties")
      .select("id")
      .eq("user_id", user.id)
      .or("is_archived.is.null,is_archived.eq.false")
      .order("created_at", { ascending: false });

    let archivedCount = 0;
    if (activeProperties && activeProperties.length > FREE_PLAN_LIMIT) {
      const idsToArchive = activeProperties.slice(FREE_PLAN_LIMIT).map(p => p.id);
      await supabase
        .from("properties")
        .update({ is_archived: true, updated_at: new Date().toISOString() })
        .in("id", idsToArchive);
      archivedCount = idsToArchive.length;
    }

    console.log(`Subscription cancelled for user ${user.id}, archived ${archivedCount} properties`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Assinatura cancelada com sucesso. Cancele também no painel da Kirvano.",
        archived_count: archivedCount,
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
