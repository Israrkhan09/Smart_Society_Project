"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, AlertCircle, Loader2, ArrowRight, UserCog, User, ShieldHalf } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<'admin' | 'resident' | 'guard' | null>(null);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const router = useRouter();
  const { user, role, loading: authLoading, refreshUserData } = useAuth();

  useEffect(() => {
    // PREFETCH DASHBOARDS FOR INSTANT NAVIGATION
    router.prefetch("/dashboard");
    router.prefetch("/dashboard/admin");
    router.prefetch("/dashboard/guard");

    // Only auto-redirect if we aren't actively processing a login attempt
    if (!authLoading && user && role && !localLoading) {
      const paths = { admin: "/dashboard/admin", resident: "/dashboard", guard: "/dashboard/guard" };
      router.push(paths[role] || "/dashboard");
    }
  }, [user, role, authLoading, router, localLoading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLocalLoading(true);
    setError("");
    
    try {
      // 1. FIREBASE AUTHENTICATION (The only unavoidable network delay)
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. FETCH ROLE (Fast single-document fetch)
      const userRef = doc(db, "users", result.user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        setError("Access Denied: Node not recognized.");
        setLocalLoading(false);
        return;
      }

      const trueRole = userDoc.data()?.role || "resident";
      
      // 3. OPTIMISTIC CACHE: Set role immediately for next page's layout
      localStorage.setItem("sessionRole", trueRole);
      localStorage.setItem("sessionName", userDoc.data()?.name || "");

      // 4. INSTANT REDIRECT (Don't await anything else)
      const paths = { admin: "/dashboard/admin", resident: "/dashboard", guard: "/dashboard/guard" };
      
      if (trueRole === "admin") {
        router.push("/dashboard/admin");
      } else {
        if (!selectedRole) {
          setError("Please select access tier.");
          setLocalLoading(false);
          return;
        }
        if (trueRole !== selectedRole) {
          setError(`Access Denied: Mismatch ${selectedRole.toUpperCase()}.`);
          setLocalLoading(false);
          return;
        }
        router.push(paths[selectedRole as 'resident' | 'guard']);
      }
      
    } catch (err: any) {
      console.error("Login failure:", err);
      setError("Invalid Security Credentials.");
      setLocalLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) { setError("Email required."); return; }
    try { await sendPasswordResetEmail(auth, email); setResetSent(true); setTimeout(() => setResetSent(false), 5000); } catch (e) { setError("Failed."); }
  };

  const roleOptions = [
    { id: 'resident', label: 'Resident', icon: User },
    { id: 'guard', label: 'Security', icon: ShieldHalf },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-['Inter',sans-serif] relative overflow-hidden">
      {/* Dynamic Visuals */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500 z-50 shadow-[0_4px_30px_rgba(16,185,129,0.2)]" />
      <div className="absolute top-[-20%] right-[-5%] w-[600px] h-[600px] bg-emerald-50 rounded-full blur-[120px] opacity-40 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-slate-100 rounded-full blur-[100px] opacity-60 pointer-events-none" />

      {/* Solo Minimal Navbar */}
      <div className="absolute top-0 left-0 w-full p-6 md:px-10 flex flex-row items-center z-50 mt-1.5">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:opacity-80 transition-opacity">SmartSociety<span className="text-emerald-500">OS</span></span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-[540px] relative z-10"
      >
        <div className="bg-white rounded-[4rem] p-8 md:p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-slate-50">
          {/* Identity */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 shadow-[inset_0_2px_12px_rgba(16,185,129,0.06)] border border-emerald-100">
              <ShieldCheck className="w-7 h-7 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter mb-0.5 uppercase">Smart-Society<span className="text-emerald-500">OS</span></h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Access Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Role Switcher */}
            <div className="p-1.5 bg-slate-50 rounded-[2rem] flex gap-1">
              {roleOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedRole(opt.id as any)}
                  className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-[1.75rem] text-[10px] font-black uppercase tracking-widest transition-all ${selectedRole === opt.id
                      ? "bg-white text-emerald-600 shadow-xl shadow-emerald-500/5 border border-emerald-100/50"
                      : "text-slate-400 hover:text-slate-600"
                    }`}
                >
                  <opt.icon size={14} strokeWidth={3} />
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@society.os"
                  className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 px-6 text-[14px] font-bold text-slate-900 outline-none focus:border-emerald-100 focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</label>
                  <button type="button" onClick={handleForgotPassword} className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors">Recover?</button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 px-6 text-[14px] font-bold text-slate-900 outline-none focus:border-emerald-100 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {(error || resetSent) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`rounded-2xl p-4 flex items-center gap-3 border ${error ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p className="text-[10px] font-black uppercase tracking-tight leading-tight">{error || "Recovery link sent."}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={localLoading}
              className="group w-full bg-slate-900 hover:bg-black text-white rounded-[2rem] py-4 text-[11px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-4 transition-all shadow-2xl shadow-slate-900/20 active:scale-[0.98] disabled:opacity-50"
            >
              {localLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Authorize Command <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={3} /></>}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-50 opacity-60">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 leading-relaxed max-w-[240px] mx-auto">
              Deployment Verified by your <span className="text-emerald-700 underline underline-offset-4 font-black">Main Administrator</span>
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-center items-center gap-8 opacity-20 select-none">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 uppercase">Core OS v4.2</p>
          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 uppercase">RSA-4096 Encrypted</p>
        </div>
      </motion.div>
    </div>
  );
}
