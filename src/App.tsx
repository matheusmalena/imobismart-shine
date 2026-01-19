import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import Documents from "./pages/Documents";
import Tenants from "./pages/Tenants";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Export from "./pages/Export";
import AdminClients from "./pages/admin/Clients";
import AdminClientDetails from "./pages/admin/ClientDetails";
import AdminPlans from "./pages/admin/Plans";
import Team from "./pages/Team";
import AcceptInvite from "./pages/AcceptInvite";
import NotFound from "./pages/NotFound";
import WhatsApp from "./pages/WhatsApp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="imobismart-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/tenants" element={<Tenants />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/export" element={<Export />} />
              <Route path="/team" element={<Team />} />
              <Route path="/whatsapp" element={<WhatsApp />} />
              <Route path="/admin/clients" element={<AdminClients />} />
              <Route path="/admin/clients/:userId" element={<AdminClientDetails />} />
              <Route path="/admin/plans" element={<AdminPlans />} />
              <Route path="/accept-invite" element={<AcceptInvite />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
