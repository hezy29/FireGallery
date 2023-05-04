// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAduTreMeptgaH7klpSiyllLnBwxuW4DtU",
    authDomain: "hezy-firegram.firebaseapp.com",
    projectId: "hezy-firegram",
    storageBucket: "hezy-firegram.appspot.com",
    messagingSenderId: "877379366928",
    appId: "1:877379366928:web:7a943094cbe7045ba65a95"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const firestore = getFirestore(app);
const auth = getAuth(app);

export { storage, firestore, auth };