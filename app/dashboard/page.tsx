"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Activity, 
  ArrowUpRight, 
  ChevronRight,
  ShieldAlert,
  Car,
  Zap,
  Tag,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

const defaultLogs = [
  { id: 1, type: "System Event", detail: "Security Systems Online and Operational", time: "08:00 AM", status: "Verified" }
];

export default function DashboardHome() {
  const { user, userData } = useAuth();
  const displayName = user?.displayName || userData?.name || "Resident";
  
  const [activeVisitors, setActiveVisitors] = useState(0);
  const [recentLogs, setRecentLogs] = useState<any[]>(defaultLogs);


  useEffect(() => {
    if (!user) return;
    
    // Polling hook or simple initialization on dashboard mount
    const fetchLogs = () => {
       try {
         const suffix = user.uid;
         // Visitors Active Count
         const savedVisitors = localStorage.getItem(`smart-society-visitors-${suffix}`);
         setActiveVisitors(savedVisitors ? JSON.parse(savedVisitors).filter((v: any) => v.status === "Active").length : 0);
         
         // Generic Global Activity Logs
         const savedLogs = localStorage.getItem(`smart-society-activity-logs-${suffix}`);
         if (savedLogs) {
           const parsedLogs = JSON.parse(savedLogs);
           setRecentLogs(parsedLogs.slice(0, 100));
         } else {
           setRecentLogs(defaultLogs);
         }
       } catch(e) {
         console.error(e);
       }
    };
    fetchLogs();
    
    // Listen for storage changes if in another tab, or just interval
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="flex flex-col gap-10 h-full min-h-[calc(100vh-140px)]" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Welcome Banner - High Fidelity Style */}
      <div className="relative rounded-[3rem] overflow-hidden bg-emerald-950 p-10 lg:p-14 text-white shadow-2xl shadow-emerald-950/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] -mr-20 -mt-20" />
        <div className="relative z-10 max-w-2xl">
           <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/20 rounded-xl backdrop-blur-md border border-white/10">
                <ShieldCheck className="text-emerald-400" size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Identity Verified</span>
           </div>
           <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">Good Morning, {displayName.split(' ')[0]}</h1>
           <p className="text-emerald-50/60 font-medium text-lg leading-relaxed mb-2">
              Welcome back to your Neighborhood OS. Your residency status is active and all security systems are operational.
           </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Active Visitors", value: activeVisitors.toString().padStart(2, '0'), sub: "Currently Inside", icon: Users, color: "text-emerald-500 bg-emerald-50" },
          { label: "My Vehicles", value: "02", sub: "Registered Units", icon: Car, color: "text-blue-500 bg-blue-50" },
          { label: "Security Status", value: "100%", sub: "Sector Isolated", icon: ShieldCheck, color: "text-emerald-500 bg-emerald-50" },
        ].map((stat, i) => (
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
              <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="w-full flex-1 flex flex-col min-h-0">
        
        {/* Recent Activity Table */}
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col" style={{ height: '700px' }}>
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
            <div>
                <h3 className="font-black text-gray-900">Recent Activity Log</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Real-time Verification Flow</p>
            </div>
          </div>
          
          <div 
            className="flex-1 overflow-y-auto p-4 lg:p-8" 
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1fae5 #f9fafb' }}
          >
             <table className="w-full text-left border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-gray-400 font-black text-[10px] uppercase tracking-widest">
                    <th className="px-6 py-4">Action Type</th>
                    <th className="px-6 py-4">Operation Detail</th>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((log) => (
                    <tr key={log.id} className="group hover:bg-emerald-50 transition-colors">
                      <td className="bg-gray-50/50 group-hover:bg-emerald-50 rounded-l-[1.5rem] py-5 px-6">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center font-black text-sm text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                               {log.type.charAt(0)}
                            </div>
                            <span className="text-sm font-black text-gray-900">{log.type}</span>
                         </div>
                      </td>
                      <td className="bg-gray-50/50 group-hover:bg-emerald-50 py-5 px-6">
                         <span className="text-xs font-bold text-gray-500 line-clamp-1">{log.detail}</span>
                      </td>
                      <td className="bg-gray-50/50 group-hover:bg-emerald-50 py-5 px-6">
                         <span className="text-[10px] font-black text-gray-400 uppercase">{log.time}</span>
                      </td>
                      <td className="bg-gray-50/50 group-hover:bg-emerald-50 rounded-r-[1.5rem] py-5 px-6">
                         <div className={`px-4 py-1.5 inline-flex rounded-lg text-[9px] font-black uppercase tracking-widest ${
                           log.status === "Active" ? "bg-emerald-100 text-emerald-600" :
                           log.status === "Used" ? "bg-gray-200 text-gray-600" :
                           "bg-blue-100 text-blue-600"
                         }`}>
                            {log.status}
                         </div>
                      </td>
                    </tr>
                  ))}
                  {recentLogs.length === 0 && (
                     <tr>
                        <td colSpan={4} className="text-center py-10">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No activities detected</p>
                        </td>
                     </tr>
                  )}
                </tbody>
             </table>
          </div>
        </div>

      </div>
    </div>
  );
}
