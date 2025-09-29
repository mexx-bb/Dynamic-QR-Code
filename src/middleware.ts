import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';

const SESSION_COOKIE_NAME = 'session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Exclude public paths from auth checks
  const publicPaths = ['/login', '/', '/link-error', '/unauthorized', '/not-found'];
  if (publicPaths.includes(pathname) || pathname.startsWith('/q/')) {
    return NextResponse.next();
  }
  
  const sessionUser = await getSession();

  const isAccessingAdminArea = pathname.startsWith('/admin');

  if (!sessionUser) {
    if (isAccessingAdminArea) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // If user is logged in and tries to access login page, redirect to admin
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  if (isAccessingAdminArea) {
    if (sessionUser.role === 'user' && pathname !== '/admin/unauthorized') {
      // Allow access to admin dashboard but maybe show a different view
      // For now, let's redirect unauthorized roles away from specific pages if needed
      if (pathname.startsWith('/admin/users')) {
         return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
