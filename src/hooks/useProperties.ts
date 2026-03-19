import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Property, PropertyFormData } from '@/types/property';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useRateLimit, RATE_LIMITS } from '@/hooks/useRateLimit';
import { validateAndNormalizePropertyFormData } from '@/utils/propertyValidation';
import { useOrgPermissions } from '@/hooks/useOrgPermissions';

export function useProperties() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { checkRateLimit } = useRateLimit();
  const { isInOrg, organizationId } = useOrgPermissions();

  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ['properties', user?.id, organizationId],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (isInOrg && organizationId) {
        query = query.eq('organization_id', organizationId);
      } else {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Property[];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const checkNameExists = async (name: string, excludeId?: string): Promise<boolean> => {
    if (!user) return false;
    
    let query = supabase
      .from('properties')
      .select('id')
      .eq('user_id', user.id)
      .ilike('name', name);
    
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    
    const { data } = await query;
    return (data?.length ?? 0) > 0;
  };

  const createProperty = useMutation({
    mutationFn: async (formData: PropertyFormData) => {
      if (!user) throw new Error('Usuário não autenticado');

      const normalized = validateAndNormalizePropertyFormData(formData);

      const rateLimitResult = await checkRateLimit(RATE_LIMITS.CREATE_PROPERTY);
      if (!rateLimitResult.allowed) {
        throw new Error('Muitas requisições. Aguarde um momento.');
      }

      const nameExists = await checkNameExists(normalized.name);
      if (nameExists) {
        throw new Error('Já existe um imóvel com este nome');
      }

      const { data, error } = await supabase
        .from('properties')
        .insert({
          user_id: user.id,
          organization_id: organizationId || null,
          name: normalized.name,
          property_type: normalized.property_type,
          status: normalized.status,
          address_street: normalized.address_street || null,
          address_number: normalized.address_number || null,
          address_complement: normalized.address_complement || null,
          address_neighborhood: normalized.address_neighborhood || null,
          address_city: normalized.address_city || null,
          address_state: normalized.address_state || null,
          address_zip: normalized.address_zip || null,
          property_value: normalized.property_value || 0,
          monthly_revenue: normalized.monthly_revenue || 0,
          occupancy_rate: Math.min(100, Math.max(0, normalized.occupancy_rate || 0)),
          acquisition_date: normalized.acquisition_date || null,
          condominium_fee: normalized.condominium_fee || 0,
          iptu_fee: normalized.iptu_fee || 0,
          maintenance_fee: normalized.maintenance_fee || 0,
          other_costs: normalized.other_costs || 0,
          area_sqm: normalized.area_sqm || null,
          bedrooms: normalized.bedrooms || 0,
          bathrooms: normalized.bathrooms || 0,
          parking_spots: normalized.parking_spots || 0,
          suites: normalized.suites || 0,
          has_pool: normalized.has_pool || false,
          has_gym: normalized.has_gym || false,
          has_elevator: normalized.has_elevator || false,
          has_balcony: normalized.has_balcony || false,
          has_barbecue: normalized.has_barbecue || false,
          is_furnished: normalized.is_furnished || false,
          floor_number: normalized.floor_number,
          year_built: normalized.year_built,
          description: normalized.description || null,
          other_amenities: normalized.other_amenities || null,
          photo_url: normalized.photo_url || null,
          link_instagram: normalized.link_instagram || null,
          link_facebook: normalized.link_facebook || null,
          link_airbnb: normalized.link_airbnb || null,
          link_booking: normalized.link_booking || null,
          link_website: normalized.link_website || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Imóvel criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar imóvel', { description: error.message });
    },
  });

  const updateProperty = useMutation({
    mutationFn: async ({ id, ...formData }: PropertyFormData & { id: string }) => {
      const normalized = validateAndNormalizePropertyFormData(formData);

      const rateLimitResult = await checkRateLimit(RATE_LIMITS.UPDATE_PROPERTY);
      if (!rateLimitResult.allowed) {
        throw new Error('Muitas requisições. Aguarde um momento.');
      }

      const nameExists = await checkNameExists(normalized.name, id);
      if (nameExists) {
        throw new Error('Já existe um imóvel com este nome');
      }

      const { data, error } = await supabase
        .from('properties')
        .update({
          name: normalized.name,
          property_type: normalized.property_type,
          status: normalized.status,
          address_street: normalized.address_street || null,
          address_number: normalized.address_number || null,
          address_complement: normalized.address_complement || null,
          address_neighborhood: normalized.address_neighborhood || null,
          address_city: normalized.address_city || null,
          address_state: normalized.address_state || null,
          address_zip: normalized.address_zip || null,
          property_value: normalized.property_value || 0,
          monthly_revenue: normalized.monthly_revenue || 0,
          occupancy_rate: Math.min(100, Math.max(0, normalized.occupancy_rate || 0)),
          acquisition_date: normalized.acquisition_date || null,
          condominium_fee: normalized.condominium_fee || 0,
          iptu_fee: normalized.iptu_fee || 0,
          maintenance_fee: normalized.maintenance_fee || 0,
          other_costs: normalized.other_costs || 0,
          area_sqm: normalized.area_sqm || null,
          bedrooms: normalized.bedrooms || 0,
          bathrooms: normalized.bathrooms || 0,
          parking_spots: normalized.parking_spots || 0,
          suites: normalized.suites || 0,
          has_pool: normalized.has_pool || false,
          has_gym: normalized.has_gym || false,
          has_elevator: normalized.has_elevator || false,
          has_balcony: normalized.has_balcony || false,
          has_barbecue: normalized.has_barbecue || false,
          is_furnished: normalized.is_furnished || false,
          floor_number: normalized.floor_number,
          year_built: normalized.year_built,
          description: normalized.description || null,
          other_amenities: normalized.other_amenities || null,
          photo_url: normalized.photo_url || null,
          link_instagram: normalized.link_instagram || null,
          link_facebook: normalized.link_facebook || null,
          link_airbnb: normalized.link_airbnb || null,
          link_booking: normalized.link_booking || null,
          link_website: normalized.link_website || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Imóvel atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar imóvel', { description: error.message });
    },
  });

  const deleteProperty = useMutation({
    mutationFn: async (id: string) => {
      const rateLimitResult = await checkRateLimit(RATE_LIMITS.DELETE_PROPERTY);
      if (!rateLimitResult.allowed) {
        throw new Error('Muitas requisições. Aguarde um momento.');
      }

      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Imóvel excluído com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir imóvel', { description: error.message });
    },
  });

  const archiveProperty = useMutation({
    mutationFn: async ({ id, isArchived }: { id: string; isArchived: boolean }) => {
      const { error } = await supabase
        .from('properties')
        .update({ is_archived: isArchived })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success(variables.isArchived ? 'Imóvel arquivado!' : 'Imóvel desarquivado!');
    },
    onError: (error) => {
      toast.error('Erro ao arquivar imóvel', { description: error.message });
    },
  });

  const duplicateProperty = useMutation({
    mutationFn: async ({ property, canAdd }: { property: Property; canAdd: boolean }) => {
      if (!user) throw new Error('Usuário não autenticado');

      if (!canAdd) {
        throw new Error('Limite de imóveis atingido. Faça upgrade do seu plano para adicionar mais imóveis.');
      }

      let copyName = `${property.name} (Cópia)`;
      let copyNumber = 1;
      while (await checkNameExists(copyName)) {
        copyNumber++;
        copyName = `${property.name} (Cópia ${copyNumber})`;
      }

      const { data, error } = await supabase
        .from('properties')
        .insert({
          user_id: user.id,
          organization_id: organizationId || null,
          name: copyName,
          property_type: property.property_type,
          status: property.status,
          address_street: property.address_street,
          address_number: property.address_number,
          address_complement: property.address_complement,
          address_neighborhood: property.address_neighborhood,
          address_city: property.address_city,
          address_state: property.address_state,
          address_zip: property.address_zip,
          property_value: property.property_value,
          monthly_revenue: property.monthly_revenue,
          occupancy_rate: property.occupancy_rate,
          acquisition_date: property.acquisition_date,
          condominium_fee: property.condominium_fee,
          iptu_fee: property.iptu_fee,
          maintenance_fee: property.maintenance_fee,
          other_costs: property.other_costs,
          area_sqm: property.area_sqm,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          parking_spots: property.parking_spots,
          suites: property.suites,
          has_pool: property.has_pool,
          has_gym: property.has_gym,
          has_elevator: property.has_elevator,
          has_balcony: property.has_balcony,
          has_barbecue: property.has_barbecue,
          is_furnished: property.is_furnished,
          floor_number: property.floor_number,
          year_built: property.year_built,
          description: property.description,
          other_amenities: property.other_amenities,
          photo_url: property.photo_url,
          link_instagram: property.link_instagram,
          link_facebook: property.link_facebook,
          link_airbnb: property.link_airbnb,
          link_booking: property.link_booking,
          link_website: property.link_website,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Imóvel duplicado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao duplicar imóvel', { description: error.message });
    },
  });

  const updatePropertyPhoto = useMutation({
    mutationFn: async ({ id, photoUrl }: { id: string; photoUrl: string }) => {
      const { error } = await supabase
        .from('properties')
        .update({ photo_url: photoUrl })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
    onError: (error) => {
      toast.error('Erro ao atualizar foto', { description: error.message });
    },
  });

  const activeProperties = properties.filter(p => !p.is_archived);
  
  const totalProperties = activeProperties.length;
  const totalRevenue = activeProperties.reduce((sum, p) => sum + Number(p.monthly_revenue), 0);
  const totalCosts = activeProperties.reduce((sum, p) => 
    sum + Number(p.condominium_fee) + Number(p.iptu_fee) + Number(p.maintenance_fee) + Number(p.other_costs), 0
  );
  const netProfit = totalRevenue - totalCosts;
  
  const avgOccupancy = activeProperties.length > 0
    ? activeProperties.reduce((sum, p) => sum + Number(p.occupancy_rate), 0) / activeProperties.length
    : 0;

  const totalPropertyValue = activeProperties.reduce((sum, p) => sum + Number(p.property_value), 0);
  const avgROI = totalPropertyValue > 0
    ? ((netProfit * 12) / totalPropertyValue) * 100
    : 0;

  return {
    properties,
    activeProperties,
    isLoading,
    error,
    createProperty,
    updateProperty,
    deleteProperty,
    archiveProperty,
    duplicateProperty,
    updatePropertyPhoto,
    metrics: {
      totalProperties,
      totalRevenue,
      totalCosts,
      netProfit,
      avgOccupancy,
      avgROI,
    },
  };
}
