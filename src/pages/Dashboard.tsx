import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProperties } from '@/hooks/useProperties';
import { useUserData } from '@/hooks/useUserData';
import { useExportData } from '@/hooks/useExportData';

import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { OccupancyChart } from '@/components/dashboard/OccupancyChart';
import { ProFeaturesCard } from '@/components/dashboard/ProFeaturesCard';
import { PlusAICard } from '@/components/dashboard/PlusAICard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PageTransition } from '@/components/PageTransition';
import { 
  Plus,
  Crown,
  Building2,
  FileText,
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

  const LoadingSkeleton = () => (
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
  );

  return (
    <PageTransition>
      {(authLoading || isLoading) ? <LoadingSkeleton /> : (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">
                Olá, {firstName}!
              </h1>
              <Badge variant={isPro ? 'default' : 'secondary'} className="gap-1">
                <Crown className="h-3 w-3" />
                {getPlanLabel()}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Visão geral dos seus investimentos
            </p>
          </div>
          <Button onClick={() => navigate('/properties')} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Imóvel
          </Button>
        </div>

        {/* Main Metrics - Always visible */}
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate('/properties')}
          >
            <Building2 className="h-5 w-5" />
            <span>Gerenciar Imóveis</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate('/documents')}
          >
            <FileText className="h-5 w-5" />
            <span>Ver Documentos</span>
          </Button>
        </div>

        {/* Upgrade prompt for Starter plan */}
        {!isPro && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
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
      )}
    </PageTransition>
  );
}
