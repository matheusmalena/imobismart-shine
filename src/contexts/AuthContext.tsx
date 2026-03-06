import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
  signUp: (email: string, password: string, fullName: string, mobileNumber?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mfaPending, setMfaPending] = useState(false);
  const mfaPendingRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    mfaPendingRef.current = mfaPending;
  }, [mfaPending]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        // Don't update user state if MFA/OTP is pending (use ref to avoid re-subscription)
        if (mfaPendingRef.current) return;

        if (currentSession) {
          // Validate session is not stale (deleted user) using setTimeout to avoid Supabase deadlock
          setTimeout(async () => {
            const { data: { user: verifiedUser }, error } = await supabase.auth.getUser();
            if (error || !verifiedUser) {
              console.warn('Session refers to deleted user, clearing...');
              await supabase.auth.signOut({ scope: 'local' });
              setSession(null);
              setUser(null);
              return;
            }
            setSession(currentSession);
            setUser(currentSession.user);
            setLoading(false);
          }, 0);
        } else {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      if (existingSession) {
        const { data: { user: verifiedUser }, error } = await supabase.auth.getUser();
        if (error || !verifiedUser) {
          console.warn('Session refers to deleted user, clearing...');
          await supabase.auth.signOut({ scope: 'local' });
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }
      }
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
    // Empty dependency array — listener is set up once, uses ref for mfaPending
  }, []);

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    // Set mfaPending BEFORE login to prevent onAuthStateChange from updating user state
    setMfaPending(true);
    mfaPendingRef.current = true;
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setMfaPending(false);
      mfaPendingRef.current = false;
      return { error: error as Error };
    }

    // Check if MFA is required
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const hasVerifiedFactor = factors?.totp?.some(f => f.status === 'verified');
    
    if (hasVerifiedFactor) {
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData?.currentLevel === 'aal1' && aalData?.nextLevel === 'aal2') {
        return { error: null, requiresMFA: true };
      }
    }

    // No MFA required, but keep pending for OTP verification
    return { error: null, requiresMFA: false };
  };

  const signUp = async (email: string, password: string, fullName: string, mobileNumber?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          mobile_number: mobileNumber,
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
      mfaPendingRef.current = false;
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

// Force rebuild v2
