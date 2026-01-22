import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const buildSystemPrompt = (userName: string) => `Você é um parceiro de negócios do usuário chamado ${userName || "amigo"}. Fale de forma informal, como se estivesse batendo papo com um amigo.

REGRAS:
- SEMPRE se refira ao usuário pelo nome: ${userName || "amigo"}
- Respostas CURTAS (2-4 linhas no máximo)
- Tom descontraído mas profissional
- Use APENAS dados do contexto - nunca invente
- Valores em R$ (ex: R$ 5.200)
- Sem emojis excessivos - use só quando fizer sentido
- Vá direto ao ponto
- Se faltar dado, avise brevemente

AÇÕES SUGERIDAS:
Quando apropriado, sugira ações clicáveis usando este formato EXATO no final da resposta:
[AÇÃO:tipo:texto_botão:parametro]

Tipos de ação disponíveis:
- criar_imovel: Criar novo imóvel
- ver_imovel: Ver detalhes de um imóvel (parametro = id do imóvel)
- ver_documento: Ver documento (parametro = nome do documento)
- ver_inquilinos: Ver lista de inquilinos
- ver_configuracoes: Abrir configurações
- ver_documentos: Ver todos os documentos

Exemplos:
- "Quer adicionar um novo imóvel? [AÇÃO:criar_imovel:Criar novo imóvel]"
- "Você pode ver os detalhes aqui: [AÇÃO:ver_imovel:Ver detalhes:abc123]"
- "Confira seus documentos: [AÇÃO:ver_documentos:Ver documentos]"

Use ações apenas quando fizer sentido no contexto da conversa.`;

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

    const body = await req.json();
    const { message, conversationHistory = [] } = body;

    // ===== INPUT VALIDATION =====
    // Validate message exists and is a string
    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Mensagem inválida" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate message length (max 2000 characters)
    const MAX_MESSAGE_LENGTH = 2000;
    if (message.length > MAX_MESSAGE_LENGTH) {
      return new Response(JSON.stringify({ 
        error: `Mensagem muito longa. Máximo de ${MAX_MESSAGE_LENGTH} caracteres permitidos.` 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate conversationHistory is an array
    if (!Array.isArray(conversationHistory)) {
      return new Response(JSON.stringify({ error: "Histórico de conversa inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Limit conversation history to prevent abuse (max 20 messages)
    const MAX_HISTORY_LENGTH = 20;
    if (conversationHistory.length > MAX_HISTORY_LENGTH) {
      return new Response(JSON.stringify({ 
        error: `Histórico de conversa muito longo. Máximo de ${MAX_HISTORY_LENGTH} mensagens.` 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate each history item format and content length
    for (const item of conversationHistory) {
      if (!item || typeof item !== "object") {
        return new Response(JSON.stringify({ error: "Formato de histórico inválido" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (!item.role || !["user", "assistant", "system"].includes(item.role)) {
        return new Response(JSON.stringify({ error: "Role inválido no histórico" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (!item.content || typeof item.content !== "string") {
        return new Response(JSON.stringify({ error: "Conteúdo de mensagem inválido no histórico" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (item.content.length > MAX_MESSAGE_LENGTH) {
        return new Response(JSON.stringify({ 
          error: `Mensagem no histórico muito longa. Máximo de ${MAX_MESSAGE_LENGTH} caracteres.` 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    // ===== END INPUT VALIDATION =====

    // Fetch user's portfolio data (multi-tenant - only user's data)
    const [propertiesResult, subscriptionResult, profileResult, documentsResult, galleryResult, tenantsResult, contractsResult] = await Promise.all([
      supabase
        .from("properties")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_archived", false),
      supabase
        .from("subscriptions")
        .select("plan, status")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id),
      supabase
        .from("property_gallery")
        .select("*")
        .eq("user_id", user.id),
      supabase
        .from("tenants")
        .select("*")
        .eq("user_id", user.id),
      supabase
        .from("lease_contracts")
        .select("*")
        .eq("user_id", user.id),
    ]);

    if (propertiesResult.error) {
      console.error("Properties fetch error:", propertiesResult.error);
    }

    const properties = propertiesResult.data || [];
    const documents = documentsResult.data || [];
    const gallery = galleryResult.data || [];
    const tenants = tenantsResult.data || [];
    const contracts = contractsResult.data || [];
    const subscription = subscriptionResult.data;
    const userName = profileResult.data?.full_name?.split(" ")[0] || "amigo";

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

    // Build complete property details with all information
    const propertyDetails = properties.map(p => {
      // Get documents for this property
      const propertyDocs = documents.filter(d => d.property_id === p.id).map(d => ({
        nome: d.name,
        categoria: d.category,
        tipo_arquivo: d.file_type,
        data_upload: d.created_at,
      }));

      // Get gallery images for this property
      const propertyGallery = gallery.filter(g => g.property_id === p.id).map(g => ({
        legenda: g.caption,
        ordem: g.display_order,
      }));

      // Get contracts for this property
      const propertyContracts = contracts.filter(c => c.property_id === p.id).map(c => {
        const tenant = tenants.find(t => t.id === c.tenant_id);
        return {
          inquilino: tenant?.name || "Desconhecido",
          aluguel_mensal: c.monthly_rent,
          inicio: c.start_date,
          fim: c.end_date,
          status: c.status,
          deposito: c.deposit_amount,
          dia_vencimento: c.payment_due_day,
          notas: c.notes,
        };
      });

      return {
        id: p.id,
        nome: p.name,
        descricao: p.description,
        tipo: p.property_type,
        status: p.status,
        desempenho: p.performance,
        // Endereço completo
        endereco: {
          rua: p.address_street,
          numero: p.address_number,
          complemento: p.address_complement,
          bairro: p.address_neighborhood,
          cidade: p.address_city,
          estado: p.address_state,
          cep: p.address_zip,
        },
        // Características
        caracteristicas: {
          area_m2: p.area_sqm,
          quartos: p.bedrooms,
          suites: p.suites,
          banheiros: p.bathrooms,
          vagas_garagem: p.parking_spots,
          andar: p.floor_number,
          ano_construcao: p.year_built,
          mobiliado: p.is_furnished,
        },
        // Comodidades
        comodidades: {
          piscina: p.has_pool,
          academia: p.has_gym,
          churrasqueira: p.has_barbecue,
          varanda: p.has_balcony,
          elevador: p.has_elevator,
        },
        // Financeiro
        financeiro: {
          valor_imovel: p.property_value,
          receita_mensal: p.monthly_revenue,
          taxa_ocupacao: p.occupancy_rate,
          condominio: p.condominium_fee,
          iptu: p.iptu_fee,
          manutencao: p.maintenance_fee,
          outros_custos: p.other_costs,
          lucro_mensal: (p.monthly_revenue || 0) - ((p.condominium_fee || 0) + (p.iptu_fee || 0) + (p.maintenance_fee || 0) + (p.other_costs || 0)),
          data_aquisicao: p.acquisition_date,
        },
        // Relacionamentos
        documentos: propertyDocs,
        fotos: propertyGallery,
        contratos: propertyContracts,
        total_documentos: propertyDocs.length,
        total_fotos: propertyGallery.length,
        total_contratos: propertyContracts.length,
      };
    });

    // Performance ranking
    const ranking = [...propertyDetails]
      .sort((a, b) => (b.financeiro.lucro_mensal || 0) - (a.financeiro.lucro_mensal || 0))
      .map((p, i) => ({ posicao: i + 1, nome: p.nome, lucro: p.financeiro.lucro_mensal }));

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
      { role: "system", content: buildSystemPrompt(userName) },
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
