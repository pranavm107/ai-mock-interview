import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

if (!getApps().length) {
  try {
    let credentialOptions: any;

    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      credentialOptions = cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'ai-mock-interview-887ab',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
    } else {
      const localKeyPath = path.join(__dirname, '../../config/serviceAccountKey.json');
      if (fs.existsSync(localKeyPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(localKeyPath, 'utf8'));
        credentialOptions = cert(serviceAccount);
      } else {
        throw new Error(
          'Missing Firebase credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.'
        );
      }
    }

    initializeApp({
      credential: credentialOptions,
    });

    console.log('Firebase Admin initialized successfully');
  } catch (error: any) {
    console.error('Firebase Admin initialization failed');
    console.error(error);
    process.exit(1);
  }
}

export const db = getFirestore();
