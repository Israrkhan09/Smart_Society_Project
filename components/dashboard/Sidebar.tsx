"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  BarChart3, 
  Users, 
  Car, 
  ShieldAlert, 
  MessageSquare, 
  Settings, 
  LogOut,
  LayoutDashboard,
  Zap,
  Tag,
  ShoppingBag,
  Bell,
  ChevronRight,
  ShieldCheck,
  Building
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const sidebarLinks = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard, color: "text-blue-500 bg-blue-50" },
  { name: "Visitor Pass", href: "/dashboard/visitors", icon: ShieldCheck, color: "text-emerald-500 bg-emerald-50" },
  { name: "Vehicle Log", href: "/dashboard/vehicles", icon: Car, color: "text-blue-500 bg-blue-50" },
  { name: "Emergency SOS", href: "/dashboard/sos", icon: ShieldAlert, color: "text-rose-500 bg-rose-50" },
  { name: "Marketplace", href: "/dashboard/marketplace", icon: ShoppingBag, color: "text-amber-500 bg-amber-50" },
  { name: "Complaints", href: "/dashboard/complaints", icon: MessageSquare, color: "text-blue-500 bg-blue-50" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userData } = useAuth();
  const displayName = user?.displayName || userData?.name || "Resident";

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("sessionName");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <aside 
      className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-gray-100 z-[60] flex flex-col shadow-sm"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Brand Header */}
      <div className="p-8 pb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
             <Building size={20} />
          </div>
          <div>
            <h1 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] leading-tight">Smart Society</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Management OS</p>
          </div>
        </div>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto no-scrollbar">
        <p className="px-4 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-4">Core Modules</p>
        
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group relative overflow-hidden ${
                isActive 
                ? "bg-emerald-50 text-emerald-600 shadow-sm" 
                : "text-gray-400 hover:text-gray-900"
              }`}
            >
              {isActive && (
                <motion.div layoutId="activeNav" className="absolute inset-0 bg-white" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
              )}
              
              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                  isActive ? "bg-emerald-100 text-emerald-600" : "bg-gray-50 text-gray-400 group-hover:text-gray-600"
                }`}>
                   <link.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[11px] font-black uppercase tracking-wider ${isActive ? "text-emerald-600" : "text-gray-500"}`}>
                  {link.name}
                </span>
              </div>

              {isActive && (
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full relative z-10" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Session Footer */}
      <div className="p-4 mt-auto">
        <div className="bg-gray-50 p-4 rounded-[2rem] border border-gray-100 mb-4">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center font-black text-emerald-600 shadow-sm">
                 {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                 <p className="text-xs font-black text-gray-900 line-clamp-1">{displayName}</p>
                 <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Verified Unit</span>
              </div>
           </div>
           
           <button 
             onClick={handleLogout}
             className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
           >
              <LogOut size={14} strokeWidth={2.5} />
              Term. Session
           </button>
        </div>
        
        <p className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest opacity-60">Engine Version 1.4.2</p>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </aside>
  );
}
