import { doc, getDoc } from 'firebase/firestore';
import { db } from './src/config/firebase.config';

async function test() {
  try {
    console.log('Testing firebase connection...');
    const docRef = doc(db, 'test', 'test');
    await getDoc(docRef);
    console.log('Success');
  } catch (e) {
    console.error('Firebase error:', e);
  }
}

test();
