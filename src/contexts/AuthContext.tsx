import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Helper function to check if user is blocked
async function checkUserBlocked(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .single();
  
  return data?.status === 'inactive';
}

interface SignInResult {
  error: Error | null;
  requiresMFA?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  mfaPending: boolean;
  setMfaPending: (pending: boolean) => void;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mfaPending, setMfaPending] = useState(false);

  const forceSignOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during force signout:', error);
    } finally {
      setUser(null);
      setSession(null);
      setMfaPending(false);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Don't update user state if MFA is pending
        if (mfaPending) return;
        
        // Check if user is blocked before allowing session
        if (session?.user) {
          const isBlocked = await checkUserBlocked(session.user.id);
          if (isBlocked) {
            toast.error('Sua conta foi bloqueada. Entre em contato com o suporte.');
            await forceSignOut();
            return;
          }
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      // Check if user is blocked on initial load
      if (session?.user) {
        const isBlocked = await checkUserBlocked(session.user.id);
        if (isBlocked) {
          toast.error('Sua conta foi bloqueada. Entre em contato com o suporte.');
          forceSignOut();
          return;
        }
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [mfaPending, forceSignOut]);

  // Periodic check for blocked status (every 30 seconds)
  useEffect(() => {
    if (!user) return;

    const checkBlockedInterval = setInterval(async () => {
      const isBlocked = await checkUserBlocked(user.id);
      if (isBlocked) {
        toast.error('Sua conta foi bloqueada. Entre em contato com o suporte.');
        forceSignOut();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkBlockedInterval);
  }, [user, forceSignOut]);

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    // Set mfaPending BEFORE login to prevent onAuthStateChange from updating user state
    setMfaPending(true);
    
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setMfaPending(false);
      return { error: error as Error };
    }

    // Check if user is blocked AFTER successful auth but BEFORE allowing access
    if (authData?.user) {
      const isBlocked = await checkUserBlocked(authData.user.id);
      if (isBlocked) {
        // Sign out immediately
        await supabase.auth.signOut();
        setMfaPending(false);
        return { error: new Error('Sua conta está bloqueada. Entre em contato com o suporte.') };
      }
    }

    // Check if MFA is required
    const { data: factors } = await supabase.auth.mfa.listFactors();
    console.log('MFA Factors:', factors);
    const hasVerifiedFactor = factors?.totp?.some(f => f.status === 'verified');
    console.log('Has verified factor:', hasVerifiedFactor);
    
    if (hasVerifiedFactor) {
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      console.log('AAL Data:', aalData);
      if (aalData?.currentLevel === 'aal1' && aalData?.nextLevel === 'aal2') {
        // MFA verification required - keep pending state
        return { error: null, requiresMFA: true };
      }
    }

    // No MFA required, allow user state update
    setMfaPending(false);
    return { error: null, requiresMFA: false };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro no signOut:', error);
        if (error.message?.includes('session_not_found')) {
          await supabase.auth.signOut({ scope: 'local' });
        }
      }
    } catch (error) {
      console.error('Erro inesperado no signOut:', error);
    } finally {
      setUser(null);
      setSession(null);
      setMfaPending(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, mfaPending, setMfaPending, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
