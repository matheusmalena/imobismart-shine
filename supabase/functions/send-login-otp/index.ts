import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Generate 4-digit code
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Delete old OTPs for this email
    await supabaseAdmin
      .from("email_verifications")
      .delete()
      .eq("email", email);

    // Insert new OTP
    const { error: insertError } = await supabaseAdmin
      .from("email_verifications")
      .insert({
        email,
        otp_code: otpCode,
        verified: false,
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: "Erro ao gerar código" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send email via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Serviço de email não configurado" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ImobiSmart <onboarding@resend.dev>",
        to: [email],
        subject: "Código de verificação - ImobiSmart",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #1a1a2e; text-align: center;">Código de Verificação</h2>
            <p style="color: #555; text-align: center;">Use o código abaixo para acessar sua conta:</p>
            <div style="text-align: center; margin: 32px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #1a1a2e; background: #f0f0f5; padding: 16px 32px; border-radius: 12px; display: inline-block;">
                ${otpCode}
              </span>
            </div>
            <p style="color: #888; text-align: center; font-size: 14px;">
              Este código expira em 15 minutos.
            </p>
            <p style="color: #888; text-align: center; font-size: 12px; margin-top: 24px;">
              Se você não solicitou este código, ignore este email.
            </p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend error:", errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao enviar email" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
