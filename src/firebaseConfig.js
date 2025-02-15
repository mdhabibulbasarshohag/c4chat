import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyC0lf-Osfc-DlDLmCVL7XRXKZ6Bp94XYlU",
    authDomain: "b25chat.firebaseapp.com",
    projectId: "b25chat",
    storageBucket: "b25chat.firebasestorage.app",
    messagingSenderId: "973911389561",
    appId: "1:973911389561:web:c465567e22ba770e99aba8",
    measurementId: "G-X83VEC7SJ3"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error("Error signing in:", error);
    }
};

const logout = async () => {
    await signOut(auth);
};

export { auth, signInWithGoogle, logout };