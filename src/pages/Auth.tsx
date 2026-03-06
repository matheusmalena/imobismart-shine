import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MFAVerification } from '@/components/auth/MFAVerification';
import { EmailOTPVerification } from '@/components/auth/EmailOTPVerification';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogoText } from '@/components/common/LogoText';
import { Eye, EyeOff, Loader2, Mail, Lock, User, Building2, BarChart3, Shield, Phone, CheckCircle } from 'lucide-react';
import { z } from 'zod';

// Client-side rate limiting for auth (before DB check)
const AUTH_RATE_LIMITS = {
  login: { maxAttempts: 5, windowMs: 60000 },
  signup: { maxAttempts: 3, windowMs: 300000 },
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

type AuthView = 'default' | 'emailOTP' | 'signupOTP' | 'mfa' | 'emailConfirmation' | 'emailVerified';

export default function Auth() {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading, mfaPending, setMfaPending } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('default');

  // No longer needed - using custom OTP verification instead of link-based

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form
  const [signupFullName, setSignupFullName] = useState('');
  const [signupMobileNumber, setSignupMobileNumber] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      toast({ title: 'Email obrigatório', description: 'Digite seu email para recuperar a senha.', variant: 'destructive' });
      return;
    }
    setForgotPasswordLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
      redirectTo: `${window.location.origin}/auth?reset=true`,
    });
    setForgotPasswordLoading(false);
    if (error) {
      toast({ title: 'Erro ao enviar email', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Email enviado!', description: 'Verifique sua caixa de entrada para redefinir a senha.' });
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
    }
  };

  useEffect(() => {
    if (user && !mfaPending && authView === 'default') {
      const provider = user.app_metadata?.provider;
      const createdAt = new Date(user.created_at).getTime();
      const now = Date.now();
      const isNewUser = now - createdAt < 15000;

      if (provider === 'google' && isNewUser) {
        (async () => {
          await supabase.auth.signOut();
          toast({
            title: 'Conta não encontrada',
            description: 'Você precisa criar uma conta primeiro. Cadastre-se na aba "Cadastrar".',
            variant: 'destructive',
            duration: 8000,
          });
        })();
        return;
      }
      navigate('/dashboard');
    }
  }, [user, mfaPending, authView, navigate]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result?.error) {
        toast({ title: 'Erro ao entrar com Google', description: result.error.message || 'Tente novamente.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Erro ao entrar com Google', description: 'Tente novamente.', variant: 'destructive' });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkAuthRateLimit('login', loginEmail)) {
      toast({ title: 'Muitas tentativas', description: 'Aguarde um minuto antes de tentar novamente.', variant: 'destructive' });
      return;
    }
    const result = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!result.success) {
      toast({ title: 'Erro de validação', description: result.error.errors[0].message, variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const { error, requiresMFA } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);
    if (error) {
      toast({
        title: 'Erro ao entrar',
        description: error.message === 'Invalid login credentials' ? 'Email ou senha incorretos' : error.message,
        variant: 'destructive',
      });
      return;
    }
    if (requiresMFA) {
      setAuthView('mfa');
      return;
    }
    // Send OTP code for email verification
    setOtpEmail(loginEmail);
    try {
      const { data, error: otpError } = await supabase.functions.invoke('send-login-otp', { body: { email: loginEmail } });
      if (otpError || !data?.success) {
        toast({ title: 'Erro ao enviar código', description: 'Tente novamente.', variant: 'destructive' });
        await supabase.auth.signOut();
        setMfaPending(false);
        return;
      }
      setAuthView('emailOTP');
    } catch {
      toast({ title: 'Erro ao enviar código', description: 'Tente novamente.', variant: 'destructive' });
      await supabase.auth.signOut();
      setMfaPending(false);
    }
  };

  const handleOTPSuccess = () => {
    setAuthView('default');
    setMfaPending(false);
    toast({ title: 'Bem-vindo!', description: 'Login realizado com sucesso.' });
    navigate('/dashboard');
  };

  const handleSignupOTPSuccess = async () => {
    // Sign out after signup verification so user must login
    await supabase.auth.signOut({ scope: 'local' });
    setMfaPending(false);
    setAuthView('emailVerified');
  };

  const handleOTPCancel = async () => {
    await supabase.auth.signOut();
    setAuthView('default');
    setMfaPending(false);
  };

  const handleMFASuccess = async () => {
    // After MFA, send OTP for additional verification
    const email = user?.email || loginEmail;
    setOtpEmail(email);
    try {
      const { data, error: otpError } = await supabase.functions.invoke('send-login-otp', { body: { email } });
      if (otpError || !data?.success) {
        toast({ title: 'Erro ao enviar código', description: 'Tente novamente.', variant: 'destructive' });
        await supabase.auth.signOut();
        setMfaPending(false);
        setAuthView('default');
        return;
      }
      setAuthView('emailOTP');
    } catch {
      toast({ title: 'Erro ao enviar código', description: 'Tente novamente.', variant: 'destructive' });
      await supabase.auth.signOut();
      setMfaPending(false);
      setAuthView('default');
    }
  };

  const handleMFACancel = async () => {
    await supabase.auth.signOut();
    setAuthView('default');
    setMfaPending(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkAuthRateLimit('signup', signupEmail)) {
      toast({ title: 'Muitas tentativas', description: 'Aguarde 5 minutos antes de tentar novamente.', variant: 'destructive' });
      return;
    }
    const result = signupSchema.safeParse({
      fullName: signupFullName, mobileNumber: signupMobileNumber,
      email: signupEmail, password: signupPassword, confirmPassword: signupConfirmPassword,
    });
    if (!result.success) {
      toast({ title: 'Erro de validação', description: result.error.errors[0].message, variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupFullName, signupMobileNumber || undefined);
    setIsLoading(false);
    if (error) {
      toast({
        title: 'Erro ao cadastrar',
        description: error.message === 'User already registered' ? 'Este email já está cadastrado' : error.message,
        variant: 'destructive',
      });
      return;
    }
    // Send OTP for email verification via Resend
    setOtpEmail(signupEmail);
    try {
      const { data, error: otpError } = await supabase.functions.invoke('send-login-otp', { body: { email: signupEmail } });
      if (otpError || !data?.success) {
        toast({ title: 'Erro ao enviar código', description: 'Tente novamente.', variant: 'destructive' });
        return;
      }
      setAuthView('signupOTP');
    } catch {
      toast({ title: 'Erro ao enviar código', description: 'Tente novamente.', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Dynamic header content based on authView
  const getHeaderContent = () => {
    switch (authView) {
      case 'emailOTP':
        return { title: 'Verificação por Email', subtitle: `Digite o código de 6 dígitos enviado para ${otpEmail}` };
      case 'emailVerified':
        return { title: 'Email Verificado!', subtitle: 'Seu email foi confirmado com sucesso' };
      case 'mfa':
        return { title: 'Verificação em Duas Etapas', subtitle: 'Digite o código do seu aplicativo autenticador' };
      case 'emailConfirmation':
        return { title: 'Verifique seu Email', subtitle: 'Falta pouco para completar seu cadastro' };
      default:
        return showForgotPassword
          ? { title: 'Recuperar senha', subtitle: 'Digite seu email para receber o link de recuperação' }
          : { title: 'Acesse sua conta', subtitle: 'Entre ou crie uma nova conta para continuar' };
    }
  };

  const header = getHeaderContent();

  const GoogleButton = ({ label }: { label: string }) => (
    <Button type="button" variant="outline" className="w-full" size="lg" onClick={handleGoogleSignIn} disabled={googleLoading}>
      {googleLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      )}
      {label}
    </Button>
  );

  const Divider = () => (
    <div className="relative my-4">
      <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-2 text-muted-foreground">ou</span>
      </div>
    </div>
  );

  const renderRightContent = () => {
    if (authView === 'emailOTP') {
      return <EmailOTPVerification email={otpEmail} onSuccess={handleOTPSuccess} onCancel={handleOTPCancel} inline />;
    }

    if (authView === 'mfa') {
      return <MFAVerification onSuccess={handleMFASuccess} onCancel={handleMFACancel} inline />;
    }

    if (authView === 'emailVerified') {
      return (
        <div className="space-y-4">
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-center text-foreground font-medium">
            Seu email foi verificado com sucesso!
          </p>
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground text-center">
            Agora você pode fazer login com suas credenciais.
          </div>
          <Button className="w-full" size="lg" onClick={() => setAuthView('default')}>
            Ir para o login
          </Button>
        </div>
      );
    }

    if (authView === 'emailConfirmation') {
      return (
        <div className="space-y-4">
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <p className="text-center text-foreground font-medium">
            Enviamos um link de confirmação para:
          </p>
          <p className="text-center text-primary font-semibold">{signupEmail}</p>
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground text-center">
            Abra seu email e clique no link de confirmação. Após confirmar, volte aqui para fazer login.
          </div>
          <Button variant="outline" className="w-full" size="lg" onClick={() => setAuthView('default')}>
            Voltar ao login
          </Button>
        </div>
      );
    }

    // Default: login/signup tabs
    return (
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="login">Entrar</TabsTrigger>
          <TabsTrigger value="signup">Cadastrar</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <GoogleButton label="Entrar com Google" />
          <Divider />
          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="forgot-email" type="email" placeholder="seu@email.com" value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={forgotPasswordLoading}>
                {forgotPasswordLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</>) : 'Enviar link de recuperação'}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setShowForgotPassword(false)}>
                Voltar ao login
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="login-email" type="email" placeholder="seu@email.com" value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Senha</Label>
                  <button type="button" onClick={() => setShowForgotPassword(true)} className="text-sm text-primary hover:underline">
                    Esqueci minha senha
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="login-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                    value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="pl-10 pr-10" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Entrando...</>) : 'Entrar'}
              </Button>
            </form>
          )}
        </TabsContent>

        <TabsContent value="signup">
          <GoogleButton label="Cadastrar com Google" />
          <Divider />
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="signup-name" type="text" placeholder="Seu nome" value={signupFullName}
                  onChange={(e) => setSignupFullName(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-mobile">Celular (opcional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="signup-mobile" type="tel" placeholder="(11) 99999-9999" value={signupMobileNumber}
                  onChange={(e) => setSignupMobileNumber(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="signup-email" type="email" placeholder="seu@email.com" value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="signup-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                  value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className="pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-confirm-password">Confirmar senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="signup-confirm-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                  value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cadastrando...</>) : 'Criar conta'}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    );
  };

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
                  {header.title}
                </CardTitle>
                <CardDescription className="text-center">
                  {header.subtitle}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderRightContent()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
