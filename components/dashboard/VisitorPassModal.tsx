"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  User, 
  Car, 
  ClipboardList, 
  Clock, 
  QrCode as QrIcon, 
  CheckCircle2, 
  MessageCircle, 
  Download,
  ShieldCheck,
  Zap,
  Loader2
} from "lucide-react";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useAuth } from "@/context/AuthContext";

interface VisitorPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (visitor: { id: string | number; name: string; type: string; vehicle: string; timeIn: string; status: string; entryTimestamp: number; durationMinutes: number }) => void;
}

type ModalStep = "form" | "loading" | "success";

export default function VisitorPassModal({ isOpen, onClose, onSuccess }: VisitorPassModalProps) {
  const [step, setStep] = useState<ModalStep>("form");
  const [isDownloading, setIsDownloading] = useState(false);
  const [generatedExpiry, setGeneratedExpiry] = useState("");
  const passRef = React.useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    vehicle: "",
    purpose: "Casual",
    duration: "3 Hours"
  });
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      // Reset form on open
      setFormData({
        name: "",
        vehicle: "",
        purpose: "Casual",
        duration: "3 Hours"
      });
      setStep("form");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in.");

    setStep("loading");
    const expiry = getExpiryTime();
    setGeneratedExpiry(expiry);
    
    // UI Mock Logic
    setTimeout(() => {
      const now = new Date();
      const durationHours = formData.duration === "Overnight" ? 18 : parseInt(formData.duration);

      if (onSuccess) {
        onSuccess({
          id: Math.random().toString(36).substr(2, 9),
          name: formData.name,
          type: formData.purpose,
          vehicle: formData.vehicle || "None",
          timeIn: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: "Active",
          entryTimestamp: now.getTime(),
          durationMinutes: durationHours * 60
        });
      }
      setStep("success");
    }, 1500);
  };

  const getExpiryTime = () => {
    const now = new Date();
    const hoursToAdd = formData.duration === "Overnight" ? 18 : parseInt(formData.duration);
    now.setHours(now.getHours() + hoursToAdd);
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const qrValue = JSON.stringify({
    ...formData,
    expires: generatedExpiry,
    passId: "SS-" + Math.random().toString(36).substr(2, 9).toUpperCase()
  });

  const handleWhatsApp = () => {
    const message = `*Visitor Pass - Smart Society*%0A%0A*Guest:* ${formData.name}%0A*Vehicle:* ${formData.vehicle || 'N/A'}%0A*Purpose:* ${formData.purpose}%0A*Valid Till:* ${generatedExpiry}%0A%0A_Please show this pass at the main gate for verification._`;
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleDownload = async () => {
    if (!passRef.current) return;
    setIsDownloading(true);

    try {
      // 1. Persist to "Database" (Console simulation for records)
      console.log("📝 Persisting Visitor Record:", {
        guestName: formData.name,
        vehicle: formData.vehicle || "N/A",
        purpose: formData.purpose,
        expiry: generatedExpiry,
        timestamp: new Date().toISOString()
      });

      // 2. Capture the Emerald Card
      const cardElement = passRef.current;
      const canvas = await html2canvas(cardElement, {
        scale: 4, // Ultra-high resolution
        useCORS: true,
        logging: false,
        backgroundColor: "#064e3b", // Match emerald-950
      });

      const imgData = canvas.toDataURL("image/png");
      
      // 3. Create PDF with custom dimensions matching the card
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "l" : "p",
        unit: "px",
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      
      // 4. Secure Filename
      const safeName = formData.name.trim().replace(/\s+/g, "_") || "Guest";
      pdf.save(`VisitorPass_${safeName}.pdf`);

    } catch (err: any) {
      console.error("❌ PDF preparation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-emerald-950/20 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-emerald-100 max-h-[98vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-5 pb-0 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <QrIcon className="text-white w-4 h-4" />
                </div>
                <h2 className="text-lg font-black text-gray-900 leading-tight">Visitor Pass</h2>
              </div>
              <button 
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 pt-4 overflow-y-auto custom-scrollbar" data-lenis-prevent>
              <AnimatePresence mode="wait">
                {step === "form" && (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleSubmit}
                    className="space-y-3"
                  >
                    {/* Guest Name */}
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Guest Name</label>
                       <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                          <input 
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            type="text" 
                            placeholder="John Doe"
                            className="w-full bg-gray-50 border border-emerald-100 rounded-xl py-3 pl-11 pr-5 text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all outline-none"
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Vehicle Number */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Vehicle (Opt)</label>
                        <div className="relative group">
                            <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                            <input 
                              value={formData.vehicle}
                              onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                              type="text" 
                              placeholder="ABC-123"
                              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-11 pr-5 text-xs font-semibold focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all outline-none"
                            />
                        </div>
                      </div>
                      {/* Purpose */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Purpose</label>
                        <div className="relative group">
                            <ClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                            <select 
                              value={formData.purpose}
                              onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-11 pr-5 text-xs font-semibold appearance-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all outline-none"
                            >
                               <option>Casual</option>
                               <option>Delivery</option>
                               <option>Maintenance</option>
                               <option>Event</option>
                            </select>
                        </div>
                      </div>
                    </div>

                    {/* Stay Duration */}
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Stay Duration</label>
                       <div className="grid grid-cols-2 gap-2">
                          {["1 Hour", "3 Hours", "6 Hours", "Overnight"].map((dur) => (
                             <button
                               key={dur}
                               type="button"
                               onClick={() => setFormData({...formData, duration: dur})}
                               className={cn(
                                 "py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2",
                                 formData.duration === dur 
                                   ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20" 
                                   : "bg-gray-50 text-gray-500 border-gray-100 hover:border-emerald-200"
                               )}
                             >
                               <Clock size={12} />
                               {dur}
                             </button>
                          ))}
                       </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3 mt-2"
                    >
                       <Zap size={16} />
                       Generate Pass
                    </button>
                  </motion.form>
                )}

                {step === "loading" && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="py-12 flex flex-col items-center justify-center"
                  >
                    <div className="relative w-16 h-16 mb-4">
                       <motion.div 
                         animate={{ rotate: 360 }}
                         transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                         className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full"
                       />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <Zap className="text-emerald-500 animate-pulse" size={20} />
                       </div>
                    </div>
                    <p className="text-gray-950 font-black text-lg tracking-tight">Securing Pass</p>
                    <p className="text-gray-400 text-xs mt-1 font-medium">Encrypting entry code...</p>
                  </motion.div>
                )}

                {step === "success" && (
                   <motion.div
                     key="success"
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="flex flex-col items-center"
                   >
                     {/* Digital Pass Card */}
                     <div 
                       ref={passRef}
                       className="w-full bg-emerald-950 rounded-[1.5rem] p-5 text-white relative overflow-hidden shadow-2xl"
                     >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-3xl" />
                        
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                           <div className="flex items-center gap-2">
                              <ShieldCheck className="text-emerald-400" size={18} />
                              <span className="font-black text-[10px] uppercase tracking-widest">Verified Pass</span>
                           </div>
                           <span className="text-[8px] font-black opacity-30 uppercase tracking-tighter">SmartSocietyOS</span>
                        </div>

                        <div className="flex flex-col items-center bg-white p-3 rounded-[1.2rem] mb-4 qr-container">
                           <div className="p-1 border-2 border-emerald-500/5 rounded-xl bg-white flex items-center justify-center w-full max-w-[140px] aspect-square">
                             <QRCode value={qrValue} size={130} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                           </div>
                           <span className="text-[8px] font-black text-gray-400 capitalize tracking-[0.3em] mt-2">Scan at Main Gate</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-1">
                           <div>
                              <p className="text-[8px] font-black uppercase text-emerald-400 tracking-widest mb-0.5">Guest</p>
                              <p className="font-black truncate text-xs">{formData.name}</p>
                           </div>
                           <div>
                              <p className="text-[8px] font-black uppercase text-emerald-400 tracking-widest mb-0.5">Expires</p>
                              <p className="font-black text-xs">{generatedExpiry}</p>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-3 w-full mt-5">
                        <button 
                          onClick={handleWhatsApp}
                          className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                        >
                           <MessageCircle size={14} />
                           WhatsApp
                        </button>
                        <button 
                          onClick={handleDownload}
                          disabled={isDownloading}
                          className="flex-1 border border-gray-100 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                           {isDownloading ? (
                             <>
                               <Loader2 size={14} className="animate-spin" />
                               Generating...
                             </>
                           ) : (
                             <>
                               <Download size={14} />
                               Download
                             </>
                           )}
                        </button>
                     </div>

                     <p className="mt-5 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 pb-2">
                        <CheckCircle2 size={10} className="text-emerald-500" />
                        Pass Active
                     </p>
                   </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
