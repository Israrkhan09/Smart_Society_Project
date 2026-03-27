"use client";

import React, { useState } from "react";
import { 
  Megaphone, 
  Search, 
  Filter, 
  Bell, 
  Clock, 
  Calendar, 
  AlertCircle, 
  FileText, 
  Pin,
  ChevronRight,
  User,
  ShieldAlert,
  Zap,
  Tag
} from "lucide-react";
import { motion } from "framer-motion";

const noticeStats = [
  { label: "Active Notices", value: "12", icon: Megaphone, color: "text-emerald-500 bg-emerald-50" },
  { label: "Urgent Alerts", value: "02", icon: ShieldAlert, color: "text-rose-500 bg-rose-50" },
  { label: "Upcoming Events", value: "05", icon: Calendar, color: "text-blue-500 bg-blue-50" },
];

const notices = [
  {
    id: 1,
    title: "Annual Society Meeting - 2026",
    content: "The annual general meeting of the Smart Society will be held next Sunday at the central community hall to discuss maintenance budgets and security upgrades.",
    type: "Official",
    category: "Important",
    date: "June 20, 2026",
    postedBy: "Society Manager",
    isPinned: true,
  },
  {
    id: 2,
    title: "Lift Maintenance Tower B",
    content: "Tower B elevators will be undergoing scheduled annual maintenance specifically on the safety brakes and motor systems. Expect delays between 10 AM to 4 PM.",
    type: "Maintenance",
    category: "Warning",
    date: "June 18, 2026",
    postedBy: "Eng. Team",
    isPinned: false,
  },
  {
    id: 3,
    title: "Summer BBQ Festival ☀️",
    content: "Get ready for the biggest event of the season! Join us at the central lawn for music, drinks, and BBQ. Tickets are available at the front desk.",
    type: "Event",
    category: "Social",
    date: "June 25, 2026",
    postedBy: "Cultural Club",
    isPinned: false,
  },
  {
    id: 4,
    title: "New Security Scanning Protocol",
    content: "Starting next month, all residents are requested to register their biometric data at the office for the new automated gate system.",
    type: "Official",
    category: "Announcement",
    date: "June 15, 2026",
    postedBy: "Security Dept",
    isPinned: false,
  },
  {
    id: 5,
    title: "Water Tank Cleaning Schedule",
    content: "Quarterly water tank cleaning for all towers will commence this weekend. Temporary water shutdown for 2 hours per tower.",
    type: "Maintenance",
    category: "Service",
    date: "June 22, 2026",
    postedBy: "Operations",
    isPinned: false,
  }
];

export default function NoticeBoard() {
  const [filter, setFilter] = useState("All");

  const categoryColors: Record<string, string> = {
    Important: "bg-emerald-500 text-white shadow-emerald-500/10",
    Warning: "bg-rose-500 text-white shadow-rose-500/10",
    Social: "bg-amber-500 text-white shadow-amber-500/10",
    Announcement: "bg-blue-500 text-white shadow-blue-500/10",
    Service: "bg-indigo-500 text-white shadow-indigo-500/10",
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="max-w-xl">
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Megaphone className="text-emerald-600" size={18} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Communication Center</span>
           </div>
           <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Notice Board</h1>
           <p className="text-gray-500 font-medium">Keep track of official announcements, maintenance updates, and community events.</p>
        </div>
        <button className="bg-white border border-gray-100 hover:border-emerald-500 hover:text-emerald-600 px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-sm transition-all flex items-center gap-2">
           <Zap size={16} />
           View Archive
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {noticeStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6 group hover:shadow-lg transition-all"
          >
            <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
              <stat.icon size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-0.5">{stat.label}</h3>
              <p className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters & Content Area */}
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
           <div className="flex gap-2 p-1 bg-gray-100/50 rounded-2xl backdrop-blur-sm">
              {["All", "Official", "Maintenance", "Event"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === f 
                    ? "bg-white text-emerald-600 shadow-sm" 
                    : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {f}
                </button>
              ))}
           </div>
           
           <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search notices..." 
                className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-6 text-sm outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all font-medium"
              />
           </div>
        </div>

        {/* Notices Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {notices.filter(n => filter === "All" || n.type === filter).map((notice, i) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={notice.id}
              className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all group relative overflow-hidden flex flex-col h-full"
            >
              {notice.isPinned && (
                <div className="absolute top-6 right-8 text-emerald-500">
                  <Pin size={18} className="fill-current" />
                </div>
              )}
              
              <div className="mb-6 flex gap-3 flex-wrap">
                 <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${categoryColors[notice.category]}`}>
                   {notice.category}
                 </span>
                 <span className="bg-gray-50 border border-gray-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400">
                    #{notice.type}
                 </span>
              </div>

              <h3 className="text-xl font-black text-gray-900 mb-4 group-hover:text-emerald-600 transition-colors leading-tight">
                {notice.title}
              </h3>
              
              <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-1">
                {notice.content}
              </p>

              <div className="pt-6 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                       <User size={16} />
                    </div>
                    <div>
                       <p className="text-xs font-black text-gray-900">{notice.postedBy}</p>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Verified Poster</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-2 text-gray-400">
                       <Clock size={14} />
                       <span className="text-[10px] font-black uppercase tracking-widest">{notice.date}</span>
                    </div>
                    <button className="p-2 bg-emerald-50 text-emerald-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-emerald-500 hover:text-white">
                       <ChevronRight size={20} />
                    </button>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
