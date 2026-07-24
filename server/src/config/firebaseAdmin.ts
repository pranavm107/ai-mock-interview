import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import serviceAccount from '../../config/serviceAccountKey.json';

dotenv.config();

if (!getApps().length) {
  try {
    const app = initializeApp({
      credential: cert(serviceAccount as any),
    });
    console.log('Firebase Admin initialized successfully');
    console.log(`Project:\n${app.options.projectId}`);
  } catch (error: any) {
    console.error('Firebase Admin initialization failed\n\nReason:\n' + error.message + '\n\nServer startup aborted.');
    process.exit(1);
  }
}

export const db = getFirestore();
