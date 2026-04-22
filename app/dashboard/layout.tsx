"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { auth as firebaseAuth } from "@/lib/firebase";
import { useSOS } from "@/context/SOSContext";
import { ShieldAlert } from "lucide-react";
import FloatingChatbot from "@/components/dashboard/chat/FloatingChatbot";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { flow, countdown } = useSOS();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    // If auth state is resolved AND there's no user in context AND no current Firebase user
    // then we redirect to login.
    if (!loading && !user && !firebaseAuth.currentUser) {
        console.log("DashboardLayout: Protected route - No user found, redirecting...");
        router.push("/login");
    }
  }, [user, loading, router]);

  // Silent load for instant feel
  if (loading && !firebaseAuth.currentUser) {
    return null;
  }

  // If we have a user (either in context or directly in auth), show the dashboard
  if (user || firebaseAuth.currentUser) {
    return (
      <div
        style={{
          display: "flex",
          backgroundColor: "#fafafa",
          minHeight: "100vh",
          color: "#111827",
          fontFamily: "Inter, sans-serif"
        }}
      >
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <div className="flex-1 flex flex-col min-h-screen transition-all duration-300" style={{ marginLeft: isSidebarOpen ? "288px" : "80px" }}>
          <DashboardHeader />
          
          {flow !== "IDLE" && pathname !== "/dashboard/sos" && (
             <div 
               onClick={() => router.push("/dashboard/sos")}
               className="mx-10 mt-6 bg-rose-500 text-white rounded-[1.5rem] p-4 px-6 flex justify-between items-center shadow-xl shadow-rose-500/20 cursor-pointer hover:bg-rose-600 transition-all"
             >
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner">
                      <ShieldAlert size={20} className="text-white animate-pulse" />
                   </div>
                   <div>
                      <h4 className="font-black text-sm uppercase tracking-widest leading-none">Emergency SOS Active</h4>
                      <p className="text-[10px] font-bold text-rose-100 uppercase tracking-widest mt-1">Tap to return to active tracking console</p>
                   </div>
                </div>
                {countdown > 0 && (
                  <div className="text-right">
                     <p className="text-[10px] font-black uppercase tracking-widest text-rose-200 mb-0.5">Guard Arriving</p>
                     <p className="font-mono font-black text-xl leading-none tracking-tight">0:{countdown.toString().padStart(2, '0')}</p>
                  </div>
                )}
             </div>
          )}
          
          <main className={`w-full box-border relative flex flex-col ${pathname === '/dashboard/messages' ? 'p-0 h-[calc(100vh-73px)] overflow-hidden' : 'flex-1 px-4 py-6 md:px-10 md:py-10'}`}>
            {children}
          </main>
          
          {pathname !== '/dashboard/messages' && (
            <footer style={{ padding: "40px", borderTop: "1px solid #f1f5f9", textAlign: "center" }}>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8", margin: 0 }}>
                    © 2026 Smart-Society Management OS. All rights reserved.
                </p>
            </footer>
          )}
          
          <FloatingChatbot />
        </div>
      </div>
    );
  }

  // Fallback while redirecting
  return null;
}
