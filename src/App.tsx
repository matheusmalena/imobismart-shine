import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayoutRoute from "@/components/layout/DashboardLayoutRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import Documents from "./pages/Documents";
import Tenants from "./pages/Tenants";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Plans from "./pages/Plans";
import Subscription from "./pages/Subscription";
import AdminClients from "./pages/admin/Clients";
import AdminClientDetails from "./pages/admin/ClientDetails";
import AdminPlans from "./pages/admin/Plans";
import AdminEnterpriseLinks from "./pages/admin/EnterpriseLinks";
import Team from "./pages/Team";
import AcceptInvite from "./pages/AcceptInvite";
import NotFound from "./pages/NotFound";
import WhatsApp from "./pages/WhatsApp";
import PaymentSuccess from "./pages/PaymentSuccess";

const queryClient = new QueryClient();

// Global interceptor for email confirmation hash on any route
function EmailConfirmationInterceptor() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('type=signup') && location.pathname !== '/auth') {
      // Preserve the hash so Supabase can exchange tokens for a session
      window.location.replace('/auth?verified=true' + hash);
    }
  }, [location, navigate]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="imobismart-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <EmailConfirmationInterceptor />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/accept-invite" element={<AcceptInvite />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              
              {/* Dashboard routes - shared layout */}
              <Route element={<DashboardLayoutRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/tenants" element={<Tenants />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/team" element={<Team />} />
                <Route path="/whatsapp" element={<WhatsApp />} />
                <Route path="/admin/clients" element={<AdminClients />} />
                <Route path="/admin/clients/:userId" element={<AdminClientDetails />} />
                <Route path="/admin/plans" element={<AdminPlans />} />
                <Route path="/admin/enterprise-links" element={<AdminEnterpriseLinks />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
