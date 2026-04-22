"use client";

import React, { useState } from "react";
import { Search, Filter, Edit2, Trash2, Power, ShieldCheck, Mail, Phone, Clock, MapPin } from "lucide-react";

interface Guard {
  id: string;
  name: string;
  shift: string;
  location: string;
  email: string;
  phone: string;
  status: 'active' | 'deactivated';
}

export default function GuardList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [guards, setGuards] = useState<Guard[]>([
    { id: '1', name: "Officer Kamal", shift: "Morning", location: "Main Gate", email: "kamal@nexus.sec", phone: "+92 312 0001111", status: 'active' },
    { id: '2', name: "Officer Zaid", shift: "Night", location: "Sector B Patrol", email: "zaid@nexus.sec", phone: "+92 344 2223333", status: 'active' },
    { id: '3', name: "Officer Rizwan", shift: "Evening", location: "Emergency Exit", email: "rizwan@nexus.sec", phone: "+92 321 4445555", status: 'deactivated' },
  ]);

  const toggleStatus = (id: string) => {
    setGuards(prev => prev.map(g => g.id === id ? { ...g, status: g.status === 'active' ? 'deactivated' : 'active' } : g));
  };

  return (
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
      {/* Search & Filter Bar */}
      <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="relative w-full max-w-md">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input 
              type="text" 
              placeholder="Search security personnel..." 
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 pl-16 pr-6 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-100 focus:bg-white transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-slate-50 text-slate-500 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-transparent hover:border-slate-200 transition-all">
               <Clock size={16} /> Shifts
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">
               Duty Roster
            </button>
         </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-slate-50/50">
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Security Personnel</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Post</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Deployment Block</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Service Status</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Operations</th>
               </tr>
            </thead>
            <tbody>
               {guards.map((guard) => (
                  <tr 
                    key={guard.id} 
                    className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group"
                  >
                     {/* Identity */}
                     <td className="p-8">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all">
                              <ShieldCheck size={20} />
                           </div>
                           <div>
                              <p className="text-sm font-black text-slate-900 tracking-tight">{guard.name}</p>
                              <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mt-0.5">Verified Personnel</p>
                           </div>
                        </div>
                     </td>

                     {/* Shift */}
                     <td className="p-8">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                              <Clock size={14} />
                           </div>
                           <span className="text-sm font-black text-slate-600">{guard.shift}</span>
                        </div>
                     </td>

                     {/* Location */}
                     <td className="p-8">
                        <div className="flex items-center gap-2">
                           <MapPin size={12} className="text-slate-300" />
                           <span className="text-xs font-bold text-slate-500">{guard.location}</span>
                        </div>
                     </td>

                     {/* Status */}
                     <td className="p-8">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${
                           guard.status === 'active' 
                           ? 'bg-emerald-50 text-emerald-600' 
                           : 'bg-rose-50 text-rose-600'
                        }`}>
                           <div className={`w-1.5 h-1.5 rounded-full ${guard.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                           {guard.status}
                        </div>
                     </td>

                     {/* Actions */}
                     <td className="p-8">
                        <div className="flex items-center gap-2">
                           <button className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm">
                              <Edit2 size={16} />
                           </button>
                           <button 
                             onClick={() => toggleStatus(guard.id)}
                             className={`p-3 bg-white border border-slate-100 rounded-xl transition-all shadow-sm ${
                               guard.status === 'active' ? 'text-slate-400 hover:text-amber-600 hover:border-amber-100' : 'text-emerald-500 hover:text-emerald-600 hover:border-emerald-100'
                             }`}
                           >
                              <Power size={16} />
                           </button>
                           <button className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm">
                              <Trash2 size={16} />
                           </button>
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* Footer */}
      <div className="p-10 bg-slate-50 flex justify-between items-center">
         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Displaying {guards.length} Security Personnel</p>
         <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm hover:bg-slate-50 transition-all">Export Duty Roster</button>
      </div>
    </div>
  );
}
