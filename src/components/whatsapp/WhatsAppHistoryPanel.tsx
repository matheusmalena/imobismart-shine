import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWhatsAppMessages } from '@/hooks/useWhatsAppMessages';
import { useTenants } from '@/hooks/useTenants';
import { useProperties } from '@/hooks/useProperties';
import { MESSAGE_STATUS_LABELS, MESSAGE_STATUS_COLORS } from '@/types/whatsapp';
import { Search, Loader2, MessageSquare, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function WhatsAppHistoryPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTenant, setFilterTenant] = useState<string>('all');
  const [filterProperty, setFilterProperty] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  const { messages, isLoading } = useWhatsAppMessages({
    tenantId: filterTenant !== 'all' ? filterTenant : undefined,
    propertyId: filterProperty !== 'all' ? filterProperty : undefined,
  });
  const { tenants } = useTenants();
  const { properties } = useProperties();

  const filteredMessages = messages.filter((msg) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      msg.tenant?.name?.toLowerCase().includes(query) ||
      msg.property?.name?.toLowerCase().includes(query) ||
      msg.phone_number.includes(query) ||
      msg.message_content.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Mensagens</CardTitle>
          <CardDescription>
            Visualize todas as mensagens enviadas via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por inquilino, imóvel ou telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterTenant} onValueChange={setFilterTenant}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por inquilino" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os inquilinos</SelectItem>
                {tenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterProperty} onValueChange={setFilterProperty}>
              <SelectTrigger className="w-full sm:w-48">
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
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      {filteredMessages.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Inquilino</TableHead>
                  <TableHead>Imóvel</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((msg) => (
                  <TableRow key={msg.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedMessage(msg)}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(msg.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-medium">{msg.tenant?.name || '-'}</TableCell>
                    <TableCell>{msg.property?.name || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {msg.phone_number}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={MESSAGE_STATUS_COLORS[msg.status] || ''}>
                        {MESSAGE_STATUS_LABELS[msg.status] || msg.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhuma mensagem encontrada</h3>
            <p className="text-muted-foreground">
              {searchQuery || filterTenant !== 'all' || filterProperty !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'As mensagens enviadas aparecerão aqui'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes da Mensagem</DialogTitle>
            <DialogDescription>
              {selectedMessage && format(new Date(selectedMessage.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Inquilino</span>
                  <p className="font-medium">{selectedMessage.tenant?.name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Imóvel</span>
                  <p className="font-medium">{selectedMessage.property?.name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Telefone</span>
                  <p className="font-medium">{selectedMessage.phone_number}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className={MESSAGE_STATUS_COLORS[selectedMessage.status] || ''}>
                    {MESSAGE_STATUS_LABELS[selectedMessage.status] || selectedMessage.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Mensagem</span>
                <div className="bg-[#dcf8c6] dark:bg-green-900/30 rounded-lg p-4 mt-2 whitespace-pre-wrap">
                  {selectedMessage.message_content}
                </div>
              </div>

              {selectedMessage.error_message && (
                <div>
                  <span className="text-sm text-destructive">Erro</span>
                  <p className="text-destructive text-sm mt-1">{selectedMessage.error_message}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
