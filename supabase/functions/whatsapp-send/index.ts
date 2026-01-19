import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendMessageRequest {
  action: 'send_message' | 'test_connection';
  // For send_message
  tenantId?: string;
  propertyId?: string;
  contractId?: string;
  phoneNumber?: string;
  message?: string;
  // For test_connection
  apiUrl?: string;
  apiKey?: string;
  instanceName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Não autorizado" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
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
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = userData.user.id;
    const body: SendMessageRequest = await req.json();

    // Get user's WhatsApp settings
    const { data: settings, error: settingsError } = await supabase
      .from("whatsapp_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (body.action === "test_connection") {
      // Test connection to Evolution API
      const apiUrl = body.apiUrl || settings?.evolution_api_url;
      const apiKey = body.apiKey || settings?.evolution_api_key;
      const instanceName = body.instanceName || settings?.evolution_instance_name;

      if (!apiUrl || !apiKey) {
        return new Response(
          JSON.stringify({ success: false, error: "URL e API Key são obrigatórios" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Validate URL is not localhost
      const urlLower = apiUrl.toLowerCase();
      if (urlLower.includes('localhost') || urlLower.includes('127.0.0.1') || urlLower.includes('0.0.0.0')) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "URLs locais (localhost) não são acessíveis pela função em nuvem. Use a URL pública da sua Evolution API (ex: https://sua-instancia.evolution-api.com)" 
          }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      try {
        // Call Evolution API to check instance status
        const response = await fetch(`${apiUrl}/instance/connectionState/${instanceName}`, {
          method: "GET",
          headers: {
            "apikey": apiKey,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        console.log("Evolution API response:", data);

        if (response.ok) {
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: `Conectado! Status: ${data.instance?.state || 'OK'}`,
              data 
            }),
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        } else {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: data.message || "Falha ao conectar com a Evolution API",
              data 
            }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      } catch (error: any) {
        console.error("Error testing connection:", error);
        return new Response(
          JSON.stringify({ success: false, error: `Erro de conexão: ${error?.message || 'Erro desconhecido'}` }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    if (body.action === "send_message") {
      if (!settings?.is_enabled) {
        return new Response(
          JSON.stringify({ success: false, error: "Notificações WhatsApp desativadas" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (!settings?.evolution_api_url || !settings?.evolution_api_key) {
        return new Response(
          JSON.stringify({ success: false, error: "Evolution API não configurada" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const { tenantId, propertyId, contractId, phoneNumber, message } = body;

      if (!tenantId || !propertyId || !phoneNumber || !message) {
        return new Response(
          JSON.stringify({ success: false, error: "Dados incompletos" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Format phone number (remove non-digits, add country code if needed)
      let formattedPhone = phoneNumber.replace(/\D/g, "");
      if (formattedPhone.length === 11 && formattedPhone.startsWith("9")) {
        formattedPhone = "55" + formattedPhone;
      } else if (formattedPhone.length === 10 || formattedPhone.length === 11) {
        formattedPhone = "55" + formattedPhone;
      }

      // Create message record
      const { data: messageRecord, error: insertError } = await supabase
        .from("whatsapp_messages")
        .insert({
          user_id: userId,
          tenant_id: tenantId,
          property_id: propertyId,
          contract_id: contractId || null,
          phone_number: phoneNumber,
          message_content: message,
          message_type: "payment_reminder",
          status: "pending",
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating message record:", insertError);
        return new Response(
          JSON.stringify({ success: false, error: "Erro ao registrar mensagem" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      try {
        // Send message via Evolution API
        const evolutionResponse = await fetch(
          `${settings.evolution_api_url}/message/sendText/${settings.evolution_instance_name}`,
          {
            method: "POST",
            headers: {
              "apikey": settings.evolution_api_key,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              number: formattedPhone,
              text: message,
            }),
          }
        );

        const evolutionData = await evolutionResponse.json();
        console.log("Evolution API send response:", evolutionData);

        if (evolutionResponse.ok) {
          // Update message status to sent
          await supabase
            .from("whatsapp_messages")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
            })
            .eq("id", messageRecord.id);

          return new Response(
            JSON.stringify({ success: true, message: "Mensagem enviada com sucesso!", data: evolutionData }),
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        } else {
          // Update message status to failed
          await supabase
            .from("whatsapp_messages")
            .update({
              status: "failed",
              error_message: evolutionData.message || "Erro desconhecido",
            })
            .eq("id", messageRecord.id);

          return new Response(
            JSON.stringify({ success: false, error: evolutionData.message || "Falha ao enviar mensagem" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      } catch (error: any) {
        console.error("Error sending message:", error);
        
        // Update message status to failed
        await supabase
          .from("whatsapp_messages")
          .update({
            status: "failed",
            error_message: error?.message || 'Erro desconhecido',
          })
          .eq("id", messageRecord.id);

        return new Response(
          JSON.stringify({ success: false, error: `Erro ao enviar: ${error?.message || 'Erro desconhecido'}` }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: false, error: "Ação inválida" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in whatsapp-send function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || 'Erro interno' }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
