"use client";

import React, { useState } from "react";
import { ShieldPlus, FileText } from "lucide-react";
import GuardList from "@/components/admin/user-management/GuardList";
import AddUserModal from "@/components/admin/user-management/AddUserModal";

export default function GuardsAdminPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="font-['Inter',sans-serif]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Security Command</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Personnel Roster • Shift Deployment Terminal</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
           <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-slate-300 transition-all">
              <FileText size={16} />
              Roster
           </button>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:scale-105 transition-all"
           >
              <ShieldPlus size={16} strokeWidth={3} />
              Deploy Personnel
           </button>
        </div>
      </div>

      {/* Main List */}
      <GuardList />

      {/* Add User Modal */}
      <AddUserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        role="guard" 
      />
    </div>
  );
}
