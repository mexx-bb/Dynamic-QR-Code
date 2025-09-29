'use server';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware is now simplified. The actual route protection logic
// should be reimplemented using Firebase Authentication state.

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|q/.*).*)'],
};
