import { useState, useEffect, useCallback } from 'react';
import { Property, PropertyFormData, PropertyType, PropertyStatus, PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS } from '@/types/property';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Loader2, Search } from 'lucide-react';
import { PhotoUpload } from './PhotoUpload';
import { PropertyGallery } from './PropertyGallery';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { formatCEP, formatCurrencyInput, parseCurrency, fetchAddressByCEP } from '@/utils/formatters';
import { toast } from 'sonner';

interface PropertyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: Property | null;
  onSubmit: (data: PropertyFormData) => void;
  isLoading?: boolean;
}

const defaultFormData: PropertyFormData = {
  name: '',
  property_type: 'apartamento',
  status: 'vago',
  address_street: '',
  address_number: '',
  address_complement: '',
  address_neighborhood: '',
  address_city: '',
  address_state: '',
  address_zip: '',
  property_value: 0,
  monthly_revenue: 0,
  occupancy_rate: 0,
  acquisition_date: '',
  condominium_fee: 0,
  iptu_fee: 0,
  maintenance_fee: 0,
  other_costs: 0,
  area_sqm: 0,
  bedrooms: 0,
  bathrooms: 0,
  parking_spots: 0,
  suites: 0,
  has_pool: false,
  has_gym: false,
  has_elevator: false,
  has_balcony: false,
  has_barbecue: false,
  is_furnished: false,
  floor_number: null,
  year_built: null,
  description: '',
  other_amenities: '',
  photo_url: null,
};

export function PropertyForm({ open, onOpenChange, property, onSubmit, isLoading }: PropertyFormProps) {
  const { uploadPhoto, isUploading } = usePhotoUpload();
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isSearchingCEP, setIsSearchingCEP] = useState(false);
  
  const [formData, setFormData] = useState<PropertyFormData>(defaultFormData);
  
  // Currency display values
  const [currencyDisplay, setCurrencyDisplay] = useState({
    property_value: '',
    monthly_revenue: '',
    condominium_fee: '',
    iptu_fee: '',
    maintenance_fee: '',
    other_costs: '',
  });

  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name,
        property_type: property.property_type,
        status: property.status,
        address_street: property.address_street || '',
        address_number: property.address_number || '',
        address_complement: property.address_complement || '',
        address_neighborhood: property.address_neighborhood || '',
        address_city: property.address_city || '',
        address_state: property.address_state || '',
        address_zip: property.address_zip || '',
        property_value: Number(property.property_value) || 0,
        monthly_revenue: Number(property.monthly_revenue) || 0,
        occupancy_rate: Number(property.occupancy_rate) || 0,
        acquisition_date: property.acquisition_date || '',
        condominium_fee: Number(property.condominium_fee) || 0,
        iptu_fee: Number(property.iptu_fee) || 0,
        maintenance_fee: Number(property.maintenance_fee) || 0,
        other_costs: Number(property.other_costs) || 0,
        area_sqm: Number(property.area_sqm) || 0,
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        parking_spots: property.parking_spots || 0,
        suites: property.suites || 0,
        has_pool: property.has_pool || false,
        has_gym: property.has_gym || false,
        has_elevator: property.has_elevator || false,
        has_balcony: property.has_balcony || false,
        has_barbecue: property.has_barbecue || false,
        is_furnished: property.is_furnished || false,
        floor_number: property.floor_number,
        year_built: property.year_built,
        description: property.description || '',
        other_amenities: property.other_amenities || '',
        photo_url: property.photo_url || null,
      });
      // Set currency display values
      setCurrencyDisplay({
        property_value: Number(property.property_value) > 0 ? formatCurrencyInput((Number(property.property_value) * 100).toString()) : '',
        monthly_revenue: Number(property.monthly_revenue) > 0 ? formatCurrencyInput((Number(property.monthly_revenue) * 100).toString()) : '',
        condominium_fee: Number(property.condominium_fee) > 0 ? formatCurrencyInput((Number(property.condominium_fee) * 100).toString()) : '',
        iptu_fee: Number(property.iptu_fee) > 0 ? formatCurrencyInput((Number(property.iptu_fee) * 100).toString()) : '',
        maintenance_fee: Number(property.maintenance_fee) > 0 ? formatCurrencyInput((Number(property.maintenance_fee) * 100).toString()) : '',
        other_costs: Number(property.other_costs) > 0 ? formatCurrencyInput((Number(property.other_costs) * 100).toString()) : '',
      });
    } else {
      setFormData(defaultFormData);
      setCurrencyDisplay({
        property_value: '',
        monthly_revenue: '',
        condominium_fee: '',
        iptu_fee: '',
        maintenance_fee: '',
        other_costs: '',
      });
    }
    setPendingFile(null);
  }, [property, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let photoUrl = formData.photo_url;
    
    // Upload new photo if selected
    if (pendingFile) {
      const uploadedUrl = await uploadPhoto(pendingFile);
      if (uploadedUrl) {
        photoUrl = uploadedUrl;
      }
    }
    
    // Clamp occupancy_rate between 0 and 100
    const clampedOccupancy = Math.min(100, Math.max(0, formData.occupancy_rate));
    
    onSubmit({ ...formData, occupancy_rate: clampedOccupancy, photo_url: photoUrl });
  };

  const updateField = <K extends keyof PropertyFormData>(field: K, value: PropertyFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    updateField('address_zip', formatted);
  };

  const handleSearchCEP = useCallback(async () => {
    const cleanCEP = formData.address_zip.replace(/\D/g, '');
    if (cleanCEP.length !== 8) {
      toast.error('CEP inválido. Informe 8 dígitos.');
      return;
    }
    
    setIsSearchingCEP(true);
    const address = await fetchAddressByCEP(formData.address_zip);
    setIsSearchingCEP(false);
    
    if (address) {
      setFormData(prev => ({
        ...prev,
        address_street: address.logradouro || prev.address_street,
        address_neighborhood: address.bairro || prev.address_neighborhood,
        address_city: address.localidade || prev.address_city,
        address_state: address.uf || prev.address_state,
        address_complement: address.complemento || prev.address_complement,
      }));
      toast.success('Endereço preenchido automaticamente!');
    } else {
      toast.error('CEP não encontrado.');
    }
  }, [formData.address_zip]);

  const handleCurrencyChange = (field: keyof typeof currencyDisplay) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setCurrencyDisplay(prev => ({ ...prev, [field]: formatted }));
    updateField(field as keyof PropertyFormData, parseCurrency(formatted));
  };

  const handleOccupancyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    updateField('occupancy_rate', Math.min(100, Math.max(0, value)));
  };

  const handlePhotoChange = (url: string | null) => {
    setFormData(prev => ({ ...prev, photo_url: url }));
    if (!url) setPendingFile(null);
  };

  const handleFileSelect = (file: File) => {
    setPendingFile(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {property ? 'Editar Imóvel' : 'Novo Imóvel'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="address">Endereço</TabsTrigger>
              <TabsTrigger value="financial">Financeiro</TabsTrigger>
              <TabsTrigger value="features">Características</TabsTrigger>
              <TabsTrigger value="gallery">Galeria</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              {/* Photo Upload */}
              <PhotoUpload
                currentPhotoUrl={formData.photo_url}
                onPhotoChange={handlePhotoChange}
                onFileSelect={handleFileSelect}
                isUploading={isUploading}
              />

              <div className="space-y-2">
                <Label htmlFor="name">Nome do Imóvel *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Ex: Apartamento Centro"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={formData.property_type}
                    onValueChange={(value) => updateField('property_type', value as PropertyType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => updateField('status', value as PropertyStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PROPERTY_STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Descrição do imóvel..."
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="address" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="street">Rua</Label>
                  <Input
                    id="street"
                    value={formData.address_street}
                    onChange={(e) => updateField('address_street', e.target.value)}
                    placeholder="Rua, Avenida..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={formData.address_number}
                    onChange={(e) => updateField('address_number', e.target.value)}
                    placeholder="123"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={formData.address_complement}
                    onChange={(e) => updateField('address_complement', e.target.value)}
                    placeholder="Apt, Bloco..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={formData.address_neighborhood}
                    onChange={(e) => updateField('address_neighborhood', e.target.value)}
                    placeholder="Centro"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.address_city}
                    onChange={(e) => updateField('address_city', e.target.value)}
                    placeholder="São Paulo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.address_state}
                    onChange={(e) => updateField('address_state', e.target.value)}
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">CEP</Label>
                  <div className="flex gap-2">
                    <Input
                      id="zip"
                      value={formData.address_zip}
                      onChange={handleCEPChange}
                      placeholder="00000-000"
                      maxLength={9}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={handleSearchCEP}
                      disabled={isSearchingCEP}
                    >
                      {isSearchingCEP ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property_value">Valor do Imóvel (R$)</Label>
                  <Input
                    id="property_value"
                    value={currencyDisplay.property_value}
                    onChange={handleCurrencyChange('property_value')}
                    placeholder="500.000,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthly_revenue">Receita Mensal (R$)</Label>
                  <Input
                    id="monthly_revenue"
                    value={currencyDisplay.monthly_revenue}
                    onChange={handleCurrencyChange('monthly_revenue')}
                    placeholder="3.000,00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="occupancy_rate">Taxa de Ocupação (0-100%)</Label>
                  <Input
                    id="occupancy_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.occupancy_rate || ''}
                    onChange={handleOccupancyChange}
                    placeholder="95"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acquisition_date">Data de Aquisição</Label>
                  <Input
                    id="acquisition_date"
                    type="date"
                    value={formData.acquisition_date}
                    onChange={(e) => updateField('acquisition_date', e.target.value)}
                  />
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="font-medium text-card-foreground mb-3">Custos Mensais</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="condominium_fee">Condomínio (R$)</Label>
                    <Input
                      id="condominium_fee"
                      value={currencyDisplay.condominium_fee}
                      onChange={handleCurrencyChange('condominium_fee')}
                      placeholder="500,00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="iptu_fee">IPTU (R$)</Label>
                    <Input
                      id="iptu_fee"
                      value={currencyDisplay.iptu_fee}
                      onChange={handleCurrencyChange('iptu_fee')}
                      placeholder="200,00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maintenance_fee">Manutenção (R$)</Label>
                    <Input
                      id="maintenance_fee"
                      value={currencyDisplay.maintenance_fee}
                      onChange={handleCurrencyChange('maintenance_fee')}
                      placeholder="100,00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="other_costs">Outros Custos (R$)</Label>
                    <Input
                      id="other_costs"
                      value={currencyDisplay.other_costs}
                      onChange={handleCurrencyChange('other_costs')}
                      placeholder="50,00"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area_sqm">Área (m²)</Label>
                  <Input
                    id="area_sqm"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.area_sqm || ''}
                    onChange={(e) => updateField('area_sqm', parseFloat(e.target.value) || 0)}
                    placeholder="80"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Quartos</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="0"
                    value={formData.bedrooms || ''}
                    onChange={(e) => updateField('bedrooms', parseInt(e.target.value) || 0)}
                    placeholder="2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="suites">Suítes</Label>
                  <Input
                    id="suites"
                    type="number"
                    min="0"
                    value={formData.suites || ''}
                    onChange={(e) => updateField('suites', parseInt(e.target.value) || 0)}
                    placeholder="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Banheiros</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="0"
                    value={formData.bathrooms || ''}
                    onChange={(e) => updateField('bathrooms', parseInt(e.target.value) || 0)}
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parking_spots">Vagas</Label>
                  <Input
                    id="parking_spots"
                    type="number"
                    min="0"
                    value={formData.parking_spots || ''}
                    onChange={(e) => updateField('parking_spots', parseInt(e.target.value) || 0)}
                    placeholder="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor_number">Andar</Label>
                  <Input
                    id="floor_number"
                    type="number"
                    min="0"
                    value={formData.floor_number ?? ''}
                    onChange={(e) => updateField('floor_number', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year_built">Ano Construção</Label>
                  <Input
                    id="year_built"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={formData.year_built ?? ''}
                    onChange={(e) => updateField('year_built', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="2020"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="font-medium text-card-foreground mb-4">Comodidades</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="has_pool" className="cursor-pointer">Piscina</Label>
                    <Switch
                      id="has_pool"
                      checked={formData.has_pool}
                      onCheckedChange={(checked) => updateField('has_pool', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="has_gym" className="cursor-pointer">Academia</Label>
                    <Switch
                      id="has_gym"
                      checked={formData.has_gym}
                      onCheckedChange={(checked) => updateField('has_gym', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="has_elevator" className="cursor-pointer">Elevador</Label>
                    <Switch
                      id="has_elevator"
                      checked={formData.has_elevator}
                      onCheckedChange={(checked) => updateField('has_elevator', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="has_balcony" className="cursor-pointer">Varanda</Label>
                    <Switch
                      id="has_balcony"
                      checked={formData.has_balcony}
                      onCheckedChange={(checked) => updateField('has_balcony', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="has_barbecue" className="cursor-pointer">Churrasqueira</Label>
                    <Switch
                      id="has_barbecue"
                      checked={formData.has_barbecue}
                      onCheckedChange={(checked) => updateField('has_barbecue', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="is_furnished" className="cursor-pointer">Mobiliado</Label>
                    <Switch
                      id="is_furnished"
                      checked={formData.is_furnished}
                      onCheckedChange={(checked) => updateField('is_furnished', checked)}
                    />
                  </div>
                </div>
                
                {/* Outros - Campo de texto para comodidades adicionais */}
                <div className="mt-4 space-y-2">
                  <Label htmlFor="other_amenities">Outras Comodidades</Label>
                  <Textarea
                    id="other_amenities"
                    value={formData.other_amenities}
                    onChange={(e) => updateField('other_amenities', e.target.value)}
                    placeholder="Informe outras comodidades não listadas acima..."
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="space-y-4 mt-4">
              <PropertyGallery 
                propertyId={property?.id} 
                isNewProperty={!property}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || isUploading}>
              {isLoading || isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? 'Enviando foto...' : 'Salvando...'}
                </>
              ) : (
                property ? 'Salvar' : 'Criar Imóvel'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}