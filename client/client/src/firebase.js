// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-fd339.firebaseapp.com",
  projectId: "mern-estate-fd339",
  storageBucket: "mern-estate-fd339.firebasestorage.app",
  messagingSenderId: "407583167821",
  appId: "1:407583167821:web:ffcff3f86dd5b021275304",
  measurementId: "G-BJH7E203KE"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);