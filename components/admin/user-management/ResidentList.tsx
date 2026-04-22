"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, Edit2, Trash2, Power, Home, Mail, Phone, Calendar, Loader2, User, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Resident {
  id: string;
  name: string;
  unit: string;
  email: string;
  phone: string;
  status: 'active' | 'deactivated';
  joined_date: string;
}

export default function ResidentList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('residents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResidents(data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
    window.addEventListener('resident-added', fetchResidents);
    return () => window.removeEventListener('resident-added', fetchResidents);
  }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'deactivated' : 'active';
    try {
      await supabase.from('residents').update({ status: newStatus }).eq('id', id);
      setResidents(prev => prev.map(r => r.id === id ? { ...r, status: newStatus as any } : r));
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = residents.filter(r => 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.unit?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden font-['Inter',sans-serif] transition-all">
      {/* Search & Filter Bar */}
      <div className="p-6 md:p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="relative w-full max-w-md">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input 
              type="text" 
              placeholder="Search databases..." 
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 pl-16 pr-6 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-100 focus:bg-white transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-slate-50 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-transparent hover:border-slate-200 transition-all">
               <Filter size={14} /> Filter
            </button>
            <button onClick={fetchResidents} className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all active:scale-95">
               {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Refresh"}
            </button>
         </div>
      </div>

      {/* Dynamic Content Engine */}
      <div className="">
         {loading && residents.length === 0 ? (
           <div className="p-6 space-y-3">
             {[...Array(4)].map((_, i) => (
               <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
             ))}
           </div>
         ) : filtered.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <User size={32} className="text-slate-200" />
              </div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">No Registered Identities Found</p>
            </div>
         ) : (
          <>
            {/* 1. MOBILE CARD VIEW (Visible on < 768px) */}
            <div className="flex flex-col gap-4 p-0 md:hidden">
               {filtered.map((resident) => (
                  <div 
                    key={resident.id}
                    className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow active:scale-[0.99]"
                  >
                     <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center font-black text-white shadow-lg shadow-emerald-500/20 text-lg shrink-0">
                              {resident.name?.charAt(0) || "U"}
                           </div>
                           <div className="min-w-0">
                              <p className="text-[16px] font-black text-slate-900 tracking-tight truncate">{resident.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                 <Home size={10} className="text-emerald-500" />
                                 <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest truncate">{resident.unit || "Unauthorized Unit"}</span>
                              </div>
                           </div>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shrink-0 ${
                           resident.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                           {resident.status}
                        </div>
                     </div>

                     <div className="space-y-4 pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-4">
                           <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                              <Mail size={14} className="text-slate-400" />
                           </div>
                           <span className="text-[11px] font-bold text-slate-500 truncate">{resident.email}</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                              <Phone size={14} className="text-slate-400" />
                           </div>
                           <span className="text-[11px] font-bold text-slate-500">{resident.phone || "No Mobile"}</span>
                        </div>
                     </div>

                     <div className="flex gap-3 pt-4">
                        <button 
                           onClick={() => toggleStatus(resident.id, resident.status)}
                           className={`flex-[2] py-4 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm border ${
                              resident.status === 'active' ? 'bg-white border-slate-200 text-slate-600' : 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-500/20'
                           }`}
                        >
                           <Power size={14} className="mr-3" /> 
                           {resident.status === 'active' ? 'Disable Node' : 'Initialize'}
                        </button>
                        <button className="flex-1 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center active:scale-95 transition-all border border-rose-100 shadow-sm">
                           <Trash2 size={16} />
                        </button>
                     </div>
                  </div>
               ))}
            </div>

            {/* 2. DESKTOP TABLE VIEW (Visible on >= 768px) */}
            <div className="hidden md:block overflow-x-auto min-w-full">
               <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                     <tr className="bg-slate-50/50">
                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Resident Identity</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Deployment Unit</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Network Terminal</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Live Status</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Operations</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filtered.map((resident) => (
                        <tr 
                        key={resident.id} 
                        className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group"
                        >
                           <td className="p-8">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-900 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                    {resident.name?.charAt(0) || "U"}
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-slate-900 tracking-tight">{resident.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                       <Calendar size={10} className="text-slate-300" />
                                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Enrolled {resident.joined_date}</span>
                                    </div>
                                 </div>
                              </div>
                           </td>
                           <td className="p-8">
                              <div className="flex items-center gap-3">
                                 <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Home size={14} />
                                 </div>
                                 <span className="text-sm font-black text-slate-600">{resident.unit || "N/A"}</span>
                              </div>
                           </td>
                           <td className="p-8">
                              <div className="space-y-1">
                                 <div className="flex items-center gap-2 text-slate-500">
                                    <Mail size={12} className="text-slate-300" />
                                    <span className="text-xs font-bold">{resident.email}</span>
                                 </div>
                                 <div className="flex items-center gap-2 text-slate-400">
                                    <Phone size={12} className="text-slate-300" />
                                    <span className="text-xs font-bold">{resident.phone || "---"}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="p-8 text-center">
                              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                 resident.status === 'active' 
                                 ? 'bg-emerald-50 text-emerald-600' 
                                 : 'bg-rose-50 text-rose-600'
                              }`}>
                                 <div className={`w-1.5 h-1.5 rounded-full ${resident.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                 {resident.status}
                              </div>
                           </td>
                           <td className="p-8">
                              <div className="flex items-center justify-end gap-3">
                                 <button 
                                 onClick={() => toggleStatus(resident.id, resident.status)}
                                 className={`p-3 bg-white border border-slate-100 rounded-xl transition-all shadow-sm ${
                                    resident.status === 'active' ? 'text-slate-400 hover:text-amber-600 hover:border-amber-100' : 'text-emerald-500 hover:text-emerald-600 hover:border-emerald-100'
                                 }`}
                                 >
                                    <Power size={18} />
                                 </button>
                                 <button className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm">
                                    <Trash2 size={18} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </>
         )}
      </div>

      {/* Footer System */}
      <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
         <div className="flex items-center gap-4">
            <ShieldCheck className="text-emerald-500 w-5 h-5" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Database Verified: {filtered.length} Secure Slots</p>
         </div>
         <div className="flex gap-2">
            {[1].map(p => (
              <button key={p} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-900 shadow-sm transition-all hover:bg-slate-900 hover:text-white">
                 {p}
              </button>
            ))}
         </div>
      </div>
    </div>
  );
}
