import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é um parceiro de negócios do usuário, especialista em imóveis. Fale de forma informal, como se estivesse batendo papo com um amigo.

REGRAS:
- Respostas CURTAS (2-4 linhas no máximo)
- Tom descontraído mas profissional
- Use APENAS dados do contexto - nunca invente
- Valores em R$ (ex: R$ 5.200)
- Sem emojis excessivos - use só quando fizer sentido
- Vá direto ao ponto
- Se faltar dado, avise brevemente`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(JSON.stringify({ error: "Usuário não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("User authenticated:", user.id);

    const { message, conversationHistory = [] } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Mensagem inválida" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user's portfolio data (multi-tenant - only user's data)
    const [propertiesResult, subscriptionResult] = await Promise.all([
      supabase
        .from("properties")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_archived", false),
      supabase
        .from("subscriptions")
        .select("plan, status")
        .eq("user_id", user.id)
        .single(),
    ]);

    if (propertiesResult.error) {
      console.error("Properties fetch error:", propertiesResult.error);
    }

    const properties = propertiesResult.data || [];
    const subscription = subscriptionResult.data;

    // Calculate portfolio metrics
    const activeProperties = properties.filter(p => p.status === "alugado");
    const vacantProperties = properties.filter(p => p.status === "vago");
    
    const totalRevenue = properties.reduce((sum, p) => sum + (p.monthly_revenue || 0), 0);
    const totalCosts = properties.reduce((sum, p) => {
      return sum + (p.condominium_fee || 0) + (p.iptu_fee || 0) + 
             (p.maintenance_fee || 0) + (p.other_costs || 0);
    }, 0);
    const netProfit = totalRevenue - totalCosts;
    const avgOccupancy = properties.length > 0
      ? properties.reduce((sum, p) => sum + (p.occupancy_rate || 0), 0) / properties.length
      : 0;
    const totalValue = properties.reduce((sum, p) => sum + (p.property_value || 0), 0);

    // Build property details for context
    const propertyDetails = properties.map(p => ({
      nome: p.name,
      tipo: p.property_type,
      status: p.status,
      cidade: p.address_city,
      bairro: p.address_neighborhood,
      valor_imovel: p.property_value,
      receita_mensal: p.monthly_revenue,
      taxa_ocupacao: p.occupancy_rate,
      condominio: p.condominium_fee,
      iptu: p.iptu_fee,
      manutencao: p.maintenance_fee,
      outros_custos: p.other_costs,
      lucro_mensal: (p.monthly_revenue || 0) - ((p.condominium_fee || 0) + (p.iptu_fee || 0) + (p.maintenance_fee || 0) + (p.other_costs || 0)),
      quartos: p.bedrooms,
      banheiros: p.bathrooms,
      area_m2: p.area_sqm,
      desempenho: p.performance,
    }));

    // Performance ranking
    const ranking = [...propertyDetails]
      .sort((a, b) => (b.lucro_mensal || 0) - (a.lucro_mensal || 0))
      .map((p, i) => ({ posicao: i + 1, nome: p.nome, lucro: p.lucro_mensal }));

    // Build context JSON
    const portfolioContext = {
      data_consulta: new Date().toISOString(),
      plano_usuario: subscription?.plan || "starter",
      resumo_geral: {
        total_imoveis: properties.length,
        imoveis_alugados: activeProperties.length,
        imoveis_vagos: vacantProperties.length,
        receita_total_mensal: totalRevenue,
        custos_totais_mensais: totalCosts,
        lucro_liquido_mensal: netProfit,
        lucro_liquido_anual_projetado: netProfit * 12,
        taxa_ocupacao_media: avgOccupancy,
        valor_total_patrimonio: totalValue,
      },
      imoveis: propertyDetails,
      ranking_por_lucro: ranking,
    };

    console.log("Portfolio context built for user:", user.id, "Properties:", properties.length);

    // Prepare messages for AI
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { 
        role: "system", 
        content: `CONTEXTO DO PORTFÓLIO DO USUÁRIO:\n${JSON.stringify(portfolioContext, null, 2)}` 
      },
      ...conversationHistory.slice(-10), // Last 10 messages for context
      { role: "user", content: message },
    ];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Configuração de IA incompleta" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Calling AI Gateway...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Entre em contato com o suporte." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "Erro ao processar sua pergunta" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response...");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("Portfolio chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
