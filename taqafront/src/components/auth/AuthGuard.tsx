"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/AuthProvider';
import { AuthGuardProps } from '@/types/session';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Default loading component
const DefaultLoading = () => (
  <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
    <div className="flex flex-col items-center space-y-4">
      <LoadingSpinner className="w-8 h-8 text-taqa-electric-blue" />
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Vérification de votre session...
      </p>
    </div>
  </div>
);

// Default fallback component for unauthenticated users
const DefaultFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
    <div className="max-w-md mx-auto text-center">
      <div className="mb-4">
        <svg
          className="w-16 h-16 mx-auto text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Accès restreint
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Vous devez être connecté pour accéder à cette page.
      </p>
      <button
        onClick={() => window.location.href = '/auth/login'}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-taqa-electric-blue hover:bg-taqa-navy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-taqa-electric-blue"
      >
        Se connecter
      </button>
    </div>
  </div>
);

/**
 * AuthGuard component that protects routes and handles authentication state
 */
export function AuthGuard({
  children,
  loading: LoadingComponent = DefaultLoading,
  fallback: FallbackComponent = DefaultFallback,
  redirectTo = '/auth/login',
  requireAuth = true,
}: AuthGuardProps) {
  const { session, status, isInitialLoading } = useSession();
  const router = useRouter();

  // Handle redirects in useEffect to avoid rendering issues
  React.useEffect(() => {
    if (isInitialLoading || status === 'loading') return;

    if (requireAuth) {
      if (status === 'unauthenticated' && redirectTo) {
        router.push(redirectTo);
        return;
      }

      // Check if user needs to change password
      if (session?.requiresPasswordChange && 
          !window.location.pathname.includes('/auth/change-password')) {
        router.push('/auth/change-password');
        return;
      }
    }
  }, [status, isInitialLoading, requireAuth, redirectTo, router, session?.requiresPasswordChange]);

  // Show loading state during initial session check
  if (isInitialLoading || status === 'loading') {
    return <LoadingComponent />;
  }

  // Handle authentication requirement
  if (requireAuth) {
    if (status === 'unauthenticated') {
      // Show fallback if no redirect specified, otherwise loading while redirecting
      if (!redirectTo) {
        return <FallbackComponent />;
      }
      return <LoadingComponent />;
    }

    // Show loading while redirecting for password change
    if (session?.requiresPasswordChange && 
        !window.location.pathname.includes('/auth/change-password')) {
      return <LoadingComponent />;
    }
  }

  // If not requiring auth, just render children
  return <>{children}</>;
}

/**
 * ProtectedRoute component - shorthand for AuthGuard with requireAuth=true
 */
export function ProtectedRoute({
  children,
  loading,
  fallback,
  redirectTo = '/auth/login',
}: Omit<AuthGuardProps, 'requireAuth'>) {
  return (
    <AuthGuard
      requireAuth={true}
      loading={loading}
      fallback={fallback}
      redirectTo={redirectTo}
    >
      {children}
    </AuthGuard>
  );
}

/**
 * AuthOnlyRoute component - redirects to dashboard if authenticated
 */
export function AuthOnlyRoute({
  children,
  loading: LoadingComponent = DefaultLoading,
  redirectTo = '/dashboard',
}: {
  children: React.ReactNode;
  loading?: React.ComponentType;
  redirectTo?: string;
}) {
  const { session, status, isInitialLoading } = useSession();
  const router = useRouter();

  // Handle redirects in useEffect to avoid rendering issues
  React.useEffect(() => {
    if (isInitialLoading || status === 'loading') return;

    if (status === 'authenticated') {
      router.push(redirectTo);
    }
  }, [status, isInitialLoading, redirectTo, router]);

  // Show loading state during initial session check
  if (isInitialLoading || status === 'loading') {
    return <LoadingComponent />;
  }

  // Show loading while redirecting if authenticated
  if (status === 'authenticated') {
    return <LoadingComponent />;
  }

  // Render children if not authenticated
  return <>{children}</>;
}

/**
 * RoleGuard component - protects routes based on user roles
 */
export function RoleGuard({
  children,
  requiredRole,
  requiredRoles,
  loading: LoadingComponent = DefaultLoading,
  fallback: FallbackComponent,
}: {
  children: React.ReactNode;
  requiredRole?: string;
  requiredRoles?: string[];
  loading?: React.ComponentType;
  fallback?: React.ComponentType;
}) {
  const { session, status, isInitialLoading } = useSession();

  // Show loading state during initial session check
  if (isInitialLoading || status === 'loading') {
    return <LoadingComponent />;
  }

  // Check authentication
  if (status === 'unauthenticated') {
    return <AuthGuard requireAuth={true}>{children}</AuthGuard>;
  }

  // Check role requirements
  if (requiredRole || requiredRoles) {
    const userRole = session?.user?.role;
    const hasRequiredRole = requiredRole
      ? userRole === requiredRole
      : requiredRoles?.includes(userRole || '');

    if (!hasRequiredRole) {
      if (FallbackComponent) {
        return <FallbackComponent />;
      }
      
      // Default unauthorized component
      return (
        <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Accès non autorisé
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Retour
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
} 