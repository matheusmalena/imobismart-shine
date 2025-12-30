import { useState } from 'react';
import { Property, PropertyFormData, PropertyType, PropertyStatus, PropertyPerformance, PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS, PROPERTY_PERFORMANCE_LABELS } from '@/types/property';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

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
  performance: 'media',
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
  description: '',
};

export function PropertyForm({ open, onOpenChange, property, onSubmit, isLoading }: PropertyFormProps) {
  const [formData, setFormData] = useState<PropertyFormData>(
    property ? {
      name: property.name,
      property_type: property.property_type,
      status: property.status,
      performance: property.performance || 'media',
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
      description: property.description || '',
    } : defaultFormData
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = <K extends keyof PropertyFormData>(field: K, value: PropertyFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="address">Endereço</TabsTrigger>
              <TabsTrigger value="financial">Financeiro</TabsTrigger>
              <TabsTrigger value="features">Características</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

                <div className="space-y-2">
                  <Label>Performance</Label>
                  <Select
                    value={formData.performance}
                    onValueChange={(value) => updateField('performance', value as PropertyPerformance)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PROPERTY_PERFORMANCE_LABELS).map(([value, label]) => (
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
                  <Input
                    id="zip"
                    value={formData.address_zip}
                    onChange={(e) => updateField('address_zip', e.target.value)}
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property_value">Valor do Imóvel (R$)</Label>
                  <Input
                    id="property_value"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.property_value || ''}
                    onChange={(e) => updateField('property_value', parseFloat(e.target.value) || 0)}
                    placeholder="500000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthly_revenue">Receita Mensal (R$)</Label>
                  <Input
                    id="monthly_revenue"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.monthly_revenue || ''}
                    onChange={(e) => updateField('monthly_revenue', parseFloat(e.target.value) || 0)}
                    placeholder="3000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="occupancy_rate">Taxa de Ocupação (%)</Label>
                  <Input
                    id="occupancy_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.occupancy_rate || ''}
                    onChange={(e) => updateField('occupancy_rate', parseFloat(e.target.value) || 0)}
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
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.condominium_fee || ''}
                      onChange={(e) => updateField('condominium_fee', parseFloat(e.target.value) || 0)}
                      placeholder="500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="iptu_fee">IPTU (R$)</Label>
                    <Input
                      id="iptu_fee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.iptu_fee || ''}
                      onChange={(e) => updateField('iptu_fee', parseFloat(e.target.value) || 0)}
                      placeholder="200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maintenance_fee">Manutenção (R$)</Label>
                    <Input
                      id="maintenance_fee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.maintenance_fee || ''}
                      onChange={(e) => updateField('maintenance_fee', parseFloat(e.target.value) || 0)}
                      placeholder="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="other_costs">Outros Custos (R$)</Label>
                    <Input
                      id="other_costs"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.other_costs || ''}
                      onChange={(e) => updateField('other_costs', parseFloat(e.target.value) || 0)}
                      placeholder="50"
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
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                property ? 'Salvar Alterações' : 'Criar Imóvel'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
