import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProperties } from '@/hooks/useProperties';
import { useUserData } from '@/hooks/useUserData';
import { useExportData } from '@/hooks/useExportData';
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
  ArrowRight,
  Home,
  TrendingUp,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { activeProperties, isLoading, metrics } = useProperties();
  const { profile, plan, isPro, isPlus } = useUserData();
  const { exportToCSV } = useExportData();
  
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
      default: return 'Gratuito';
    }
  };

  const quickActions = [
    { label: 'Novo Imóvel', icon: Home, href: '/properties', color: 'text-primary' },
    { label: 'Inquilinos', icon: Users, href: '/tenants', color: 'text-info' },
    { label: 'Documentos', icon: FileText, href: '/documents', color: 'text-success' },
    { label: 'WhatsApp', icon: MessageCircle, href: '/whatsapp', color: 'text-warning' },
  ];

  const recentActivity = [
    { text: 'Imóvel "Apt. Vila Mariana" atualizado', time: 'Agora', icon: Building2 },
    { text: 'Novo documento adicionado', time: '2h atrás', icon: FileText },
    { text: 'Inquilino cadastrado', time: '5h atrás', icon: Users },
    { text: 'Receita mensal registrada', time: '1d atrás', icon: TrendingUp },
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