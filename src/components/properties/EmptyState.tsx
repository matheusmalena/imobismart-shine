import { Button } from '@/components/ui/button';
import { Building2, Plus } from 'lucide-react';

interface EmptyStateProps {
  onAddProperty: () => void;
}

export function EmptyState({ onAddProperty }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="p-6 rounded-full bg-primary/10 mb-6">
        <Building2 className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        Nenhum imóvel cadastrado
      </h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Comece adicionando seu primeiro imóvel para gerenciar seus investimentos imobiliários de forma inteligente.
      </p>
      <Button onClick={onAddProperty} size="lg" className="gap-2">
        <Plus className="h-5 w-5" />
        Adicionar Primeiro Imóvel
      </Button>
    </div>
  );
}
