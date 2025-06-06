import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "",
  authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID || ""}.firebaseapp.com`,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID || ""}.firebasestorage.app`,
  appId: process.env.VITE_FIREBASE_APP_ID || "",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, auth, storage };
