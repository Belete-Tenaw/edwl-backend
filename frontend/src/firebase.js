// Import the specific tools EDWL needs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration (Keep exactly as is)
const firebaseConfig = {
    apiKey: "AIzaSyBzZXf9OpJSPY7VV62fpm4Cj2WbkD4qTDg",
    authDomain: "edwl-ethio-domesticworkerslink.firebaseapp.com",
    projectId: "edwl-ethio-domesticworkerslink",
    storageBucket: "edwl-ethio-domesticworkerslink.firebasestorage.app",
    messagingSenderId: "274209810616",
    appId: "1:274209810616:web:30534059ff3867ffa42c4d",
    measurementId: "G-D21Q6GSYJS"
};

// 1. Initialize the App
const app = initializeApp(firebaseConfig);

// 2. Export the "Services" so the rest of your app can use them
export const auth = getAuth(app);      // For Login/OTP
export const db = getFirestore(app);   // For Worker Profiles & Badges
export const storage = getStorage(app); // For ID/Photo uploads

export default app;