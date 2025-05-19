import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/register';

  // Check if the path is dashboard and requires protection
  const isDashboardPath = path.startsWith('/dashboard');

  // Get the token from cookies
  const token = request.cookies.get('token')?.value;

  // If trying to access dashboard without a token, redirect to login
  if (isDashboardPath && !token) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }

  // If user is logged in and trying to access login/register page, redirect to dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
}; 