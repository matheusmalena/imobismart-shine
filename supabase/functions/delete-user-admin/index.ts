import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Validate caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await callerClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const callerId = claimsData.claims.sub;

    // Use service role client for admin operations
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check caller is admin
    const { data: callerRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .single();

    if (callerRole?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), { status: 403, headers: corsHeaders });
    }

    const { userId } = await req.json();
    if (!userId) {
      return new Response(JSON.stringify({ error: "userId is required" }), { status: 400, headers: corsHeaders });
    }

    // Prevent self-deletion
    if (userId === callerId) {
      return new Response(JSON.stringify({ error: "Cannot delete yourself" }), { status: 400, headers: corsHeaders });
    }

    const deleted: Record<string, number> = {};

    // Helper to delete and count
    const del = async (table: string, column = "user_id") => {
      const { data, error } = await supabase.from(table).delete().eq(column, userId).select("id");
      if (error) console.error(`Error deleting from ${table}:`, error.message);
      deleted[table] = data?.length ?? 0;
    };

    // Delete in dependency order
    await del("whatsapp_scheduled");
    await del("whatsapp_messages");
    await del("whatsapp_settings");
    await del("ai_chat_messages");
    await del("property_gallery");
    await del("documents");
    await del("lease_contracts");
    await del("tenants");
    await del("properties");
    await del("organization_invitations", "invited_by");
    await del("organization_members");

    // Delete organizations where user is owner
    const { data: orgs } = await supabase.from("organizations").delete().eq("owner_id", userId).select("id");
    deleted["organizations"] = orgs?.length ?? 0;

    await del("plan_audit_logs", "changed_by");
    await del("rate_limits");
    await del("enterprise_checkout_links", "created_by");
    await del("subscriptions");
    await del("user_roles");
    await del("profiles");

    // Clean storage buckets
    for (const bucket of ["avatars", "property-photos", "property-documents"]) {
      try {
        const { data: files } = await supabase.storage.from(bucket).list(userId);
        if (files?.length) {
          const paths = files.map((f) => `${userId}/${f.name}`);
          await supabase.storage.from(bucket).remove(paths);
        }
      } catch (e) {
        console.error(`Storage cleanup ${bucket}:`, e);
      }
    }

    // Delete from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) {
      console.error("Error deleting auth user:", authError.message);
      return new Response(
        JSON.stringify({ error: "Failed to delete auth user", details: authError.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(JSON.stringify({ success: true, deleted }), { headers: corsHeaders });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
