import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Settings, Calendar, History } from 'lucide-react';
import { WhatsAppSettingsPanel } from '@/components/whatsapp/WhatsAppSettingsPanel';
import { WhatsAppSendPanel } from '@/components/whatsapp/WhatsAppSendPanel';
import { WhatsAppHistoryPanel } from '@/components/whatsapp/WhatsAppHistoryPanel';
import { WhatsAppScheduledPanel } from '@/components/whatsapp/WhatsAppScheduledPanel';
import { Skeleton } from '@/components/ui/skeleton';

export default function WhatsApp() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('send');

  if (!user) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">WhatsApp</h1>
          <p className="text-muted-foreground">
            Envie lembretes de pagamento e mensagens personalizadas para seus inquilinos
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="send" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Enviar</span>
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Agendados</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configurações</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="space-y-6">
            <WhatsAppSendPanel />
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-6">
            <WhatsAppScheduledPanel />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <WhatsAppHistoryPanel />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <WhatsAppSettingsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
