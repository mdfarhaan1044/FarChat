
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: "reactchat-5ae21.firebaseapp.com",
    projectId: "reactchat-5ae21",
    storageBucket: "reactchat-5ae21.firebasestorage.app",
    messagingSenderId: "654554312069",
    appId: "1:654554312069:web:19f3e8c3bd17b6be03e8ec"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore();
export const storage = getStorage();