// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB7RqGIAoGzw6ZMBadjUiJhRSXAT7DRRys",
  authDomain: "lalabapa-try.firebaseapp.com",
  projectId: "lalabapa-try",
  storageBucket: "lalabapa-try.firebasestorage.app",
  messagingSenderId: "1042208021885",
  appId: "1:1042208021885:web:a2dab1b1cbdf158b65c014",
  measurementId: "G-64MQX3EBXC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
