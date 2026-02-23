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

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing environment variables");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Invalid or expired token");
    }

    // 1. Update subscription to free plan
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        plan: "free",
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating subscription:", updateError);
      throw updateError;
    }

    // 2. Get active (non-archived) properties ordered by created_at DESC
    const { data: activeProperties, error: propertiesError } = await supabase
      .from("properties")
      .select("id")
      .eq("user_id", user.id)
      .or("is_archived.is.null,is_archived.eq.false")
      .order("created_at", { ascending: false });

    if (propertiesError) {
      console.error("Error fetching properties:", propertiesError);
      throw propertiesError;
    }

    let archivedCount = 0;
    const keptCount = Math.min(activeProperties?.length || 0, FREE_PLAN_LIMIT);

    // 3. Archive properties beyond the limit (keep the most recent ones)
    if (activeProperties && activeProperties.length > FREE_PLAN_LIMIT) {
      const propertiesToArchive = activeProperties.slice(FREE_PLAN_LIMIT);
      const idsToArchive = propertiesToArchive.map(p => p.id);

      const { error: archiveError } = await supabase
        .from("properties")
        .update({ is_archived: true, updated_at: new Date().toISOString() })
        .in("id", idsToArchive);

      if (archiveError) {
        console.error("Error archiving properties:", archiveError);
        throw archiveError;
      }

      archivedCount = idsToArchive.length;
    }

    console.log(`Downgrade to free for user ${user.id}: archived=${archivedCount}, kept=${keptCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        archived_count: archivedCount,
        kept_count: keptCount,
        message: archivedCount > 0
          ? `Downgrade realizado. ${archivedCount} ${archivedCount === 1 ? 'imóvel foi arquivado' : 'imóveis foram arquivados'}.`
          : "Downgrade realizado com sucesso.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Downgrade error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

