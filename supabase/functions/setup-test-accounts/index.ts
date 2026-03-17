import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PASSWORD = "Teste@2025";

const ACCOUNTS = [
  {
    email: "free@teste.com",
    plan: "free" as const,
    fullName: "Maria Free",
    propertyCount: 2,
  },
  {
    email: "starter@teste.com",
    plan: "starter" as const,
    fullName: "João Starter",
    propertyCount: 5,
  },
  {
    email: "pro@teste.com",
    plan: "pro" as const,
    fullName: "Ana Pro",
    propertyCount: 8,
  },
  {
    email: "plus@teste.com",
    plan: "plus" as const,
    fullName: "Carlos Plus",
    propertyCount: 10,
  },
];

const PROPERTY_TEMPLATES = [
  {
    name: "Apartamento Centro",
    property_type: "apartamento",
    status: "alugado",
    performance: "alta",
    property_value: 850000,
    monthly_revenue: 4500,
    occupancy_rate: 100,
    condominium_fee: 600,
    iptu_fee: 250,
    maintenance_fee: 100,
    address_street: "Rua Augusta",
    address_number: "1500",
    address_neighborhood: "Centro",
    address_city: "São Paulo",
    address_state: "SP",
    address_zip: "01304-001",
    area_sqm: 75,
    bedrooms: 2,
    bathrooms: 1,
    parking_spots: 1,
    has_elevator: true,
    floor_number: 8,
    year_built: 2020,
    description: "Apartamento moderno no centro com ótima localização.",
  },
  {
    name: "Casa Vila Nova",
    property_type: "casa",
    status: "alugado",
    performance: "alta",
    property_value: 1200000,
    monthly_revenue: 6000,
    occupancy_rate: 100,
    condominium_fee: 0,
    iptu_fee: 400,
    maintenance_fee: 200,
    address_street: "Rua das Palmeiras",
    address_number: "230",
    address_neighborhood: "Vila Nova",
    address_city: "São Paulo",
    address_state: "SP",
    address_zip: "04023-060",
    area_sqm: 180,
    bedrooms: 3,
    bathrooms: 2,
    parking_spots: 2,
    has_barbecue: true,
    has_balcony: true,
    year_built: 2018,
    description: "Casa espaçosa com quintal e churrasqueira.",
  },
  {
    name: "Sala Comercial Paulista",
    property_type: "sala",
    status: "alugado",
    performance: "media",
    property_value: 650000,
    monthly_revenue: 3800,
    occupancy_rate: 100,
    condominium_fee: 700,
    iptu_fee: 200,
    maintenance_fee: 100,
    address_street: "Av. Paulista",
    address_number: "1800",
    address_complement: "Sala 405",
    address_neighborhood: "Bela Vista",
    address_city: "São Paulo",
    address_state: "SP",
    address_zip: "01310-200",
    area_sqm: 45,
    bedrooms: 0,
    bathrooms: 1,
    parking_spots: 1,
    has_elevator: true,
    floor_number: 4,
    year_built: 2017,
    description: "Sala comercial na Paulista, ideal para escritório.",
  },
  {
    name: "Apartamento Moema",
    property_type: "apartamento",
    status: "alugado",
    performance: "alta",
    property_value: 1100000,
    monthly_revenue: 5500,
    occupancy_rate: 95,
    condominium_fee: 900,
    iptu_fee: 350,
    maintenance_fee: 150,
    address_street: "Alameda dos Arapanés",
    address_number: "450",
    address_complement: "Apto 92",
    address_neighborhood: "Moema",
    address_city: "São Paulo",
    address_state: "SP",
    address_zip: "04524-001",
    area_sqm: 110,
    bedrooms: 3,
    bathrooms: 2,
    suites: 1,
    parking_spots: 2,
    has_pool: true,
    has_gym: true,
    has_elevator: true,
    has_balcony: true,
    floor_number: 9,
    year_built: 2021,
    description: "Apartamento de alto padrão em Moema com lazer completo.",
  },
  {
    name: "Loja Pinheiros",
    property_type: "loja",
    status: "alugado",
    performance: "media",
    property_value: 500000,
    monthly_revenue: 3200,
    occupancy_rate: 100,
    condominium_fee: 300,
    iptu_fee: 180,
    maintenance_fee: 80,
    address_street: "Rua dos Pinheiros",
    address_number: "900",
    address_neighborhood: "Pinheiros",
    address_city: "São Paulo",
    address_state: "SP",
    address_zip: "05422-001",
    area_sqm: 60,
    bedrooms: 0,
    bathrooms: 1,
    parking_spots: 0,
    year_built: 2015,
    description: "Loja de rua com grande fluxo de pedestres.",
  },
  {
    name: "Kitnet Consolação",
    property_type: "apartamento",
    status: "vago",
    performance: "baixa",
    property_value: 320000,
    monthly_revenue: 0,
    occupancy_rate: 0,
    condominium_fee: 350,
    iptu_fee: 120,
    maintenance_fee: 50,
    address_street: "Rua da Consolação",
    address_number: "2100",
    address_complement: "Apto 34",
    address_neighborhood: "Consolação",
    address_city: "São Paulo",
    address_state: "SP",
    address_zip: "01302-100",
    area_sqm: 30,
    bedrooms: 1,
    bathrooms: 1,
    parking_spots: 0,
    has_elevator: true,
    floor_number: 3,
    year_built: 2010,
    description: "Kitnet compacta próxima ao metrô.",
  },
  {
    name: "Galpão Industrial",
    property_type: "galpao",
    status: "alugado",
    performance: "alta",
    property_value: 2000000,
    monthly_revenue: 15000,
    occupancy_rate: 100,
    condominium_fee: 0,
    iptu_fee: 800,
    maintenance_fee: 500,
    address_street: "Rod. Anhanguera",
    address_number: "km 32",
    address_neighborhood: "Distrito Industrial",
    address_city: "Cajamar",
    address_state: "SP",
    address_zip: "07750-000",
    area_sqm: 500,
    bedrooms: 0,
    bathrooms: 2,
    parking_spots: 10,
    year_built: 2019,
    description: "Galpão logístico moderno com pé-direito alto.",
  },
  {
    name: "Cobertura Itaim",
    property_type: "apartamento",
    status: "alugado",
    performance: "alta",
    property_value: 3500000,
    monthly_revenue: 18000,
    occupancy_rate: 100,
    condominium_fee: 2200,
    iptu_fee: 700,
    maintenance_fee: 400,
    address_street: "Rua Joaquim Floriano",
    address_number: "820",
    address_complement: "Cobertura",
    address_neighborhood: "Itaim Bibi",
    address_city: "São Paulo",
    address_state: "SP",
    address_zip: "04534-003",
    area_sqm: 250,
    bedrooms: 4,
    bathrooms: 4,
    suites: 2,
    parking_spots: 4,
    has_pool: true,
    has_gym: true,
    has_elevator: true,
    has_balcony: true,
    has_barbecue: true,
    is_furnished: true,
    floor_number: 20,
    year_built: 2022,
    description: "Cobertura duplex no Itaim com vista panorâmica e piscina privativa.",
  },
  {
    name: "Terreno Granja Viana",
    property_type: "terreno",
    status: "vago",
    performance: "baixa",
    property_value: 400000,
    monthly_revenue: 0,
    occupancy_rate: 0,
    condominium_fee: 250,
    iptu_fee: 150,
    maintenance_fee: 0,
    address_street: "Rua dos Ipês",
    address_number: "100",
    address_neighborhood: "Granja Viana",
    address_city: "Cotia",
    address_state: "SP",
    address_zip: "06708-000",
    area_sqm: 500,
    bedrooms: 0,
    bathrooms: 0,
    parking_spots: 0,
    description: "Terreno plano em condomínio fechado com infraestrutura completa.",
  },
  {
    name: "Studio Brooklin",
    property_type: "apartamento",
    status: "alugado",
    performance: "media",
    property_value: 550000,
    monthly_revenue: 2800,
    occupancy_rate: 90,
    condominium_fee: 450,
    iptu_fee: 160,
    maintenance_fee: 80,
    address_street: "Rua Michigan",
    address_number: "600",
    address_complement: "Apto 15",
    address_neighborhood: "Brooklin",
    address_city: "São Paulo",
    address_state: "SP",
    address_zip: "04566-000",
    area_sqm: 40,
    bedrooms: 1,
    bathrooms: 1,
    parking_spots: 1,
    has_elevator: true,
    floor_number: 1,
    year_built: 2023,
    description: "Studio moderno no Brooklin, perfeito para jovens profissionais.",
  },
];

const TENANT_TEMPLATES = [
  { name: "Ana Beatriz Silva", email: "ana.silva@email.com", phone: "(11) 98765-1234", cpf: "11122233344" },
  { name: "Roberto Almeida", email: "roberto.almeida@email.com", phone: "(11) 97654-3210", cpf: "22233344455" },
  { name: "Mariana Costa", email: "mariana.costa@email.com", phone: "(21) 99876-5432", cpf: "33344455566" },
  { name: "TechFlow Ltda", email: "contato@techflow.com.br", phone: "(11) 3456-7890", cpf: "12345678000190" },
  { name: "Pedro Henrique Santos", email: "pedro.santos@email.com", phone: "(11) 91234-5678", cpf: "44455566677" },
  { name: "Fernanda Lima", email: "fernanda.lima@email.com", phone: "(11) 92345-6789", cpf: "55566677788" },
  { name: "Lucas Oliveira", email: "lucas.oliveira@email.com", phone: "(21) 93456-7890", cpf: "66677788899" },
  { name: "StartUp Hub ME", email: "financeiro@startuphub.com", phone: "(11) 4567-8901", cpf: "98765432000111" },
  { name: "Juliana Ferreira", email: "juliana.ferreira@email.com", phone: "(11) 94567-8901", cpf: "77788899900" },
  { name: "Ricardo Mendes", email: "ricardo.mendes@email.com", phone: "(11) 95678-9012", cpf: "88899900011" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const results: Array<{ email: string; plan: string; properties: number; tenants: number; contracts: number }> = [];

    for (const account of ACCOUNTS) {
      // Check if user exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find((u) => u.email === account.email);

      let userId: string;

      if (existingUser) {
        userId = existingUser.id;
        // Clean existing data
        await supabase.from("lease_contracts").delete().eq("user_id", userId);
        await supabase.from("documents").delete().eq("user_id", userId);
        await supabase.from("tenants").delete().eq("user_id", userId);
        await supabase.from("property_gallery").delete().eq("user_id", userId);
        await supabase.from("properties").delete().eq("user_id", userId);
      } else {
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: account.email,
          password: PASSWORD,
          email_confirm: true,
          user_metadata: { full_name: account.fullName },
        });
        if (createError) throw new Error(`Failed to create ${account.email}: ${createError.message}`);
        userId = newUser.user.id;
      }

      // Profile
      await supabase.from("profiles").upsert({
        user_id: userId,
        full_name: account.fullName,
        email: account.email,
        mobile_number: "(11) 99999-0000",
      }, { onConflict: "user_id" });

      // Subscription
      await supabase.from("subscriptions").upsert({
        user_id: userId,
        plan: account.plan,
        status: "active",
        started_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      // User role
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!existingRole) {
        await supabase.from("user_roles").insert({ user_id: userId, role: "user" });
      }

      // Properties (pick from templates based on count)
      const propsToInsert = PROPERTY_TEMPLATES.slice(0, account.propertyCount).map((p) => ({
        ...p,
        user_id: userId,
      }));

      const { data: insertedProps, error: propError } = await supabase
        .from("properties")
        .insert(propsToInsert)
        .select("id, name, status");

      if (propError) throw new Error(`Props error for ${account.email}: ${propError.message}`);

      // Tenants (one per rented property)
      const rentedProps = insertedProps!.filter((p) => p.status === "alugado");
      const tenantsToInsert = rentedProps.map((_, i) => ({
        ...TENANT_TEMPLATES[i % TENANT_TEMPLATES.length],
        user_id: userId,
        // Make CPF unique per account by appending index
        cpf: TENANT_TEMPLATES[i % TENANT_TEMPLATES.length].cpf,
      }));

      const { data: insertedTenants, error: tenantError } = await supabase
        .from("tenants")
        .insert(tenantsToInsert)
        .select("id, name");

      if (tenantError) throw new Error(`Tenants error for ${account.email}: ${tenantError.message}`);

      // Contracts (one per rented property)
      const contracts = rentedProps.map((prop, i) => ({
        user_id: userId,
        property_id: prop.id,
        tenant_id: insertedTenants![i].id,
        start_date: "2024-06-01",
        end_date: "2026-05-31",
        monthly_rent: propsToInsert.find((p) => p.name === prop.name)?.monthly_revenue || 3000,
        deposit_amount: (propsToInsert.find((p) => p.name === prop.name)?.monthly_revenue || 3000) * 2,
        payment_due_day: 10,
        status: "active",
      }));

      const { error: contractError } = await supabase
        .from("lease_contracts")
        .insert(contracts);

      if (contractError) throw new Error(`Contracts error for ${account.email}: ${contractError.message}`);

      // Documents (2 per property)
      const documents = insertedProps!.flatMap((prop) => [
        {
          user_id: userId,
          property_id: prop.id,
          name: `Matrícula - ${prop.name}`,
          category: "matricula",
          file_url: "https://example.com/placeholder-doc.pdf",
          file_type: "application/pdf",
          file_size: 125000,
        },
        {
          user_id: userId,
          property_id: prop.id,
          name: `IPTU 2025 - ${prop.name}`,
          category: "iptu",
          file_url: "https://example.com/placeholder-iptu.pdf",
          file_type: "application/pdf",
          file_size: 85000,
        },
      ]);

      const { error: docError } = await supabase.from("documents").insert(documents);
      if (docError) throw new Error(`Docs error for ${account.email}: ${docError.message}`);

      results.push({
        email: account.email,
        plan: account.plan,
        properties: insertedProps!.length,
        tenants: insertedTenants!.length,
        contracts: contracts.length,
      });
    }

    return new Response(
      JSON.stringify({ success: true, password: PASSWORD, accounts: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
