import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://10.30.249.128:3333/api/v1';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/anomalies',
  '/maintenance',
  '/teams',
  '/rex',
  '/equipment',
  '/slots',
  '/users',
];

// Routes that should redirect to dashboard if authenticated
const authOnlyRoutes = [
  '/auth/login',
  '/auth/change-password',
  '/auth/forgot-password',
  '/auth/reset-password',
];

// Public routes that don't require authentication
const publicRoutes = [
  '/api',
  '/_next',
  '/favicon.ico',
  '/logo.svg',
  '/logo_2.svg',
  '/manifest.json',
];

/**
 * Verify token with the backend API
 */
async function verifyToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return response.ok && data.success;
  } catch (error) {
    console.error('Token verification error in middleware:', error);
    return false;
  }
}

/**
 * Get token from request
 */
function getTokenFromRequest(request: NextRequest): string | null {
  // Try to get token from cookies first
  const tokenFromCookies = request.cookies.get('taqa_auth_token')?.value;
  
  if (tokenFromCookies) {
    return tokenFromCookies;
  }

  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Check if route is protected
 */
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route));
}

/**
 * Check if route is auth-only (should redirect to dashboard if authenticated)
 */
function isAuthOnlyRoute(pathname: string): boolean {
  return authOnlyRoutes.some(route => pathname.startsWith(route));
}

/**
 * Check if route is public
 */
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Skip middleware for root path
  if (pathname === '/') {
    return NextResponse.next();
  }

  // Get token from request
  const token = getTokenFromRequest(request);
  
  // Verify token if it exists
  let isAuthenticated = false;
  if (token) {
    isAuthenticated = await verifyToken(token);
  }

  // Handle protected routes
  if (isProtectedRoute(pathname)) {
    if (!isAuthenticated) {
      // Clear invalid token cookie if it exists
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('taqa_auth_token');
      return response;
    }
    
    // Allow access to protected route
    return NextResponse.next();
  }

  // Handle auth-only routes (login, forgot password, etc.)
  if (isAuthOnlyRoute(pathname)) {
    if (isAuthenticated) {
      // Redirect to dashboard if already authenticated
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Allow access to auth-only route
    return NextResponse.next();
  }

  // For all other routes, check authentication
  if (!isAuthenticated && token) {
    // Clear invalid token cookie
    const response = NextResponse.next();
    response.cookies.delete('taqa_auth_token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 