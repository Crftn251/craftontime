// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDVM7TLNDk9jqt8zoDz9Ch-x5YTgtQ31EE",
  authDomain: "caloriecam-ljpyg.firebaseapp.com",
  projectId: "caloriecam-ljpyg",
  storageBucket: "caloriecam-ljpyg.firebasestorage.app",
  messagingSenderId: "220425511225",
  appId: "1:220425511225:web:ade4c7ee5808541bebc8e8"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
