"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, User, LogOut, Search, Mail, CheckCircle2, MessageCircle, X, ChevronRight, Clock, Phone, MessageSquare, ShieldCheck, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";

export default function DashboardHeader() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [localName, setLocalName] = React.useState("");
  const [mounted, setMounted] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [selectedNotification, setSelectedNotification] = React.useState<any>(null);
  const [showDot, setShowDot] = React.useState(false);
  const [activeChat, setActiveChat] = React.useState<any>(null);

  React.useEffect(() => {
    setLocalName(localStorage.getItem("sessionName") || "");
    setMounted(true);
  }, []);

  // REALTIME MESSAGES LOGIC
  React.useEffect(() => {
    if (!user) return;

    // Fetch initial unread messages
    const fetchUnread = async () => {
      const { data, error } = await supabase
        .from('marketplace_messages')
        .select(`
          *,
          listings (title, image:listing_images(url))
        `)
        .eq('receiver_id', user.uid)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!error && data) {
        setNotifications(data);
        if (data.some(n => !n.is_read)) setShowDot(true);
      }
    };

    fetchUnread();

    const channel = supabase.channel('mkt-alerts')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'marketplace_messages',
        filter: `receiver_id=eq.${user.uid}`
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
        setShowDot(true);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const markRead = async (id: string, fullData: any) => {
    setSelectedNotification(fullData);
    await supabase.from('marketplace_messages').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    if (notifications.every(n => n.is_read || n.id === id)) setShowDot(false);
  };

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

        {/* Bell & Notifications */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => { setShowDropdown(!showDropdown); setShowDot(false); }}
            style={{
              width: "42px", height: "42px", backgroundColor: "white",
              border: "1px solid #f1f5f9", borderRadius: "14px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", position: "relative",
            }}
          >
            <Bell size={18} color="#6b7280" />
            {showDot && (
              <span
                style={{
                  position: "absolute", top: "10px", right: "10px",
                  width: "10px", height: "10px", backgroundColor: "#ef4444",
                  borderRadius: "50%", border: "2px solid white",
                }}
              />
            )}
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 5, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                style={{
                  position: "absolute", top: "50px", right: 0,
                  width: "360px", backgroundColor: "white", borderRadius: "24px",
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)",
                  border: "1px solid #f1f5f9", overflow: "hidden", zIndex: 100,
                  padding: "20px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                   <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                     <Mail size={16} color="#059669" />
                     <span style={{ fontSize: "14px", fontWeight: 900, color: "#111827" }}>Invitations</span>
                   </div>
                   <button onClick={() => setShowDropdown(false)} style={{ color: "#94a3b8" }}><X size={16} /></button>
                </div>

                <div style={{ maxHeight: "400px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }} className="hide-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => markRead(n.id, n)}
                        style={{ 
                          padding: "16px", borderRadius: "18px", backgroundColor: n.is_read ? "transparent" : "#f8fafc",
                          border: "1px solid", borderColor: n.is_read ? "#f1f5f9" : "#d1fae5",
                          cursor: "pointer", transition: "all 0.2s ease"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                           <span style={{ fontSize: "10px", fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: "0.1em" }}>Marketplace Request</span>
                           <Clock size={10} color="#94a3b8" />
                        </div>
                        <p style={{ fontSize: "13px", fontWeight: 700, color: "#111827", margin: "2px 0" }}>{n.sender_name} is interested</p>
                        <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0" }}>"{n.message}"</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                           <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: n.is_read ? "#cbd5e1" : "#10b981" }} />
                           <span style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8" }}>
                              {n.is_read ? "Viewed" : "New Message"}
                           </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "40px 20px", textAlign: "center" }}>
                       <Mail size={32} color="#f1f5f9" style={{ marginBottom: "12px" }} />
                       <p style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8" }}>No active invitations</p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => router.push('/dashboard/marketplace')}
                  style={{ 
                    width: "100%", marginTop: "16px", padding: "12px", borderRadius: "14px",
                    backgroundColor: "#f8fafc", border: "1px solid #f1f5f9", 
                    fontSize: "11px", fontWeight: 800, color: "#334155",
                    textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer"
                  }}
                >
                   View Marketplace
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Invitation Modal */}
        <AnimatePresence>
          {selectedNotification && (
            <div 
              style={{
                position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
                backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 2000, padding: "20px"
              }}
              onClick={() => setSelectedNotification(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
                style={{
                  backgroundColor: "white", borderRadius: "3.5rem", padding: "48px",
                  maxWidth: "500px", width: "100%", margin: "auto",
                  boxShadow: "0 50px 100px -20px rgba(0,0,0,0.4)", position: "relative"
                }}
              >
                <button 
                  onClick={() => setSelectedNotification(null)}
                  style={{ position: "absolute", top: "32px", right: "32px", color: "#94a3b8", transition: "color 0.2s" }}
                  onMouseOver={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#111827")}
                  onMouseOut={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#94a3b8")}
                >
                  <X size={20} />
                </button>

                {/* Header Badge */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
                   <div style={{ position: "relative" }}>
                     <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981" }} />
                     <div style={{ position: "absolute", top: 0, left: 0, width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981", animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite" }} />
                   </div>
                   <span style={{ fontSize: "10px", fontWeight: 900, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.2em" }}>Incoming Buyer Request</span>
                </div>

                {/* Profile Section */}
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                   <div style={{ position: "relative", width: "100px", height: "100px", margin: "0 auto 16px" }}>
                      <div style={{ width: "100%", height: "100%", backgroundColor: "#f8fafc", borderRadius: "35px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #f1f5f9" }}>
                         <User size={40} color="#cbd5e1" />
                      </div>
                      <div style={{ position: "absolute", bottom: "-4px", right: "-4px", backgroundColor: "#059669", borderRadius: "14px", padding: "6px", border: "4px solid white" }}>
                         <ShieldCheck size={16} color="white" />
                      </div>
                   </div>
                   <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#111827", marginBottom: "4px" }}>{selectedNotification.sender_name}</h2>
                   <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981" }} />
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Verified Resident • Online Now</span>
                   </div>
                </div>

                {/* Message Content */}
                <div style={{ backgroundColor: "#f8fafc", borderRadius: "2rem", padding: "24px", marginBottom: "20px", border: "1px solid #f1f5f9", position: "relative" }}>
                   <div style={{ position: "absolute", top: "-10px", right: "20px", backgroundColor: "#052616", color: "#6ee7b7", padding: "4px 12px", borderRadius: "8px", fontSize: "9px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em" }}>Let's chat with buyer</div>
                   <p style={{ fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Direct Message</p>
                   <p style={{ fontSize: "15px", fontWeight: 500, color: "#1e293b", lineHeight: 1.6, fontStyle: "italic" }}>
                     "{selectedNotification.message}"
                   </p>
                </div>

                {/* Contact Info Badge */}
                <div style={{ display: "flex", alignItems: "center", justifyCenter: "center", gap: "10px", backgroundColor: "#fffbeb", border: "1px solid #fef3c7", borderRadius: "18px", padding: "12px", marginBottom: "24px" }}>
                   <Phone size={14} color="#d97706" />
                   <span style={{ fontSize: "13px", fontWeight: 900, color: "#92400e" }}>{selectedNotification.sender_phone || "No number provided"}</span>
                </div>

                {/* Quick Contact & Interaction Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                   {/* WhatsApp Full Width */}
                   <button 
                     onClick={() => {
                        const phone = selectedNotification.sender_phone?.replace(/\D/g, '');
                        if (phone) window.open(`https://wa.me/${phone}?text=Hello ${selectedNotification.sender_name}, regarding your interest in the Marketplace...`, '_blank');
                     }}
                     style={{ 
                       width: "100%", padding: "18px", borderRadius: "20px", 
                       backgroundColor: "#10b981", color: "white", 
                       fontSize: "11px", fontWeight: 900, 
                       textTransform: "uppercase", letterSpacing: "0.15em", 
                       cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                       boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.3)"
                     }}
                   >
                     <ExternalLink size={18} /> CONNECT ON WHATSAPP
                   </button>
                   
                   {/* Chat Now - Primary SaaS Style */}
                   <button 
                     onClick={() => { setActiveChat(selectedNotification); setSelectedNotification(null); }}
                     style={{ 
                       width: "100%", padding: "18px", borderRadius: "20px", 
                       backgroundColor: "#052616", color: "white", 
                       fontSize: "11px", fontWeight: 900, 
                       textTransform: "uppercase", letterSpacing: "0.2em", 
                       cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                       boxShadow: "0 10px 25px -5px rgba(5, 38, 22, 0.4)"
                     }}
                   >
                     <MessageSquare size={18} /> CHAT NOW
                   </button>

                   <button 
                    onClick={() => setSelectedNotification(null)}
                    style={{ 
                      width: "100%", padding: "14px", borderRadius: "20px", 
                      backgroundColor: "transparent", color: "#94a3b8", 
                      fontSize: "10px", fontWeight: 800, 
                      textTransform: "uppercase", letterSpacing: "0.1em", 
                      cursor: "pointer"
                    }}
                   >
                     Dismiss
                   </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Global Floating Chat Terminal */}
        <AnimatePresence>
          {activeChat && (
            <motion.div
              initial={{ opacity: 0, y: 100, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: 100, x: 20 }}
              style={{
                position: "fixed", bottom: "40px", right: "40px",
                width: "400px", height: "550px", backgroundColor: "white",
                borderRadius: "2.5rem", boxShadow: "0 50px 100px -20px rgba(0,0,0,0.3)",
                border: "1px solid #f1f5f9", zIndex: 3000, display: "flex", flexDirection: "column",
                overflow: "hidden"
              }}
            >
              {/* Chat Header */}
              <div style={{ padding: "24px", borderBottom: "1px solid #f1f5f9", backgroundColor: "#052616", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#10b981", animation: "pulse 2s infinite" }} />
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 900 }}>{activeChat.sender_name}</p>
                    <p style={{ fontSize: "10px", fontWeight: 700, color: "#6ee7b7", textTransform: "uppercase" }}>Marketplace Transaction</p>
                  </div>
                </div>
                <button onClick={() => setActiveChat(null)} style={{ color: "white", opacity: 0.6 }}><X size={20} /></button>
              </div>

              {/* Chat Body */}
              <div style={{ flex: 1, padding: "24px", overflowY: "auto", backgroundColor: "#f8fafc", display: "flex", flexDirection: "column", gap: "16px" }} className="hide-scrollbar">
                <div style={{ alignSelf: "flex-start", maxWidth: "85%" }}>
                   <div style={{ backgroundColor: "white", padding: "16px", borderRadius: "20px 20px 20px 4px", boxShadow: "0 2px 5px rgba(0,0,0,0.02)", border: "1px solid #f1f5f9" }}>
                      <p style={{ fontSize: "13px", color: "#334155" }}>{activeChat.message}</p>
                   </div>
                   <span style={{ fontSize: "10px", color: "#94a3b8", marginLeft: "4px", marginTop: "4px", display: "block" }}>Incoming Inquiry</span>
                </div>
                <div style={{ textAlign: "center", margin: "10px 0" }}>
                   <span style={{ fontSize: "9px", fontWeight: 800, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.1em" }}>Start of conversation • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>

              {/* Chat Input */}
              <div style={{ padding: "20px", backgroundColor: "white", borderTop: "1px solid #f1f5f9" }}>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input 
                    type="text" 
                    placeholder="Type your response..." 
                    style={{ width: "100%", padding: "16px 50px 16px 20px", borderRadius: "18px", backgroundColor: "#f8fafc", border: "1px solid #f1f5f9", outline: "none", fontSize: "13px", fontWeight: 500 }}
                  />
                  <button style={{ position: "absolute", right: "8px", width: "38px", height: "38px", borderRadius: "14px", backgroundColor: "#052616", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
