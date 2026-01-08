import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Property, PropertyFormData } from '@/types/property';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useProperties() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // TEMPORÁRIO: Mock data para screenshots
  const mockProperties: Property[] = [
    {
      id: '1',
      user_id: 'mock',
      name: 'Apartamento Jardins',
      property_type: 'apartamento',
      status: 'alugado',
      performance: 'alta',
      address_city: 'São Paulo',
      address_neighborhood: 'Jardins',
      address_state: 'SP',
      property_value: 850000,
      monthly_revenue: 4500,
      occupancy_rate: 100,
      condominium_fee: 800,
      iptu_fee: 350,
      maintenance_fee: 150,
      other_costs: 0,
      area_sqm: 85,
      bedrooms: 2,
      bathrooms: 2,
      parking_spots: 1,
      created_at: '2024-01-15',
      updated_at: '2024-01-15',
      is_archived: false,
      photo_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400',
      address_street: null,
      address_number: null,
      address_complement: null,
      address_zip: null,
      acquisition_date: null,
      description: null,
    },
    {
      id: '2',
      user_id: 'mock',
      name: 'Casa Alphaville',
      property_type: 'casa',
      status: 'alugado',
      performance: 'alta',
      address_city: 'Barueri',
      address_neighborhood: 'Alphaville',
      address_state: 'SP',
      property_value: 1200000,
      monthly_revenue: 6500,
      occupancy_rate: 100,
      condominium_fee: 1200,
      iptu_fee: 500,
      maintenance_fee: 300,
      other_costs: 100,
      area_sqm: 180,
      bedrooms: 4,
      bathrooms: 3,
      parking_spots: 2,
      created_at: '2023-08-20',
      updated_at: '2024-01-10',
      is_archived: false,
      photo_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
      address_street: null,
      address_number: null,
      address_complement: null,
      address_zip: null,
      acquisition_date: null,
      description: null,
    },
    {
      id: '3',
      user_id: 'mock',
      name: 'Sala Comercial Faria Lima',
      property_type: 'sala',
      status: 'alugado',
      performance: 'media',
      address_city: 'São Paulo',
      address_neighborhood: 'Itaim Bibi',
      address_state: 'SP',
      property_value: 650000,
      monthly_revenue: 3800,
      occupancy_rate: 100,
      condominium_fee: 600,
      iptu_fee: 280,
      maintenance_fee: 100,
      other_costs: 50,
      area_sqm: 45,
      bedrooms: 0,
      bathrooms: 1,
      parking_spots: 1,
      created_at: '2023-05-10',
      updated_at: '2024-01-05',
      is_archived: false,
      photo_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
      address_street: null,
      address_number: null,
      address_complement: null,
      address_zip: null,
      acquisition_date: null,
      description: null,
    },
    {
      id: '4',
      user_id: 'mock',
      name: 'Apartamento Moema',
      property_type: 'apartamento',
      status: 'vago',
      performance: 'baixa',
      address_city: 'São Paulo',
      address_neighborhood: 'Moema',
      address_state: 'SP',
      property_value: 720000,
      monthly_revenue: 0,
      occupancy_rate: 0,
      condominium_fee: 900,
      iptu_fee: 320,
      maintenance_fee: 200,
      other_costs: 0,
      area_sqm: 72,
      bedrooms: 2,
      bathrooms: 2,
      parking_spots: 1,
      created_at: '2024-02-01',
      updated_at: '2024-02-01',
      is_archived: false,
      photo_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
      address_street: null,
      address_number: null,
      address_complement: null,
      address_zip: null,
      acquisition_date: null,
      description: null,
    },
    {
      id: '5',
      user_id: 'mock',
      name: 'Loja Shopping Center',
      property_type: 'loja',
      status: 'alugado',
      performance: 'alta',
      address_city: 'São Paulo',
      address_neighborhood: 'Pinheiros',
      address_state: 'SP',
      property_value: 980000,
      monthly_revenue: 8500,
      occupancy_rate: 100,
      condominium_fee: 1500,
      iptu_fee: 450,
      maintenance_fee: 200,
      other_costs: 150,
      area_sqm: 60,
      bedrooms: 0,
      bathrooms: 1,
      parking_spots: 0,
      created_at: '2022-11-15',
      updated_at: '2024-01-08',
      is_archived: false,
      photo_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
      address_street: null,
      address_number: null,
      address_complement: null,
      address_zip: null,
      acquisition_date: null,
      description: null,
    },
  ];

  // TEMPORÁRIO: Retorna mock data em vez de fazer query
  const { data: properties = mockProperties, isLoading, error } = useQuery({
    queryKey: ['properties', user?.id],
    queryFn: async () => {
      // Retorna mock para screenshots
      return mockProperties;
    },
    enabled: true, // Sempre habilitado para screenshots
  });

  const createProperty = useMutation({
    mutationFn: async (formData: PropertyFormData) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('properties')
        .insert({
          user_id: user.id,
          name: formData.name,
          property_type: formData.property_type,
          status: formData.status,
          performance: formData.performance,
          address_street: formData.address_street || null,
          address_number: formData.address_number || null,
          address_complement: formData.address_complement || null,
          address_neighborhood: formData.address_neighborhood || null,
          address_city: formData.address_city || null,
          address_state: formData.address_state || null,
          address_zip: formData.address_zip || null,
          property_value: formData.property_value || 0,
          monthly_revenue: formData.monthly_revenue || 0,
          occupancy_rate: formData.occupancy_rate || 0,
          acquisition_date: formData.acquisition_date || null,
          condominium_fee: formData.condominium_fee || 0,
          iptu_fee: formData.iptu_fee || 0,
          maintenance_fee: formData.maintenance_fee || 0,
          other_costs: formData.other_costs || 0,
          area_sqm: formData.area_sqm || null,
          bedrooms: formData.bedrooms || 0,
          bathrooms: formData.bathrooms || 0,
          parking_spots: formData.parking_spots || 0,
          description: formData.description || null,
          photo_url: formData.photo_url || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({ title: 'Imóvel criado com sucesso!' });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar imóvel',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateProperty = useMutation({
    mutationFn: async ({ id, ...formData }: PropertyFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('properties')
        .update({
          name: formData.name,
          property_type: formData.property_type,
          status: formData.status,
          performance: formData.performance,
          address_street: formData.address_street || null,
          address_number: formData.address_number || null,
          address_complement: formData.address_complement || null,
          address_neighborhood: formData.address_neighborhood || null,
          address_city: formData.address_city || null,
          address_state: formData.address_state || null,
          address_zip: formData.address_zip || null,
          property_value: formData.property_value || 0,
          monthly_revenue: formData.monthly_revenue || 0,
          occupancy_rate: formData.occupancy_rate || 0,
          acquisition_date: formData.acquisition_date || null,
          condominium_fee: formData.condominium_fee || 0,
          iptu_fee: formData.iptu_fee || 0,
          maintenance_fee: formData.maintenance_fee || 0,
          other_costs: formData.other_costs || 0,
          area_sqm: formData.area_sqm || null,
          bedrooms: formData.bedrooms || 0,
          bathrooms: formData.bathrooms || 0,
          parking_spots: formData.parking_spots || 0,
          description: formData.description || null,
          photo_url: formData.photo_url || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({ title: 'Imóvel atualizado com sucesso!' });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar imóvel',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteProperty = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({ title: 'Imóvel excluído com sucesso!' });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir imóvel',
        description: error.message,
        variant: 'destructive',
      });
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
      toast({
        title: variables.isArchived ? 'Imóvel arquivado!' : 'Imóvel desarquivado!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao arquivar imóvel',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const duplicateProperty = useMutation({
    mutationFn: async (property: Property) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('properties')
        .insert({
          user_id: user.id,
          name: `${property.name} (Cópia)`,
          property_type: property.property_type,
          status: property.status,
          performance: property.performance,
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
          description: property.description,
          photo_url: property.photo_url,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({ title: 'Imóvel duplicado com sucesso!' });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao duplicar imóvel',
        description: error.message,
        variant: 'destructive',
      });
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
      toast({
        title: 'Erro ao atualizar foto',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Calculate metrics
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
