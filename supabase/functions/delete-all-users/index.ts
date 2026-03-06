import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  let deleted = 0;
  for (const user of users || []) {
    await supabase.auth.admin.deleteUser(user.id);
    deleted++;
  }

  return new Response(JSON.stringify({ deleted }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
