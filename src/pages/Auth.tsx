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
import { toast } from 'sonner';
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
  password: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

const PASSWORD_RULES = [
  { label: 'Mínimo 8 caracteres', test: (v: string) => v.length >= 8 },
  { label: 'Uma letra maiúscula', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Uma letra minúscula', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Um número', test: (v: string) => /[0-9]/.test(v) },
  { label: 'Um caractere especial', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

type AuthView = 'default' | 'emailOTP' | 'mfa' | 'emailConfirmation' | 'emailVerified';

export default function Auth() {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading, mfaPending, setMfaPending } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('default');

  // Detect email confirmation from Supabase link redirect or ?verified=true from global interceptor
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('verified') === 'true') {
      setAuthView('emailVerified');
      window.history.replaceState(null, '', window.location.pathname);
      return;
    }
    
    if (hash && hash.includes('type=signup')) {
      supabase.auth.signOut({ scope: 'local' }).then(() => {
        setAuthView('emailVerified');
      });
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

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
      toast.error('Email obrigatório', { description: 'Digite seu email para recuperar a senha.' });
      return;
    }
    setForgotPasswordLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
      redirectTo: `${window.location.origin}/auth?reset=true`,
    });
    setForgotPasswordLoading(false);
    if (error) {
      toast.error('Erro ao enviar email', { description: error.message });
    } else {
      toast.success('Email enviado!', { description: 'Verifique sua caixa de entrada para redefinir a senha.' });
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
    }
  };

  // Handle Google OAuth return — deterministic check using profiles table + pre-redirect timestamp
  useEffect(() => {
    if (!user || mfaPending || authView !== 'default') return;

    const provider = user.app_metadata?.provider;
    const savedTab = localStorage.getItem('imobismart-auth-tab');
    const savedTimestamp = localStorage.getItem('imobismart-auth-ts');

    if (provider === 'google' && savedTab && savedTimestamp) {
      // Prevent multiple executions
      const alreadyProcessing = localStorage.getItem('imobismart-auth-processing');
      if (alreadyProcessing) return;
      localStorage.setItem('imobismart-auth-processing', 'true');

      (async () => {
        try {
          const preRedirectTs = parseInt(savedTimestamp, 10);

          // Query the profiles table to check if user existed before this redirect
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('created_at')
            .eq('user_id', user.id)
            .single();

          if (profileError || !profile) {
            // Profile not found — shouldn't happen since trigger creates it, treat as new
            await supabase.auth.signOut();
            toast.error('Erro ao verificar conta', {
              description: 'Tente novamente.',
              duration: 6000,
            });
            return;
          }

          const profileCreatedAt = new Date(profile.created_at).getTime();
          const isExistingUser = preRedirectTs > 0 && profileCreatedAt < preRedirectTs;

          if (!isExistingUser && savedTab === 'login') {
            // New user tried to login — block
            await supabase.auth.signOut();
            toast.error('Conta não encontrada', {
              description: 'Você precisa criar uma conta primeiro. Cadastre-se na aba "Cadastrar".',
              duration: 8000,
            });
            return;
          }

          if (isExistingUser && savedTab === 'signup') {
            // Existing user tried to sign up again — block
            await supabase.auth.signOut();
            toast.error('Você já possui uma conta', {
              description: 'Faça login na aba "Entrar" com o Google.',
              duration: 8000,
            });
            return;
          }

          if (isExistingUser && savedTab === 'login') {
            // Existing user logging in — send OTP for verification (same security as email/password)
            const email = user.email;
            if (!email) {
              await supabase.auth.signOut();
              toast.error('Erro ao verificar conta', { description: 'Email não encontrado.' });
              return;
            }

            setMfaPending(true);
            setOtpEmail(email);

            const { data, error: otpError } = await supabase.functions.invoke('send-login-otp', {
              body: { email },
            });

            if (otpError || !data?.success) {
              toast.error('Erro ao enviar código de verificação', { description: 'Tente novamente.' });
              await supabase.auth.signOut();
              setMfaPending(false);
              return;
            }

            setAuthView('emailOTP');
            return;
          }

          // New user + signup tab — valid first-time signup, go straight to dashboard
          toast.success('Conta criada com sucesso!', { description: 'Bem-vindo ao ImobiSmart.' });
          navigate('/dashboard');
        } finally {
          localStorage.removeItem('imobismart-auth-tab');
          localStorage.removeItem('imobismart-auth-ts');
          localStorage.removeItem('imobismart-auth-processing');
        }
      })();
      return;
    }

    // Non-Google user already authenticated (e.g. returning session)
    if (!savedTab) {
      navigate('/dashboard');
    }
  }, [user, mfaPending, authView, navigate]);

  const handleGoogleSignIn = async (tab: 'login' | 'signup') => {
    setGoogleLoading(true);
    localStorage.setItem('imobismart-auth-tab', tab);
    localStorage.setItem('imobismart-auth-ts', Date.now().toString());
    localStorage.removeItem('imobismart-auth-processing');
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result?.error) {
        localStorage.removeItem('imobismart-auth-tab');
        localStorage.removeItem('imobismart-auth-ts');
        toast.error('Erro ao entrar com Google', { description: result.error.message || 'Tente novamente.' });
      }
    } catch {
      localStorage.removeItem('imobismart-auth-tab');
      localStorage.removeItem('imobismart-auth-ts');
      toast.error('Erro ao entrar com Google', { description: 'Tente novamente.' });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkAuthRateLimit('login', loginEmail)) {
      toast.error('Muitas tentativas', { description: 'Aguarde um minuto antes de tentar novamente.' });
      return;
    }
    const result = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!result.success) {
      toast.error('Erro de validação', { description: result.error.errors[0].message });
      return;
    }
    setIsLoading(true);
    const { error, requiresMFA } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);
    if (error) {
      toast.error('Erro ao entrar', {
        description: error.message === 'Invalid login credentials' ? 'Email ou senha incorretos' : error.message,
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
        toast.error('Erro ao enviar código', { description: 'Tente novamente.' });
        await supabase.auth.signOut();
        setMfaPending(false);
        return;
      }
      setAuthView('emailOTP');
    } catch {
      toast.error('Erro ao enviar código', { description: 'Tente novamente.' });
      await supabase.auth.signOut();
      setMfaPending(false);
    }
  };

  const handleOTPSuccess = () => {
    setMfaPending(false);
    toast.success('Bem-vindo!', { description: 'Login realizado com sucesso.' });
    navigate('/dashboard');
  };


  const handleOTPCancel = async () => {
    await supabase.auth.signOut();
    setAuthView('default');
    setMfaPending(false);
  };

  const handleMFASuccess = async () => {
    const email = user?.email || loginEmail;
    setOtpEmail(email);
    try {
      const { data, error: otpError } = await supabase.functions.invoke('send-login-otp', { body: { email } });
      if (otpError || !data?.success) {
        toast.error('Erro ao enviar código', { description: 'Tente novamente.' });
        await supabase.auth.signOut();
        setMfaPending(false);
        setAuthView('default');
        return;
      }
      setAuthView('emailOTP');
    } catch {
      toast.error('Erro ao enviar código', { description: 'Tente novamente.' });
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
      toast.error('Muitas tentativas', { description: 'Aguarde 5 minutos antes de tentar novamente.' });
      return;
    }
    const result = signupSchema.safeParse({
      fullName: signupFullName, mobileNumber: signupMobileNumber,
      email: signupEmail, password: signupPassword, confirmPassword: signupConfirmPassword,
    });
    if (!result.success) {
      toast.error('Erro de validação', { description: result.error.errors[0].message });
      return;
    }
    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupFullName, signupMobileNumber || undefined);
    setIsLoading(false);
    if (error) {
      toast.error('Erro ao cadastrar', {
        description: error.message === 'User already registered' ? 'Este email já está cadastrado' : error.message,
      });
      return;
    }
    // Show email confirmation screen - user must click the link sent by Supabase
    setOtpEmail(signupEmail);
    setAuthView('emailConfirmation');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Full-screen email confirmation pending page
  if (authView === 'emailConfirmation') {
    return (
      <div className="min-h-screen bg-white dark:bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-primary/10">
              <Mail className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Confirme seu e-mail
          </h1>
          <p className="text-lg text-muted-foreground">
            Enviamos um link de confirmação para <strong>{otpEmail}</strong>. Clique no link para ativar sua conta.
          </p>
          <p className="text-sm text-muted-foreground">
            Não recebeu? Verifique sua caixa de spam.
          </p>
          <Button variant="outline" size="lg" className="w-full max-w-xs mx-auto" onClick={() => setAuthView('default')}>
            Voltar ao login
          </Button>
        </div>
      </div>
    );
  }

  // Full-screen email verified page
  if (authView === 'emailVerified') {
    return (
      <div className="min-h-screen bg-white dark:bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            E-mail verificado com sucesso!
          </h1>
          <p className="text-lg text-muted-foreground">
            Você já pode fazer login na plataforma.
          </p>
          <Button size="lg" className="w-full max-w-xs mx-auto" onClick={() => setAuthView('default')}>
            Ir para o login
          </Button>
        </div>
      </div>
    );
  }

  // Dynamic header content based on authView
  const getHeaderContent = () => {
    switch (authView) {
      case 'emailOTP':
        return { title: 'Verificação por Email', subtitle: `Digite o código de 6 dígitos enviado para ${otpEmail}` };
      case 'mfa':
        return { title: 'Verificação em Duas Etapas', subtitle: 'Digite o código do seu aplicativo autenticador' };
      default:
        return showForgotPassword
          ? { title: 'Recuperar senha', subtitle: 'Digite seu email para receber o link de recuperação' }
          : { title: 'Acesse sua conta', subtitle: 'Entre ou crie uma nova conta para continuar' };
    }
  };

  const header = getHeaderContent();

  const GoogleButton = ({ label, tab }: { label: string; tab: 'login' | 'signup' }) => (
    <Button type="button" variant="outline" className="w-full" size="lg" onClick={() => handleGoogleSignIn(tab)} disabled={googleLoading}>
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

    // Default: login/signup tabs
    return (
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="login">Entrar</TabsTrigger>
          <TabsTrigger value="signup">Cadastrar</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <GoogleButton label="Entrar com Google" tab="login" />
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
          <GoogleButton label="Cadastrar com Google" tab="signup" />
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
              {signupPassword.length > 0 && (
                <div className="space-y-1 pt-1">
                  {PASSWORD_RULES.map((rule) => {
                    const passed = rule.test(signupPassword);
                    return (
                      <div key={rule.label} className="flex items-center gap-2 text-xs">
                        <CheckCircle className={`h-3.5 w-3.5 ${passed ? 'text-green-500' : 'text-muted-foreground/40'}`} />
                        <span className={passed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>{rule.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
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
