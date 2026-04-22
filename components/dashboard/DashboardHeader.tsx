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
  const { user, userData, role } = useAuth();
  const router = useRouter();
  const [localName, setLocalName] = React.useState("");
  const [mounted, setMounted] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [selectedNotification, setSelectedNotification] = React.useState<any>(null);
  const [showDot, setShowDot] = React.useState(false);
  const [activeChat, setActiveChat] = React.useState<any>(null);
  const [chatInput, setChatInput] = React.useState("");
  const [chatLogs, setChatLogs] = React.useState<any[]>([]);

  const displayName = user?.displayName || userData?.name || localName || "Member";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  React.useEffect(() => {
    if (activeChat) {
      setChatLogs([{ id: 'init', text: activeChat.message, sender: 'them', time: 'Received' }]);
    } else {
      setChatLogs([]);
      setChatInput("");
    }
  }, [activeChat]);

  const handleSendChat = async (directText?: string) => {
    const text = directText || chatInput;
    if (!text.trim() || !activeChat || !user) return;
    
    const newMsg = {
      id: Date.now(),
      text,
      sender: 'me',
      time: 'Just Now'
    };
    
    setChatLogs(prev => [...prev, newMsg]);
    setChatInput("");

    try {
      await supabase.from('marketplace_messages').insert({
        sender_id: user.uid,
        receiver_id: activeChat.sender_id,
        listing_id: activeChat.listing_id,
        sender_name: displayName,
        message: text,
        is_read: false
      });
    } catch (e) {
      console.error("Chat send failed:", e);
    }
  };

  React.useEffect(() => {
    setLocalName(localStorage.getItem("sessionName") || "");
    setMounted(true);
  }, []);

  // REALTIME MESSAGES LOGIC
  React.useEffect(() => {
    if (!user) return;

    // Fetch initial unread messages
    const fetchUnread = async () => {
      try {
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
      } catch (e) {
        console.error("Header notification fetch failed:", e);
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



  return (
    <>
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
          {getGreeting()}, <span style={{ color: "#059669" }}>{displayName}</span>
        </h2>
        <p style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em", marginTop: "2px" }}>
          Society {role === "admin" ? "Command Center" : role === "guard" ? "Security Hub" : "Resident Hub"}
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

          {/* New Message Floating Alert */}
          <AnimatePresence>
            {showDot && !showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, y: 5, x: "-50%" }}
                style={{
                  position: "absolute", top: "52px", left: "50%",
                  backgroundColor: "#052616", color: "#6ee7b7",
                  padding: "4px 10px", borderRadius: "8px",
                  fontSize: "9px", fontWeight: 900, whiteSpace: "nowrap",
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
                  zIndex: 40, pointerEvents: "none",
                  border: "1px solid rgba(110, 231, 183, 0.2)"
                }}
              >
                New Message
                <div style={{ position: "absolute", top: "-4px", left: "50%", transform: "translateX(-50%) rotate(45deg)", width: "8px", height: "8px", backgroundColor: "#052616", borderTop: "1px solid rgba(110, 231, 183, 0.2)", borderLeft: "1px solid rgba(110, 231, 183, 0.2)" }} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 5, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.1, ease: 'easeOut' }}
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
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                transition={{ duration: 0.12, ease: 'easeOut' }}
                onClick={e => e.stopPropagation()}
                style={{
                  backgroundColor: "white", borderRadius: "3.5rem", padding: "48px",
                  maxWidth: "500px", width: "100%", margin: "auto",
                  boxShadow: "0 50px 100px -20px rgba(0,0,0,0.4)", position: "relative"
                }}
              >
                <button 
                  onClick={() => setSelectedNotification(null)}
                  style={{ position: "absolute", top: "24px", right: "24px", width: "40px", height: "40px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", transition: "all 0.2s" }}
                >
                  <X size={18} />
                </button>

                {/* Header Badge */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                   <div style={{ position: "relative", width: "8px", height: "8px" }}>
                     <div style={{ position: "absolute", inset: 0, borderRadius: "50%", backgroundColor: "#10b981" }} />
                     <div style={{ position: "absolute", inset: 0, borderRadius: "50%", backgroundColor: "#10b981", animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite" }} />
                   </div>
                   <span style={{ fontSize: "9px", fontWeight: 900, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.25em" }}>Marketplace • Incoming Request</span>
                </div>

                {/* Profile Section */}
                <div style={{ textAlign: "center", marginBottom: "28px" }}>
                   <div style={{ position: "relative", width: "80px", height: "80px", margin: "0 auto 12px" }}>
                      <div style={{ width: "100%", height: "100%", backgroundColor: "#f8fafc", borderRadius: "30px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #f1f5f9", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)" }}>
                         <User size={32} color="#cbd5e1" />
                      </div>
                      <div style={{ position: "absolute", bottom: "-2px", right: "-2px", backgroundColor: "#059669", borderRadius: "10px", padding: "5px", border: "3px solid white", boxShadow: "0 4px 10px rgba(5, 150, 105, 0.2)" }}>
                         <ShieldCheck size={14} color="white" />
                      </div>
                   </div>
                   <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#111827", marginBottom: "4px", letterSpacing: "-0.01em" }}>{selectedNotification.sender_name}</h2>
                   <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Verified Resident • Online Now</span>
                   </div>
                </div>

                {/* Message Content - Premium Bubble */}
                <div style={{ backgroundColor: "#f8fafc", borderRadius: "24px", padding: "20px", marginBottom: "16px", border: "1px solid #f1f5f9", position: "relative" }}>
                   <div style={{ position: "absolute", top: "-10px", left: "20px", backgroundColor: "#052616", color: "#6ee7b7", padding: "3px 10px", borderRadius: "6px", fontSize: "8px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em" }}>Buyer Message</div>
                   <p style={{ fontSize: "14px", fontWeight: 600, color: "#334155", lineHeight: 1.55 }}>
                     "{selectedNotification.message}"
                   </p>
                </div>

                {/* Contact Info Badge */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: "16px", padding: "10px 16px", marginBottom: "24px" }}>
                   <Phone size={13} color="#64748b" />
                   <span style={{ fontSize: "12px", fontWeight: 800, color: "#475569", fontFamily: "monospace" }}>{selectedNotification.sender_phone || "No number provided"}</span>
                </div>

                {/* Quick Contact & Interaction Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                   <button 
                     onClick={() => {
                        const phone = selectedNotification.sender_phone?.replace(/\D/g, '');
                        if (phone) window.open(`https://wa.me/${phone}?text=Hello ${selectedNotification.sender_name}, regarding your interest in the Marketplace...`, '_blank');
                     }}
                     style={{ 
                       width: "100%", padding: "16px", borderRadius: "16px", 
                       backgroundColor: "#10b981", color: "white", 
                       fontSize: "11px", fontWeight: 900, 
                       textTransform: "uppercase", letterSpacing: "0.15em", 
                       cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                       boxShadow: "0 10px 20px -5px rgba(16, 185, 129, 0.25)"
                     }}
                   >
                     <ExternalLink size={16} /> WhatsApp
                   </button>
                   
                   <button 
                     onClick={() => { setActiveChat(selectedNotification); setSelectedNotification(null); }}
                     style={{ 
                       width: "100%", padding: "16px", borderRadius: "16px", 
                       backgroundColor: "#052616", color: "white", 
                       fontSize: "11px", fontWeight: 900, 
                       textTransform: "uppercase", letterSpacing: "0.2em", 
                       cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                       boxShadow: "0 10px 20px -5px rgba(5, 38, 22, 0.3)"
                     }}
                   >
                     <MessageSquare size={16} /> Direct Chat
                   </button>

                   <motion.button 
                    whileHover={{ color: "#94a3b8" }}
                    onClick={() => setSelectedNotification(null)}
                    style={{ 
                      width: "100%", padding: "12px", marginTop: "4px", borderRadius: "14px", 
                      backgroundColor: "transparent", color: "#cbd5e1", 
                      fontSize: "10px", fontWeight: 800, 
                      textTransform: "uppercase", letterSpacing: "0.1em"
                    }}
                   >
                     Dismiss
                   </motion.button>
                </div>
              </motion.div>
            </div>
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
              {role === 'admin' ? 'Administrator' : role === 'guard' ? 'Security' : 'Resident'}
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
    
    <AnimatePresence>
      {activeChat && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
            zIndex: 11000
          }}
          onClick={() => setActiveChat(null)}
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 40, stiffness: 400 }}
            onClick={e => e.stopPropagation()}
            onWheel={e => e.stopPropagation()}
            style={{
              position: "absolute", top: 0, right: 0, bottom: 0,
              width: "100%", maxWidth: "500px",
              backgroundColor: "white", 
              boxShadow: "-10px 0 60px rgba(0,0,0,0.3)",
              display: "flex", flexDirection: "column",
              overflow: "hidden"
            }}
          >
            {/* Header */}
            <div style={{ padding: "24px 32px", backgroundColor: "#052616", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ position: "relative" }}>
                   <div style={{ width: "48px", height: "48px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <User size={24} />
                   </div>
                   <div style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "12px", height: "12px", backgroundColor: "#10b981", borderRadius: "50%", border: "2px solid #052616" }} />
                </div>
                <div>
                  <p style={{ fontSize: "16px", fontWeight: 900 }}>{activeChat.sender_name}</p>
                  <p style={{ fontSize: "9px", fontWeight: 700, color: "#6ee7b7", textTransform: "uppercase", letterSpacing: "0.1em" }}>Active Connection</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveChat(null)} 
                style={{ width: "32px", height: "32px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div 
              style={{ flex: 1, padding: "32px", overflowY: "auto", backgroundColor: "#f8fafc", display: "flex", flexDirection: "column", gap: "20px" }} 
              className="hide-scrollbar"
            >
              {chatLogs.map((log) => (
                <div key={log.id} style={{ alignSelf: log.sender === 'them' ? "flex-start" : "flex-end", maxWidth: "85%" }}>
                   <div style={{ 
                      backgroundColor: log.sender === 'them' ? "white" : "#052616", 
                      padding: "16px 20px", 
                      borderRadius: log.sender === 'them' ? "1.5rem 1.5rem 1.5rem 4px" : "1.5rem 1.5rem 4px 1.5rem", 
                      boxShadow: "0 2px 10px rgba(0,0,0,0.03)", 
                      border: log.sender === 'them' ? "1px solid #f1f5f9" : "none",
                      color: log.sender === 'them' ? "#1e293b" : "white"
                   }}>
                      <p style={{ fontSize: "14px", fontWeight: 500, lineHeight: 1.5 }}>{log.text}</p>
                   </div>
                   <p style={{ 
                      fontSize: "8px", fontWeight: 800, color: "#94a3b8", 
                      textTransform: "uppercase", marginTop: "6px", 
                      textAlign: log.sender === 'me' ? 'right' : 'left'
                   }}>
                      {log.sender === 'them' ? activeChat.sender_name : 'You'} • {log.time}
                   </p>
                </div>
              ))}
              
              <div style={{ textAlign: "center", margin: "10px 0" }}>
                 <span style={{ fontSize: "9px", fontWeight: 800, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.1em" }}>Secure Session Active</span>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: "24px 32px", backgroundColor: "white", borderTop: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px", overflowX: "auto" }} className="hide-scrollbar">
                {["Perfect!", "Price?", "Location?"].map(q => (
                  <button key={q} onClick={() => handleSendChat(q)} style={{ padding: "8px 16px", backgroundColor: "#f1f5f9", borderRadius: "10px", fontSize: "10px", fontWeight: 800, color: "#475569", textTransform: "uppercase", whiteSpace: "nowrap" }}>{q}</button>
                ))}
              </div>
              
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input 
                  type="text" 
                  placeholder="Secure response..." 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                  style={{ width: "100%", padding: "16px 60px 16px 20px", borderRadius: "16px", backgroundColor: "#f8fafc", border: "1px solid #f1f5f9", outline: "none", fontSize: "14px", fontWeight: 600 }}
                />
                <button 
                  onClick={() => handleSendChat()}
                  style={{ position: "absolute", right: "8px", width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#052616", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
  );
}
