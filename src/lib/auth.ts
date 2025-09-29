'use server';

import { cookies } from 'next/headers';
import { users } from '@/lib/data';
import type { User } from '@/types';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebase';

export async function getSession(): Promise<User | null> {
  const sessionCookie = cookies().get('session')?.value;
  
  if (!sessionCookie) {
    return null;
  }
  
  // In a real Firebase app, you would verify the session cookie.
  // For this demo, we're using the email stored in the cookie as a mock session.
  const user = users.find((u) => u.email === sessionCookie);

  if (!user) {
    // If user not in mock data, clear the cookie
    cookies().delete('session');
    return null;
  }

  return user;
  
  /*
  // REAL FIREBASE IMPLEMENTATION EXAMPLE
  try {
    if (!adminApp) {
        throw new Error('Firebase Admin SDK nicht initialisiert.');
    }
    const decodedClaims = await getAuth(adminApp).verifySessionCookie(sessionCookie, true);
    const user = users.find((u) => u.email === decodedClaims.email);
    return user || null;
  } catch (error) {
    console.error('Fehler bei der Sitzungsüberprüfung:', error);
    return null;
  }
  */
}
