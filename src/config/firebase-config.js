import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuración real desde tu captura de pantalla
const firebaseConfig = {
  apiKey: "AIzaSyBmhVXBqPtx2maIVk39FWRwSBdLEgk6YAw",
  authDomain: "ecommerse2-40c18.firebaseapp.com",
  projectId: "ecommerse2-40c18",
  storageBucket: "ecommerse2-40c18.firebasestorage.app",
  messagingSenderId: "48168243071",
  appId: "1:48168243071:web:da4eed165e5546c7c3d44a",
  measurementId: "G-S8HQ8F5BRE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
