// src/middleware.ts

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
 try {
   const token = await getToken({
     req: request,
     secret: process.env.NEXTAUTH_SECRET,
   });

   // Debug logging for development
   console.log(`[Middleware] Path: ${request.nextUrl.pathname}`);
   console.log(`[Middleware] Token exists: ${!!token}`);
   console.log(`[Middleware] Environment: ${process.env.NODE_ENV}`);
   console.log(`[Middleware] Auth URL: ${process.env.NEXTAUTH_URL}`);

   // API route protection
   if (request.nextUrl.pathname.startsWith('/api')) {
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
       return NextResponse.redirect(new URL('/dashboard', request.url));
     }
     return NextResponse.next();
   }

   // Dashboard protection
   if (request.nextUrl.pathname.startsWith('/dashboard')) {
     if (!token) {
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
   return NextResponse.redirect(new URL('/auth/login', request.url));
 }
}

export const config = {
 matcher: [
   '/api/:path*',
   '/auth/:path*',
   '/dashboard/:path*',
 ],
};