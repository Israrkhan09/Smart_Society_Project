"use client";

import { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Loader2, CheckCircle2, UserPlus, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminSetup() {
  const { user, refreshUserData } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"IDLE" | "LOADING" | "SUCCESS" | "ERROR">("IDLE");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleInitialize = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("LOADING");
    setError("");

    try {
      let targetUser = user;

      // If no user is logged in, register them as the FIRST admin
      if (!targetUser) {
        if (!email || !password) {
          setError("Owner credentials required for initialization.");
          setStatus("IDLE");
          return;
        }
        const result = await createUserWithEmailAndPassword(auth, email, password);
        targetUser = result.user;
      }

      const userRef = doc(db, "users", targetUser.uid);
      await setDoc(userRef, {
        uid: targetUser.uid,
        email: targetUser.email,
        name: targetUser.displayName || "Master Administrator",
        role: "admin",
        createdAt: new Date().toISOString(),
      }, { merge: true });
      
      await refreshUserData();
      setStatus("SUCCESS");
      
      setTimeout(() => {
        router.push("/dashboard/admin");
      }, 2000);
    } catch (err: any) {
      console.error("Setup error:", err);
      setError(err.message || "Initialization failure.");
      setStatus("ERROR");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-['Inter',sans-serif]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[500px] bg-white rounded-[3.5rem] p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-slate-100 text-center"
      >
        <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-emerald-100">
          <ShieldCheck className="w-10 h-10 text-emerald-600" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">First-Time Deployment</h1>
        <p className="text-slate-400 text-sm font-medium mb-10 leading-relaxed px-4">
          Establish the **Master Administrative Identity**. This will initialize the entire Society OS for your organization.
        </p>

        {status === "SUCCESS" ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <p className="text-emerald-700 font-black uppercase tracking-[0.2em] text-[11px]">Identity Established</p>
              <p className="text-slate-400 text-[10px] mt-1">Bridging to Command Overview...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleInitialize} className="space-y-6">
            {!user && (
              <div className="space-y-5 text-left mb-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Owner Email</label>
                  <div className="relative">
                    <UserPlus className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="master@society.os"
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4.5 pl-14 pr-6 text-sm font-bold text-slate-900 outline-none focus:border-emerald-100 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Master Access Key</label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4.5 pl-14 pr-6 text-sm font-bold text-slate-900 outline-none focus:border-emerald-100 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-rose-500 rotate-180" />
                <p className="text-[10px] font-black uppercase text-rose-600 tracking-tight">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "LOADING"}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {status === "LOADING" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                user ? "Elevate Current ID to Admin" : "Initialize Master Admin"
              )}
            </button>
          </form>
        )}

        <div className="mt-12 pt-8 border-t border-slate-50">
           <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Authorized Build v4.2 • Secured Cloud Access</p>
        </div>
      </motion.div>
    </div>
  );
}
