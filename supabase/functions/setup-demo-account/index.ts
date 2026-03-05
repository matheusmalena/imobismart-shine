import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const email = "demo@imobismart.com";
    const password = "Demo@2025";

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email === email);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      // Clean existing data
      await supabase.from("lease_contracts").delete().eq("user_id", userId);
      await supabase.from("tenants").delete().eq("user_id", userId);
      await supabase.from("documents").delete().eq("user_id", userId);
      await supabase.from("property_gallery").delete().eq("user_id", userId);
      await supabase.from("properties").delete().eq("user_id", userId);
    } else {
      // Create user with email confirmed
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: "Carlos Mendes" },
      });
      if (createError) throw createError;
      userId = newUser.user.id;
    }

    // Ensure profile exists
    await supabase.from("profiles").upsert({
      user_id: userId,
      full_name: "Carlos Mendes",
      email,
      mobile_number: "(11) 99876-5432",
    }, { onConflict: "user_id" });

    // Ensure subscription (pro plan)
    await supabase.from("subscriptions").upsert({
      user_id: userId,
      plan: "pro",
      status: "active",
      started_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    // Ensure user role
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (!existingRole) {
      await supabase.from("user_roles").insert({ user_id: userId, role: "user" });
    }

    const storageBase = `${supabaseUrl}/storage/v1/object/public/property-photos/demo`;

    // Create properties
    const properties = [
      {
        user_id: userId,
        name: "Apartamento Jardins",
        property_type: "apartamento",
        status: "alugado",
        performance: "alta",
        property_value: 1850000,
        monthly_revenue: 8500,
        occupancy_rate: 100,
        condominium_fee: 1200,
        iptu_fee: 450,
        maintenance_fee: 200,
        other_costs: 0,
        address_street: "Rua Oscar Freire",
        address_number: "1200",
        address_complement: "Apto 182",
        address_neighborhood: "Jardins",
        address_city: "São Paulo",
        address_state: "SP",
        address_zip: "01426-001",
        area_sqm: 120,
        bedrooms: 3,
        bathrooms: 2,
        suites: 1,
        parking_spots: 2,
        has_pool: true,
        has_gym: true,
        has_elevator: true,
        has_balcony: true,
        is_furnished: false,
        floor_number: 18,
        year_built: 2019,
        photo_url: `${storageBase}%2Fprop-1.jpg`,
        description: "Apartamento de alto padrão nos Jardins com vista panorâmica para a cidade.",
      },
      {
        user_id: userId,
        name: "Casa Alphaville",
        property_type: "casa",
        status: "alugado",
        performance: "alta",
        property_value: 2500000,
        monthly_revenue: 12000,
        occupancy_rate: 100,
        condominium_fee: 800,
        iptu_fee: 600,
        maintenance_fee: 500,
        other_costs: 300,
        address_street: "Alameda dos Jacarandás",
        address_number: "350",
        address_neighborhood: "Alphaville",
        address_city: "Barueri",
        address_state: "SP",
        address_zip: "06454-000",
        area_sqm: 280,
        bedrooms: 4,
        bathrooms: 4,
        suites: 2,
        parking_spots: 3,
        has_pool: true,
        has_gym: false,
        has_barbecue: true,
        has_balcony: true,
        is_furnished: true,
        year_built: 2021,
        photo_url: `${storageBase}%2Fprop-2.jpg`,
        description: "Casa moderna em condomínio fechado com piscina e área gourmet.",
      },
      {
        user_id: userId,
        name: "Sala Comercial Faria Lima",
        property_type: "sala",
        status: "alugado",
        performance: "media",
        property_value: 950000,
        monthly_revenue: 5500,
        occupancy_rate: 100,
        condominium_fee: 900,
        iptu_fee: 350,
        maintenance_fee: 150,
        other_costs: 0,
        address_street: "Av. Brigadeiro Faria Lima",
        address_number: "3477",
        address_complement: "Sala 1204",
        address_neighborhood: "Itaim Bibi",
        address_city: "São Paulo",
        address_state: "SP",
        address_zip: "04538-133",
        area_sqm: 65,
        bedrooms: 0,
        bathrooms: 1,
        parking_spots: 1,
        has_elevator: true,
        floor_number: 12,
        year_built: 2018,
        photo_url: `${storageBase}%2Fprop-3.jpg`,
        description: "Sala comercial na Faria Lima com vista para a avenida, andar alto.",
      },
      {
        user_id: userId,
        name: "Apartamento Copacabana",
        property_type: "apartamento",
        status: "alugado",
        performance: "alta",
        property_value: 1200000,
        monthly_revenue: 6800,
        occupancy_rate: 95,
        condominium_fee: 950,
        iptu_fee: 380,
        maintenance_fee: 300,
        other_costs: 0,
        address_street: "Av. Atlântica",
        address_number: "2800",
        address_complement: "Apto 1501",
        address_neighborhood: "Copacabana",
        address_city: "Rio de Janeiro",
        address_state: "RJ",
        address_zip: "22041-001",
        area_sqm: 95,
        bedrooms: 2,
        bathrooms: 2,
        suites: 1,
        parking_spots: 1,
        has_elevator: true,
        has_balcony: true,
        is_furnished: true,
        floor_number: 15,
        year_built: 2016,
        photo_url: `${storageBase}%2Fprop-4.jpg`,
        description: "Apartamento de frente para o mar em Copacabana, totalmente mobiliado.",
      },
      {
        user_id: userId,
        name: "Loft Vila Madalena",
        property_type: "apartamento",
        status: "vago",
        performance: "media",
        property_value: 680000,
        monthly_revenue: 0,
        occupancy_rate: 0,
        condominium_fee: 500,
        iptu_fee: 220,
        maintenance_fee: 100,
        other_costs: 0,
        address_street: "Rua Aspicuelta",
        address_number: "580",
        address_complement: "Loft 3",
        address_neighborhood: "Vila Madalena",
        address_city: "São Paulo",
        address_state: "SP",
        address_zip: "05433-011",
        area_sqm: 75,
        bedrooms: 1,
        bathrooms: 1,
        parking_spots: 1,
        has_elevator: false,
        has_balcony: false,
        is_furnished: false,
        year_built: 2015,
        photo_url: `${storageBase}%2Fprop-5.jpg`,
        description: "Loft estiloso com pé-direito duplo e tijolo aparente na Vila Madalena.",
      },
    ];

    const { data: insertedProps, error: propError } = await supabase
      .from("properties")
      .insert(properties)
      .select("id, name");

    if (propError) throw propError;

    // Create tenants
    const tenants = [
      { user_id: userId, name: "Ana Beatriz Silva", email: "ana.silva@email.com", phone: "(11) 98765-1234", cpf: "123.456.789-01" },
      { user_id: userId, name: "Roberto Almeida", email: "roberto.almeida@email.com", phone: "(11) 97654-3210", cpf: "234.567.890-12" },
      { user_id: userId, name: "Mariana Costa", email: "mariana.costa@email.com", phone: "(21) 99876-5432", cpf: "345.678.901-23" },
      { user_id: userId, name: "TechFlow Ltda", email: "contato@techflow.com.br", phone: "(11) 3456-7890", cpf: "12.345.678/0001-90" },
    ];

    const { data: insertedTenants, error: tenantError } = await supabase
      .from("tenants")
      .insert(tenants)
      .select("id, name");

    if (tenantError) throw tenantError;

    // Create lease contracts (for the 4 rented properties)
    const contracts = [];
    const propMap = insertedProps!;
    const tenantMap = insertedTenants!;

    // Jardins -> Ana
    contracts.push({
      user_id: userId,
      property_id: propMap[0].id,
      tenant_id: tenantMap[0].id,
      start_date: "2024-06-01",
      end_date: "2026-05-31",
      monthly_rent: 8500,
      deposit_amount: 17000,
      payment_due_day: 10,
      status: "active",
    });
    // Alphaville -> Roberto
    contracts.push({
      user_id: userId,
      property_id: propMap[1].id,
      tenant_id: tenantMap[1].id,
      start_date: "2024-03-01",
      end_date: "2026-02-28",
      monthly_rent: 12000,
      deposit_amount: 24000,
      payment_due_day: 5,
      status: "active",
    });
    // Faria Lima -> TechFlow
    contracts.push({
      user_id: userId,
      property_id: propMap[2].id,
      tenant_id: tenantMap[3].id,
      start_date: "2024-01-15",
      end_date: "2027-01-14",
      monthly_rent: 5500,
      deposit_amount: 11000,
      payment_due_day: 15,
      status: "active",
    });
    // Copacabana -> Mariana
    contracts.push({
      user_id: userId,
      property_id: propMap[3].id,
      tenant_id: tenantMap[2].id,
      start_date: "2024-09-01",
      end_date: "2025-08-31",
      monthly_rent: 6800,
      deposit_amount: 13600,
      payment_due_day: 1,
      status: "active",
    });

    const { error: contractError } = await supabase
      .from("lease_contracts")
      .insert(contracts);

    if (contractError) throw contractError;

    return new Response(
      JSON.stringify({
        success: true,
        email,
        password,
        properties: propMap.length,
        tenants: tenantMap.length,
        contracts: contracts.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
