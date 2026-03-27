"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Bell, User, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function DashboardHeader() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [localName, setLocalName] = React.useState("");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setLocalName(localStorage.getItem("sessionName") || "");
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("sessionName");
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const displayName = !mounted
    ? "..."
    : user?.displayName || userData?.name || localName || "Resident";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header
      style={{
        height: "72px",
        borderBottom: "1px solid #f1f5f9",
        backgroundColor: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(12px)",
        padding: "0 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Left: Greeting */}
      <div>
        <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#111827", lineHeight: 1.2 }}>
          {getGreeting()},{" "}
          <span style={{ color: "#059669" }}>{displayName}</span>
        </h2>
        <p style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em", marginTop: "2px" }}>
          Society Resident Hub
        </p>
      </div>

      {/* Right: Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Search */}
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <Search style={{ position: "absolute", left: "14px", color: "#9ca3af", zIndex: 1 }} size={16} />
          <input
            type="text"
            placeholder="Search activities, passes..."
            style={{
              backgroundColor: "#f8fafc",
              border: "1px solid #f1f5f9",
              borderRadius: "16px",
              padding: "10px 20px 10px 40px",
              fontSize: "13px",
              fontWeight: 500,
              outline: "none",
              width: "260px",
              color: "#374151",
            }}
          />
        </div>

        {/* Bell */}
        <button
          style={{
            width: "42px",
            height: "42px",
            backgroundColor: "white",
            border: "1px solid #f1f5f9",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
          }}
        >
          <Bell size={18} color="#6b7280" />
          <span
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              width: "8px",
              height: "8px",
              backgroundColor: "#ef4444",
              borderRadius: "50%",
              border: "2px solid white",
            }}
          />
        </button>

        {/* User badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: "white",
            border: "1px solid #f1f5f9",
            borderRadius: "14px",
            padding: "6px 14px 6px 6px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              width: "30px",
              height: "30px",
              backgroundColor: "#d1fae5",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <User size={16} color="#059669" />
          </div>
          <div>
            <p style={{ fontSize: "12px", fontWeight: 900, color: "#111827", lineHeight: 1 }}>
              {displayName.split(" ")[0]}
            </p>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "#6ee7b7", lineHeight: 1.2 }}>
              Resident
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Log Out"
          style={{
            width: "42px",
            height: "42px",
            backgroundColor: "#fff1f2",
            border: "1px solid #fee2e2",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#ef4444";
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#fff1f2";
          }}
        >
          <LogOut size={16} color="#ef4444" />
        </button>
      </div>
    </header>
  );
}
