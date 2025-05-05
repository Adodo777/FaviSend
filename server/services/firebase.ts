import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase/storage';
import { app } from '../lib/firebase';

// Initialize Firebase Admin SDK if not already initialized
export const initializeFirebaseAdmin = () => {
  if (getApps().length === 0) {
    try {
      initializeApp({
        // Use environment variables for service account or default credentials
        credential: process.env.FIREBASE_SERVICE_ACCOUNT 
          ? cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) 
          : undefined,
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`
      });
      console.log('Firebase Admin SDK initialized');
    } catch (error) {
      console.error('Firebase Admin SDK initialization error:', error);
    }
  }
};

// Get Firebase Auth instance
export const getFirebaseAuth = () => {
  initializeFirebaseAdmin();
  return getAuth();
};

// Get Firebase Storage instance for the client
export const getFirebaseStorage = () => {
  return getStorage(app);
};

// Verify Firebase ID token
export const verifyIdToken = async (idToken: string) => {
  try {
    const auth = getFirebaseAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return null;
  }
};
