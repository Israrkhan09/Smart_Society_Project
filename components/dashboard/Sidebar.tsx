"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  Users, 
  Car, 
  ShieldAlert, 
  MessageSquare, 
  MessageCircle,
  Settings, 
  LogOut,
  LayoutDashboard,
  ShoppingBag,
  ShieldCheck,
  Building,
  FileText,
  AlertCircle,
  CreditCard,
  Bell,
  HardDrive,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

// Configuration for all possible modules
const modules = {
  admin: [
    { name: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Residents", href: "/dashboard/admin/residents", icon: Building },
    { name: "Guards", href: "/dashboard/admin/guards", icon: ShieldCheck },
    { name: "Visitor Logs", href: "/dashboard/admin/visitors", icon: HardDrive },
    { name: "Vehicle Logs", href: "/dashboard/admin/vehicles", icon: Car },
    { name: "Operations", href: "/dashboard/admin/complaints", icon: FileText },
    { name: "SOS Center", href: "/dashboard/admin/sos", icon: AlertCircle },
    { name: "Financials", href: "/dashboard/admin/finance", icon: CreditCard },
    { name: "Messages", href: "/dashboard/messages", icon: MessageCircle },
  ],
  resident: [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Visitor Pass", href: "/dashboard/visitors", icon: ShieldCheck },
    { name: "Vehicle Log", href: "/dashboard/vehicles", icon: Car },
    { name: "Emergency SOS", href: "/dashboard/sos", icon: ShieldAlert },
    { name: "Marketplace", href: "/dashboard/marketplace", icon: ShoppingBag },
    { name: "Complaints", href: "/dashboard/complaints", icon: MessageSquare },
    { name: "Messages", href: "/dashboard/messages", icon: MessageCircle },
  ],
  guard: [
    { name: "Checkpoint", href: "/dashboard/guard", icon: ShieldCheck },
    { name: "Visitor Reg", href: "/dashboard/guard/visitors", icon: Users },
    { name: "Vehicle Check", href: "/dashboard/guard/vehicles", icon: Car },
    { name: "SOS Patrol", href: "/dashboard/guard/sos", icon: ShieldAlert },
    { name: "Messages", href: "/dashboard/messages", icon: MessageCircle },
  ]
};

interface SidebarProps {
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (val: boolean) => void;
}

export default function Sidebar({ isSidebarOpen = true, setIsSidebarOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userData, role } = useAuth();

  // Fallback to resident if role undetected yet
  const activeRole = role || 'resident';
  const currentLinks = modules[activeRole as keyof typeof modules] || modules.resident;

  const displayName = user?.displayName || userData?.name || "Member";

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
    <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-100 z-[60] flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-72' : 'w-20'}`}>
      {/* Brand Header */}
      <div className={`p-8 pb-10 flex items-center justify-between relative ${!isSidebarOpen && 'px-5'}`}>
        <Link href="/dashboard" className={`flex items-center gap-3 active:scale-95 transition-transform ${!isSidebarOpen && 'justify-center w-full'}`}>
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 flex-shrink-0">
             <Building size={20} />
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] leading-tight">Smart Society</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{activeRole} terminal</p>
            </div>
          )}
        </Link>
        <button 
          onClick={() => setIsSidebarOpen && setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute ${isSidebarOpen ? '-right-3' : '-right-3'} top-10 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-500 shadow-sm z-50 transition-all`}
        >
          {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto no-scrollbar">
        {isSidebarOpen ? (
          <p className="px-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-4 whitespace-nowrap">Command Center</p>
        ) : (
          <div className="h-4" />
        )}
        
        {currentLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.name}
              href={link.href}
              prefetch={true}
              title={!isSidebarOpen ? link.name : ""}
              className={`flex items-center justify-between px-4 py-3.5 rounded-2xl cursor-pointer group relative overflow-hidden transition-all duration-100 ${
                isActive 
                ? "bg-white shadow-sm text-emerald-600 ring-1 ring-slate-100" 
                : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
              } ${!isSidebarOpen && 'px-0 justify-center'}`}
            >
              <div className={`flex items-center gap-4 ${!isSidebarOpen && 'justify-center'}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isActive ? "bg-emerald-100 text-emerald-600" : "bg-slate-50 text-slate-400 group-hover:text-slate-600"
                }`}>
                   <link.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                {isSidebarOpen && (
                  <span className={`text-[11px] font-black uppercase tracking-wider whitespace-nowrap ${isActive ? "text-emerald-600" : "text-slate-500"}`}>
                    {link.name}
                  </span>
                )}
              </div>

              {isActive && isSidebarOpen && (
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Session Footer */}
      <div className={`p-4 mt-auto ${!isSidebarOpen && 'px-2'}`}>
        <div className={`bg-slate-50 p-4 rounded-[2rem] border border-slate-100 mb-4 ${!isSidebarOpen && 'px-2 py-4 rounded-[1.5rem]'}`}>
           <div className={`flex items-center gap-3 mb-4 ${!isSidebarOpen && 'justify-center'}`}>
              <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center font-black text-emerald-600 shadow-sm flex-shrink-0">
                 {displayName.charAt(0).toUpperCase()}
              </div>
              {isSidebarOpen && (
                <div className="overflow-hidden">
                   <p className="text-xs font-black text-slate-900 truncate">{displayName}</p>
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate block">{activeRole} Account</span>
                </div>
              )}
           </div>
           
           <button 
             onClick={handleLogout}
             title={!isSidebarOpen ? "Terminate Session" : ""}
             className={`flex items-center justify-center gap-3 py-3 bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm ${
               isSidebarOpen ? 'w-full rounded-xl' : 'w-10 h-10 rounded-xl p-0 mx-auto'
             }`}
           >
              <LogOut size={14} strokeWidth={2.5} />
              {isSidebarOpen && <span>Terminate</span>}
           </button>
        </div>
        
        {isSidebarOpen && <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest opacity-60 whitespace-nowrap">Engine OS v4.2.Final</p>}
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </aside>
  );
}
