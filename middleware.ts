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
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  if (pathname === '/') {
    if (user.role === 'admin' || user.role === 'marketing_manager') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  if (isAccessingAdmin) {
    if (user.role === 'user') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|q/.*).*)'],
};
