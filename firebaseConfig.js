// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDG-_k0LgoWB_xbZ_3bJpiBK0dXakt6UGM",
  authDomain: "felisometro.firebaseapp.com",
  projectId: "felisometro",
  storageBucket: "felisometro.firebasestorage.app",
  messagingSenderId: "1034923139988",
  appId: "1:1034923139988:web:3df182e99bce57a363e581",
  measurementId: "G-DGPVL1MNFP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);