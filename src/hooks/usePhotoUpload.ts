import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function usePhotoUpload() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const uploadPhoto = async (file: File): Promise<string | null> => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
      return null;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione uma imagem',
        variant: 'destructive',
      });
      return null;
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'A imagem deve ter no máximo 5MB',
        variant: 'destructive',
      });
      return null;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('property-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('property-photos')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error: any) {
      toast({
        title: 'Erro ao fazer upload',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deletePhoto = async (photoUrl: string): Promise<boolean> => {
    try {
      // Extract path from URL
      const urlParts = photoUrl.split('/property-photos/');
      if (urlParts.length < 2) return false;

      const filePath = urlParts[1];

      const { error } = await supabase.storage
        .from('property-photos')
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir foto',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    uploadPhoto,
    deletePhoto,
    isUploading,
  };
}
