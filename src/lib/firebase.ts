import { initializeApp, getApps, cert } from 'firebase-admin/app';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

if (!serviceAccount) {
  console.warn(
    'Firebase service account not found. Firebase Admin SDK will not be initialized.'
  );
}

export const adminApp =
  getApps().find((app) => app.name === 'admin') ||
  (serviceAccount
    ? initializeApp({ credential: cert(serviceAccount) }, 'admin')
    : undefined);

// NOTE: Client-side Firebase config would also go here,
// but should be loaded from environment variables for security.
//
// import { initializeApp as initializeClientApp, getApps as getClientApps } from 'firebase/app';
//
// const clientConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   ...
// };
//
// export const clientApp = getClientApps().length === 0 ? initializeClientApp(clientConfig) : getClientApps()[0];
