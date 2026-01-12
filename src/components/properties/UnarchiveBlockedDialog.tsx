import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowUpCircle } from "lucide-react";

interface UnarchiveBlockedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeCount: number;
  limit: number;
  planName: string;
}

export function UnarchiveBlockedDialog({
  open,
  onOpenChange,
  activeCount,
  limit,
  planName,
}: UnarchiveBlockedDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-warning/10">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
            <AlertDialogTitle>Limite de Imóveis Atingido</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <p>
              Você não pode desarquivar este imóvel porque já atingiu o limite do seu plano.
            </p>
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plano atual:</span>
                <span className="font-medium text-foreground capitalize">{planName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Imóveis ativos:</span>
                <span className="font-medium text-foreground">{activeCount} de {limit}</span>
              </div>
            </div>
            <p className="text-sm">
              Para desarquivar este imóvel, você pode:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Arquivar ou excluir outro imóvel ativo</li>
              <li>Fazer upgrade do seu plano para mais imóveis</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel>Fechar</AlertDialogCancel>
          <Link to="/settings">
            <AlertDialogAction asChild>
              <Button className="gap-2">
                <ArrowUpCircle className="h-4 w-4" />
                Ver Planos
              </Button>
            </AlertDialogAction>
          </Link>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
