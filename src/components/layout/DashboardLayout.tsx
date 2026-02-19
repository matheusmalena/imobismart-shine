import { ReactNode, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/hooks/useUserData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Home,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Crown,
  ClipboardList,
  CreditCard,
  Users,
  MessageCircle,
  Link2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { TutorialModal } from '@/components/onboarding/TutorialModal';
import { LogoText } from '@/components/common/LogoText';
import { PortfolioCopilot, PortfolioCopilotRef } from '@/components/ai/PortfolioCopilot';

interface DashboardLayoutProps {
  children: ReactNode;
}

// Removido "Configurações" - já acessível via dropdown do perfil
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Imóveis', href: '/properties', icon: Home },
  { name: 'Inquilinos', href: '/tenants', icon: Users },
  { name: 'Documentos', href: '/documents', icon: FileText },
  { name: 'WhatsApp', href: '/whatsapp', icon: MessageCircle },
  { name: 'Assinatura', href: '/subscription', icon: CreditCard },
];

const adminNavigation = [
  { name: 'Clientes', href: '/admin/clients', icon: Crown },
  { name: 'Planos', href: '/admin/plans', icon: CreditCard },
  { name: 'Links Enterprise', href: '/admin/enterprise-links', icon: Link2 },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, isAdmin, isPro, isEnterprise } = useUserData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const copilotRef = useRef<PortfolioCopilotRef>(null);

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      <TutorialModal autoShow={false} />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col pt-4 lg:pt-8">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 mb-6">
            <div className="flex-1">
              <LogoText size="md" variant="sidebar" />
            </div>
            <button
              className="lg:hidden text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}

            {/* Relatórios - Pro+ */}
            <Link
              to="/reports"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                location.pathname === '/reports'
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <ClipboardList className="h-5 w-5" />
              Relatórios
            </Link>

            {/* Equipe - Enterprise */}
            <Link
              to="/team"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                location.pathname === '/team'
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <Users className="h-5 w-5" />
              Equipe
            </Link>

            {/* Admin section */}
            {isAdmin && (
              <>
                <div className="pt-4 pb-2">
                  <p className="px-4 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                    Admin
                  </p>
                </div>
                {adminNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-sidebar-accent transition-colors overflow-hidden">
                  <Avatar className="h-10 w-10 border border-sidebar-border flex-shrink-0">
                    <AvatarImage src={profile?.avatar_url || undefined} alt="Foto de perfil" />
                    <AvatarFallback className="text-sm bg-sidebar-primary/20 text-sidebar-primary">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-medium text-sidebar-foreground truncate">
                      {profile?.full_name || user?.email?.split('@')[0]}
                    </div>
                    <div className="text-xs text-sidebar-foreground/60 truncate" title={user?.email}>
                      {user?.email}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border shadow-sm hover:bg-secondary transition-colors"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>

      {/* AI Copilot - Available on all pages */}
      <PortfolioCopilot ref={copilotRef} />
    </div>
  );
}
