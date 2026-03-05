import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProperties } from '@/hooks/useProperties';
import { useUserData } from '@/hooks/useUserData';
import { useExportData } from '@/hooks/useExportData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { OccupancyChart } from '@/components/dashboard/OccupancyChart';
import { ProFeaturesCard } from '@/components/dashboard/ProFeaturesCard';
import { PlusAICard } from '@/components/dashboard/PlusAICard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus,
  Crown,
  Building2,
  FileText,
  Users,
  MessageCircle,
  Clock,
  Home,
  TrendingUp,
} from 'lucide-react';

interface RecentActivityItem {
  text: string;
  time: string;
  icon: typeof Building2;
}

function useRecentActivity() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['recent-activity', user?.id],
    queryFn: async (): Promise<RecentActivityItem[]> => {
      if (!user) return [];
      
      const [propertiesRes, tenantsRes, documentsRes] = await Promise.all([
        supabase.from('properties').select('name, updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(2),
        supabase.from('tenants').select('name, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
        supabase.from('documents').select('name, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
      ]);
      
      const items: { text: string; timestamp: string; icon: typeof Building2 }[] = [];
      
      propertiesRes.data?.forEach(p => {
        items.push({ text: `Imóvel "${p.name}" atualizado`, timestamp: p.updated_at, icon: Building2 });
      });
      tenantsRes.data?.forEach(t => {
        items.push({ text: `Inquilino "${t.name}" cadastrado`, timestamp: t.created_at, icon: Users });
      });
      documentsRes.data?.forEach(d => {
        items.push({ text: `Documento "${d.name}" adicionado`, timestamp: d.created_at, icon: FileText });
      });
      
      return items
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 4)
        .map(item => ({
          text: item.text,
          time: formatDistanceToNow(new Date(item.timestamp), { addSuffix: true, locale: ptBR }),
          icon: item.icon,
        }));
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { activeProperties, isLoading, metrics } = useProperties();
  const { profile, plan, isPro, isPlus } = useUserData();
  const { exportToCSV } = useExportData();
  const { data: recentActivity = [] } = useRecentActivity();
  
  const firstName = profile?.full_name?.split(' ')[0] || 'Investidor';

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[350px] rounded-xl" />
            <Skeleton className="h-[350px] rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleExportData = () => {
    exportToCSV(activeProperties);
  };

  const getPlanLabel = () => {
    switch (plan) {
      case 'enterprise': return 'Enterprise';
      case 'plus': return 'Plus';
      case 'pro': return 'Pro';
      case 'starter': return 'Starter';
      default: return 'Gratuito';
    }
  };

  const quickActions = [
    { label: 'Novo Imóvel', icon: Home, href: '/properties', color: 'text-primary' },
    { label: 'Inquilinos', icon: Users, href: '/tenants', color: 'text-info' },
    { label: 'Documentos', icon: FileText, href: '/documents', color: 'text-success' },
    { label: 'WhatsApp', icon: MessageCircle, href: '/whatsapp', color: 'text-warning' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Olá, {firstName}!
              </h1>
              <Badge variant={isPro ? 'default' : 'secondary'} className="gap-1">
                <Crown className="h-3 w-3" />
                {getPlanLabel()}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              Visão geral dos seus investimentos
            </p>
          </div>
          <Button onClick={() => navigate('/properties')} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Imóvel
          </Button>
        </div>

        {/* Main Metrics */}
        <DashboardMetrics
          totalProperties={metrics.totalProperties}
          netProfit={metrics.netProfit}
          avgROI={metrics.avgROI}
          avgOccupancy={metrics.avgOccupancy}
        />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart properties={activeProperties} />
          <OccupancyChart properties={activeProperties} />
        </div>

        {/* Quick Actions + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.href)}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all duration-200 group"
                  >
                    <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                      <action.icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <span className="text-sm font-medium text-foreground">{action.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Atividade Recente</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeProperties.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">Nenhuma atividade ainda.</p>
                    <p className="text-xs text-muted-foreground mt-1">Cadastre seu primeiro imóvel para começar.</p>
                  </div>
                ) : (
                  recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-muted mt-0.5">
                        <activity.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{activity.text}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pro + Plus Features Row */}
        {activeProperties.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProFeaturesCard
              properties={activeProperties}
              avgROI={metrics.avgROI}
              isPro={isPro}
              onExport={handleExportData}
            />
            <PlusAICard
              isPlus={isPlus}
              propertyCount={activeProperties.length}
              avgROI={metrics.avgROI}
              avgOccupancy={metrics.avgOccupancy}
            />
          </div>
        )}

        {/* Upgrade prompt for Starter plan */}
        {!isPro && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <Crown className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Desbloqueie recursos avançados</h3>
                    <p className="text-muted-foreground text-sm mt-0.5">
                      Análise de portfólio, ranking de performance, recomendações IA e mais.
                    </p>
                  </div>
                </div>
                <Button onClick={() => navigate('/plans')} className="gap-2 shrink-0">
                  <Crown className="h-4 w-4" />
                  Ver Planos
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}