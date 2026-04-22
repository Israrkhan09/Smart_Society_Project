"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Mail, Phone, Home, Clock, Shield, Loader2, CheckCircle2 } from "lucide-react";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'resident' | 'guard';
}

export default function AddUserModal({ isOpen, onClose, role }: AddUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    unit: "",
    shift: "Morning",
    password: "",
    autoPassword: true
  });

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!";
    return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const finalPassword = formData.autoPassword ? generatePassword() : formData.password;

    if (!finalPassword || finalPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/provision-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          unit: formData.unit,
          shift: formData.shift,
          role: role,
          password: finalPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Provisioning failed");
      }

      setLoading(false);
      setSuccess(true);

      // Notify the resident list to refresh
      setTimeout(() => {
        setSuccess(false);
        onClose();
        window.dispatchEvent(new CustomEvent("resident-added"));
        // Reset form
        setFormData({ fullName: "", email: "", phone: "", unit: "", shift: "Morning", password: "", autoPassword: true });
      }, 500);

    } catch (err: any) {
      console.error("Provisioning Error:", err);
      setLoading(false);
      alert("Failed to provision: " + err.message);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            data-lenis-prevent
            style={{ overscrollBehavior: 'contain' }}
            className="w-full max-w-[560px] bg-white rounded-[2rem] shadow-2xl shadow-slate-900/30 relative overflow-y-auto max-h-[90vh] custom-modal-scroll"
          >
            {/* Header */}
            <div className="px-6 pt-5 pb-4 flex justify-between items-center border-b border-slate-50">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                     <UserPlus size={16} />
                  </div>
                  <div>
                     <h2 className="text-lg font-black text-slate-900 tracking-tight capitalize leading-none">Provision {role}</h2>
                     <p className="text-[10px] font-bold text-slate-400 mt-0.5">Initialize a new secure account.</p>
                  </div>
               </div>
               <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all">
                  <X size={18} />
               </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
               <div className="grid grid-cols-2 gap-3">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Identity Name</label>
                    <div className="relative">
                       <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                       <input 
                         required
                         type="text" 
                         placeholder="Akhbar Zada"
                         className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-100 focus:bg-white transition-all"
                         value={formData.fullName}
                         onChange={e => setFormData({...formData, fullName: e.target.value})}
                       />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Network Email</label>
                    <div className="relative">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                       <input 
                         required
                         type="email" 
                         placeholder="user@smart-society.com"
                         className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-100 focus:bg-white transition-all"
                         value={formData.email}
                         onChange={e => setFormData({...formData, email: e.target.value})}
                       />
                    </div>
                  </div>

                  {/* Role Specifics */}
                  {role === 'resident' ? (
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Assigned Unit</label>
                      <div className="relative">
                         <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                         <input 
                           required={role === 'resident'}
                           type="text" 
                           placeholder="Villa 402-B"
                           className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-100 focus:bg-white transition-all"
                           value={formData.unit}
                           onChange={e => setFormData({...formData, unit: e.target.value})}
                         />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Deployment Shift</label>
                      <div className="relative">
                         <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                         <select 
                           className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-100 focus:bg-white transition-all appearance-none"
                           value={formData.shift}
                           onChange={e => setFormData({...formData, shift: e.target.value})}
                         >
                            <option>Morning (08:00 - 16:00)</option>
                            <option>Evening (16:00 - 00:00)</option>
                            <option>Night (00:00 - 08:00)</option>
                         </select>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Terminal</label>
                    <div className="relative">
                       <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                       <input 
                         type="tel" 
                         placeholder="+92 300 0000000"
                         className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-100 focus:bg-white transition-all"
                         value={formData.phone}
                         onChange={e => setFormData({...formData, phone: e.target.value})}
                       />
                    </div>
                  </div>
               </div>

               {/* Access Security */}
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">Encryption Credentials</p>
                     <Shield className="text-emerald-500 w-4 h-4" />
                  </div>
                  
                  <div className="flex items-center gap-3">
                     <button 
                       type="button"
                       onClick={() => setFormData({...formData, autoPassword: true})}
                       className={`flex-1 py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.autoPassword ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-slate-400 border-slate-200'}`}
                     >
                        Auto-Generate
                     </button>
                     <button 
                       type="button"
                       onClick={() => setFormData({...formData, autoPassword: false})}
                       className={`flex-1 py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${!formData.autoPassword ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-400 border-slate-200'}`}
                     >
                        Set Manually
                     </button>
                  </div>

                  {!formData.autoPassword && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="pt-1"
                    >
                       <input 
                         type="password" 
                         placeholder="Enter Master Password..."
                         className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold text-slate-900 outline-none focus:border-slate-400 transition-all"
                         onChange={e => setFormData({...formData, password: e.target.value})}
                       />
                    </motion.div>
                  )}
               </div>

               {/* Submit */}
               <div className="pb-2">
                  <button 
                    disabled={loading || success}
                    className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
                  >
                     {loading ? (
                       <Loader2 className="w-5 h-5 animate-spin" />
                     ) : success ? (
                       <><CheckCircle2 className="w-5 h-5" /> Account Initialized</>
                     ) : (
                       <>Initialize Secure Account</>
                     )}
                  </button>
                  <p className="text-center text-[9px] font-black uppercase tracking-widest text-slate-300 mt-3 leading-relaxed">
                     Credentials dispatched to <span className="text-emerald-600 underline">Assigned Node Email</span>.
                  </p>
               </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
