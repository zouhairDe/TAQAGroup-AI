import { LoginFormData, AuthResponse, User } from '@/types/auth';

// Get API base URL from environment or fallback
const getApiBaseUrl = () => {
  // Try Next.js public env var first
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Check if we're in browser vs SSR
  if (typeof window !== 'undefined') {
    // Client-side: use localhost
    return 'http://10.30.249.128:3333/api/v1';
  } else {
    // Server-side: skip auth verification during SSR
  return 'http://10.30.249.128:3333/api/v1';
  }
};

const API_BASE_URL = getApiBaseUrl();

export class AuthService {
  private static readonly TOKEN_KEY = 'taqa_auth_token';
  private static readonly USER_KEY = 'taqa_user_data';

  /**
   * Login user with email and password
   */
  static async login(credentials: LoginFormData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion');
      }

      if (data.success && data.data) {
        // Store token and user data
        this.setToken(data.data.token);
        this.setUser(data.data.user);
        
        return {
          user: data.data.user,
          token: data.data.token,
          requiresPasswordChange: data.data.requiresPasswordChange,
          message: 'Connexion réussie'
        };
      } else {
        throw new Error(data.message || 'Erreur de connexion');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erreur de connexion au serveur');
    }
  }

  /**
   * Logout user - only handles backend call, clearing is done by SessionProvider
   */
  static async logout(): Promise<void> {
    const token = this.getToken();
    
    if (token) {
      // Call backend logout endpoint (no auth header needed now)
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Backend logout failed: ${response.status}`);
      }
    }
  }

  /**
   * Force logout and redirect (for use in components)
   */
  static forceLogout(): void {
    // Clear everything immediately
    this.clearToken();
    this.clearUser();
    
    // Force redirect with page reload
    if (typeof window !== 'undefined') {
      window.location.replace('/auth/login');
    }
  }

  /**
   * Verify current token and get user data
   */
  static async verifyToken(): Promise<User | null> {
    try {
      const token = this.getToken();
      
      if (!token) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        // Add timeout and other options for better reliability
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      // Check if it's a network error vs auth error
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Genuine auth error - token is expired/invalid
          console.log('Token expired or invalid, clearing auth data');
          this.clearToken();
          this.clearUser();
          return null;
        } else {
          // Network or server error - don't clear token
          throw new Error(`Server error: ${response.status}`);
        }
      }

      const data = await response.json();

      if (!data.success) {
        // Backend says token is invalid
        console.log('Backend rejected token, clearing auth data');
        this.clearToken();
        this.clearUser();
        return null;
      }

      // Update stored user data
      this.setUser(data.data.user);
      return data.data.user;
      
    } catch (error) {
      console.error('Token verification error:', error);
      
      // Only clear tokens on genuine auth errors, not network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.log('Network error during token verification, keeping token');
        // Don't clear token on network errors
      } else {
        console.log('Auth error during token verification, clearing token');
        this.clearToken();
        this.clearUser();
      }
      
      throw error; // Re-throw to let caller handle
    }
  }

  /**
   * Change password
   */
  static async changePassword(userId: string, newPassword: string, currentPassword?: string): Promise<void> {
    try {
      const token = this.getToken();
      
      if (!token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          newPassword,
          currentPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors du changement de mot de passe');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erreur lors du changement de mot de passe');
    }
  }

  /**
   * Get stored token from localStorage (fallback to cookies)
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try localStorage first
    const localToken = localStorage.getItem(this.TOKEN_KEY);
    if (localToken) return localToken;
    
    // Fallback to cookies
    const cookieToken = this.getCookieToken();
    if (cookieToken) {
      // Sync back to localStorage
      localStorage.setItem(this.TOKEN_KEY, cookieToken);
      return cookieToken;
    }
    
    return null;
  }

  /**
   * Get token from cookies
   */
  private static getCookieToken(): string | null {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === this.TOKEN_KEY) {
        return value;
      }
    }
    return null;
  }

  /**
   * Set token in localStorage and cookies
   */
  static setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.TOKEN_KEY, token);
    // Also set in cookies for middleware access
    document.cookie = `${this.TOKEN_KEY}=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
    // Dispatch custom event to notify session provider
    window.dispatchEvent(new CustomEvent('auth-change'));
  }

  /**
   * Clear token from localStorage and cookies
   */
  static clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.TOKEN_KEY);
    // Also clear from cookies - use multiple approaches to ensure complete removal
    document.cookie = `${this.TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
    document.cookie = `${this.TOKEN_KEY}=; path=/; max-age=0; SameSite=Strict`;
    document.cookie = `${this.TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    // Dispatch custom event to notify session provider
    window.dispatchEvent(new CustomEvent('auth-change'));
  }

  /**
   * Get stored user data
   */
  static getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Set user data in localStorage
   */
  static setUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    // Dispatch custom event to notify session provider
    window.dispatchEvent(new CustomEvent('auth-change'));
  }

  /**
   * Clear user data from localStorage
   */
  static clearUser(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.USER_KEY);
    // Dispatch custom event to notify session provider
    window.dispatchEvent(new CustomEvent('auth-change'));
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Get authorization header for API calls
   */
  static getAuthHeader(): { Authorization: string } | {} {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Make authenticated API call
   */
  static async apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = this.getToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // If unauthorized, force logout and redirect to login
      if (response.status === 401) {
        this.forceLogout();
        return;
      }
      throw new Error(data.message || 'Erreur API');
    }

    return data;
  }
}

// Auth context hook
export const useAuth = () => {
  const user = AuthService.getUser();
  const isAuthenticated = AuthService.isAuthenticated();

  return {
    user,
    isAuthenticated,
    login: AuthService.login,
    logout: AuthService.logout,
    forceLogout: AuthService.forceLogout,
    verifyToken: AuthService.verifyToken,
    changePassword: AuthService.changePassword,
  };
}; 