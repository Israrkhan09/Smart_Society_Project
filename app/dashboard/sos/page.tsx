"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  ShieldAlert, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldCheck,
  Flame,
  Stethoscope,
  X,
  Plus,
  Power,
  HeartPulse,
  User,
  Navigation,
  CheckCircle2,
  Loader2,
  Volume2,
  Activity,
  MessageCircle,
  PhoneCall,
  AlertTriangle,
  BellRing,
  Wifi,
  Timer as TimerIcon,
  Send,
  MoreVertical,
  Minus,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

type SOSFlow = "IDLE" | "CHOOSING" | "SENDING" | "ACTIVE";

interface Message {
  id: number;
  text: string;
  sender: "guard" | "user";
  time: string;
}

import { useSOS } from "@/context/SOSContext";

export default function SOSPage() {
  const { user } = useAuth();
  const { 
    flow, setFlow, 
    emerType, setEmerType, 
    stepIndex, setStepIndex,
    guardActive, setGuardActive,
    isFullyReached, setIsFullyReached,
    countdown, setCountdown,
    timerRunning, setTimerRunning,
    handleReset
  } = useSOS();
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Chat States
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: `Hello ${user?.displayName || "Muhammad Kamal"}, I have received your request. I am en route to Sector B, Block-C. Please stay secure.`,
      sender: "guard",
      time: "Just Now"
    }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const timelineSteps = [
    "EMERGENCY SIGNAL DISPATCHED",
    "SEARCHING FOR NEAREST AVAILABLE GUARD",
    "OFFICER AHMED RAZA NOTIFIED",
    "EN ROUTE TO LOCATION",
    "REACHED TO LOCATION"
  ];

  // BODY SCROLL LOCK: Prevent background scrolling when chat is open
  useEffect(() => {
    if (isChatOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isChatOpen]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFullReset = () => {
    handleReset();
    setIsChatOpen(false);
    setMessages([{
      id: 1,
      text: `Hello ${user?.displayName || "Muhammad Kamal"}, I have received your request. I am en route to Sector B, Block-C. Please stay secure.`,
      sender: "guard",
      time: "Just Now"
    }]);
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    const newMessage: Message = {
      id: Date.now(),
      text,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMessage]);
    setChatInput("");
    // REMOVED AUTO-ACK MESSAGE (Simulated reply removed as per user request)
  };

  const quickReplies = ["Thank you", "Please hurry!", "I am inside", "Gate is open", "Arrived?"];
  const formatTime = (seconds: number) => `0:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] w-full max-w-[1400px] mx-auto p-4 select-none relative" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      <AnimatePresence mode="wait">
        {flow === "IDLE" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center py-20">
             <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-4 uppercase">Emergency System</h2>
             <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-10">One-tap critical response dispatch</p>
             <motion.button whileHover={{ scale: 1.05 }} onClick={() => setFlow("CHOOSING")} className="w-52 h-52 rounded-full bg-rose-500 border-[12px] border-rose-50 flex flex-col items-center justify-center text-white shadow-2xl transition-all">
                <ShieldAlert size={48} className="mb-2" />
                <span className="text-sm font-black tracking-widest uppercase">SOS Help</span>
             </motion.button>
          </motion.div>
        )}

        {flow === "CHOOSING" && (
          <motion.div key="choosing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto py-10">
             <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tighter uppercase">Incident Type</h2>
             <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 w-full px-4 text-center">
                {emergencyOptions.map((opt) => (
                  <button key={opt.id} onClick={() => { 
                    setEmerType(opt.id); 
                    setFlow("SENDING");
                    try {
                      const logKey = user ? `smart-society-activity-logs-${user.uid}` : "smart-society-activity-logs";
                      const logs = JSON.parse(localStorage.getItem(logKey) || "[]");
                      logs.unshift({
                        id: Date.now(),
                        type: "Emergency Alert",
                        detail: `${opt.label} Emergency Triggered`,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        status: "Critical"
                      });
                      localStorage.setItem(logKey, JSON.stringify(logs));
                    } catch(e) {}
                  }} className="flex flex-col items-center justify-center gap-3 py-6 rounded-[2rem] bg-white border border-gray-100 hover:border-emerald-500 transition-all shadow-sm group">
                     <div className={`w-12 h-12 ${opt.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}><opt.icon size={24} /></div>
                     <h4 className="font-black text-[10px] text-gray-900 uppercase tracking-widest">{opt.label}</h4>
                  </button>
                ))}
             </div>
             <button onClick={handleFullReset} className="mt-8 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-rose-500 transition-all">Cancel Request</button>
          </motion.div>
        )}

        {flow === "SENDING" && (
          <motion.div key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center py-20">
             <div className="relative mb-8 text-rose-500">
                <Loader2 size={64} className="animate-spin" />
                <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-current rounded-full blur-2xl" />
             </div>
             <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase mb-2">Sending Emergency Request...</h2>
             <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Establishing Secure Satellite Link</p>
          </motion.div>
        )}

        {flow === "ACTIVE" && (
          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col gap-4 relative pb-10 h-full">
             <div className="absolute top-1 right-2 z-20">
                <AnimatePresence mode="wait">
                  {guardActive && !isFullyReached && (
                    <motion.div key="timer" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="flex items-center gap-2 px-6 py-2 bg-blue-500 rounded-full text-white shadow-xl border border-blue-400/20">
                       <TimerIcon size={14} className="animate-spin-slow" />
                       <span className="text-[12px] font-black uppercase tracking-widest font-mono">Arriving in {formatTime(countdown)}</span>
                    </motion.div>
                  )}
                  {isFullyReached && (
                    <motion.div key="tick" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 px-6 py-2 bg-emerald-500 rounded-full text-white shadow-xl">
                       <CheckCircle2 size={16} />
                       <span className="text-[12px] font-black uppercase tracking-widest">Arrived</span>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>

             <div className="flex flex-col lg:flex-row gap-4 h-full">
                <div className="flex-[2.2] flex flex-col gap-4">
                   <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-xl flex flex-col justify-center">
                      <div className="flex items-center gap-4 mb-4">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner shrink-0 relative transition-colors duration-500 ${isFullyReached ? "bg-emerald-100 text-emerald-500" : "bg-rose-100 text-rose-500"}`}>
                            {isFullyReached ? <CheckCircle2 size={32} strokeWidth={3} className="animate-in zoom-in" /> : <BellRing size={28} className="animate-bounce" />}
                            {!isFullyReached && <div className="absolute inset-0 bg-rose-500/10 rounded-full animate-ping" />}
                         </div>
                         <div><h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-none">SOS Active</h3><p className="text-rose-500 font-black text-[10px] uppercase tracking-widest mt-1">{emerType}</p></div>
                      </div>
                      <div className={`border rounded-xl p-4 mb-6 flex items-center gap-3 transition-colors duration-500 ${isFullyReached ? "bg-emerald-50 border-emerald-100" : "bg-rose-50/50 border-rose-100"}`}>
                         {isFullyReached ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Wifi size={16} className="text-rose-500 animate-pulse" />}
                         <p className={`text-[10px] font-black uppercase tracking-tight ${isFullyReached ? "text-emerald-600" : "text-rose-600"}`}>{isFullyReached ? "Guard reached to your location" : stepIndex < 2 ? "Request sent to the guard, wait for response" : "Guard is on the way"}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-6 border-t border-gray-50 pt-6">
                         <div><p className="text-[9px] font-black text-black uppercase tracking-widest mb-1.5">Resident</p><p className="text-sm font-black text-gray-800 uppercase leading-none">{user?.displayName || "Muhammad Kamal"}</p></div>
                         <div><p className="text-[9px] font-black text-black uppercase tracking-widest mb-1.5">Location</p><p className="text-sm font-black text-gray-800 uppercase leading-none">Block-C</p></div>
                         <div><p className="text-[9px] font-black text-black uppercase tracking-widest mb-1.5">Apartment</p><p className="text-sm font-black text-gray-800 uppercase leading-none">Apt #402</p></div>
                      </div>
                   </div>
                   <div className="bg-[#0b0e14] rounded-[2.5rem] p-10 border border-white/5 shadow-2xl flex flex-col">
                      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5 shrink-0">
                         <Activity className="text-emerald-500" size={20} />
                         <h3 className="text-xl font-black text-white uppercase tracking-tight">Live Escalation Status</h3>
                      </div>
                      <div className="flex flex-col gap-5 pr-2 overflow-y-auto no-scrollbar">
                         {timelineSteps.map((step, i) => {
                            const isDone = i < stepIndex || (i === 4 && isFullyReached);
                            const isCur = i === stepIndex && !isFullyReached;
                            return (
                               <motion.div key={i} animate={{ opacity: i > stepIndex ? 0.2 : 1 }} className="flex items-center gap-5">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 ${isDone ? "bg-emerald-500 border-emerald-500 text-white" : isCur ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-white/5 border-white/10 text-white/20"}`}>
                                     {isDone ? <CheckCircle2 size={14} strokeWidth={3} /> : isCur ? <Loader2 size={12} className="animate-spin" /> : <div className="w-1.5 h-1.5 bg-current rounded-full" />}
                                  </div>
                                  <span className={`text-[12px] tracking-widest uppercase ${isDone ? "text-emerald-400 font-semibold" : isCur ? "text-white font-black" : "text-white/20"}`}>{step}</span>
                               </motion.div>
                            );
                         })}
                      </div>
                   </div>
                </div>
                <aside className="flex-1 flex flex-col gap-4">
                   <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-xl flex flex-col">
                      <p className="text-[8px] font-black text-black uppercase tracking-[0.2em] mb-6 shrink-0">Assigned Response</p>
                      <AnimatePresence mode="wait">
                        {!guardActive ? (
                          <motion.div key="req" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center text-center py-10">
                             <Loader2 size={24} className="text-gray-900 animate-spin mb-4" /><p className="text-[10px] font-black text-black uppercase tracking-widest animate-pulse">Searching...</p>
                          </motion.div>
                        ) : (
                          <motion.div key="ready" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center">
                             <div className="relative mb-4"><div className="w-20 h-20 bg-gray-50 rounded-full border-[3px] border-white shadow-xl flex items-center justify-center overflow-hidden"><User size={40} className="text-gray-200" /></div><div className={`absolute bottom-1 right-1 w-5 h-5 border-[3px] border-white rounded-full shadow-lg ${isFullyReached ? "bg-blue-500" : "bg-emerald-500"}`} /></div>
                             <h4 className="text-lg font-black text-gray-900 tracking-tighter uppercase mb-1 leading-none">Officer Ahmed Raza</h4><p className="text-[8px] font-bold text-black uppercase tracking-widest mb-6">Head Guard | SS-G902</p>
                             <div className={`w-full rounded-2xl p-4 border transition-all duration-700 flex items-center justify-between mb-6 ${isFullyReached ? "bg-emerald-50 border-emerald-100" : "bg-gray-50 border-gray-100"}`}>
                                <div className="text-left"><p className="text-[8px] font-black text-black uppercase tracking-widest mb-1.5 leading-none">Status</p><div className={`flex items-center gap-2 ${isFullyReached ? "text-emerald-600" : "text-blue-500"}`}><div className={`w-1.5 h-1.5 rounded-full ${isFullyReached ? "bg-emerald-500" : "bg-blue-500 animate-pulse"}`} /><span className="text-lg font-black uppercase tracking-tighter">{isFullyReached ? "Reached" : "Dispatched"}</span></div></div>
                                {isFullyReached ? <CheckCircle2 className="text-emerald-500" size={24} /> : <Navigation className="text-gray-300" size={24} />}
                             </div>
                             <div className="flex flex-col gap-3 w-full mt-auto">
                                <button onClick={() => setIsChatOpen(true)} className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all"><MessageCircle size={18} /><span className="text-[10px] font-black uppercase tracking-widest">Smart Chat</span></button>
                                <button className="w-full py-4 bg-[#00c58e] hover:bg-[#00b07e] text-white rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all"><PhoneCall size={18} className="fill-white" /><span className="text-[10px] font-black uppercase tracking-widest">Call Guard</span></button>
                             </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                   </div>
                   <button onClick={handleFullReset} className="py-4 bg-gray-50 text-gray-500 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:text-rose-500 transition-all mt-auto shadow-sm border border-gray-100/50">Reset Crisis</button>
                </aside>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REFINED FULL-SCREEN CHAT MODAL WITH SCROLL FIX */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 lg:p-8">
             <motion.div initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 200, opacity: 0 }} className="w-full max-w-[1000px] bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[85vh] lg:h-[80vh] border border-blue-100/30">
                
                {/* Compact Header */}
                <div className="bg-blue-600 px-8 py-5 text-white flex items-center justify-between shrink-0">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner"><User size={24} /></div>
                      <div>
                         <h4 className="text-lg font-black uppercase tracking-tighter">Ahmed Raza</h4>
                         <p className="text-[10px] font-bold text-blue-100 uppercase tracking-[0.2em]">Officer • SS-G902</p>
                      </div>
                   </div>
                   <button onClick={() => setIsChatOpen(false)} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"><X size={20} /></button>
                </div>
                
                {/* SCROLLABLE MESSAGES AREA - ISOLATED SCROLL */}
                <div 
                  className="flex-1 px-8 py-8 overflow-y-auto bg-gray-50/50 flex flex-col gap-6 custom-scroll overscroll-contain"
                  onWheel={(e) => e.stopPropagation()} 
                >
                   {messages.map((msg) => (
                     <motion.div key={msg.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`flex ${msg.sender === "guard" ? "justify-start" : "justify-end"}`}>
                        <div className={`p-5 rounded-[2rem] max-w-[75%] shadow-sm ${msg.sender === "guard" ? "bg-white border border-gray-100 rounded-tl-none text-gray-800" : "bg-blue-600 text-white rounded-tr-none"}`}>
                           <p className="text-sm font-semibold leading-relaxed">{msg.text}</p>
                           <span className={`text-[8px] mt-3 block uppercase font-black tracking-widest opacity-60`}>{msg.sender === "guard" ? "Officer Ahmed" : "Kamal (You)"} • {msg.time}</span>
                        </div>
                     </motion.div>
                   ))}
                   <div ref={chatEndRef} />
                </div>

                {/* Compact Footer */}
                <div className="px-8 py-6 bg-white border-t border-gray-100 shrink-0">
                   {/* Compact Quick Replies */}
                   <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar py-1">
                      {quickReplies.map((reply) => (
                        <button key={reply} onClick={() => handleSendMessage(reply)} className="px-5 py-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all whitespace-nowrap active:scale-95 shadow-sm">
                           {reply}
                        </button>
                      ))}
                   </div>
                   <div className="flex items-center gap-3">
                      <input 
                        value={chatInput} 
                        onChange={(e) => setChatInput(e.target.value)} 
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage(chatInput)}
                        type="text" 
                        placeholder="Type urgent status update..." 
                        className="flex-1 bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 shadow-inner" 
                      />
                      <button onClick={() => handleSendMessage(chatInput)} className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg active:scale-90"><Send size={22} /></button>
                   </div>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .animate-spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const emergencyOptions = [
  { id: "SECURITY", label: "Security", icon: ShieldAlert, color: "bg-rose-500" },
  { id: "MEDICAL", label: "Medical", icon: Stethoscope, color: "bg-blue-500" },
  { id: "FIRE", label: "Fire / Smoke", icon: Flame, color: "bg-amber-500" },
  { id: "UTILITY", label: "Utility", icon: Power, color: "bg-emerald-500" },
  { id: "WELLNESS", label: "Wellness", icon: HeartPulse, color: "bg-purple-500" },
  { id: "OTHER", label: "Other Support", icon: AlertTriangle, color: "bg-gray-500" },
];
