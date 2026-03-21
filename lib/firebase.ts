// lib/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔥 Your Firebase config (safe to keep public)
const firebaseConfig = {
  apiKey: "AIzaSyAU8t_lTvU7vXJbKtjJd6zsS3kwM6kO9Mo",
  authDomain: "pocket-lobby.firebaseapp.com",
  projectId: "pocket-lobby",
  storageBucket: "pocket-lobby.firebasestorage.app",
  messagingSenderId: "1007060902201",
  appId: "1:1007060902201:web:6e32cbf7c245d7943e48e8",
};

// 🔥 Initialize Firebase app
const app = initializeApp(firebaseConfig);

// 🔐 Authentication
export const auth = getAuth(app);

// 🔐 Google provider
export const provider = new GoogleAuthProvider();

// 🗄️ Firestore database
export const db = getFirestore(app);