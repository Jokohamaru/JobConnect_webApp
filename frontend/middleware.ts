import { NextRequest, NextResponse } from 'next/server';

function getUserRoleFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString()
    );
    return payload.role || null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  const pathname = request.nextUrl.pathname;

  // Public routes
  const publicRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/admin/dashboard'
  ];

  // Protected routes
  const protectedRoutes = [
    // '/profile',
    '/dashboard',
    // '/recruiter',
    '/candidate',
  ];

  // Check if current route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // If route is protected and no token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control
  if (token) {
    const userRole = getUserRoleFromToken(token);

    // Recruiter routes - only RECRUITER can access
    if (pathname.startsWith('/recruiter')) {
      if (userRole !== 'RECRUITER') {
        // Not a recruiter, redirect to home with error
        const homeUrl = new URL('/', request.url);
        homeUrl.searchParams.set('error', 'access_denied');
        return NextResponse.redirect(homeUrl);
      }
    }

    // Admin routes - only ADMIN can access
    if (pathname.startsWith('/admin')) {
      if (userRole !== 'ADMIN') {
        const homeUrl = new URL('/', request.url);
        homeUrl.searchParams.set('error', 'access_denied');
        return NextResponse.redirect(homeUrl);
      }
    }

    // Candidate routes - only CANDIDATE can access
    if (pathname.startsWith('/candidate')) {
      if (userRole !== 'CANDIDATE') {
        const homeUrl = new URL('/', request.url);
        homeUrl.searchParams.set('error', 'access_denied');
        return NextResponse.redirect(homeUrl);
      }
    }
  }

  // If route is public (login/register) and user has token, redirect based on role
  if (isPublicRoute && token) {
    const userRole = getUserRoleFromToken(token);
    
    if (userRole === 'RECRUITER') {
      return NextResponse.redirect(new URL('/recruiter/dashboard', request.url));
    } else if (userRole === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/', request.url));
    }
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
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg).*)',
  ],
};
