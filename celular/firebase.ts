import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBrihqnUgeU83UfYjcF9OFF67F-1tBKVck',
  authDomain: 'comarca-9711d.firebaseapp.com',
  projectId: 'comarca-9711d',
  storageBucket: 'comarca-9711d.firebasestorage.app',
  messagingSenderId: '618590751285',
  appId: '1:618590751285:web:42a499bb29b2ae06e83f7c',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
