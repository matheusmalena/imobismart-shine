import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u: any) => u.email === "pro@teste.com");

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      console.log("User already exists:", userId);
    } else {
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: "pro@teste.com",
        password: "123456",
        email_confirm: true,
        user_metadata: { full_name: "Matheus" },
      });
      if (userError) throw new Error(`User creation failed: ${userError.message}`);
      userId = userData.user.id;
      console.log("User created:", userId);

      await supabase.from("profiles").update({ full_name: "Matheus" }).eq("user_id", userId);
      await supabase.from("subscriptions").update({ plan: "pro", status: "active" }).eq("user_id", userId);
    }

    // Check if properties already exist
    const { data: existingProps } = await supabase
      .from("properties")
      .select("id, name, photo_url")
      .eq("user_id", userId);

    let insertedProperties = existingProps;

    if (!existingProps || existingProps.length === 0) {
      // Insert properties (same as before)
      const properties = [
        { user_id: userId, name: "Apartamento Centro SP", property_type: "apartamento", status: "alugado", address_street: "Rua Augusta", address_number: "1200", address_complement: "Apto 801", address_neighborhood: "Centro", address_city: "São Paulo", address_state: "SP", address_zip: "01304-001", property_value: 450000, monthly_revenue: 2800, occupancy_rate: 100, condominium_fee: 650, iptu_fee: 180, maintenance_fee: 100, other_costs: 50, area_sqm: 72, bedrooms: 2, bathrooms: 1, parking_spots: 1, suites: 1, has_pool: false, has_gym: true, has_elevator: true, has_balcony: true, has_barbecue: false, is_furnished: false, floor_number: 8, year_built: 2015, description: "Apartamento moderno no coração de São Paulo, próximo ao metrô e comércio." },
        { user_id: userId, name: "Casa Alphaville", property_type: "casa", status: "alugado", address_street: "Alameda dos Lírios", address_number: "350", address_neighborhood: "Alphaville", address_city: "Barueri", address_state: "SP", address_zip: "06453-000", property_value: 1200000, monthly_revenue: 5500, occupancy_rate: 100, condominium_fee: 1200, iptu_fee: 450, maintenance_fee: 300, other_costs: 150, area_sqm: 280, bedrooms: 4, bathrooms: 3, parking_spots: 3, suites: 2, has_pool: true, has_gym: false, has_elevator: false, has_balcony: true, has_barbecue: true, is_furnished: true, year_built: 2018, description: "Casa espaçosa em condomínio fechado com segurança 24h, piscina e churrasqueira." },
        { user_id: userId, name: "Sala Comercial Faria Lima", property_type: "sala", status: "alugado", address_street: "Av. Brigadeiro Faria Lima", address_number: "3477", address_complement: "Sala 1205", address_neighborhood: "Itaim Bibi", address_city: "São Paulo", address_state: "SP", address_zip: "04538-133", property_value: 380000, monthly_revenue: 3200, occupancy_rate: 100, condominium_fee: 800, iptu_fee: 220, maintenance_fee: 80, other_costs: 0, area_sqm: 45, bedrooms: 0, bathrooms: 1, parking_spots: 1, suites: 0, has_pool: false, has_gym: false, has_elevator: true, has_balcony: false, has_barbecue: false, is_furnished: true, floor_number: 12, year_built: 2020, description: "Sala comercial premium na Faria Lima, ideal para escritório ou consultório." },
        { user_id: userId, name: "Loja Shopping Morumbi", property_type: "loja", status: "alugado", address_street: "Av. Roque Petroni Júnior", address_number: "1089", address_complement: "Loja 42", address_neighborhood: "Morumbi", address_city: "São Paulo", address_state: "SP", address_zip: "04707-900", property_value: 520000, monthly_revenue: 4000, occupancy_rate: 100, condominium_fee: 1500, iptu_fee: 350, maintenance_fee: 200, other_costs: 100, area_sqm: 60, bedrooms: 0, bathrooms: 1, parking_spots: 0, suites: 0, has_pool: false, has_gym: false, has_elevator: true, has_balcony: false, has_barbecue: false, is_furnished: false, floor_number: 1, year_built: 2010, description: "Loja bem localizada em shopping de alto padrão com grande fluxo de clientes." },
        { user_id: userId, name: "Apartamento Copacabana", property_type: "apartamento", status: "vago", address_street: "Av. Atlântica", address_number: "2800", address_complement: "Apto 1502", address_neighborhood: "Copacabana", address_city: "Rio de Janeiro", address_state: "RJ", address_zip: "22041-001", property_value: 780000, monthly_revenue: 0, occupancy_rate: 0, condominium_fee: 900, iptu_fee: 280, maintenance_fee: 150, other_costs: 0, area_sqm: 95, bedrooms: 3, bathrooms: 2, parking_spots: 1, suites: 1, has_pool: true, has_gym: true, has_elevator: true, has_balcony: true, has_barbecue: false, is_furnished: true, floor_number: 15, year_built: 2005, description: "Apartamento com vista para o mar em Copacabana, recentemente reformado." },
        { user_id: userId, name: "Casa Jardins", property_type: "casa", status: "alugado", address_street: "Rua Oscar Freire", address_number: "890", address_neighborhood: "Jardins", address_city: "São Paulo", address_state: "SP", address_zip: "01426-001", property_value: 950000, monthly_revenue: 4200, occupancy_rate: 100, condominium_fee: 0, iptu_fee: 380, maintenance_fee: 250, other_costs: 100, area_sqm: 180, bedrooms: 3, bathrooms: 2, parking_spots: 2, suites: 1, has_pool: false, has_gym: false, has_elevator: false, has_balcony: true, has_barbecue: true, is_furnished: false, year_built: 1998, description: "Casa charmosa no bairro dos Jardins, região nobre com fácil acesso." },
        { user_id: userId, name: "Galpão Industrial Guarulhos", property_type: "galpao", status: "alugado", address_street: "Rod. Presidente Dutra", address_number: "KM 225", address_complement: "Galpão 3", address_neighborhood: "Distrito Industrial", address_city: "Guarulhos", address_state: "SP", address_zip: "07210-000", property_value: 1500000, monthly_revenue: 8000, occupancy_rate: 100, condominium_fee: 0, iptu_fee: 600, maintenance_fee: 500, other_costs: 300, area_sqm: 800, bedrooms: 0, bathrooms: 2, parking_spots: 10, suites: 0, has_pool: false, has_gym: false, has_elevator: false, has_balcony: false, has_barbecue: false, is_furnished: false, year_built: 2012, description: "Galpão industrial com excelente localização próximo à Dutra e aeroporto." },
        { user_id: userId, name: "Terreno Campinas", property_type: "terreno", status: "a_venda", address_street: "Rua das Palmeiras", address_number: "SN", address_complement: "Lote 15", address_neighborhood: "Barão Geraldo", address_city: "Campinas", address_state: "SP", address_zip: "13083-000", property_value: 350000, monthly_revenue: 0, occupancy_rate: 0, condominium_fee: 200, iptu_fee: 120, maintenance_fee: 50, other_costs: 0, area_sqm: 500, bedrooms: 0, bathrooms: 0, parking_spots: 0, suites: 0, has_pool: false, has_gym: false, has_elevator: false, has_balcony: false, has_barbecue: false, is_furnished: false, year_built: null, description: "Terreno plano em condomínio fechado, pronto para construir." },
        { user_id: userId, name: "Apartamento Vila Mariana", property_type: "apartamento", status: "em_reforma", address_street: "Rua Domingos de Morais", address_number: "1550", address_complement: "Apto 403", address_neighborhood: "Vila Mariana", address_city: "São Paulo", address_state: "SP", address_zip: "04010-200", property_value: 620000, monthly_revenue: 0, occupancy_rate: 0, condominium_fee: 550, iptu_fee: 200, maintenance_fee: 800, other_costs: 200, area_sqm: 85, bedrooms: 3, bathrooms: 2, parking_spots: 1, suites: 1, has_pool: false, has_gym: true, has_elevator: true, has_balcony: true, has_barbecue: false, is_furnished: false, floor_number: 4, year_built: 2000, description: "Apartamento em reforma completa, previsão de conclusão em 2 meses." },
        { user_id: userId, name: "Comercial Paulista", property_type: "comercial", status: "alugado", address_street: "Av. Paulista", address_number: "1578", address_complement: "Conj. 1810", address_neighborhood: "Bela Vista", address_city: "São Paulo", address_state: "SP", address_zip: "01310-200", property_value: 890000, monthly_revenue: 6500, occupancy_rate: 100, condominium_fee: 1100, iptu_fee: 400, maintenance_fee: 150, other_costs: 80, area_sqm: 120, bedrooms: 0, bathrooms: 2, parking_spots: 2, suites: 0, has_pool: false, has_gym: false, has_elevator: true, has_balcony: false, has_barbecue: false, is_furnished: true, floor_number: 18, year_built: 2016, description: "Conjunto comercial na Av. Paulista com vista panorâmica da cidade." },
      ];

      const { data, error: propError } = await supabase.from("properties").insert(properties).select("id, name, photo_url");
      if (propError) throw new Error(`Properties insert failed: ${propError.message}`);
      insertedProperties = data;
    }

    // Upload photos for properties that don't have photo_url yet
    const imageMap: Record<string, string> = {
      "Apartamento Centro SP": "prop-1-apto-centro-sp.jpg",
      "Casa Alphaville": "prop-2-casa-alphaville.jpg",
      "Sala Comercial Faria Lima": "prop-3-sala-faria-lima.jpg",
      "Loja Shopping Morumbi": "prop-4-loja-morumbi.jpg",
      "Apartamento Copacabana": "prop-5-apto-copacabana.jpg",
      "Casa Jardins": "prop-6-casa-jardins.jpg",
      "Galpão Industrial Guarulhos": "prop-7-galpao-guarulhos.jpg",
      "Terreno Campinas": "prop-8-terreno-campinas.jpg",
      "Apartamento Vila Mariana": "prop-9-apto-vila-mariana.jpg",
      "Comercial Paulista": "prop-10-comercial-paulista.jpg",
    };

    const appUrl = "https://imobismart-shine.lovable.app";
    let photosUploaded = 0;

    const propsNeedingPhotos = insertedProperties!.filter((p: any) => !p.photo_url);

    for (const prop of propsNeedingPhotos) {
      const fileName = imageMap[prop.name];
      if (!fileName) {
        console.warn(`No image mapping for: ${prop.name}`);
        continue;
      }

      try {
        const imgRes = await fetch(`${appUrl}/images/${fileName}`);
        if (!imgRes.ok) {
          console.warn(`Failed to fetch image for ${prop.name}: ${imgRes.status}`);
          continue;
        }

        const arrayBuffer = await imgRes.arrayBuffer();
        const filePath = `${userId}/${prop.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("property-photos")
          .upload(filePath, new Uint8Array(arrayBuffer), {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (uploadError) {
          console.warn(`Upload failed for ${prop.name}: ${uploadError.message}`);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("property-photos")
          .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;

        await supabase.from("properties").update({ photo_url: publicUrl }).eq("id", prop.id);

        await supabase.from("property_gallery").insert({
          property_id: prop.id,
          user_id: userId,
          image_url: publicUrl,
          caption: prop.name,
          display_order: 0,
        });

        photosUploaded++;
        console.log(`Photo uploaded for ${prop.name}`);
      } catch (err) {
        console.warn(`Error processing photo for ${prop.name}:`, err);
      }
    }

    console.log(`Photos uploaded: ${photosUploaded}/${propsNeedingPhotos.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        userId,
        properties: insertedProperties?.length,
        photosUploaded,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Seed error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
