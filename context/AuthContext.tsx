"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  userData: any;
  role: 'admin' | 'resident' | 'guard' | null;
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
  const [role, setRole] = useState<'admin' | 'resident' | 'guard' | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid: string) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        setRole(data.role || 'resident'); // Default to resident if role missing
      }
    } catch (err) {
      console.error("AuthProvider: Firestore fetch error:", err);
    }
  };

  const refreshUserData = async () => {
    if (user) await fetchUserData(user.uid);
  };

  useEffect(() => {
    // 1. FAST-PATH: Try to recover session role immediately from cache
    const cachedRole = localStorage.getItem("sessionRole") as any;
    if (cachedRole) {
      setRole(cachedRole);
      // We can potentially set loading(false) here if we trust the cache
      // but let's keep it safe and just set the role for instant sidebar rendering
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // We still fetch fresh data in background
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          const freshRole = data.role || 'resident';
          setRole(freshRole);
          localStorage.setItem("sessionRole", freshRole);
        }
      } else {
        setUserData(null);
        setRole(null);
        localStorage.removeItem("sessionRole");
      }
      
      setLoading(false);
    }, (error) => {
      console.error("AuthProvider error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, role, loading, refreshUserData }}>
        {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
