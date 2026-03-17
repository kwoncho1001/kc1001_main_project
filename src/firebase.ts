import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the specific database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

/**
 * Validates connection to Firestore.
 * Logs an error if the client is offline or configuration is incorrect.
 */
async function testConnection() {
  try {
    // Attempt to fetch a non-existent doc to test connectivity
    await getDocFromServer(doc(db, '_connection_test_', 'init'));
    console.log('[Firebase] Connection verified.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("[Firebase] Configuration error: The client is offline. Please check your Firebase setup.");
    }
    // Other errors are expected for non-existent docs, so we don't log them here.
  }
}

testConnection();

export default app;
