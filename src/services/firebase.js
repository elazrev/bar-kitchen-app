import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// החלף את הערכים האלה בהגדרות Firebase שלך
const firebaseConfig = {
    apiKey: "AIzaSyCMPsFMnrpkwpDKzZrB4vO4-5ys-oMpdPc",
    authDomain: "bar-kitchen-app-86392.firebaseapp.com",
    projectId: "bar-kitchen-app-86392",
    storageBucket: "bar-kitchen-app-86392.firebasestorage.app",
    messagingSenderId: "775512416025",
    appId: "1:775512416025:web:8fb44b9a213073387eaf88",
    measurementId: "G-2SRST95KL9"
  };

// אתחול Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);