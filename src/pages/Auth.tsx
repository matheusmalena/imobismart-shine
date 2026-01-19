import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MFAVerification } from '@/components/auth/MFAVerification';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogoText } from '@/components/common/LogoText';
import { Eye, EyeOff, Loader2, Mail, Lock, User, Building2, BarChart3, Shield, Phone } from 'lucide-react';
import { z } from 'zod';

// Client-side rate limiting for auth (before DB check)
const AUTH_RATE_LIMITS = {
  login: { maxAttempts: 5, windowMs: 60000 }, // 5 attempts per minute
  signup: { maxAttempts: 3, windowMs: 300000 }, // 3 attempts per 5 minutes
};

const authAttempts = new Map<string, { count: number; resetTime: number }>();

function checkAuthRateLimit(action: 'login' | 'signup', identifier: string): boolean {
  const key = `${action}:${identifier}`;
  const limit = AUTH_RATE_LIMITS[action];
  const now = Date.now();
  
  const attempt = authAttempts.get(key);
  
  if (attempt) {
    if (now < attempt.resetTime) {
      if (attempt.count >= limit.maxAttempts) {
        return false;
      }
      attempt.count++;
    } else {
      authAttempts.set(key, { count: 1, resetTime: now + limit.windowMs });
    }
  } else {
    authAttempts.set(key, { count: 1, resetTime: now + limit.windowMs });
  }
  
  return true;
}

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  mobileNumber: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true;
    const cleaned = val.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
  }, 'Número de celular inválido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export default function Auth() {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading, mfaPending, setMfaPending } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showMFA, setShowMFA] = useState(false);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form
  const [signupFullName, setSignupFullName] = useState('');
  const [signupMobileNumber, setSignupMobileNumber] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  useEffect(() => {
    // Only redirect if user is logged in AND MFA is not pending
    if (user && !mfaPending && !showMFA) {
      navigate('/dashboard');
    }
  }, [user, mfaPending, showMFA, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limit check (client-side first)
    if (!checkAuthRateLimit('login', loginEmail)) {
      toast({
        title: 'Muitas tentativas',
        description: 'Aguarde um minuto antes de tentar novamente.',
        variant: 'destructive',
      });
      return;
    }
    
    const result = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!result.success) {
      toast({
        title: 'Erro de validação',
        description: result.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const { error, requiresMFA } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Erro ao entrar',
        description: error.message === 'Invalid login credentials' 
          ? 'Email ou senha incorretos' 
          : error.message,
        variant: 'destructive',
      });
      return;
    }

    if (requiresMFA) {
      setShowMFA(true);
      return;
    }

    toast({
      title: 'Bem-vindo!',
      description: 'Login realizado com sucesso.',
    });
    navigate('/dashboard');
  };

  const handleMFASuccess = () => {
    setShowMFA(false);
    setMfaPending(false);
    toast({
      title: 'Bem-vindo!',
      description: 'Login realizado com sucesso.',
    });
    navigate('/dashboard');
  };

  const handleMFACancel = async () => {
    await supabase.auth.signOut();
    setShowMFA(false);
    setMfaPending(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limit check (client-side first)
    if (!checkAuthRateLimit('signup', signupEmail)) {
      toast({
        title: 'Muitas tentativas',
        description: 'Aguarde 5 minutos antes de tentar novamente.',
        variant: 'destructive',
      });
      return;
    }
    
    const result = signupSchema.safeParse({
      fullName: signupFullName,
      mobileNumber: signupMobileNumber,
      email: signupEmail,
      password: signupPassword,
      confirmPassword: signupConfirmPassword,
    });
    
    if (!result.success) {
      toast({
        title: 'Erro de validação',
        description: result.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupFullName, signupMobileNumber || undefined);
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Erro ao cadastrar',
        description: error.message === 'User already registered'
          ? 'Este email já está cadastrado'
          : error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Conta criada!',
        description: 'Sua conta foi criada com sucesso.',
      });
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show MFA verification screen
  if (showMFA) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <MFAVerification onSuccess={handleMFASuccess} onCancel={handleMFACancel} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero p-12 flex-col justify-between">
        <Link to="/" className="flex items-center gap-3">
          <LogoText size="lg" className="[&_span:first-of-type]:text-white" />
        </Link>
        
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Gestão imobiliária inteligente e simplificada
          </h1>
          <p className="text-lg text-white/80 max-w-md">
            Tenha controle total sobre seu patrimônio com métricas em tempo real, 
            documentos organizados e insights de IA.
          </p>
          <div className="space-y-4 pt-4">
            {[
              { icon: BarChart3, text: 'Dashboard com métricas automáticas' },
              { icon: Shield, text: 'Dados 100% seguros na nuvem' },
              { icon: Building2, text: 'Gestão completa de imóveis' },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-white/90">
                <div className="p-2 rounded-lg bg-white/10">
                  <item.icon className="h-5 w-5" />
                </div>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-sm text-white/60">
          © {new Date().getFullYear()} ImobiSmart. Todos os direitos reservados.
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex-1 flex flex-col bg-background">
        <div className="flex items-center justify-between p-4 lg:p-6">
          <Link to="/" className="lg:hidden">
            <LogoText size="sm" />
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center px-6 pb-6">
          <div className="w-full max-w-md space-y-6">

          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-center text-foreground">
                Acesse sua conta
              </CardTitle>
              <CardDescription className="text-center">
                Entre ou crie uma nova conta para continuar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="signup">Cadastrar</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        'Entrar'
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nome completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Seu nome"
                          value={signupFullName}
                          onChange={(e) => setSignupFullName(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-mobile">Celular (opcional)</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-mobile"
                          type="tel"
                          placeholder="(11) 99999-9999"
                          value={signupMobileNumber}
                          onChange={(e) => setSignupMobileNumber(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Confirmar senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-confirm-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={signupConfirmPassword}
                          onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cadastrando...
                        </>
                      ) : (
                        'Criar conta'
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
