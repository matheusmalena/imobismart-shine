import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "Email obrigatório" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any previous OTPs for this email
    await supabase
      .from("email_verifications")
      .delete()
      .eq("email", email);

    // Store OTP
    const { error: insertError } = await supabase
      .from("email_verifications")
      .insert({
        email,
        otp_code: otpCode,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      });

    if (insertError) {
      console.error("Error storing OTP:", insertError);
      throw new Error("Erro ao gerar código");
    }

    // Send email via Resend
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const emailResponse = await resend.emails.send({
      from: "ImobiSmart <noreply@imobismart.com>",
      to: [email],
      subject: "Código de Verificação - ImobiSmart",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">ImobiSmart</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Gestão Inteligente de Imóveis</p>
            </div>
            
            <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
              <h2 style="margin: 0 0 16px; color: #111827; font-size: 22px; text-align: center;">Código de Verificação</h2>
              
              <p style="color: #4b5563; margin-bottom: 24px; text-align: center;">
                Use o código abaixo para verificar seu email e ativar sua conta:
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <div style="background: #f3f4f6; border: 2px dashed #6366f1; border-radius: 12px; padding: 24px; display: inline-block;">
                  <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #6366f1; font-family: monospace;">${otpCode}</span>
                </div>
              </div>
              
              <p style="color: #9ca3af; font-size: 14px; margin-top: 24px; text-align: center;">
                Este código expira em <strong>15 minutos</strong>. Se você não solicitou este código, ignore este email.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
              
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                © ${new Date().getFullYear()} ImobiSmart. Todos os direitos reservados.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Verification email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-verification-otp:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
