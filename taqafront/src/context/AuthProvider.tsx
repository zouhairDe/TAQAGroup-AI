"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { Session, SessionContextType, SessionProviderProps, SessionUser, SignOutOptions } from '@/types/session';
import { User } from '@/types/auth';

const AuthContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ 
  children, 
  refetchOnWindowFocus = true, 
  refetchOnReconnect = true 
}: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  // Convert User to SessionUser
  const convertUserToSessionUser = useCallback((user: User): SessionUser => {
    return {
      ...user,
      sessionId: `session_${user.id}_${Date.now()}`,
      permissions: [], // This could be populated from the backend
      lastPasswordChange: undefined,
      passwordExpiresAt: undefined,
    };
  }, []);

  // Create session from user data
  const createSession = useCallback((user: User, token: string, requiresPasswordChange: boolean = false): Session => {
    const now = new Date();
    const expires = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days

    return {
      user: convertUserToSessionUser(user),
      token,
      expires,
      requiresPasswordChange,
      lastActivity: now,
      isActive: true,
    };
  }, [convertUserToSessionUser]);

  // Get current session
  const getSession = useCallback(async (): Promise<Session | null> => {
    try {
      setError(null);
      
      const token = AuthService.getToken();
      if (!token) {
        setStatus('unauthenticated');
        return null;
      }

      const user = await AuthService.verifyToken();
      if (!user) {
        setStatus('unauthenticated');
        return null;
      }

      const newSession = createSession(user, token, user.isFirstLogin);
      setSession(newSession);
      setStatus('authenticated');
      
      return newSession;
    } catch (error) {
      console.error('Session verification failed:', error);
      setError(error instanceof Error ? error.message : 'Session verification failed');
      setStatus('unauthenticated');
      setSession(null);
      return null;
    }
  }, [createSession]);

  // Verify session validity with retry logic
  const verifySession = useCallback(async (retries = 1): Promise<boolean> => {
    try {
      const currentSession = await getSession();
      return currentSession !== null;
    } catch (error) {
      console.error('Session verification error:', error);
      
      // If we have retries left and it's a network error, try again
      if (retries > 0 && (error instanceof TypeError && error.message.includes('fetch'))) {
        console.log('Network error during session verification, retrying...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        return verifySession(retries - 1);
      }
      
      // Only return false if we're sure it's an auth issue, not a network issue
      return false;
    }
  }, [getSession]);

  // Update session data
  const update = useCallback(async (data?: any): Promise<Session | null> => {
    try {
      if (!session) {
        return await getSession();
      }

      // If specific data is provided, update the session
      if (data) {
        const updatedSession: Session = {
          ...session,
          user: { ...session.user, ...data },
          lastActivity: new Date(),
        };
        setSession(updatedSession);
        return updatedSession;
      }

      // Otherwise refresh the session
      return await getSession();
    } catch (error) {
      console.error('Session update failed:', error);
      setError(error instanceof Error ? error.message : 'Session update failed');
      return null;
    }
  }, [session, getSession]);

  // Sign out
  const signOut = useCallback(async (options: SignOutOptions = {}): Promise<void> => {
    try {
      setError(null);
      console.log('SignOut: Starting logout process...');
      
      // STEP 1: Set logout state and clear session
      setIsLoggingOut(true);
      setStatus('loading');
      setSession(null);
      console.log('SignOut: Session cleared, logout state set');
      
      // STEP 2: Clear tokens locally first (synchronous)
      AuthService.clearToken();
      AuthService.clearUser();
      console.log('SignOut: Local tokens cleared');
      
      // STEP 3: Set status to unauthenticated immediately
      setStatus('unauthenticated');
      console.log('SignOut: Status set to unauthenticated');
      
      // STEP 4: Call backend logout (async, but don't wait for it to fail)
      try {
        await AuthService.logout();
        console.log('SignOut: Backend logout successful');
      } catch (backendError) {
        console.log('SignOut: Backend logout failed, but continuing with redirect');
      }
      
      // STEP 5: Force redirect immediately
      if (options.redirect !== false) {
        const redirectUrl = options.callbackUrl || '/auth/login';
        console.log('SignOut: Redirecting to:', redirectUrl);
        
        // Use window.location.replace for immediate, non-reversible redirect
        if (typeof window !== 'undefined') {
          window.location.replace(redirectUrl);
        }
      }
    } catch (error) {
      console.error('Sign out failed:', error);
      setError(error instanceof Error ? error.message : 'Sign out failed');
      
      // Ensure we're logged out locally even if everything fails
      setSession(null);
      setStatus('unauthenticated');
      setIsLoggingOut(false);
      AuthService.clearToken();
      AuthService.clearUser();
      
      // Force redirect even on error
      if (options.redirect !== false) {
        const redirectUrl = options.callbackUrl || '/auth/login';
        if (typeof window !== 'undefined') {
          window.location.replace(redirectUrl);
        }
      }
    }
  }, [router]);

  // Initialize session on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setIsInitialLoading(true);
        await getSession();
      } catch (error) {
        console.error('Session initialization failed:', error);
      } finally {
        setIsInitialLoading(false);
        setIsLoggingOut(false); // Ensure logout state is cleared on initial load
      }
    };

    initializeSession();
  }, [getSession]);

  // Listen for localStorage changes to update session immediately
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'taqa_auth_token' || e.key === 'taqa_user_data') {
        // Token or user data changed, refresh session
        getSession();
      }
    };

    // Custom event for same-tab localStorage changes
    const handleAuthChange = () => {
      getSession();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [getSession]);

  // Periodic session validation (with failure tolerance)
  useEffect(() => {
    if (status !== 'authenticated' || !session) return;

    let consecutiveFailures = 0;
    const MAX_FAILURES = 3; // Allow 3 consecutive failures before signing out

    const validateSession = async () => {
      try {
        const isValid = await verifySession(2); // Use 2 retries for periodic validation
        if (isValid) {
          consecutiveFailures = 0; // Reset failure count on success
        } else {
          consecutiveFailures++;
          console.warn(`Session validation failed (${consecutiveFailures}/${MAX_FAILURES})`);
          
          // Only sign out after multiple consecutive failures
          if (consecutiveFailures >= MAX_FAILURES) {
            console.log('Multiple session validation failures, signing out...');
            await signOut({ redirect: false });
          }
        }
      } catch (error) {
        console.error('Session validation failed:', error);
        consecutiveFailures++;
        
        // Only sign out after multiple consecutive failures
        if (consecutiveFailures >= MAX_FAILURES) {
          console.log('Multiple session validation failures, signing out...');
          await signOut({ redirect: false });
        }
      }
    };

    // Validate session every 5 minutes
    const interval = setInterval(validateSession, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [status, session, verifySession, signOut]);

  // Handle window focus (throttled to prevent excessive validation)
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    let lastValidation = 0;
    const VALIDATION_THROTTLE = 60 * 1000; // Only validate once per minute

    const handleWindowFocus = () => {
      const now = Date.now();
      if (status === 'authenticated' && (now - lastValidation) > VALIDATION_THROTTLE) {
        lastValidation = now;
        verifySession();
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [refetchOnWindowFocus, status, verifySession]);

  // Handle online/offline
  useEffect(() => {
    if (!refetchOnReconnect) return;

    const handleOnline = () => {
      if (status === 'authenticated') {
        verifySession();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [refetchOnReconnect, status, verifySession]);

  // Session activity tracking
  useEffect(() => {
    if (status !== 'authenticated' || !session) return;

    const updateActivity = () => {
      if (session) {
        setSession(prev => prev ? { ...prev, lastActivity: new Date() } : null);
      }
    };

    // Track user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [status, session]);

  const value: SessionContextType = {
    data: session,
    status,
    error,
    isInitialLoading,
    isLoggingOut,
    update,
    signOut,
    getSession,
    verifySession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the session context
export function useSession() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

// Hook for protecting routes
export function useRequireAuth() {
  const { data: session, status, isInitialLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isInitialLoading) return;

    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, isInitialLoading, router]);

  return { session, status, isInitialLoading, isAuthenticated: status === 'authenticated' };
}

// Hook for auth-only pages (redirect to dashboard if authenticated)
export function useAuthPages() {
  const { data: session, status, isInitialLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isInitialLoading) return;

    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, isInitialLoading, router]);

  return { session, status, isInitialLoading, isUnauthenticated: status === 'unauthenticated' };
} 