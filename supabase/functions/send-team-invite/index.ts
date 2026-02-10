import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteEmailRequest {
  invitationId: string;
}

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. AUTHENTICATION - Verify user is logged in
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the JWT and get user
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      console.error("Invalid token or user not found:", userError);
      return new Response(
        JSON.stringify({ error: "Usuário não autenticado" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const userId = userData.user.id;
    console.log("Authenticated user:", userId);

    // 2. INPUT VALIDATION - Validate invitationId format
    const { invitationId }: InviteEmailRequest = await req.json();

    if (!invitationId || typeof invitationId !== "string" || !UUID_REGEX.test(invitationId)) {
      console.error("Invalid invitation ID format:", invitationId);
      return new Response(
        JSON.stringify({ error: "ID de convite inválido" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Processing invitation:", invitationId);

    // Fetch invitation details with organization info
    const { data: invitation, error: invitationError } = await supabase
      .from("organization_invitations")
      .select(`
        *,
        organizations:organization_id (name, owner_id)
      `)
      .eq("id", invitationId)
      .single();

    if (invitationError || !invitation) {
      console.error("Error fetching invitation:", invitationError);
      return new Response(
        JSON.stringify({ error: "Convite não encontrado" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // 3. AUTHORIZATION - Verify caller has permission to send this invitation
    // Check if user is the organization owner
    const isOwner = invitation.organizations?.owner_id === userId;
    
    // Check if user is an admin of the organization
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", invitation.organization_id)
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    const isAdmin = membership?.role === "admin";
    
    // Check if user is the one who created the invitation
    const isInviter = invitation.invited_by === userId;

    if (!isOwner && !isAdmin && !isInviter) {
      console.error("User not authorized to send this invitation:", userId);
      return new Response(
        JSON.stringify({ error: "Acesso negado - você não tem permissão para enviar este convite" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Authorization passed for user:", userId, { isOwner, isAdmin, isInviter });

    // Get inviter profile for the email
    const { data: inviterProfile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("user_id", invitation.invited_by)
      .single();

    const inviterName = inviterProfile?.full_name || inviterProfile?.email || "Um administrador";
    const organizationName = invitation.organizations?.name || "sua equipe";

    // Build the invite link
    const appUrl = Deno.env.get("APP_URL") || "https://imobismart-shine.lovable.app";
    const inviteLink = `${appUrl}/accept-invite?token=${invitation.token}`;

    const roleLabels: Record<string, string> = {
      admin: "Administrador",
      financial: "Financeiro",
      operator: "Operador",
    };

    const roleLabel = roleLabels[invitation.role] || invitation.role;

    console.log("Sending email to:", invitation.email);

    const emailResponse = await resend.emails.send({
      from: "ImobiSmart <noreply@imobismart.com.br>",
      to: [invitation.email],
      subject: `Convite para ${organizationName} - ImobiSmart`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Convite para Equipe</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">ImobiSmart</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Gestão Inteligente de Imóveis</p>
            </div>
            
            <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
              <h2 style="margin: 0 0 16px; color: #111827; font-size: 22px;">Você foi convidado!</h2>
              
              <p style="color: #4b5563; margin-bottom: 24px;">
                <strong>${inviterName}</strong> convidou você para fazer parte da equipe 
                <strong>${organizationName}</strong> como <strong>${roleLabel}</strong>.
              </p>
              
              <p style="color: #4b5563; margin-bottom: 24px;">
                Com o ImobiSmart, você terá acesso a ferramentas poderosas para gerenciar imóveis, 
                acompanhar contratos e muito mais.
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${inviteLink}" 
                   style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); 
                          color: white; 
                          padding: 14px 32px; 
                          border-radius: 8px; 
                          text-decoration: none; 
                          font-weight: 600;
                          display: inline-block;
                          box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.3);">
                  Aceitar Convite e Criar Conta
                </a>
              </div>
              
              <p style="color: #9ca3af; font-size: 14px; margin-top: 24px;">
                Este convite expira em 7 dias. Se você não esperava este convite, pode ignorar este e-mail.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
              
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                Se o botão não funcionar, copie e cole este link no navegador:<br>
                <a href="${inviteLink}" style="color: #6366f1; word-break: break-all;">${inviteLink}</a>
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-team-invite function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
