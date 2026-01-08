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

  // TEMPORÁRIO: Mock data para screenshots
  const mockDocuments: PropertyDocument[] = [
    {
      id: 'doc1',
      user_id: 'mock',
      property_id: '1',
      name: 'Contrato de Locação',
      category: 'contrato',
      file_url: 'https://example.com/contrato.pdf',
      file_type: 'application/pdf',
      file_size: 245000,
      created_at: '2024-01-15',
      updated_at: '2024-01-15',
    },
    {
      id: 'doc2',
      user_id: 'mock',
      property_id: '1',
      name: 'Matrícula do Imóvel',
      category: 'matricula',
      file_url: 'https://example.com/matricula.pdf',
      file_type: 'application/pdf',
      file_size: 180000,
      created_at: '2024-01-10',
      updated_at: '2024-01-10',
    },
    {
      id: 'doc3',
      user_id: 'mock',
      property_id: '2',
      name: 'IPTU 2024',
      category: 'iptu',
      file_url: 'https://example.com/iptu.pdf',
      file_type: 'application/pdf',
      file_size: 120000,
      created_at: '2024-02-01',
      updated_at: '2024-02-01',
    },
    {
      id: 'doc4',
      user_id: 'mock',
      property_id: '2',
      name: 'Laudo de Vistoria',
      category: 'laudo',
      file_url: 'https://example.com/laudo.pdf',
      file_type: 'application/pdf',
      file_size: 350000,
      created_at: '2023-12-20',
      updated_at: '2023-12-20',
    },
    {
      id: 'doc5',
      user_id: 'mock',
      property_id: '3',
      name: 'Contrato Comercial',
      category: 'contrato',
      file_url: 'https://example.com/contrato2.pdf',
      file_type: 'application/pdf',
      file_size: 290000,
      created_at: '2023-11-15',
      updated_at: '2023-11-15',
    },
    {
      id: 'doc6',
      user_id: 'mock',
      property_id: '5',
      name: 'Contrato de Aluguel Loja',
      category: 'contrato',
      file_url: 'https://example.com/contrato3.pdf',
      file_type: 'application/pdf',
      file_size: 310000,
      created_at: '2023-10-05',
      updated_at: '2023-10-05',
    },
  ];

  const { data: documents = mockDocuments, isLoading } = useQuery({
    queryKey: ['documents', propertyId],
    queryFn: async () => {
      // Retorna mock para screenshots
      return mockDocuments;
    },
    enabled: true,
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
