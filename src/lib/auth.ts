'use server';

import { cookies } from 'next/headers';
import { users } from '@/lib/data';
import type { User } from '@/types';

const SESSION_COOKIE_NAME = 'session';

export async function getSession(): Promise<User | null> {
  const cookieStore = cookies();
  const email = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!email) {
    return null;
  }

  const user = users.find((u) => u.email === email);
  return user || null;
}

export async function createSession(email: string) {
  const user = users.find((u) => u.email === email);
  if (!user) {
    return { error: 'Invalid user' };
  }

  cookies().set(SESSION_COOKIE_NAME, email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/',
  });

  return { success: true };
}

export async function deleteSession() {
  cookies().delete(SESSION_COOKIE_NAME);
}
