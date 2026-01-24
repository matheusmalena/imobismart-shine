import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

interface EncryptRequest {
  api_key: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Não autorizado" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ success: false, error: "Usuário não autenticado" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders } }
      );
    }

    const body: EncryptRequest = await req.json();

    if (!body.api_key || typeof body.api_key !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: "API key é obrigatória" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders } }
      );
    }

    const encryptionKey = Deno.env.get("WHATSAPP_ENCRYPTION_KEY");
    if (!encryptionKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Chave de criptografia não configurada" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders } }
      );
    }

    // Encrypt the API key
    const { data: encryptedKey, error: encryptError } = await supabase.rpc('encrypt_api_key_with_key', {
      plain_key: body.api_key,
      encryption_key: encryptionKey
    });

    if (encryptError) {
      console.error("Encryption error:", encryptError);
      return new Response(
        JSON.stringify({ success: false, error: "Erro ao criptografar" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, encrypted_key: encryptedKey }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders } }
    );

  } catch (error: any) {
    console.error("Error in encrypt-whatsapp-key function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || 'Erro interno' }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders, ...securityHeaders } }
    );
  }
};

serve(handler);
