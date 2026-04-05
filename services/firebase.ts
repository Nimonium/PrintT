import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAFoX5mDb44KbkZvU6dMp1VHjKZDbsRW8I",
  authDomain: "printt-15851.firebaseapp.com",
  databaseURL: "https://printt-15851-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "printt-15851",
  storageBucket: "printt-15851.firebasestorage.app",
  messagingSenderId: "135083827529",
  appId: "1:135083827529:web:5134acd629cc2ddb6bfa98",
  measurementId: "G-M0KH03P5RT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize analytics only on supported environments (like web)
export const analytics = isSupported().then((supported) => supported ? getAnalytics(app) : null);

export const auth = getAuth(app);
export const database = getDatabase(app);

export default app;
