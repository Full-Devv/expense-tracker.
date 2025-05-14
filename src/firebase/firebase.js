import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyA6RhWrWpb7YiEsFLyFLOHsHzxNaAnkjuo",
    authDomain: "expense-tracker-1a126.firebaseapp.com",
    projectId: "expense-tracker-1a126",
    storageBucket: "expense-tracker-1a126.firebasestorage.app",
    messagingSenderId: "788303875711",
    appId: "1:788303875711:web:56a96b25146a1a9931394a",
    measurementId: "G-R9L4B5LXX4"
  };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };