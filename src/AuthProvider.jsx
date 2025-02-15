import { createContext, useContext, useEffect, useState } from "react";
import { auth, signInWithGoogle, logout } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {  // Accept children as props
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, signInWithGoogle, logout }}>
            {children}  {/* Wrap children */}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);