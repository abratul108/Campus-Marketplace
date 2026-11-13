
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAbtnX37HA7cZ-EnI-TJDHOLU3TBTvTOlk",
  authDomain: "campus-marketplace-daf9e.firebaseapp.com",
  projectId: "campus-marketplace-daf9e",
  storageBucket: "campus-marketplace-daf9e.firebasestorage.app",
  messagingSenderId: "414493643675",
  appId: "1:414493643675:web:c1fbef7224a178e9c8873e",
  measurementId: "G-MM2TBYLQ5V"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
