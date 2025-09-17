import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { users } from '@/lib/data';

const SESSION_COOKIE_NAME = 'session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionEmail = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  const isAccessingAdmin = pathname.startsWith('/admin');

  // If there's no session cookie
  if (!sessionEmail) {
    // And they are trying to access an admin page, redirect to login
    if (isAccessingAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    // Otherwise, allow the request
    return NextResponse.next();
  }

  // If there is a session cookie, find the user
  const user = users.find((u) => u.email === sessionEmail);

  // If the user from the cookie doesn't exist in our data
  if (!user) {
    // Redirect to login and clear the invalid cookie
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }
  
  // If a logged-in user is on the homepage
  if (pathname === '/') {
    // And is an admin/manager, redirect to the dashboard
    if (user.role === 'admin' || user.role === 'marketing_manager') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // If a logged-in user is trying to access an admin page
  if (isAccessingAdmin) {
    // But is just a regular 'user', redirect to unauthorized
    if (user.role === 'user') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // For all other cases, allow the request
  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except API, Next.js internal, and static files.
  // The /q/:slug route is also excluded to ensure QR code scanning is not affected.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|q/.*).*)'],
};
