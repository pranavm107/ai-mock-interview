import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAq264L8jt3PCLLq5rqICoC1IjU_jMdwYA",
  authDomain: "ai-mock-interview-887ab.firebaseapp.com",
  projectId: "ai-mock-interview-887ab",
  storageBucket: "ai-mock-interview-887ab.firebasestorage.app",
  messagingSenderId: "1055408476201",
  appId: "1:1055408476201:web:f11650cf40f326a7578c38"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    const resumeDocRef = doc(db, 'resumes', 'fake-id');
    await getDoc(resumeDocRef);
    console.log('Success');
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
