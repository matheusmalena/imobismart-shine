import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Settings } from 'lucide-react';
import { WhatsAppSettingsPanel } from '@/components/whatsapp/WhatsAppSettingsPanel';
import { WhatsAppSendPanel } from '@/components/whatsapp/WhatsAppSendPanel';
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
          <h1 className="text-3xl font-bold text-foreground">WhatsApp</h1>
          <p className="text-muted-foreground mt-1">
            Envie lembretes de pagamento para seus inquilinos via WhatsApp
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="send" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Enviar</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="space-y-6">
            <WhatsAppSendPanel />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <WhatsAppSettingsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
