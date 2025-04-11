
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCrJQEmrPpqVFQ1nsuPX6soXakCwTN2Bm8",
  authDomain: "project9-76d8a.firebaseapp.com",
  projectId: "project9-76d8a",
  storageBucket: "project9-76d8a.firebasestorage.app",
  messagingSenderId: "621431377723",
  appId: "1:621431377723:web:d861a67ab881a4aed5311e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);