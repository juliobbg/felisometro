import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyDG-_k0LgoWB_xbZ_3bJpiBK0dXakt6UGM",
  authDomain: "felisometro.firebaseapp.com",
  projectId: "felisometro",
  storageBucket: "felisometro.firebasestorage.app",
  messagingSenderId: "1034923139988",
  appId: "1:1034923139988:web:3df182e99bce57a363e581",
  measurementId: "G-DGPVL1MNFP"
};

const app = initializeApp(firebaseConfig);

// IMPORTANTE: Especificar región europe-west1
const functions = getFunctions(app, 'europe-west1');

const db = getFirestore(app);

export { app, db, functions };
export default app;