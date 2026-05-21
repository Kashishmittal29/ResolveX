/**
 * FIREBASE CONFIGURATION (Backend)
 * ================================
 * Initializes Firebase Admin SDK for backend.
 * Used to write notifications to Firestore in real-time.
 */

const admin = require('firebase-admin');
const path = require('path');

let db;
let firebaseAdmin;

function initializeFirebase() {
  if (db) return { db, admin: firebaseAdmin };
  if (admin.apps.length > 0) {
    db = admin.firestore();
    firebaseAdmin = admin.apps[0];
    return { db, admin: firebaseAdmin };
  }


  try {
    let serviceAccount;
    
    // Check for JSON string in env var (for Production/Render)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } 
    // Fallback to file path (for Local Dev)
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      serviceAccount = require(path.resolve(__dirname, '..', process.env.FIREBASE_SERVICE_ACCOUNT_PATH));
    } else {
      console.warn('⚠️  Neither FIREBASE_SERVICE_ACCOUNT_JSON nor PATH set. Firebase disabled.');
      return { db: null, admin: null };
    }

    // Initialize Firebase Admin
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });

    // Get Firestore instance
    db = admin.firestore();

    console.log('✅ Firebase initialized successfully');
    console.log(`📊 Project ID: ${serviceAccount.project_id}`);

    return { db, admin: firebaseAdmin };
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    console.error('Make sure FIREBASE_SERVICE_ACCOUNT_PATH points to your service account JSON');
    return { db: null, admin: null };
  }
}

function getFirestore() {
  if (!db) {
    const result = initializeFirebase();
    db = result.db;
  }
  return db;
}

function getAdmin() {
  if (!firebaseAdmin) {
    const result = initializeFirebase();
    firebaseAdmin = result.admin;
  }
  return firebaseAdmin;
}

module.exports = {
  initializeFirebase,
  getFirestore,
  getAdmin,
};
