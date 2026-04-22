"use client";

import React, { useState } from "react";
import { Users, ShieldCheck, Activity, AlertTriangle, ArrowUpRight, Plus, Search, TrendingUp } from "lucide-react";
import AddUserModal from "@/components/admin/user-management/AddUserModal";

const stats = [
  { label: "Total Residents", value: "1,280", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", trend: "+12 this month" },
  { label: "Active Guards", value: "24", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", trend: "All on duty" },
  { label: "Visitors Today", value: "142", icon: Activity, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", trend: "+8 since morning" },
  { label: "Security Alerts", value: "02", icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", trend: "Needs review" },
];

export default function AdminDashboard() {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  return (
    <div className="font-['Inter',sans-serif] space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">Command Overview</h1>
          <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Society Control Panel • Real-time Data</p>
        </div>
        <button 
          onClick={() => setIsAddUserOpen(true)}
          className="w-full md:w-auto flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:scale-105 transition-all active:scale-95"
        >
          <Plus size={16} strokeWidth={3} />
          Provision User
        </button>
      </div>

      {/* Stats Grid — 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, idx) => (
          <div 
            key={stat.label}
            className={`bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border ${stat.border} shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-shadow group cursor-pointer`}
          >
            <div className="flex justify-between items-start mb-4 md:mb-6">
               <div className={`w-11 h-11 md:w-14 md:h-14 ${stat.bg} ${stat.color} rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon size={20} className="md:w-6 md:h-6" />
               </div>
               <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <ArrowUpRight size={14} />
               </div>
            </div>
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 leading-tight">{stat.label}</p>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-none">{stat.value}</h2>
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2 hidden md:block">{stat.trend}</p>
          </div>
        ))}
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Security Feed */}
        <div className="lg:col-span-2">
           <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 p-6 md:p-10 overflow-hidden relative">
              <div className="flex justify-between items-center mb-6 md:mb-8">
                <div>
                  <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tight">Security Infrastructure</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Personnel on Duty • {new Date().toLocaleDateString()}</p>
                </div>
                <button className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                  <Search size={18} />
                </button>
              </div>

              <div className="space-y-3 md:space-y-4">
                 {[
                   { name: "Officer John Doe", post: "Main Gate • Sector A", initial: "J" },
                   { name: "Officer Sarah Smith", post: "Patrol Command • Sector B", initial: "S" },
                   { name: "Guard Mike Ross", post: "Commercial Hub • Entrance 2", initial: "M" }
                 ].map((guard, i) => (
                   <div key={i} className="flex items-center justify-between p-4 md:p-6 bg-slate-50/50 rounded-[1.5rem] md:rounded-[2rem] border border-white hover:border-slate-200 transition-all hover:bg-white group">
                      <div className="flex items-center gap-3 md:gap-5">
                         <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full border border-slate-200 flex items-center justify-center font-black text-emerald-600 shadow-sm group-hover:border-emerald-200 transition-colors text-sm">
                           {guard.initial}
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-900">{guard.name}</p>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{guard.post}</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 hidden md:block">Active Duty</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Sidebar Cards */}
        <div className="space-y-6">
           <div className="bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md mb-5">
                  <AlertTriangle className="text-amber-400 w-5 h-5" />
                </div>
                <h3 className="text-lg md:text-xl font-black tracking-tight mb-2 uppercase">Pending Tasks</h3>
                <p className="text-slate-400 text-xs md:text-sm font-medium mb-6 leading-relaxed">System has flagged 12 resident complaints and 3 visitor overstays that require validation.</p>
                <button className="w-full py-4 bg-white hover:bg-emerald-500 hover:text-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95">Review All Logs</button>
              </div>
              <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />
           </div>

           <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 p-6 md:p-10 shadow-sm">
              <h3 className="text-[11px] font-black text-slate-400 tracking-[0.2em] uppercase mb-6">System Terminal</h3>
              <div className="grid grid-cols-2 gap-3">
                 {['Broadcast', 'Log Audit', 'Backup', 'Finance'].map(action => (
                   <button key={action} className="p-4 md:p-6 bg-slate-50 rounded-2xl md:rounded-3xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white transition-all border border-transparent hover:border-slate-800 shadow-sm active:scale-95">
                      {action}
                   </button>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Modals */}
      <AddUserModal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} role="resident" />
    </div>
  );
}

