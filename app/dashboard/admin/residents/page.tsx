"use client";

import React, { useState } from "react";
import { UserPlus, Download } from "lucide-react";
import ResidentList from "@/components/admin/user-management/ResidentList";
import AddUserModal from "@/components/admin/user-management/AddUserModal";

export default function ResidentsAdminPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="font-['Inter',sans-serif]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 md:mb-12">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">Resident Management</h1>
          <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Society Occupancy Logs • {new Date().getFullYear()} Database</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
           <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3.5 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-slate-300 transition-all">
              <Download size={14} />
              Export
           </button>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all"
           >
              <UserPlus size={14} strokeWidth={3} />
              Provision Resident
           </button>
        </div>
      </div>

      {/* Main List */}
      <ResidentList />

      {/* Add User Modal */}
      <AddUserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        role="resident" 
      />
    </div>
  );
}
