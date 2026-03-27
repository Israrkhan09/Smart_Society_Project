import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// User provided production configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIjWqYMHVfVOpJD9bf1xDtSA17RrxxkdQ",
  authDomain: "smart-neighboor.firebaseapp.com",
  projectId: "smart-neighboor",
  storageBucket: "smart-neighboor.firebasestorage.app",
  messagingSenderId: "750555826353",
  appId: "1:750555826353:web:25c44512cd6e5de4faba90",
  measurementId: "G-PFSWV1WW7T"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
