"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Shield, LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { scrollY } = useScroll();
  const { user } = useAuth();
  const router = useRouter();

  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(250, 250, 250, 0)", "rgba(250, 250, 250, 0.8)"]
  );
  const backdropBlur = useTransform(
    scrollY,
    [0, 100],
    ["blur(0px)", "blur(12px)"]
  );
  const borderBottom = useTransform(
    scrollY,
    [0, 100],
    ["1px solid rgba(0,0,0,0)", "1px solid rgba(0,0,0,0.05)"]
  );

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <motion.nav
      style={{
        backgroundColor,
        backdropFilter: backdropBlur,
        borderBottom,
      }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-300"
    >
      <Link href="/" className="flex items-center gap-2">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Shield className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold tracking-tight">SmartSociety<span className="text-emerald-500">OS</span></span>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        {[
          { label: "Overview", link: "/#overview" },
          { label: "Features", link: "/#features" },
          { label: "Solutions", link: "/#solutions" },
          { label: "Lifestyle", link: "/#lifestyle" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.link}
            className="text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2 rounded-full shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all font-bold text-sm"
            >
               <LayoutDashboard size={16} />
               Dashboard
            </Link>
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
               <UserIcon size={16} className="text-emerald-600" />
               <span className="text-xs font-bold text-gray-900">{user.displayName || "User"}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <>
            <Link href="/login" className="text-sm font-bold px-6 py-2.5 rounded-full hover:bg-gray-100 transition-all">
              Sign In
            </Link>
            <Link href="/signup" className="text-sm font-bold bg-emerald-500 text-white px-7 py-2.5 rounded-full shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95">
              Get Started
            </Link>
          </>
        )}
      </div>
    </motion.nav>
  );
}
