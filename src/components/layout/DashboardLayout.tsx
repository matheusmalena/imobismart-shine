import { ReactNode, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/hooks/useUserData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
  Lock,
  CreditCard,
  Users,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
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
];

const adminNavigation = [
  { name: 'Clientes', href: '/admin/clients', icon: Crown },
  { name: 'Planos', href: '/admin/plans', icon: CreditCard },
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
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
            <div className="flex-1">
              <LogoText size="md" className="[&_span.logo-name]:text-sidebar-foreground" />
            </div>
            <button
              className="lg:hidden text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
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

            {/* Unified Reports link - Pro+ */}
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
              {!isPro && (
                <Badge variant="outline" className="ml-auto gap-1 text-xs bg-sidebar-accent">
                  <Lock className="h-3 w-3" />
                  Upgrade
                </Badge>
              )}
            </Link>

            {/* Enterprise Feature: Equipe */}
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
              {!isEnterprise && (
                <Badge variant="outline" className="ml-auto gap-1 text-xs bg-amber-500/10 border-amber-500/30 text-amber-600">
                  <Lock className="h-3 w-3" />
                  Upgrade
                </Badge>
              )}
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

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar - Simplified without AI input */}
        <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 lg:px-8">
          <button
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex-1" />

          <ThemeToggle />
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>

      {/* AI Copilot - Available on all pages */}
      <PortfolioCopilot ref={copilotRef} />
    </div>
  );
}
