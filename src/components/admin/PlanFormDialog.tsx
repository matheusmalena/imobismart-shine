import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { PlanInput } from '@/hooks/usePlans';

interface PlanFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  formData: PlanInput;
  setFormData: (data: PlanInput) => void;
  featuresText: string;
  setFeaturesText: (text: string) => void;
  onSave: () => void;
  isSaving: boolean;
  isEditing: boolean;
}

export function PlanFormDialog({
  isOpen,
  onClose,
  title,
  description,
  formData,
  setFormData,
  featuresText,
  setFeaturesText,
  onSave,
  isSaving,
  isEditing,
}: PlanFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan-id">ID do Plano</Label>
              <Input
                id="plan-id"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                placeholder="ex: starter"
                disabled={isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-name">Nome</Label>
              <Input
                id="plan-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ex: Gratuito"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan-description">Descrição</Label>
            <Input
              id="plan-description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="ex: Perfeito para começar"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan-price">Preço (R$)</Label>
              <Input
                id="plan-price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-price-label">Label do Preço</Label>
              <Input
                id="plan-price-label"
                value={formData.price_label}
                onChange={(e) => setFormData({ ...formData, price_label: e.target.value })}
                placeholder="ex: R$ 49/mês"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan-property-limit">Limite de Imóveis</Label>
              <Input
                id="plan-property-limit"
                type="number"
                value={formData.property_limit}
                onChange={(e) => setFormData({ ...formData, property_limit: Number(e.target.value) })}
                min={-1}
              />
              <p className="text-xs text-muted-foreground">Use -1 para ilimitado</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-sort-order">Ordem</Label>
              <Input
                id="plan-sort-order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                min={0}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan-features">Recursos (um por linha)</Label>
            <Textarea
              id="plan-features"
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              placeholder="Dashboard básico&#10;Upload de documentos&#10;Suporte por email"
              rows={5}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="plan-is-active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="plan-is-active">Ativo</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="plan-is-highlighted"
                checked={formData.is_highlighted}
                onCheckedChange={(checked) => setFormData({ ...formData, is_highlighted: checked })}
              />
              <Label htmlFor="plan-is-highlighted">Destacado</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={onSave} 
            disabled={!formData.id || !formData.name || isSaving}
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
