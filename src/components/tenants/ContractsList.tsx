import { useState } from 'react';
import { useLeaseContracts } from '@/hooks/useLeaseContracts';
import { useTenants } from '@/hooks/useTenants';
import { useProperties } from '@/hooks/useProperties';
import { LeaseContract, LeaseContractFormData, CONTRACT_STATUS_LABELS, CONTRACT_STATUS_COLORS } from '@/types/tenant';
import { ContractFormDialog } from './ContractFormDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DocumentViewDialog } from '@/components/documents/DocumentViewDialog';
import { Plus, MoreVertical, Pencil, Trash2, FileSignature, Loader2, FileText, Download, Eye } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function ContractsList() {
  const { contracts, isLoading, createContract, updateContract, deleteContract, getSignedUrl } = useLeaseContracts();
  const { tenants } = useTenants();
  const { properties } = useProperties();

  const [formOpen, setFormOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<LeaseContract | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<LeaseContract | null>(null);
  const [viewingDocument, setViewingDocument] = useState<{ name: string; file_type: string; url: string } | null>(null);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);

  const handleEdit = (contract: LeaseContract) => {
    setEditingContract(contract);
    setFormOpen(true);
  };

  const handleDelete = (contract: LeaseContract) => {
    setContractToDelete(contract);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (contractToDelete) {
      deleteContract.mutate(contractToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setContractToDelete(null);
        },
      });
    }
  };

  const handleFormSubmit = (data: LeaseContractFormData) => {
    if (editingContract) {
      updateContract.mutate(
        { ...data, id: editingContract.id },
        {
          onSuccess: () => {
            setFormOpen(false);
            setEditingContract(null);
          },
        }
      );
    } else {
      createContract.mutate(data, {
        onSuccess: () => {
          setFormOpen(false);
        },
      });
    }
  };

  const handleViewDocument = async (contract: LeaseContract) => {
    if (!contract.contract_file_url) return;

    const signedUrl = await getSignedUrl(contract.contract_file_url);
    if (signedUrl) {
      setViewingDocument({
        name: `Contrato - ${contract.tenant?.name || 'Inquilino'}`,
        file_type: 'application/pdf',
        url: signedUrl,
      });
      setDocumentDialogOpen(true);
    } else {
      toast.error('Erro ao carregar o documento');
    }
  };

  const handleDownloadDocument = async (contract: LeaseContract) => {
    if (!contract.contract_file_url) return;

    const signedUrl = await getSignedUrl(contract.contract_file_url);
    if (signedUrl) {
      const link = document.createElement('a');
      link.href = signedUrl;
      link.download = `contrato-${contract.tenant?.name || 'inquilino'}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.error('Erro ao baixar o documento');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getExpiryStatus = (endDate: string, status: string) => {
    if (status !== 'active') return null;
    const daysLeft = differenceInDays(new Date(endDate), new Date());
    if (daysLeft < 0) {
      return <Badge variant="destructive" className="ml-2">Vencido</Badge>;
    }
    if (daysLeft <= 30) {
      return <Badge className="ml-2 bg-yellow-500/80">Vence em {daysLeft}d</Badge>;
    }
    return null;
  };

  // Helper function to get signed URL for DocumentViewDialog
  const getDocumentSignedUrl = async (): Promise<string | null> => {
    return viewingDocument?.url || null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingContract(null);
            setFormOpen(true);
          }}
          className="gap-2"
          disabled={tenants.length === 0 || properties.length === 0}
        >
          <Plus className="h-4 w-4" />
          Novo Contrato
        </Button>
      </div>

      {tenants.length === 0 || properties.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileSignature className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Não é possível criar contratos
            </h3>
            <p className="text-muted-foreground">
              {tenants.length === 0 && properties.length === 0
                ? 'Cadastre pelo menos um inquilino e um imóvel antes de criar contratos.'
                : tenants.length === 0
                ? 'Cadastre pelo menos um inquilino antes de criar contratos.'
                : 'Cadastre pelo menos um imóvel antes de criar contratos.'}
            </p>
          </CardContent>
        </Card>
      ) : contracts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileSignature className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhum contrato cadastrado
            </h3>
            <p className="text-muted-foreground mb-4">
              Crie seu primeiro contrato de locação para vincular inquilinos aos seus imóveis.
            </p>
            <Button onClick={() => setFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Contrato
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Inquilino</TableHead>
                <TableHead>Imóvel</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Aluguel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {contract.tenant?.name || 'Inquilino não encontrado'}
                      {contract.contract_file_url && (
                        <FileText className="h-4 w-4 text-primary" aria-label="Contrato anexado" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{contract.property?.name || 'Imóvel não encontrado'}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(contract.start_date), "dd/MM/yyyy", { locale: ptBR })}
                      {' → '}
                      {format(new Date(contract.end_date), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(contract.monthly_rent)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Badge className={cn('text-xs', CONTRACT_STATUS_COLORS[contract.status])}>
                        {CONTRACT_STATUS_LABELS[contract.status]}
                      </Badge>
                      {getExpiryStatus(contract.end_date, contract.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {contract.contract_file_url && (
                          <>
                            <DropdownMenuItem onClick={() => handleViewDocument(contract)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Documento
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadDocument(contract)}>
                              <Download className="h-4 w-4 mr-2" />
                              Baixar Documento
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem onClick={() => handleEdit(contract)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(contract)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <ContractFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingContract(null);
        }}
        contract={editingContract}
        tenants={tenants}
        properties={properties.filter(p => !p.is_archived)}
        onSubmit={handleFormSubmit}
        isLoading={createContract.isPending || updateContract.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Contrato</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este contrato?
              {contractToDelete?.contract_file_url && ' O documento anexado também será excluído.'}
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteContract.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteContract.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteContract.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DocumentViewDialog
        document={viewingDocument ? {
          id: 'contract-doc',
          property_id: '',
          user_id: '',
          name: viewingDocument.name,
          file_url: viewingDocument.url,
          file_type: viewingDocument.file_type,
          file_size: null,
          category: 'contrato',
          created_at: '',
          updated_at: '',
        } : null}
        open={documentDialogOpen}
        onOpenChange={setDocumentDialogOpen}
        onDownload={() => {
          if (viewingDocument) {
            const link = document.createElement('a');
            link.href = viewingDocument.url;
            link.download = `${viewingDocument.name}.pdf`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }}
        getSignedUrl={getDocumentSignedUrl}
      />
    </div>
  );
}
