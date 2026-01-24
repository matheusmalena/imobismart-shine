import { useState } from 'react';
import { useOrganization, OrgMemberRole } from '@/hooks/useOrganization';
import { useUserData } from '@/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  UserPlus,
  Crown,
  Shield,
  DollarSign,
  User,
  MoreVertical,
  Trash2,
  Mail,
  Clock,
  Building2,
  Lock,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const ROLE_ICONS: Record<OrgMemberRole, React.ReactNode> = {
  owner: <Crown className="h-4 w-4 text-amber-500" />,
  admin: <Shield className="h-4 w-4 text-blue-500" />,
  financial: <DollarSign className="h-4 w-4 text-green-500" />,
  operator: <User className="h-4 w-4 text-muted-foreground" />,
};

const ROLE_COLORS: Record<OrgMemberRole, string> = {
  owner: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  admin: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  financial: 'bg-green-500/10 text-green-600 border-green-500/20',
  operator: 'bg-muted text-muted-foreground border-border',
};

export function TeamManagement() {
  // Using centralized hook - isEnterprise is exclusive to Enterprise plan only
  const { isEnterprise } = useUserData();
  const {
    organization,
    userRole,
    members,
    invitations,
    isLoading,
    canManage,
    isOwner,
    createOrganization,
    inviteMember,
    cancelInvitation,
    resendInvitation,
    updateMemberRole,
    removeMember,
    ROLE_LABELS,
    ROLE_DESCRIPTIONS,
  } = useOrganization();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<OrgMemberRole>('operator');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Show upgrade message for non-Enterprise users
  if (!isEnterprise) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Múltiplos Usuários</CardTitle>
              <CardDescription>Gerencie sua equipe e permissões</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Recurso Enterprise</h3>
            <p className="text-muted-foreground max-w-md mb-4">
              A funcionalidade de múltiplos usuários está disponível apenas no plano Enterprise. 
              Adicione membros à sua equipe com diferentes permissões para colaborar na gestão dos imóveis.
            </p>
            <Badge variant="outline" className="gap-1 bg-amber-500/10 text-amber-600 border-amber-200">
              <Lock className="h-3 w-3" />
              Plano Enterprise
            </Badge>
            <Button size="sm" onClick={() => window.location.href = '/plans'} className="gap-1.5 mt-4">
              <Crown className="h-3.5 w-3.5" />
              Upgrade para Enterprise
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show create organization UI if user doesn't have one
  if (!organization) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Múltiplos Usuários</CardTitle>
              <CardDescription>Crie sua equipe para colaborar na gestão</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Crie sua Equipe</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Configure sua equipe para adicionar colaboradores com diferentes níveis de permissão.
            </p>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Criar Equipe
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Equipe</DialogTitle>
                  <DialogDescription>
                    Dê um nome para sua equipe. Você poderá convidar membros após criá-la.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-name">Nome da Equipe</Label>
                    <Input
                      id="org-name"
                      placeholder="Ex: Imobiliária Silva"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      createOrganization.mutate(orgName, {
                        onSuccess: () => setShowCreateDialog(false),
                      });
                    }}
                    disabled={!orgName.trim() || createOrganization.isPending}
                  >
                    {createOrganization.isPending ? 'Criando...' : 'Criar Equipe'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeMembers = members.filter(m => m.status === 'active');
  const membersCount = activeMembers.length + invitations.length;
  const maxMembers = organization.max_members;

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      toast.error('Digite o email do membro');
      return;
    }
    
    inviteMember.mutate(
      { email: inviteEmail, role: inviteRole },
      {
        onSuccess: () => {
          setShowInviteDialog(false);
          setInviteEmail('');
          setInviteRole('operator');
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {organization.name}
                <Badge variant="outline" className="font-normal">
                  {membersCount}/{maxMembers} membros
                </Badge>
              </CardTitle>
              <CardDescription>Gerencie sua equipe e permissões de acesso</CardDescription>
            </div>
          </div>
          
          {canManage && (
            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={membersCount >= maxMembers}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Convidar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Convidar Membro</DialogTitle>
                  <DialogDescription>
                    Envie um convite para adicionar um novo membro à equipe.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Email</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-role">Permissão</Label>
                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as OrgMemberRole)}>
                      <SelectTrigger id="invite-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            {ROLE_ICONS.admin}
                            <span>Administrador</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="financial">
                          <div className="flex items-center gap-2">
                            {ROLE_ICONS.financial}
                            <span>Financeiro</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="operator">
                          <div className="flex items-center gap-2">
                            {ROLE_ICONS.operator}
                            <span>Operador</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {ROLE_DESCRIPTIONS[inviteRole]}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleInvite} disabled={inviteMember.isPending}>
                    {inviteMember.isPending ? 'Enviando...' : 'Enviar Convite'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Member limit warning */}
        {membersCount >= maxMembers && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-600">Limite de membros atingido</p>
              <p className="text-xs text-amber-600/80">
                Entre em contato conosco para adicionar mais membros à sua equipe.
              </p>
            </div>
            <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10">
              Aumentar Limite
            </Button>
          </div>
        )}

        {/* Active Members */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Membros Ativos</h4>
          {activeMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {member.profile?.full_name?.[0] || member.profile?.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {member.profile?.full_name || member.profile?.email || 'Usuário'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {member.profile?.email}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={ROLE_COLORS[member.role]}>
                  {ROLE_ICONS[member.role]}
                  <span className="ml-1">{ROLE_LABELS[member.role]}</span>
                </Badge>
                
                {canManage && member.role !== 'owner' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => updateMemberRole.mutate({ memberId: member.id, role: 'admin' })}
                        disabled={member.role === 'admin'}
                      >
                        {ROLE_ICONS.admin}
                        <span className="ml-2">Tornar Administrador</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateMemberRole.mutate({ memberId: member.id, role: 'financial' })}
                        disabled={member.role === 'financial'}
                      >
                        {ROLE_ICONS.financial}
                        <span className="ml-2">Tornar Financeiro</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateMemberRole.mutate({ memberId: member.id, role: 'operator' })}
                        disabled={member.role === 'operator'}
                      >
                        {ROLE_ICONS.operator}
                        <span className="ml-2">Tornar Operador</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remover da Equipe
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover Membro</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover {member.profile?.full_name || 'este membro'} da equipe?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeMember.mutate(member.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Convites Pendentes</h4>
              {invitations.map((invitation) => {
                const expiresAt = new Date(invitation.expires_at);
                const now = new Date();
                const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const isExpiringSoon = daysUntilExpiry <= 2;
                
                return (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-dashed bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <p className={`text-xs flex items-center gap-1 ${isExpiringSoon ? 'text-amber-600' : 'text-muted-foreground'}`}>
                          {isExpiringSoon ? (
                            <AlertCircle className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          {isExpiringSoon 
                            ? `Expira em ${daysUntilExpiry} dia${daysUntilExpiry !== 1 ? 's' : ''}` 
                            : `Expira em ${format(expiresAt, "d 'de' MMM", { locale: ptBR })}`
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={ROLE_COLORS[invitation.role]}>
                        {ROLE_ICONS[invitation.role]}
                        <span className="ml-1">{ROLE_LABELS[invitation.role]}</span>
                      </Badge>
                      
                      {canManage && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => resendInvitation.mutate(invitation.id)}
                            disabled={resendInvitation.isPending}
                            title="Reenviar convite"
                          >
                            <RefreshCw className={`h-4 w-4 ${resendInvitation.isPending ? 'animate-spin' : ''}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => cancelInvitation.mutate(invitation.id)}
                            title="Cancelar convite"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Role Legend */}
        <Separator />
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Níveis de Permissão</h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {(['owner', 'admin', 'financial', 'operator'] as OrgMemberRole[]).map((role) => (
              <div key={role} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                {ROLE_ICONS[role]}
                <div>
                  <p className="text-sm font-medium">{ROLE_LABELS[role]}</p>
                  <p className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
