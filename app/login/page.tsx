"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // If already logged in, go straight to dashboard
  useEffect(() => {
    if (!authLoading && user) {
        console.log("LoginPage: Auth is active, redirecting to dashboard...");
        router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    setError("");
    try {
      console.log("LoginPage: Logging in...");
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("sessionName", email.split("@")[0]);
      console.log("LoginPage: Login success, navigating...");
      router.push("/dashboard");
      // Safety redirect in case router is slow
      setTimeout(() => {
          if (window.location.pathname === "/login") {
              window.location.href = "/dashboard";
          }
      }, 1500);
    } catch (err: any) {
      console.error("LoginPage: Auth Error:", err.code || err.message);
      const msg = err.code === "auth/invalid-credential" 
        || err.code === "auth/user-not-found"
        || err.code === "auth/wrong-password"
        ? "Incorrect email or password. Please try again."
        : err.message;
      setError(msg);
      setLocalLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "Inter, sans-serif"
      }}
    >
      {/* Show a non-blocking indicator if still checking session */}
      {authLoading && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "3px", backgroundColor: "#d1fae5", zIndex: 100 }}>
              <div style={{ width: "30%", height: "100%", backgroundColor: "#10b981", animation: "progress 2s infinite" }} />
              <style>{`@keyframes progress { from { left: -30%; } to { left: 100%; } }`}</style>
          </div>
      )}

      {/* Back button */}
      <Link
        href="/"
        style={{
          position: "fixed",
          top: "40px",
          left: "40px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#94a3b8",
          textDecoration: "none",
          fontWeight: 700,
          fontSize: "14px",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
        }}
      >
        ← Home
      </Link>

      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#ffffff",
          borderRadius: "3rem",
          padding: "60px 48px",
          border: "1px solid #f1f5f9",
          boxShadow: "0 25px 60px -15px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              backgroundColor: "#10b981",
              borderRadius: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              color: "white",
              fontSize: "32px",
              boxShadow: "0 12px 30px rgba(16,185,129,0.3)"
            }}
          >
            🛡️
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: 900, color: "#111827", margin: "0 0 10px", letterSpacing: "-1px" }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280", fontWeight: 600, margin: 0 }}>
            Smart-Society Secure Login
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#374151", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: "100%",
                padding: "16px 20px",
                borderRadius: "16px",
                border: "2px solid #f1f5f9",
                backgroundColor: "#fafafa",
                fontSize: "15px",
                fontWeight: 600,
                color: "#111827",
                outline: "none",
                transition: "all 0.2s",
                boxSizing: "border-box"
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#10b981"; e.currentTarget.style.backgroundColor = "white"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#f1f5f9"; e.currentTarget.style.backgroundColor = "#fafafa"; }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#374151", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%",
                padding: "16px 20px",
                borderRadius: "16px",
                border: "2px solid #f1f5f9",
                backgroundColor: "#fafafa",
                fontSize: "15px",
                fontWeight: 600,
                color: "#111827",
                outline: "none",
                transition: "all 0.2s",
                boxSizing: "border-box"
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#10b981"; e.currentTarget.style.backgroundColor = "white"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#f1f5f9"; e.currentTarget.style.backgroundColor = "#fafafa"; }}
            />
          </div>

          {error && (
            <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fee2e2", borderRadius: "14px", padding: "14px 18px", color: "#dc2626", fontSize: "13px", fontWeight: 700 }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={localLoading}
            style={{
              marginTop: "10px",
              backgroundColor: localLoading ? "#6ee7b7" : "#10b981",
              color: "white",
              border: "none",
              borderRadius: "18px",
              padding: "18px",
              fontSize: "14px",
              fontWeight: 900,
              cursor: localLoading ? "not-allowed" : "pointer",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              boxShadow: "0 10px 30px rgba(16,185,129,0.3)",
              transition: "all 0.2s",
            }}
          >
            {localLoading ? "Validating..." : "Sign In Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "32px", fontSize: "14px", color: "#6b7280", fontWeight: 600 }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: "#059669", fontWeight: 800, textDecoration: "none" }}>
            Register Now
          </Link>
        </p>
      </div>
    </div>
  );
}
