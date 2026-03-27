"use client";

import React, { useState } from "react";
import { 
  Users, 
  Search, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Building, 
  ShieldCheck, 
  UserPlus, 
  Filter,
  CheckCircle2,
  ChevronRight,
  User,
  Zap,
  MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const residentStats = [
  { label: "Total Residents", value: "1,240", icon: Users, color: "text-emerald-500 bg-emerald-50" },
  { label: "Verified Heads", value: "320", icon: ShieldCheck, color: "text-blue-500 bg-blue-50" },
  { label: "Occupancy Rate", value: "94%", icon: Zap, color: "text-amber-500 bg-amber-50" },
];

const residents = [
  { id: 1, name: "Ibraheem Ahmed", house: "Tower A - 204", head: "Yes", contact: "+92 300 1234567", category: "Owner", avatar: "IA" },
  { id: 2, name: "Sara Malik", house: "Tower B - 101", head: "Yes", contact: "+92 300 7654321", category: "Tenant", avatar: "SM" },
  { id: 3, name: "Zainab Khan", house: "Tower A - 501", head: "No", contact: "+92 311 0099887", category: "Owner", avatar: "ZK" },
  { id: 4, name: "Mustafa Kamal", house: "Tower C - 302", head: "Yes", contact: "+92 333 4455667", category: "Owner", avatar: "MK" },
  { id: 5, name: "Aisha Rehman", house: "Tower B - 205", head: "No", contact: "+92 345 5566778", category: "Tenant", avatar: "AR" },
];

export default function ResidentDirectory() {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="max-w-xl">
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Users className="text-emerald-600" size={18} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Community Grid</span>
           </div>
           <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Resident Directory</h1>
           <p className="text-gray-500 font-medium">Connect and communicate with your neighbors in a secure, verified environment.</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-3">
           <UserPlus size={18} />
           Update My Profile
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {residentStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6 group hover:shadow-lg transition-all"
          >
            <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
              <stat.icon size={26} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</h3>
              <p className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {/* Toolbar */}
        <div className="p-8 border-b border-gray-50 flex flex-col lg:flex-row justify-between items-center gap-6 bg-white sticky top-0 z-10">
          <div className="flex gap-2 p-1 bg-gray-100/50 rounded-2xl backdrop-blur-sm w-full lg:w-auto overflow-x-auto no-scrollbar">
            {["All", "Owners", "Tenants", "Heads"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab 
                  ? "bg-white text-emerald-600 shadow-sm" 
                  : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
             <div className="relative group w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Search by name, house, or id..." 
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-6 text-sm outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all font-medium"
                />
             </div>
             <button className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gray-50 text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 border border-transparent hover:border-emerald-100">
                <Filter size={16} />
                Sort By
             </button>
          </div>
        </div>

        {/* Directory List */}
        <div className="flex-1 p-4 lg:p-8">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                 {residents.map((res) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={res.id}
                      className="bg-gray-50/50 hover:bg-white rounded-[2.5rem] p-7 border border-transparent hover:border-gray-100 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all group relative overflow-hidden flex flex-col items-center text-center"
                    >
                       <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all">
                          <MoreVertical size={18} className="text-gray-300 cursor-pointer" />
                       </div>

                       <div className="relative mb-6">
                          <div className="w-20 h-20 bg-white border-4 border-white shadow-xl rounded-[2rem] flex items-center justify-center font-black text-2xl text-emerald-600 group-hover:scale-110 transition-transform duration-500">
                             {res.avatar}
                          </div>
                          {res.head === "Yes" && (
                             <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 border-2 border-white rounded-lg flex items-center justify-center text-white shadow-lg">
                                <ShieldCheck size={14} />
                             </div>
                          )}
                       </div>

                       <h3 className="text-lg font-black text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">{res.name}</h3>
                       <div className="flex items-center gap-2 mb-6">
                          <span className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em]">{res.house}</span>
                          <div className="w-1 h-1 bg-gray-200 rounded-full" />
                          <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${res.category === 'Owner' ? 'text-blue-500' : 'text-amber-500'}`}>
                             {res.category}
                          </span>
                       </div>

                       <div className="grid grid-cols-2 gap-3 w-full mt-auto">
                          <button className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                             <Phone size={14} />
                             Call
                          </button>
                          <button className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                             <MessageCircle size={14} />
                             Message
                          </button>
                       </div>
                    </motion.div>
                 ))}
              </AnimatePresence>
           </div>
        </div>
        
        {/* Footer/Pagination */}
        <div className="p-8 border-t border-gray-50 text-center">
           <button className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] hover:text-emerald-500 transition-all flex items-center gap-2 mx-auto">
              Load and show more neighbors
              <ChevronRight size={14} />
           </button>
        </div>
      </div>
    </div>
  );
}
