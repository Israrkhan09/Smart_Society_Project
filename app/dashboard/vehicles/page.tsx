"use client";

import React, { useState, useEffect } from "react";
import { 
  Bell,
  MapPin, 
  ArrowRightLeft, 
  ShieldCheck, 
  Car, 
  SlidersHorizontal, 
  Users,
  X,
  Info,
  Calendar,
  CheckCircle2,
  Timer,
  Plus,
  Star,
  Bike
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

const ParkingIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>
  </svg>
);

export default function VehiclesPage() {
  const { user } = useAuth();
  const userName = user?.displayName || "Muhammad Kamal";
  
  const [activeTab, setActiveTab] = useState("DASHBOARD");
  
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

  // Banner Request State
  const [bannerReqs, setBannerReqs] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    const reqKey = `smart-society-vehicle-requests-${user.uid}`;
    const syncKey = `smart-society-vehicle-sync-${user.uid}`;
    const saved = localStorage.getItem(reqKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      const savedTime = localStorage.getItem(syncKey);
      if (savedTime) {
         const elapsed = Math.floor((Date.now() - parseInt(savedTime)) / 1000);
         const fastForwarded = parsed.map((req: any) => {
           if (req.status === "approved" && req.timeLeft > 0) {
              const newTime = Math.max(0, req.timeLeft - elapsed);
              if (newTime === 0 && !req.loggedExpiry) {
                 logActivity("Parking Timeout", `${req.user}'s temporary parking slot ${req.slot} time has ended.`, "Completed");
                 return { ...req, timeLeft: 0, loggedExpiry: true, label: "COMPLETED" };
              }
              return { ...req, timeLeft: newTime };
           }
           return req;
         });
         setBannerReqs(fastForwarded);
      } else {
         setBannerReqs(parsed);
      }
    } else {
      setBannerReqs([
        {
          id: 1,
          active: true,
          status: "pending", 
          timeLeft: 7200, 
          label: "TEMPORARY • 2 HOURS",
          user: "SARA ALI (APT 501)",
          slot: "P-402",
          loggedExpiry: false
        },
        {
          id: 2,
          active: true,
          status: "pending", 
          timeLeft: 0, 
          label: "PERMANENT SWAP",
          user: "OMAR FAZAL (APT 304)",
          slot: "P-405",
          loggedExpiry: true
        }
      ]);
    }
    setIsLoaded(true);
  }, [user]);

  useEffect(() => {
    if (!isLoaded || !user) return;
    localStorage.setItem(`smart-society-vehicle-requests-${user.uid}`, JSON.stringify(bannerReqs));
    localStorage.setItem(`smart-society-vehicle-sync-${user.uid}`, Date.now().toString());
  }, [bannerReqs, isLoaded, user]);

  useEffect(() => {
    if (!isLoaded || !user) return;
    let timer = setInterval(() => {
      setBannerReqs((prev) => 
        prev.map(req => {
          if (req.status === "approved" && req.timeLeft > 0) {
            const nextTime = req.timeLeft - 1;
            if (nextTime === 0 && !req.loggedExpiry) {
               logActivity("Parking Expired", `${req.user}'s temporary slot ${req.slot} usage has formally completed.`, "Completed");
               return { ...req, timeLeft: 0, loggedExpiry: true, label: "COMPLETED" };
            }
            return { ...req, timeLeft: nextTime };
          }
          return req;
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [isLoaded]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Shared Slots State
  const [sharedSlots, setSharedSlots] = useState([
    { id: 1, slot: "P-405", owner: "Adnan Malik", block: "Block A", status: "idle" },
    { id: 2, slot: "P-410", owner: "Zahid Ahmed", block: "Block C", status: "idle" },
    { id: 3, slot: "P-412", owner: "Hassan Raza", block: "Block C", status: "pending" },
    { id: 4, slot: "P-501", owner: "Aisha Khan", block: "Block E", status: "reserved" },
    { id: 5, slot: "P-505", owner: "Kamran Ali", block: "Block F", status: "idle" },
  ]);

  // Active Vehicles State
  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      name: "Honda Civic",
      plate: "LEP-4029",
      slot: "Slot P-402",
      type: "car",
      status: "inside",
      isPrimary: true
    },
    {
      id: 2,
      name: "Yamaha YBR",
      plate: "MNP-3122",
      slot: "Slot B-21",
      type: "bike",
      status: "outside",
      isPrimary: false
    }
  ]);

  const toggleVehicleStatus = (id: number) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === id) {
         const newStatus = v.status === "inside" ? "outside" : "inside";
         logActivity("Vehicle Entry/Exit", `${v.name} (${v.plate}) was marked as ${newStatus.toUpperCase()}`, newStatus === "inside" ? "Parked" : "Active");
         return { ...v, status: newStatus };
      }
      return v;
    }));
  };

  // Parking Slot Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"REQUEST" | "SWAP">("REQUEST");
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: userName,
    carName: "Honda Civic",
    carNumber: "LEP-4029",
    from: "",
    to: "",
    phone: ""
  });

  const handleOpenModal = (slotItem: any) => {
    setSelectedSlot(slotItem);
    setIsModalOpen(true);
    setModalMode("REQUEST");
    setFormData({
      name: userName,
      carName: "Honda Civic",
      carNumber: "LEP-4029",
      from: "",
      to: "",
      phone: ""
    });
  };

  const handleSubmitRequest = () => {
    setSharedSlots(prev => prev.map(s => s.id === selectedSlot.id ? { ...s, status: "pending" } : s));
    logActivity("Parking Slot Request", `Requested Parking Slot ${selectedSlot.slot} from ${selectedSlot.owner} (${modalMode})`, "Pending");
    setIsModalOpen(false);
  };

  // Add Vehicle Modal State
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [newVehicleData, setNewVehicleData] = useState({
    name: "",
    plate: "",
    type: "car",
  });

  const handleAddVehicle = () => {
    if (!newVehicleData.name || !newVehicleData.plate) return;
    
    const newId = vehicles.length ? Math.max(...vehicles.map(v => v.id)) + 1 : 1;
    const newVehicle = {
      id: newId,
      name: newVehicleData.name,
      plate: newVehicleData.plate.toUpperCase(),
      slot: newVehicleData.type === "car" ? "Slot P-402" : "Slot B-21", // default slots
      type: newVehicleData.type,
      status: "inside", 
      isPrimary: vehicles.length === 0, 
    };
    
    setVehicles([newVehicle, ...vehicles]);
    logActivity("New Vehicle Added", `New ${newVehicleData.type} '${newVehicleData.name}' added to your account.`, "Verified");
    setIsAddVehicleModalOpen(false);
    setNewVehicleData({ name: "", plate: "", type: "car" });
  };

  return (
    <div className="flex flex-col gap-5 relative" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Alert Banners */}
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {bannerReqs.filter(r => r.active).map(req => (
            <motion.div 
              key={req.id}
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: -12, overflow: "hidden" }}
              className={`border rounded-[1.5rem] px-5 py-2.5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm relative overflow-hidden transition-colors duration-500 ${
                req.status === "approved" 
                  ? "bg-emerald-50 border-emerald-100" 
                  : "bg-[#fffcf0] border-[#fef0c7]"
              }`}
            >
               <div className={`absolute left-0 top-0 w-32 h-32 blur-[50px] pointer-events-none transition-colors duration-500 ${req.status === "approved" ? "bg-emerald-400/20" : "bg-amber-400/20"}`} />
               
               <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md shrink-0 transition-colors duration-500 ${req.status === "approved" ? "bg-emerald-500 shadow-emerald-500/30" : "bg-[#f59e0b] shadow-amber-500/30"}`}>
                     {req.status === "approved" ? <CheckCircle2 className="text-white" size={14} /> : <Bell className="text-white fill-white" size={14} />}
                  </div>
                  <div className="flex flex-col justify-center">
                     <h3 className={`font-black text-[13px] tracking-tight leading-none ${req.status === "approved" ? "text-emerald-900" : "text-gray-900"}`}>
                        {req.status === "approved" ? "Parking Request Approved" : "Pending Parking Request"}
                     </h3>
                     <p className={`font-extrabold text-[8px] uppercase tracking-[0.1em] mt-0.5 ${req.status === "approved" ? "text-emerald-600" : "text-[#d97706]"}`}>
                       {req.user} REQUESTING SLOT {req.slot} • {req.label}
                     </p>
                  </div>
               </div>
               
               <div className="flex items-center gap-2 shrink-0 w-full md:w-auto mt-2 md:mt-0 justify-end relative z-10 transition-all duration-500">
                  {req.status === "pending" ? (
                    <>
                      <button 
                        onClick={() => setBannerReqs(prev => prev.map(p => p.id === req.id ? { ...p, active: false } : p))}
                        className="text-gray-400 hover:text-gray-800 text-[8px] font-black uppercase tracking-[0.2em] transition-colors px-3 py-1.5 rounded-full"
                      >
                        REJECT
                      </button>
                      <button 
                        onClick={() => {
                          setBannerReqs(prev => prev.map(p => p.id === req.id ? { ...p, status: "approved" } : p));
                          logActivity("Parking Approved", `${req.label} Parking Approved for ${req.user}`, "Confirmed");
                        }}
                        className="bg-[#f59e0b] hover:bg-[#d97706] text-white px-5 py-2 rounded-full text-[8px] font-black uppercase tracking-[0.15em] shadow-md shadow-amber-500/20 transition-transform active:scale-95"
                      >
                        APPROVE
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm border border-emerald-100">
                          {req.id === 1 ? (
                            <>
                              <Timer size={12} className="text-emerald-500" />
                              <span className="text-emerald-600 font-mono font-black text-[10px]">{formatTime(req.timeLeft)}</span>
                            </>
                          ) : (
                            <>
                               <CheckCircle2 size={12} className="text-emerald-500" />
                               <span className="text-emerald-600 font-black text-[9px] uppercase tracking-widest">SWAPPED</span>
                            </>
                          )}
                        </div>
                        <button 
                          onClick={() => {
                             setBannerReqs(prev => prev.map(p => p.id === req.id ? { ...p, active: false } : p));
                             logActivity("Parking Revoked", `Parking permission to ${req.user} has been revoked manually.`, "Completed");
                          }}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-500 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.15em] border border-rose-100 transition-colors"
                        >
                          REVOKE
                        </button>
                    </div>
                  )}
               </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Stats Cards Grid - 3 Columns (Reserved Removed) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "TOTAL SLOTS", value: "40", icon: ParkingIcon, iconColor: "text-blue-500", iconBg: "bg-blue-50" },
          { label: "MY SLOT #", value: "P-402", icon: MapPin, iconColor: "text-emerald-500", iconBg: "bg-emerald-50" },
          { label: "REQUESTS", value: "1", icon: ArrowRightLeft, iconColor: "text-amber-500", iconBg: "bg-amber-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-[1.5rem] p-5 px-6 border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all cursor-default relative overflow-hidden">
             <div className="flex flex-col z-10 min-w-0 pr-3">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest truncate mb-0.5">{stat.label}</p>
                <h3 className="text-xl lg:text-2xl font-black text-gray-900 tracking-normal leading-none truncate">{stat.value}</h3>
             </div>
             <div className={`w-10 h-10 rounded-full ${stat.iconBg} ${stat.iconColor} flex items-center justify-center transition-transform group-hover:scale-110 shrink-0 z-10`}>
                <stat.icon size={18} className={stat.label === "REQUESTS" ? "stroke-[2.5px]" : ""} />
             </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-gray-100 px-6 mt-1 relative">
         <button 
           onClick={() => setActiveTab("DASHBOARD")}
           className={`pb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] transition-colors relative ${
             activeTab === "DASHBOARD" ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
           }`}
         >
            <Car size={16} strokeWidth={2.5} />
            DASHBOARD
            {activeTab === "DASHBOARD" && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t-full" />}
         </button>
         <button 
           onClick={() => setActiveTab("SMART PARKING")}
           className={`pb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] transition-colors relative ${
             activeTab === "SMART PARKING" ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
           }`}
         >
            <SlidersHorizontal size={16} strokeWidth={2.5} />
            SMART PARKING
            {activeTab === "SMART PARKING" && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t-full" />}
         </button>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === "DASHBOARD" && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="mt-2"
          >
             <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Active Vehicles</h2>
                <button 
                  onClick={() => setIsAddVehicleModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-transform active:scale-95 flex items-center gap-2"
                >
                   <Plus size={14} strokeWidth={3} />
                   ADD VEHICLE
                </button>
             </div>

             {/* Inside Row */}
             <div className="mb-8">
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">
                  Parked Inside <span className="text-gray-300 ml-1">({vehicles.filter(v => v.status === "inside").length})</span>
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 min-h-[140px]">
                  <AnimatePresence mode="popLayout">
                    {vehicles.filter(v => v.status === "inside").map(v => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        key={v.id} 
                        className="bg-white rounded-[2rem] p-6 lg:p-7 border border-gray-100 shadow-sm relative flex flex-col hover:shadow-md transition-shadow"
                      >
                         {v.isPrimary && (
                           <div className="absolute top-0 right-8 bg-blue-600 text-white px-3 py-1 rounded-b-lg flex items-center gap-1 shadow-sm z-10">
                              <Star size={8} className="fill-white" />
                              <span className="text-[7px] font-black uppercase tracking-widest">PRIMARY</span>
                           </div>
                         )}
                         
                         <div className="flex justify-between items-start mb-8">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner shrink-0 leading-none ${v.type === 'car' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-500'}`}>
                               {v.type === 'car' ? <Car size={20} strokeWidth={2.5} /> : <Bike size={20} strokeWidth={2.5} />}
                            </div>
                            <div className="flex flex-col items-end gap-1.5 mt-3">
                               <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-[9px] font-mono font-black tracking-widest shadow-sm">
                                  {v.plate}
                               </div>
                               <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-500 mr-1">
                                  INSIDE
                               </span>
                            </div>
                         </div>

                         <div className="mb-6">
                            <h4 className="text-lg font-black text-gray-900 tracking-tight leading-none mb-2">{v.name}</h4>
                            <div className="flex items-center gap-1.5 text-gray-400">
                               <MapPin size={12} strokeWidth={2.5} />
                               <span className="text-[9px] font-bold uppercase tracking-widest">{v.slot}</span>
                            </div>
                         </div>

                         <button 
                           onClick={() => toggleVehicleStatus(v.id)}
                           className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 transition-transform active:scale-95"
                         >
                            MARK OUTSIDE
                         </button>
                      </motion.div>
                    ))}
                    {vehicles.filter(v => v.status === "inside").length === 0 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-10 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-[2rem]">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No vehicles parked inside</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
             </div>

             {/* Outside Row */}
             <div>
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">
                  Outside Society <span className="text-gray-300 ml-1">({vehicles.filter(v => v.status === "outside").length})</span>
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 min-h-[140px]">
                  <AnimatePresence mode="popLayout">
                    {vehicles.filter(v => v.status === "outside").map(v => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        key={v.id} 
                        className="bg-white rounded-[2rem] p-6 lg:p-7 border border-gray-100 shadow-sm relative flex flex-col hover:shadow-md transition-shadow"
                      >
                         {v.isPrimary && (
                           <div className="absolute top-0 right-8 bg-blue-600 text-white px-3 py-1 rounded-b-lg flex items-center gap-1 shadow-sm z-10">
                              <Star size={8} className="fill-white" />
                              <span className="text-[7px] font-black uppercase tracking-widest">PRIMARY</span>
                           </div>
                         )}

                         <div className="flex justify-between items-start mb-8">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner shrink-0 leading-none ${v.type === 'car' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-500'}`}>
                               {v.type === 'car' ? <Car size={20} strokeWidth={2.5} /> : <Bike size={20} strokeWidth={2.5} />}
                            </div>
                            <div className="flex flex-col items-end gap-1.5 mt-3">
                               <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-[9px] font-mono font-black tracking-widest shadow-sm">
                                  {v.plate}
                               </div>
                               <span className="text-[8px] font-black uppercase tracking-[0.2em] text-rose-500 mr-1">
                                  OUTSIDE
                               </span>
                            </div>
                         </div>

                         <div className="mb-6">
                            <h4 className="text-lg font-black text-gray-900 tracking-tight leading-none mb-2">{v.name}</h4>
                            <div className="flex items-center gap-1.5 text-gray-400">
                               <MapPin size={12} strokeWidth={2.5} />
                               <span className="text-[9px] font-bold uppercase tracking-widest">{v.slot}</span>
                            </div>
                         </div>

                         <button 
                           onClick={() => toggleVehicleStatus(v.id)}
                           className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-transform active:scale-95"
                         >
                            MARK INSIDE
                         </button>
                      </motion.div>
                    ))}
                    {vehicles.filter(v => v.status === "outside").length === 0 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-10 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-[2rem]">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">No vehicles are currently outside</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
             </div>
             <div className="pb-10" />

          </motion.div>
        )}

        {activeTab === "SMART PARKING" && (
          <motion.div 
            key="smart"
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-gray-100 shadow-sm mt-4"
          >
             <div className="flex items-center gap-4 mb-8">
                <Users className="text-blue-600" size={26} strokeWidth={2.5} />
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Neighbors Shared Slots</h2>
             </div>

             <div className="space-y-4">
                {sharedSlots.map((slot) => (
                  <div key={slot.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 px-8 border border-gray-100 rounded-[1.5rem] hover:bg-gray-50/50 transition-colors group cursor-default gap-4">
                     <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm ${slot.status === 'idle' ? 'bg-blue-50/50 border border-blue-100/50 text-blue-600' : slot.status === 'reserved' ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-amber-50 text-amber-500 border border-amber-100'}`}>
                           <ParkingIcon size={20} className="opacity-90" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                           <h4 className="text-gray-900 font-extrabold text-lg leading-none">{slot.slot}</h4>
                           <p className="font-black text-[10px] uppercase tracking-widest mt-1 text-gray-900 flex items-center gap-1.5">
                              {slot.owner} 
                              <span className="text-gray-300 font-normal text-[8px]">●</span> 
                              <span className="text-gray-400">{slot.block}</span>
                           </p>
                        </div>
                     </div>
                     {slot.status === "idle" && (
                       <button 
                         onClick={() => handleOpenModal(slot)}
                         className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-transform active:scale-95 text-center"
                       >
                          REQUEST
                       </button>
                     )}
                     {slot.status === "pending" && (
                       <button 
                         disabled
                         className="bg-amber-50 text-amber-600 border border-amber-200 w-full md:w-auto px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm cursor-not-allowed flex items-center justify-center gap-2"
                       >
                          PENDING APPROVAL
                       </button>
                     )}
                     {slot.status === "reserved" && (
                       <button 
                         disabled
                         className="bg-rose-50 text-rose-500 border border-rose-100 w-full md:w-auto px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm cursor-not-allowed flex items-center justify-center gap-2"
                       >
                          RESERVED
                       </button>
                     )}
                  </div>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parking Slot Request Modal */}
      <AnimatePresence>
        {isModalOpen && selectedSlot && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
             <motion.div 
               initial={{ opacity: 0, y: 30, scale: 0.95 }} 
               animate={{ opacity: 1, y: 0, scale: 1 }} 
               exit={{ opacity: 0, y: 20, scale: 0.95 }}
               className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
             >
                {/* Header */}
                <div className="p-6 md:p-8 pb-4 flex justify-between items-start shrink-0">
                   <div className="flex flex-col gap-1.5">
                      <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Parking Slot Request</h2>
                      <p className="text-blue-500 font-black text-[9px] md:text-[10px] uppercase tracking-widest">
                        REQUESTING SLOT: {selectedSlot.slot} ({selectedSlot.owner.toUpperCase()})
                      </p>
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                      <X size={18} />
                   </button>
                </div>

                {/* Body */}
                <div className="p-6 md:p-8 pt-0 overflow-y-auto">
                   
                   {/* Modal Tabs */}
                   <div className="flex gap-2 p-1.5 bg-gray-50 rounded-2xl mb-6">
                     <button 
                       onClick={() => setModalMode("REQUEST")}
                       className={`flex-1 py-2.5 md:py-3 text-[9px] font-black uppercase tracking-[0.15em] rounded-xl transition-all ${
                         modalMode === "REQUEST" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                       }`}
                     >
                        SLOT REQUEST
                     </button>
                     <button 
                       onClick={() => setModalMode("SWAP")}
                       className={`flex-1 py-2.5 md:py-3 text-[9px] font-black uppercase tracking-[0.15em] rounded-xl transition-all ${
                         modalMode === "SWAP" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                       }`}
                     >
                        SLOT SWAP
                     </button>
                   </div>

                   {/* Form - SLOT REQUEST (Temporary) */}
                   {modalMode === "REQUEST" && (
                     <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-5 mb-6">
                        {/* First Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                           <div className="flex flex-col gap-2">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">YOUR NAME</label>
                              <input 
                                type="text" 
                                readOnly
                                value={formData.name}
                                className="bg-gray-50 border-none rounded-2xl px-5 py-4 text-xs md:text-sm font-bold text-gray-900 w-full"
                              />
                           </div>
                           <div className="flex flex-col gap-2">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">CAR NAME</label>
                              <input 
                                type="text" 
                                readOnly
                                value={formData.carName}
                                className="bg-gray-50 border-none rounded-2xl px-5 py-4 text-xs md:text-sm font-bold text-gray-900 w-full"
                              />
                           </div>
                        </div>

                        {/* Second Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                           <div className="flex flex-col gap-2">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">CAR NUMBER</label>
                              <input 
                                type="text" 
                                readOnly
                                value={formData.carNumber}
                                className="bg-gray-50 border-none rounded-2xl px-5 py-4 text-xs md:text-sm font-bold text-gray-900 w-full"
                              />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="flex flex-col gap-2">
                                 <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">FROM</label>
                                 <input 
                                   type="datetime-local" 
                                   value={formData.from}
                                   onChange={(e) => setFormData({...formData, from: e.target.value})}
                                   className="bg-gray-50 border-none rounded-2xl px-4 py-4 text-[9px] md:text-[10px] font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20 w-full"
                                 />
                              </div>
                              <div className="flex flex-col gap-2">
                                 <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">TO</label>
                                 <input 
                                   type="datetime-local" 
                                   value={formData.to}
                                   onChange={(e) => setFormData({...formData, to: e.target.value})}
                                   className="bg-gray-50 border-none rounded-2xl px-4 py-4 text-[9px] md:text-[10px] font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20 w-full"
                                 />
                              </div>
                           </div>
                        </div>
                     </motion.div>
                   )}

                   {/* Form - SLOT SWAP (Permanent) */}
                   {modalMode === "SWAP" && (
                     <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-5 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                           <div className="flex flex-col gap-2">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">YOUR NAME</label>
                              <input 
                                type="text" 
                                readOnly
                                value={formData.name}
                                className="bg-gray-50 border-none rounded-2xl px-5 py-4 text-xs md:text-sm font-bold text-gray-900 w-full"
                              />
                           </div>
                           <div className="flex flex-col gap-2">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">CAR NAME</label>
                              <input 
                                type="text" 
                                readOnly
                                value={formData.carName}
                                className="bg-gray-50 border-none rounded-2xl px-5 py-4 text-xs md:text-sm font-bold text-gray-900 w-full"
                              />
                           </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                           <div className="flex flex-col gap-2">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">CAR NUMBER</label>
                              <input 
                                type="text" 
                                readOnly
                                value={formData.carNumber}
                                className="bg-gray-50 border-none rounded-2xl px-5 py-4 text-xs md:text-sm font-bold text-gray-900 w-full"
                              />
                           </div>
                           <div className="flex flex-col gap-2">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">PHONE NUMBER</label>
                              <input 
                                type="text" 
                                placeholder="+92 3XX XXXXXXX"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="bg-white border border-gray-200 rounded-2xl px-5 py-4 text-xs md:text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20 w-full transition-all shadow-inner"
                              />
                           </div>
                        </div>
                     </motion.div>
                   )}

                   {/* Info Message */}
                   <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3 mb-6">
                      <Info size={16} className="text-blue-500 shrink-0" />
                      <p className="text-[10px] md:text-[11px] font-bold text-blue-900 leading-tight">
                        {modalMode === "REQUEST" ? (
                          <>You are sending a <span className="underline decoration-blue-300">Temporary</span> request for slot <span className="font-extrabold">{selectedSlot.slot}</span>.</>
                        ) : (
                          <>You are sending a <span className="underline decoration-blue-300">Permanent Swap</span> request for slot <span className="font-extrabold">{selectedSlot.slot}</span>.</>
                        )}
                      </p>
                   </div>

                   {/* Actions */}
                   <div className="flex flex-col md:flex-row gap-3">
                      <button 
                        onClick={() => setIsModalOpen(false)}
                        className="bg-white border border-gray-100 py-3 md:py-4 px-6 rounded-full text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-colors md:w-1/3"
                      >
                         CANCEL
                      </button>
                      <button 
                        onClick={handleSubmitRequest}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex-1 py-3 md:py-4 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                      >
                         {modalMode === "REQUEST" ? "SEND TEMPORARY REQUEST" : "SEND SWAP REQUEST"}
                      </button>
                   </div>

                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add New Vehicle Modal */}
      <AnimatePresence>
        {isAddVehicleModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsAddVehicleModalOpen(false)} />
             <motion.div 
               initial={{ opacity: 0, y: 30, scale: 0.95 }} 
               animate={{ opacity: 1, y: 0, scale: 1 }} 
               exit={{ opacity: 0, y: 20, scale: 0.95 }}
               className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
             >
                {/* Header */}
                <div className="p-6 md:p-8 pb-4 flex justify-between items-start shrink-0 border-b border-gray-50">
                   <div className="flex flex-col gap-1.5">
                      <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Register New Vehicle</h2>
                      <p className="text-gray-400 font-black text-[9px] md:text-[10px] uppercase tracking-widest">
                        ADD A CAR OR BIKE TO YOUR PROFILE
                      </p>
                   </div>
                   <button onClick={() => setIsAddVehicleModalOpen(false)} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                      <X size={18} />
                   </button>
                </div>

                {/* Body */}
                <div className="p-6 md:p-8 overflow-y-auto flex flex-col gap-6">
                   
                   {/* Vehicle Type Selection */}
                   <div className="flex gap-4">
                      <button 
                        onClick={() => setNewVehicleData({...newVehicleData, type: "car"})}
                        className={`flex-1 py-5 flex flex-col items-center gap-2 rounded-2xl border-2 transition-all ${newVehicleData.type === "car" ? "border-blue-500 bg-blue-50/50 text-blue-600 shadow-sm" : "border-gray-100 bg-white text-gray-400 hover:bg-gray-50"}`}
                      >
                         <Car size={26} strokeWidth={2.5} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Car</span>
                      </button>
                      <button 
                        onClick={() => setNewVehicleData({...newVehicleData, type: "bike"})}
                        className={`flex-1 py-5 flex flex-col items-center gap-2 rounded-2xl border-2 transition-all ${newVehicleData.type === "bike" ? "border-blue-500 bg-blue-50/50 text-blue-600 shadow-sm" : "border-gray-100 bg-white text-gray-400 hover:bg-gray-50"}`}
                      >
                         <Bike size={26} strokeWidth={2.5} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Bike</span>
                      </button>
                   </div>

                   {/* Form Fields */}
                   <div className="flex flex-col gap-5">
                      <div className="flex flex-col gap-2">
                         <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">VEHICLE NAME / MODEL</label>
                         <input 
                           type="text" 
                           placeholder={newVehicleData.type === "car" ? "e.g. Honda Civic" : "e.g. Yamaha YBR"}
                           value={newVehicleData.name}
                           onChange={(e) => setNewVehicleData({...newVehicleData, name: e.target.value})}
                           className="bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20 w-full hover:bg-gray-100/50 transition-colors"
                         />
                      </div>
                      <div className="flex flex-col gap-2">
                         <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">LICENSE PLATE NUMBER</label>
                         <input 
                           type="text" 
                           placeholder="e.g. ABC-1234"
                           value={newVehicleData.plate}
                           onChange={(e) => setNewVehicleData({...newVehicleData, plate: e.target.value})}
                           className="bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20 w-full uppercase hover:bg-gray-100/50 transition-colors"
                         />
                      </div>
                   </div>

                   {/* Actions */}
                   <div className="flex gap-4 mt-2">
                      <button 
                        onClick={() => setIsAddVehicleModalOpen(false)}
                        className="bg-white border border-gray-100 py-4 px-6 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-colors w-1/3"
                      >
                         CANCEL
                      </button>
                      <button 
                        onClick={handleAddVehicle}
                        disabled={!newVehicleData.name || !newVehicleData.plate}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:opacity-50 text-white flex-1 py-4 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                      >
                         ADD VEHICLE
                      </button>
                   </div>

                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
