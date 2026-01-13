import { useNavigate } from "react-router-dom";
import { Property, PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS } from "@/types/property";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Bed, 
  Bath, 
  Car, 
  Maximize, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Percent,
  FileText,
  BarChart3,
  Home,
  Edit,
  Waves,
  Dumbbell,
  Building,
  Sofa,
  Flame,
  CheckCircle,
  XCircle,
  Images,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/PageTransition";
import { useDocuments } from "@/hooks/useDocuments";
import { usePropertyGallery } from "@/hooks/usePropertyGallery";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { DocumentViewDialog } from "@/components/documents/DocumentViewDialog";
import { useState } from "react";
import type { PropertyDocument } from "@/types/property";

interface PropertyDetailsProps {
  property: Property;
  onEdit: (property: Property) => void;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  matricula: "Matrícula",
  iptu: "IPTU",
  contrato: "Contrato",
  laudo: "Laudo",
  outro: "Outro",
};

export function PropertyDetails({ property, onEdit, onClose }: PropertyDetailsProps) {
  const { documents, deleteDocument, downloadDocument, viewDocument, getThumbnailUrl } = useDocuments();
  const { images: galleryImages, isLoading: isLoadingGallery } = usePropertyGallery(property.id);
  const [viewDocumentData, setViewDocumentData] = useState<PropertyDocument | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const totalCosts =
    Number(property.condominium_fee || 0) +
    Number(property.iptu_fee || 0) +
    Number(property.maintenance_fee || 0) +
    Number(property.other_costs || 0);
  const profit = Number(property.monthly_revenue || 0) - totalCosts;
  const roi = property.property_value
    ? ((profit * 12) / Number(property.property_value)) * 100
    : 0;

  const propertyDocuments = documents?.filter((d) => d.property_id === property.id) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "alugado": return "bg-success/10 text-success border-success/20";
      case "vago": return "bg-warning/10 text-warning border-warning/20";
      case "em_reforma": return "bg-info/10 text-info border-info/20";
      case "a_venda": return "bg-primary/10 text-primary border-primary/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPerformanceIcon = (performance: string | null) => {
    switch (performance) {
      case "alta": return <TrendingUp className="h-4 w-4" />;
      case "baixa": return <TrendingDown className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  const getPerformanceColor = (performance: string | null) => {
    switch (performance) {
      case "alta": return "text-success";
      case "baixa": return "text-destructive";
      default: return "text-warning";
    }
  };

  const fullAddress = [
    property.address_street,
    property.address_number,
    property.address_complement,
    property.address_neighborhood,
    property.address_city,
    property.address_state,
    property.address_zip,
  ].filter(Boolean).join(", ");

  const handleViewDocument = (doc: PropertyDocument) => {
    setViewDocumentData(doc);
  };

  const handleGetSignedUrl = async (doc: PropertyDocument): Promise<string | null> => {
    return await viewDocument(doc);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{property.name}</h1>
              <p className="text-muted-foreground">{PROPERTY_TYPE_LABELS[property.property_type]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("border", getStatusColor(property.status))}>
              {PROPERTY_STATUS_LABELS[property.status]}
            </Badge>
            <Button onClick={() => onEdit(property)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
          {property.photo_url ? (
            <img
              src={property.photo_url}
              alt={property.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="h-24 w-24 text-primary/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            {fullAddress && (
              <p className="text-foreground flex items-center gap-2 text-sm md:text-base">
                <MapPin className="h-4 w-4 shrink-0" />
                {fullAddress}
              </p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="w-full justify-start bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="info" className="gap-2 rounded-lg">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Informações</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="gap-2 rounded-lg">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Financeiro</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2 rounded-lg">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Documentos</span>
              {propertyDocuments.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {propertyDocuments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2 rounded-lg">
              <Images className="h-4 w-4" />
              <span className="hidden sm:inline">Galeria</span>
              {galleryImages.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {galleryImages.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="metrics" className="gap-2 rounded-lg">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Métricas</span>
            </TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Características</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  {property.area_sqm && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Maximize className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Área</p>
                        <p className="font-medium">{property.area_sqm} m²</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Bed className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Quartos</p>
                      <p className="font-medium">{property.bedrooms || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Bath className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Banheiros</p>
                      <p className="font-medium">{property.bathrooms || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Car className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Vagas</p>
                      <p className="font-medium">{property.parking_spots || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comodidades */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Comodidades</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  {[
                    { label: 'Piscina', value: property.has_pool, icon: Waves },
                    { label: 'Academia', value: property.has_gym, icon: Dumbbell },
                    { label: 'Elevador', value: property.has_elevator, icon: Building },
                    { label: 'Varanda', value: property.has_balcony, icon: Home },
                    { label: 'Churrasqueira', value: property.has_barbecue, icon: Flame },
                    { label: 'Mobiliado', value: property.is_furnished, icon: Sofa },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${item.value ? 'bg-success/10' : 'bg-muted'}`}>
                        <item.icon className={`h-4 w-4 ${item.value ? 'text-success' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{item.label}</span>
                        {item.value ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detalhes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data de Aquisição</p>
                      <p className="font-medium">{formatDate(property.acquisition_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor do Imóvel</p>
                      <p className="font-medium">{formatCurrency(Number(property.property_value || 0))}</p>
                    </div>
                  </div>
                  {property.description && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Descrição</p>
                      <p className="text-sm">{property.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="mt-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-success/20 bg-success/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Receita Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-success">
                    {formatCurrency(Number(property.monthly_revenue || 0))}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-destructive/20 bg-destructive/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Custos Mensais</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-destructive">{formatCurrency(totalCosts)}</p>
                </CardContent>
              </Card>

              <Card className={cn(
                "border-2",
                profit >= 0 ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"
              )}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Lucro Líquido</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={cn("text-2xl font-bold", profit >= 0 ? "text-success" : "text-destructive")}>
                    {formatCurrency(profit)}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Detalhamento de Custos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Condomínio", value: Number(property.condominium_fee || 0) },
                    { label: "IPTU", value: Number(property.iptu_fee || 0) },
                    { label: "Manutenção", value: Number(property.maintenance_fee || 0) },
                    { label: "Outros", value: Number(property.other_costs || 0) },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-4 flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg">{formatCurrency(totalCosts)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="mt-6">
            {propertyDocuments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum documento</h3>
                  <p className="text-muted-foreground text-sm">
                    Este imóvel não possui documentos cadastrados.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {propertyDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onView={() => handleViewDocument(doc)}
                    onDownload={() => downloadDocument(doc)}
                    onDelete={() => deleteDocument.mutate(doc)}
                    getThumbnailUrl={getThumbnailUrl}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="mt-6">
            {isLoadingGallery ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </CardContent>
              </Card>
            ) : galleryImages.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Images className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma foto na galeria</h3>
                  <p className="text-muted-foreground text-sm">
                    Este imóvel não possui fotos adicionais na galeria.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages.map((image, index) => (
                  <div
                    key={image.id}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={image.image_url}
                      alt={image.caption || `Foto ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <Maximize className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                        <p className="text-white text-xs truncate">{image.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Taxa de Ocupação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">{property.occupancy_rate || 0}%</span>
                    <Percent className="h-8 w-8 text-primary/50" />
                  </div>
                  <Progress value={property.occupancy_rate || 0} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    Porcentagem de ocupação ao longo do período
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ROI Anual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={cn("text-3xl font-bold", roi >= 0 ? "text-success" : "text-destructive")}>
                      {roi.toFixed(2)}%
                    </span>
                    <TrendingUp className={cn("h-8 w-8", roi >= 0 ? "text-success/50" : "text-destructive/50")} />
                  </div>
                  <Progress 
                    value={Math.min(Math.abs(roi), 100)} 
                    className={cn("h-3", roi < 0 && "[&>div]:bg-destructive")} 
                  />
                  <p className="text-sm text-muted-foreground">
                    Retorno sobre investimento anualizado
                  </p>
                </CardContent>
              </Card>

            </div>
          </TabsContent>
        </Tabs>

        {/* Document View Dialog */}
        <DocumentViewDialog
          document={viewDocumentData}
          open={!!viewDocumentData}
          onOpenChange={(open) => !open && setViewDocumentData(null)}
          onDownload={downloadDocument}
          getSignedUrl={handleGetSignedUrl}
        />

        {/* Gallery Image Viewer Dialog */}
        <Dialog open={selectedImageIndex !== null} onOpenChange={(open) => !open && setSelectedImageIndex(null)}>
          <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
            {selectedImageIndex !== null && galleryImages[selectedImageIndex] && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10 text-white hover:bg-white/20"
                  onClick={() => setSelectedImageIndex(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
                
                {galleryImages.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                      onClick={() => setSelectedImageIndex((prev) => 
                        prev !== null ? (prev === 0 ? galleryImages.length - 1 : prev - 1) : null
                      )}
                    >
                      <ChevronLeft className="h-8 w-8" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                      onClick={() => setSelectedImageIndex((prev) => 
                        prev !== null ? (prev === galleryImages.length - 1 ? 0 : prev + 1) : null
                      )}
                    >
                      <ChevronRight className="h-8 w-8" />
                    </Button>
                  </>
                )}

                <img
                  src={galleryImages[selectedImageIndex].image_url}
                  alt={galleryImages[selectedImageIndex].caption || `Foto ${selectedImageIndex + 1}`}
                  className="w-full max-h-[80vh] object-contain"
                />
                
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center justify-between text-white">
                    <p className="text-sm">
                      {galleryImages[selectedImageIndex].caption || `Foto ${selectedImageIndex + 1} de ${galleryImages.length}`}
                    </p>
                    <p className="text-xs text-white/70">
                      {selectedImageIndex + 1} / {galleryImages.length}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
