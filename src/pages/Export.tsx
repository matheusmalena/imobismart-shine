import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProperties } from '@/hooks/useProperties';
import { useUserData } from '@/hooks/useUserData';
import { useExportData } from '@/hooks/useExportData';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Download, 
  Crown, 
  Lock,
  FileSpreadsheet,
  FileJson,
  FileText,
} from 'lucide-react';

export default function Export() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { activeProperties, isLoading } = useProperties();
  const { plan, isPro, isPlus } = useUserData();
  const { exportToCSV, exportToJSON } = useExportData();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-4xl">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  // Show upgrade prompt for non-Pro users
  if (!isPro) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-12 animate-fade-in">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto p-4 rounded-full bg-primary/10 w-fit mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Exportar Dados</CardTitle>
              <CardDescription className="text-base mt-2">
                Exporte todos os dados do seu portfólio em diferentes formatos para análises externas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 text-left">
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <FileSpreadsheet className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Exportar para CSV</p>
                    <p className="text-sm text-muted-foreground">Compatível com Excel e Google Sheets</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <FileJson className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Exportar para JSON</p>
                    <p className="text-sm text-muted-foreground">Formato estruturado para integrações</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Download className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Backup Completo</p>
                    <p className="text-sm text-muted-foreground">Todos os dados do seu portfólio</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Badge variant="outline" className="gap-1 mb-4">
                  <Lock className="h-3 w-3" />
                  Disponível no Plano Pro
                </Badge>
                <Button onClick={() => navigate('/settings')} size="lg" className="w-full gap-2">
                  <Crown className="h-4 w-4" />
                  Fazer Upgrade para Pro
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">Exportar Dados</h1>
            <Badge variant="default" className="gap-1">
              <Crown className="h-3 w-3" />
              Pro
            </Badge>
          </div>
        </div>

        {/* Export Options */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Exportar CSV</CardTitle>
                  <CardDescription>Planilha compatível com Excel</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Exporte seus {activeProperties.length} imóveis em formato CSV para análise em planilhas.
              </p>
              <Button onClick={() => exportToCSV(activeProperties)} className="w-full gap-2">
                <Download className="h-4 w-4" />
                Baixar CSV
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <FileJson className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Exportar JSON</CardTitle>
                  <CardDescription>Dados estruturados para integrações</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Exporte seus dados em formato JSON para uso em outras aplicações.
              </p>
              <Button onClick={() => exportToJSON(activeProperties)} variant="outline" className="w-full gap-2">
                <Download className="h-4 w-4" />
                Baixar JSON
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Upgrade to Plus prompt - show for Pro users who don't have Plus */}
        {isPro && !isPlus && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Relatórios Personalizados</h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        Crie relatórios profissionais com sua marca e layout exclusivo para impressionar clientes e parceiros.
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => navigate('/settings')} className="gap-2 shrink-0">
                    <Crown className="h-4 w-4" />
                    Ver Plano Plus
                  </Button>
                </div>
                
                {/* Report types with badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg border border-border/50">
                    <div className="p-1.5 rounded-md bg-green-500/10">
                      <FileSpreadsheet className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Financeiro</p>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 mt-1">PDF</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg border border-border/50">
                    <div className="p-1.5 rounded-md bg-blue-500/10">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Ocupação</p>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 mt-1">PDF</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg border border-border/50">
                    <div className="p-1.5 rounded-md bg-purple-500/10">
                      <FileJson className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Rentabilidade</p>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 mt-1">PDF</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg border border-border/50">
                    <div className="p-1.5 rounded-md bg-orange-500/10">
                      <Download className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Completo</p>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 mt-1">PDF</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
