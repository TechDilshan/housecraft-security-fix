
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD7iyY1QfXM4NXtAlYJ5_XPCpivaxc7HVA",
  authDomain: "estatecraft-housing.firebaseapp.com",
  projectId: "estatecraft-housing",
  storageBucket: "estatecraft-housing.appspot.com",
  messagingSenderId: "612483716642",
  appId: "1:612483716642:web:c48a7c7e3f12f8e7f242e0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
