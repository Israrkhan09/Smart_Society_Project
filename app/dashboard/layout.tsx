"use client";

import React, { useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { auth as firebaseAuth } from "@/lib/firebase";
import { useSOS } from "@/context/SOSContext";
import { ShieldAlert } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { flow, countdown } = useSOS();

  useEffect(() => {
    // If auth state is resolved AND there's no user in context AND no current Firebase user
    // then we redirect to login.
    if (!loading && !user && !firebaseAuth.currentUser) {
        console.log("DashboardLayout: Protected route - No user found, redirecting...");
        router.push("/login");
    }
  }, [user, loading, router]);

  // Premium loading state while checking authentication
  if (loading && !firebaseAuth.currentUser) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, sans-serif"
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              border: "5px solid #d1fae5",
              borderTopColor: "#10b981",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 24px",
            }}
          />
          <p
            style={{
              fontSize: "12px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              color: "#10b981",
              margin: 0
            }}
          >
            Securing Session...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
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
        <Sidebar />
        <div
          style={{
            flex: 1,
            marginLeft: "288px",
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
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
          
          <main 
            style={{ 
              flex: 1, 
              padding: "40px",
              maxWidth: "1600px",
              margin: "0 auto",
              width: "100%",
              boxSizing: "border-box"
            }}
          >
            {children}
          </main>
          <footer style={{ padding: "40px", borderTop: "1px solid #f1f5f9", textAlign: "center" }}>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8", margin: 0 }}>
                  © 2026 Smart-Society Management OS. All rights reserved.
              </p>
          </footer>
        </div>
      </div>
    );
  }

  // Fallback while redirecting
  return null;
}
