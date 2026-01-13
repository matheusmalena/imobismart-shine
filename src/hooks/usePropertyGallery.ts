import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface GalleryImage {
  id: string;
  property_id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export function usePropertyGallery(propertyId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['property-gallery', propertyId],
    queryFn: async () => {
      if (!propertyId || !user) return [];
      
      const { data, error } = await supabase
        .from('property_gallery')
        .select('*')
        .eq('property_id', propertyId)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as GalleryImage[];
    },
    enabled: !!propertyId && !!user,
  });

  const uploadImage = useMutation({
    mutationFn: async ({ file, caption }: { file: File; caption?: string }) => {
      if (!user || !propertyId) throw new Error('Usuário não autenticado ou imóvel não selecionado');

      // Validate file
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Tipo de arquivo inválido. Use JPG, PNG, WebP ou GIF.');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Máximo 5MB.');
      }

      // Upload to storage
      const fileName = `${user.id}/${propertyId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('property-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('property-photos')
        .getPublicUrl(fileName);

      // Get max display_order
      const { data: maxOrderData } = await supabase
        .from('property_gallery')
        .select('display_order')
        .eq('property_id', propertyId)
        .order('display_order', { ascending: false })
        .limit(1);

      const nextOrder = maxOrderData && maxOrderData.length > 0 
        ? (maxOrderData[0].display_order || 0) + 1 
        : 0;

      // Insert into database
      const { error: insertError } = await supabase
        .from('property_gallery')
        .insert({
          property_id: propertyId,
          user_id: user.id,
          image_url: publicUrl,
          caption: caption || null,
          display_order: nextOrder,
        });

      if (insertError) throw insertError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-gallery', propertyId] });
      toast.success('Imagem adicionada à galeria!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao enviar imagem');
    },
  });

  const deleteImage = useMutation({
    mutationFn: async (imageId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Get the image to find its URL
      const image = images.find(img => img.id === imageId);
      if (!image) throw new Error('Imagem não encontrada');

      // Delete from database first
      const { error: deleteError } = await supabase
        .from('property_gallery')
        .delete()
        .eq('id', imageId);

      if (deleteError) throw deleteError;

      // Try to delete from storage (extract path from URL)
      try {
        const url = new URL(image.image_url);
        const pathMatch = url.pathname.match(/\/property-photos\/(.+)$/);
        if (pathMatch) {
          await supabase.storage
            .from('property-photos')
            .remove([decodeURIComponent(pathMatch[1])]);
        }
      } catch (e) {
        console.warn('Could not delete file from storage:', e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-gallery', propertyId] });
      toast.success('Imagem removida da galeria!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao remover imagem');
    },
  });

  const updateCaption = useMutation({
    mutationFn: async ({ imageId, caption }: { imageId: string; caption: string }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('property_gallery')
        .update({ caption })
        .eq('id', imageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-gallery', propertyId] });
      toast.success('Legenda atualizada!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar legenda');
    },
  });

  return {
    images,
    isLoading,
    uploadImage,
    deleteImage,
    updateCaption,
  };
}
