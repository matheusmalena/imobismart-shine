import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { DocumentCategory, PropertyDocument } from '@/types/property';

export function useDocuments(propertyId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents', propertyId],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as PropertyDocument[];
    },
    enabled: !!user,
  });

  const getFilePath = (fileUrl: string): string | null => {
    const urlParts = fileUrl.split('/property-documents/');
    if (urlParts.length >= 2) {
      return urlParts[1];
    }
    return null;
  };

  const getSignedUrl = async (fileUrl: string): Promise<string | null> => {
    const filePath = getFilePath(fileUrl);
    if (!filePath) return null;

    const { data, error } = await supabase.storage
      .from('property-documents')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  };

  const uploadDocument = async (
    file: File,
    propertyId: string,
    name: string,
    category: DocumentCategory
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
      return false;
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 10MB',
        variant: 'destructive',
      });
      return false;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${propertyId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('property-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Store the path pattern for later retrieval (not the public URL since bucket is private)
      const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/property-documents/${fileName}`;

      const { error: dbError } = await supabase.from('documents').insert({
        user_id: user.id,
        property_id: propertyId,
        name,
        category,
        file_url: baseUrl,
        file_type: file.type,
        file_size: file.size,
      });

      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ['documents'] });
      
      toast({
        title: 'Sucesso',
        description: 'Documento enviado com sucesso',
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar documento',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteDocument = useMutation({
    mutationFn: async (document: PropertyDocument) => {
      const filePath = getFilePath(document.file_url);
      if (filePath) {
        await supabase.storage.from('property-documents').remove([filePath]);
      }

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: 'Sucesso',
        description: 'Documento excluído com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir documento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const downloadDocument = async (document: PropertyDocument) => {
    try {
      const signedUrl = await getSignedUrl(document.file_url);
      if (!signedUrl) {
        throw new Error('Não foi possível gerar o link de download');
      }

      const response = await fetch(signedUrl);
      if (!response.ok) throw new Error('Falha ao baixar arquivo');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      
      // Get extension from file_type or URL
      let ext = '';
      if (document.file_type) {
        const parts = document.file_type.split('/');
        ext = parts[1] || '';
      }
      a.download = ext ? `${document.name}.${ext}` : document.name;
      
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error: any) {
      toast({
        title: 'Erro ao baixar documento',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const viewDocument = async (document: PropertyDocument): Promise<string | null> => {
    return await getSignedUrl(document.file_url);
  };

  const getThumbnailUrl = async (fileUrl: string): Promise<string | null> => {
    return await getSignedUrl(fileUrl);
  };

  return {
    documents,
    isLoading,
    isUploading,
    uploadDocument,
    deleteDocument,
    downloadDocument,
    viewDocument,
    getThumbnailUrl,
  };
}
