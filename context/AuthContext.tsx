"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  userData: any;
  loading: boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  refreshUserData: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid: string) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    } catch (err) {
      console.error("AuthProvider: Firestore fetch error:", err);
    }
  };

  const refreshUserData = async () => {
    if (user) await fetchUserData(user.uid);
  };

  useEffect(() => {
    console.log("AuthProvider: Initializing Auth Listener...");
    
    // Safety timeout: Unlock UI after 4 seconds regardless of Firebase
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 4000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("AuthProvider: Auth State Changed. User:", firebaseUser ? "Yes" : "No");
      
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchUserData(firebaseUser.uid);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
      clearTimeout(timeoutId);
    }, (error) => {
      console.error("AuthProvider: Listener error:", error);
      setLoading(false);
      clearTimeout(timeoutId);
    });

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading, refreshUserData }}>
        {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
