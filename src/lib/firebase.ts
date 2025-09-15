import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebase config validation is handled in the try-catch block below

let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let database: ReturnType<typeof getDatabase> | null = null;
let storage: ReturnType<typeof getStorage> | null = null;
let firestore: ReturnType<typeof getFirestore> | null = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  database = getDatabase(app);
  storage = getStorage(app);
  firestore = getFirestore(app);

  // Connect to emulators in development
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    try {
      // Only connect if not already connected
      if (!auth._delegate._config?.emulator) {
        connectAuthEmulator(auth, 'http://localhost:9099');
      }
      if (!database._delegate._repoInternal?.repoInfo_?.host.includes('localhost')) {
        connectDatabaseEmulator(database, 'localhost', 9199);
      }
      if (!storage._delegate._host.includes('localhost')) {
        connectStorageEmulator(storage, 'localhost', 9000);
      }
      if (!firestore._delegate._settings?.host?.includes('localhost')) {
        connectFirestoreEmulator(firestore, 'localhost', 8080);
      }
    } catch (emulatorError) {
      console.log('Emulators already connected or not available:', emulatorError);
    }
  }
} catch (error) {
  console.error('Firebase initialization failed:', error);
}

export { auth, database, storage, firestore };
export default app;
