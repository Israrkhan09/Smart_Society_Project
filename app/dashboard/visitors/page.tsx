"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Users, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  UserPlus, 
  Search, 
  Filter,
  ChevronRight,
  MoreVertical,
  QrCode,
  Tag,
  Zap,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import VisitorPassModal from "@/components/dashboard/VisitorPassModal";
import { useAuth } from "@/context/AuthContext";

import { supabase } from "@/lib/supabase";

export default function VisitorsPage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [visitors, setVisitors] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load from Supabase on mount
  const fetchVisitors = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .eq('resident_id', user.uid)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setVisitors(data.map(v => ({
          id: v.id,
          name: v.name,
          type: v.purpose,
          vehicle: v.vehicle_number,
          timeIn: v.time_in,
          status: v.status,
          avatar: v.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
        })));
      }
    } catch (err) {
      console.error("Failed to fetch visitors:", err);
      // Fallback to local storage
      const saved = localStorage.getItem(`smart-society-visitors-${user.uid}`);
      if (saved) setVisitors(JSON.parse(saved));
    } finally {
      setLoading(false);
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [user]);

  // Save to LocalStorage on change (Mirror)
  useEffect(() => {
    if (isLoaded && user) {
      localStorage.setItem(`smart-society-visitors-${user.uid}`, JSON.stringify(visitors));
    }
  }, [visitors, isLoaded, user]);

  const logActivity = (type: string, detail: string, status: string) => {
    if (!user) return;
    try {
      const key = `smart-society-activity-logs-${user.uid}`;
      const logs = JSON.parse(localStorage.getItem(key) || "[]");
      logs.unshift({
        id: Date.now(),
        type,
        detail,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status
      });
      localStorage.setItem(key, JSON.stringify(logs));
    } catch(e) {}
  };

  const handleAddVisitor = (newVisitor: any) => {
    const visitorObj = {
      id: newVisitor.id,
      name: newVisitor.name,
      type: newVisitor.type,
      vehicle: newVisitor.vehicle,
      timeIn: newVisitor.timeIn,
      status: "Active",
      avatar: newVisitor.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
    };
    setVisitors(prev => [visitorObj, ...prev]);
    logActivity("Visitor Pass", `${newVisitor.type} QR Pass issued for ${newVisitor.name}.`, "Active");
  };

  const handleExitVisitor = async (id: any) => {
    try {
      const { error } = await supabase
        .from('visitors')
        .update({ status: 'Used' })
        .eq('id', id);

      if (error) throw error;

      const visitor = visitors.find(v => v.id === id);
      if (visitor) {
        logActivity("Visitor Exit", `${visitor.type} ${visitor.name} marked as safely exited.`, "Used");
      }
      setVisitors(prev => prev.map(v => v.id === id ? { ...v, status: "Used" } : v));
    } catch (err) {
      console.error("Exit error:", err);
      alert("Failed to mark exit. Please try again.");
    }
  };

  const activePasses = visitors.filter(v => v.status === "Active").length;
  const overtimeAlerts = 0; // Simulated for now

  return (
    <div className="flex flex-col gap-10" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header Banner */}
      <div className="relative rounded-[3rem] overflow-hidden bg-emerald-950 p-10 lg:p-14 text-white shadow-2xl shadow-emerald-950/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] -mr-20 -mt-20" />
        <div className="relative z-10 max-w-2xl">
           <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/20 rounded-xl backdrop-blur-md border border-white/10">
                <Users className="text-emerald-400" size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Security & Access Control</span>
           </div>
           <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">Visitor Management</h1>
           <p className="text-emerald-50/60 font-medium text-lg leading-relaxed mb-8">
              Seamlessly monitor guest entries, generate digital QR passes, and maintain high-fidelity access logs.
           </p>
           <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-3"
              >
                 <Plus size={18} />
                 Issue New QR Pass
              </button>
           </div>
        </div>
      </div>

      {/* Stats Quick View - REDUCED TO 2 CARDS AS REQUESTED */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: "Active Passes", value: activePasses.toString().padStart(2, '0'), sub: "Currently Inside", icon: ShieldCheck, color: "text-emerald-500 bg-emerald-50" },
          { label: "OverTime Alerts", value: overtimeAlerts.toString().padStart(2, '0'), sub: "Security Risks", icon: AlertTriangle, color: "text-rose-500 bg-rose-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6 group hover:shadow-lg transition-all">
            <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
              <stat.icon size={26} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</h3>
              <p className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col w-full">
        {/* Toolbar */}
        <div className="p-8 border-b border-gray-50 flex flex-col lg:flex-row justify-between items-center gap-6 bg-white sticky top-0 z-10">
          <div className="flex gap-2 p-1 bg-gray-100/50 rounded-2xl backdrop-blur-sm w-full lg:w-auto overflow-x-auto no-scrollbar">
            {["All", "Active", "Used"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === tab 
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, plate, or id..." 
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-6 text-sm outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all font-medium"
                />
             </div>
          </div>
        </div>

        {/* Visitor Table/Registry */}
        <div 
          className="flex-1 overflow-y-auto p-4 lg:p-8" 
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1fae5 #f9fafb', overflowY: 'auto', maxHeight: '700px' }}
        >
           <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-gray-400 font-black text-[10px] uppercase tracking-widest">
                  <th className="px-6 py-4">Visitor Profile</th>
                  <th className="px-6 py-4">Entry Details</th>
                  <th className="px-6 py-4">Vehicle Reg</th>
                  <th className="px-6 py-4">Access Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="overflow-visible">
                <AnimatePresence mode="popLayout">
                {visitors
                  .filter(v => filter === "All" || v.status === filter)
                  .filter(v => 
                    searchQuery === "" || 
                    v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    (v.vehicle && v.vehicle.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    v.type.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((v) => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.1 }}
                      key={v.id} 
                      className="group hover:bg-emerald-50 transition-colors cursor-pointer"
                    >
                      <td className="bg-gray-50/50 group-hover:bg-emerald-50 rounded-l-[1.5rem] py-5 px-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl border border-gray-100 flex items-center justify-center font-black text-emerald-600 group-hover:scale-110 transition-transform shadow-sm">
                              {v.avatar}
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900 leading-tight">{v.name}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Verified Resident Guest</p>
                            </div>
                        </div>
                      </td>
                      <td className="bg-gray-50/50 group-hover:bg-emerald-50 py-5 px-6">
                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase text-white ${
                              v.type === 'Guest' ? 'bg-blue-500' : 
                              v.type === 'Delivery' ? 'bg-amber-500' : 'bg-purple-500'
                            }`}>
                              {v.type}
                            </span>
                            <div className="w-1 h-1 bg-gray-200 rounded-full" />
                            <span className="text-[10px] font-bold text-gray-400">{v.timeIn}</span>
                        </div>
                      </td>
                      <td className="bg-gray-50/50 group-hover:bg-emerald-50 py-5 px-6">
                        <span className="text-xs font-black text-gray-900 font-mono">{v.vehicle}</span>
                      </td>
                      <td className="bg-gray-50/50 group-hover:bg-emerald-50 py-5 px-6">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${v.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${v.status === 'Active' ? 'text-emerald-500' : 'text-gray-400'}`}>
                              {v.status}
                            </span>
                        </div>
                      </td>
                      <td className="bg-gray-50/50 group-hover:bg-emerald-50 rounded-r-[1.5rem] py-5 px-6 text-right">
                        {v.status === 'Active' ? (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleExitVisitor(v.id); }}
                            className="bg-rose-100/50 hover:bg-rose-100 text-rose-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors shadow-sm"
                          >
                            EXIT
                          </button>
                        ) : (
                          <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest px-4">USED</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
           </table>
        </div>

      </div>

      {/* Visitor Modal */}
      <VisitorPassModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleAddVisitor} 
      />
    </div>
  );
}
