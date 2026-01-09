import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useCallback, useRef } from 'react';

interface RateLimitConfig {
  action: string;
  maxRequests?: number;
  windowMinutes?: number;
  showToast?: boolean;
}

interface RateLimitResult {
  allowed: boolean;
  error?: string;
}

// Client-side rate limit tracking (backup for when DB call fails)
const clientLimits = new Map<string, { count: number; resetTime: number }>();

export function useRateLimit() {
  const { user } = useAuth();
  const pendingChecks = useRef<Set<string>>(new Set());

  const checkRateLimit = useCallback(async ({
    action,
    maxRequests = 100,
    windowMinutes = 1,
    showToast = true,
  }: RateLimitConfig): Promise<RateLimitResult> => {
    if (!user) {
      return { allowed: false, error: 'Usuário não autenticado' };
    }

    const limitKey = `${user.id}:${action}`;

    // Prevent duplicate concurrent checks for the same action
    if (pendingChecks.current.has(limitKey)) {
      return { allowed: true };
    }

    // Client-side check first (fast path)
    const now = Date.now();
    const clientLimit = clientLimits.get(limitKey);
    
    if (clientLimit) {
      if (now < clientLimit.resetTime) {
        if (clientLimit.count >= maxRequests) {
          if (showToast) {
            toast.error('Muitas requisições. Aguarde um momento.');
          }
          return { allowed: false, error: 'Rate limit exceeded (client)' };
        }
        clientLimit.count++;
      } else {
        // Reset window
        clientLimits.set(limitKey, { count: 1, resetTime: now + windowMinutes * 60 * 1000 });
      }
    } else {
      clientLimits.set(limitKey, { count: 1, resetTime: now + windowMinutes * 60 * 1000 });
    }

    // Server-side check (authoritative)
    try {
      pendingChecks.current.add(limitKey);
      
      const { data, error } = await supabase.rpc('check_rate_limit', {
        _user_id: user.id,
        _action: action,
        _max_requests: maxRequests,
        _window_minutes: windowMinutes,
      });

      pendingChecks.current.delete(limitKey);

      if (error) {
        console.error('Rate limit check error:', error);
        // Fall back to client-side limit on error
        return { allowed: true };
      }

      if (!data) {
        if (showToast) {
          toast.error('Limite de requisições atingido. Aguarde um momento.');
        }
        return { allowed: false, error: 'Rate limit exceeded' };
      }

      return { allowed: true };
    } catch (error) {
      pendingChecks.current.delete(limitKey);
      console.error('Rate limit check failed:', error);
      // Allow on error to prevent blocking legitimate users
      return { allowed: true };
    }
  }, [user]);

  // Wrapper to execute action only if rate limit allows
  const withRateLimit = useCallback(async <T>(
    config: RateLimitConfig,
    action: () => Promise<T>
  ): Promise<T | null> => {
    const result = await checkRateLimit(config);
    
    if (!result.allowed) {
      return null;
    }

    return action();
  }, [checkRateLimit]);

  return {
    checkRateLimit,
    withRateLimit,
  };
}

// Predefined rate limit configs for common actions
export const RATE_LIMITS = {
  // Auth actions - stricter limits
  LOGIN: { action: 'login', maxRequests: 5, windowMinutes: 1 },
  SIGNUP: { action: 'signup', maxRequests: 3, windowMinutes: 5 },
  PASSWORD_RESET: { action: 'password_reset', maxRequests: 3, windowMinutes: 15 },
  
  // CRUD operations - moderate limits
  CREATE_PROPERTY: { action: 'create_property', maxRequests: 10, windowMinutes: 1 },
  UPDATE_PROPERTY: { action: 'update_property', maxRequests: 30, windowMinutes: 1 },
  DELETE_PROPERTY: { action: 'delete_property', maxRequests: 10, windowMinutes: 1 },
  
  // Document operations
  UPLOAD_DOCUMENT: { action: 'upload_document', maxRequests: 20, windowMinutes: 1 },
  DELETE_DOCUMENT: { action: 'delete_document', maxRequests: 20, windowMinutes: 1 },
  
  // Data fetching - more lenient
  FETCH_DATA: { action: 'fetch_data', maxRequests: 100, windowMinutes: 1 },
  
  // Export operations - stricter
  EXPORT_DATA: { action: 'export_data', maxRequests: 5, windowMinutes: 5 },
  GENERATE_REPORT: { action: 'generate_report', maxRequests: 5, windowMinutes: 5 },
  
  // Profile updates
  UPDATE_PROFILE: { action: 'update_profile', maxRequests: 10, windowMinutes: 1 },
  UPLOAD_AVATAR: { action: 'upload_avatar', maxRequests: 5, windowMinutes: 1 },
} as const;
