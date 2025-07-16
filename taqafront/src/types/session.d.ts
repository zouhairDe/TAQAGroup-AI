import { User, UserRole } from './auth';

// Session interface that extends the User type with additional session data
export interface Session {
  user: SessionUser;
  token: string;
  expires: Date;
  requiresPasswordChange: boolean;
  lastActivity: Date;
  isActive: boolean;
}

// Extended user interface for session with additional fields
export interface SessionUser extends User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  isFirstLogin: boolean;
  lastLogin?: Date;
  createdAt: Date;
  createdBy?: string;
  isActive: boolean;
  // Additional session-specific fields
  sessionId?: string;
  permissions?: string[];
  lastPasswordChange?: Date;
  passwordExpiresAt?: Date;
}

// Session state for the auth context
export interface SessionState {
  session: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  error: string | null;
  isInitialLoading: boolean;
}

// Session provider props
export interface SessionProviderProps {
  children: React.ReactNode;
  session?: Session | null;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
}

// Session context type
export interface SessionContextType {
  data: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  error: string | null;
  isInitialLoading: boolean;
  isLoggingOut: boolean;
  update: (data?: any) => Promise<Session | null>;
  signOut: (options?: SignOutOptions) => Promise<void>;
  getSession: () => Promise<Session | null>;
  verifySession: () => Promise<boolean>;
}

// Sign out options
export interface SignOutOptions {
  redirect?: boolean;
  callbackUrl?: string;
}

// Auth guard props
export interface AuthGuardProps {
  children: React.ReactNode;
  loading?: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

// Route protection types
export type RouteProtection = 'public' | 'protected' | 'auth-only';

// Session storage interface
export interface SessionStorage {
  getSession: () => Session | null;
  setSession: (session: Session) => void;
  removeSession: () => void;
  clearAll: () => void;
} 