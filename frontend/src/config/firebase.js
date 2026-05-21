/**
 * FIREBASE CONFIGURATION (Frontend)
 * =================================
 * Initializes Firebase SDK for frontend.
 * Used to listen to real-time notifications from Firestore.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // Optional - add only if available
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

// Filter out undefined values
const filteredConfig = Object.fromEntries(
  Object.entries(firebaseConfig).filter(([_, v]) => v !== undefined)
);

let app;
let db;

function initializeFirebase() {
  if (app) return { app, db };

  try {
    // Check if required config is present
    if (!filteredConfig.apiKey || !filteredConfig.projectId) {
      console.warn('⚠️  Firebase config incomplete. Real-time notifications disabled.');
      return { app: null, db: null };
    }

    // Initialize Firebase
    app = initializeApp(filteredConfig);
    db = getFirestore(app);

    console.log('✅ Firebase initialized successfully');
    console.log(`📊 Project ID: ${filteredConfig.projectId}`);

    return { app, db };
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    return { app: null, db: null };
  }
}

const { app: initializedApp, db: initializedDb } = initializeFirebase();
app = initializedApp;
db = initializedDb;
export { app, db };
