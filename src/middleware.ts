import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    // Get the token with explicit typing
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Debug logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] Path: ${request.nextUrl.pathname}`);
      console.log(`[Middleware] Token exists: ${!!token}`);
    }

    // API route protection
    if (request.nextUrl.pathname.startsWith('/api')) {
      // Skip auth check for auth-related API routes
      if (request.nextUrl.pathname.startsWith('/api/auth')) {
        return NextResponse.next();
      }

      if (!token) {
        console.error('[Middleware] API Route - Unauthorized access attempt');
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized access" }), 
          { 
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      // Add user info to request headers for API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', token.sub || '');
      requestHeaders.set('x-user-email', token.email as string || '');

      return NextResponse.next({
        headers: requestHeaders,
      });
    }

    // Auth page protection
    if (request.nextUrl.pathname.startsWith('/auth')) {
      if (token) {
        console.log('[Middleware] Auth Page - Redirecting authenticated user to dashboard');
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // Dashboard protection
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      if (!token) {
        console.log('[Middleware] Dashboard - Redirecting unauthenticated user to login');
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('callbackUrl', request.url);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }

    // Contact page protection
    if (request.nextUrl.pathname.startsWith('/contacts')) {
      if (!token) {
        console.log('[Middleware] Contacts - Redirecting unauthenticated user to login');
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('callbackUrl', request.url);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }

    // Public routes
    return NextResponse.next();
  } catch (error) {
    console.error('[Middleware] Error:', error);
    
    // Handle errors gracefully
    if (request.nextUrl.pathname.startsWith('/api')) {
      return new NextResponse(
        JSON.stringify({ error: "Internal server error" }), 
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Redirect to error page for non-API routes
    return NextResponse.redirect(new URL('/error', request.url));
  }
}

export const config = {
  matcher: [
    // Protected API routes
    '/api/:path*',
    // Auth pages
    '/auth/:path*',
    // Dashboard pages
    '/dashboard/:path*',
    // Contact pages
    "/api/contacts/:path*",

  ],
};