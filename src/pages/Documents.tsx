import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProperties } from '@/hooks/useProperties';
import { useDocuments } from '@/hooks/useDocuments';
import { useOrgPermissions } from '@/hooks/useOrgPermissions';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { DocumentUploadDialog } from '@/components/documents/DocumentUploadDialog';
import { DocumentViewDialog } from '@/components/documents/DocumentViewDialog';
import { DeleteDocumentDialog } from '@/components/documents/DeleteDocumentDialog';
import { FileText, Search, Upload, Building2 } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import type { PropertyDocument, DocumentCategory } from '@/types/property';

export default function Documents() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { properties, activeProperties, isLoading: propertiesLoading } = useProperties();
  const { documents, isLoading: documentsLoading, isUploading, uploadDocument, deleteDocument, downloadDocument, viewDocument: getDocumentSignedUrl, getThumbnailUrl } = useDocuments();
  const { canCreate, canDelete } = useOrgPermissions();

  const [searchQuery, setSearchQuery] = useState('');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [viewDocumentData, setViewDocumentData] = useState<PropertyDocument | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<PropertyDocument | null>(null);

  // TEMPORÁRIO: Desabilitado para screenshots
  // useEffect(() => {
  //   if (!authLoading && !user) {
  //     navigate('/auth');
  //   }
  // }, [user, authLoading, navigate]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      if (propertyFilter !== 'all' && doc.property_id !== propertyFilter) return false;
      if (categoryFilter !== 'all' && doc.category !== categoryFilter) return false;
      if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [documents, propertyFilter, categoryFilter, searchQuery]);

  const getPropertyName = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    return property?.name || 'Imóvel desconhecido';
  };

  const handleUploadClick = (propertyId?: string) => {
    if (propertyId) {
      setSelectedPropertyId(propertyId);
    } else if (activeProperties.length > 0) {
      setSelectedPropertyId(activeProperties[0].id);
    }
    setUploadDialogOpen(true);
  };

  const handleUpload = async (file: File, propertyId: string, name: string, category: DocumentCategory) => {
    return await uploadDocument(file, propertyId, name, category);
  };

  const handleDeleteConfirm = () => {
    if (deleteDoc) {
      deleteDocument.mutate(deleteDoc);
      setDeleteDoc(null);
    }
  };

  const isPageLoading = authLoading || propertiesLoading;

  return (
    <DashboardLayout>
      <PageTransition>
      {isPageLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Documentos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os documentos dos seus imóveis
            </p>
          </div>
          {canCreate && (
            <Button
              className="gap-2"
              onClick={() => handleUploadClick()}
              disabled={!hasProperties}
            >
              <Upload className="h-4 w-4" />
              Upload de Documento
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar documentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger className="w-[200px]">
                <Building2 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por imóvel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os imóveis</SelectItem>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                <SelectItem value="matricula">Matrícula</SelectItem>
                <SelectItem value="iptu">IPTU</SelectItem>
                <SelectItem value="contrato">Contrato</SelectItem>
                <SelectItem value="laudo">Laudo</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Documents List */}
        {documentsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : filteredDocuments.length > 0 ? (
          <div className="space-y-6">
            {/* Group by property */}
            {properties
              .filter((p) => propertyFilter === 'all' || p.id === propertyFilter)
              .map((property) => {
                const propertyDocs = filteredDocuments.filter((d) => d.property_id === property.id);
                if (propertyDocs.length === 0) return null;

                return (
                  <div key={property.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        {property.name}
                      </h3>
                      {canCreate && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUploadClick(property.id)}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Adicionar
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {propertyDocs.map((doc) => (
                        <DocumentCard
                          key={doc.id}
                          document={doc}
                          onView={setViewDocumentData}
                          onDownload={downloadDocument}
                          onDelete={canDelete ? setDeleteDoc : undefined}
                          getThumbnailUrl={getThumbnailUrl}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="bg-card rounded-xl p-12 shadow-card border border-border/50 flex flex-col items-center justify-center">
            <div className="p-6 rounded-lg bg-primary/10 mb-6">
              <FileText className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {!hasProperties ? 'Cadastre um imóvel primeiro' : 'Nenhum documento encontrado'}
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {!hasProperties
                ? 'Para adicionar documentos, você precisa primeiro cadastrar um imóvel.'
                : 'Faça upload de documentos como matrículas, contratos, laudos e comprovantes de IPTU para manter tudo organizado.'}
            </p>
            {hasProperties && (
              <Button className="gap-2" onClick={() => handleUploadClick()}>
                <Upload className="h-4 w-4" />
                Upload de Documento
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        properties={activeProperties}
        initialPropertyId={selectedPropertyId}
        onUpload={handleUpload}
        isUploading={isUploading}
      />

      {/* View Dialog */}
      <DocumentViewDialog
        document={viewDocumentData}
        open={!!viewDocumentData}
        onOpenChange={(open) => !open && setViewDocumentData(null)}
        onDownload={downloadDocument}
        getSignedUrl={getDocumentSignedUrl}
      />

      {/* Delete Dialog */}
      <DeleteDocumentDialog
        document={deleteDoc}
        open={!!deleteDoc}
        onOpenChange={(open) => !open && setDeleteDoc(null)}
        onConfirm={handleDeleteConfirm}
      />
      )}
      </PageTransition>
    </DashboardLayout>
  );
}
