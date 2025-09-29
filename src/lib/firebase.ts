import { initializeApp as initializeAdminApp, getApps as getAdminApps, cert } from 'firebase-admin/app';
import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Admin SDK (Server-Side)
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

if (!serviceAccount) {
  console.warn(
    'Firebase service account not found in environment variables. Firebase Admin SDK will not be initialized.'
  );
}

export const adminApp =
  getAdminApps().find((app) => app.name === 'admin') ||
  (serviceAccount
    ? initializeAdminApp({ credential: cert(serviceAccount) }, 'admin')
    : undefined);


// Client SDK (Client-Side)
const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function createClientApp() {
    if (getApps().length > 0) {
        return getApp();
    }
    
    if (!firebaseConfig.apiKey) {
        console.warn(
            'Firebase client configuration not found in environment variables. Client app will not be initialized.'
        )
        return undefined;
    }
    
    return initializeApp(firebaseConfig);
}

export const clientApp = createClientApp();
export const auth = clientApp ? getAuth(clientApp) : undefined;
