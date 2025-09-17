import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { users } from '@/lib/data';

const SESSION_COOKIE_NAME = 'session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionEmail = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  const isAccessingAdmin = pathname.startsWith('/admin');

  if (!sessionEmail) {
    if (isAccessingAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  const user = users.find((u) => u.email === sessionEmail);

  if (!user) {
    // Invalid cookie, clear it and redirect
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  // If user is logged in and tries to access the login page, redirect to admin
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  if (isAccessingAdmin) {
    if (user.role === 'user') {
      // Regular users cannot access admin pages
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|q/.*).*)'],
};
