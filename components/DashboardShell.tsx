"use client";

import { motion } from "framer-motion";
import { 
  BarChart3, 
  Users2, 
  ShieldAlert, 
  LayoutDashboard, 
  CreditCard, 
  MessageSquare, 
  Settings,
  Plus
} from "lucide-react";
import Stats from "@/components/Stats";
import { useAuth } from "@/context/AuthContext";

export default function DashboardShell() {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col lg:flex-row min-h-[800px] ring-1 ring-black/5">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-gray-100 p-8 flex flex-col bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-12 group cursor-pointer">
            <motion.div 
              whileHover={{ rotate: 90 }}
              className="w-10 h-10 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center"
            >
               <div className="w-4 h-4 bg-white rounded-sm" />
            </motion.div>
            <span className="font-black text-xl tracking-tight text-emerald-950">Resident<span className="text-emerald-500">Hub</span></span>
          </div>

          <nav className="flex-1 flex flex-col gap-1.5">
            {[
              { icon: LayoutDashboard, label: "Dashboard", active: true },
              { icon: Users2, label: "Visitors" },
              { icon: CreditCard, label: "Payments" },
              { icon: ShieldAlert, label: "Complaints" },
              { icon: MessageSquare, label: "Messages" },
              { icon: Settings, label: "Settings" },
            ].map((item, i) => (
              <motion.button
                key={i}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${
                  item.active 
                    ? "bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-emerald-600"
                }`}
              >
                <item.icon size={22} strokeWidth={item.active ? 2.5 : 2} />
                <span className="text-sm font-semibold">{item.label}</span>
                {item.active && (
                   <motion.div layoutId="activeNav" className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </motion.button>
            ))}
          </nav>

          <div className="mt-8 bg-emerald-950 rounded-[2rem] p-6 text-white text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 blur-3xl -mr-12 -mt-12 group-hover:bg-emerald-500/40 transition-colors" />
            <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-3">Premium Support</p>
            <p className="text-sm font-medium mb-5">Need immediate assistance?</p>
            <button className="bg-emerald-500 hover:bg-emerald-400 text-white w-full py-3 rounded-xl font-bold text-xs transition-colors shadow-lg shadow-black/20">
              Contact Concierge
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-gray-50/50 p-10 overflow-y-auto">
          <motion.header 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-between items-center mb-10"
          >
            <div>
              <h2 className="text-3xl font-black text-gray-900 leading-tight">
                Good morning, <span className="text-emerald-600 font-black">{user.displayName || "Resident"}</span>
              </h2>
              <p className="text-gray-500 font-medium">Welcome back to your Smart-Society Dashboard.</p>
            </div>
            <button className="bg-emerald-500 text-white p-4 rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-110 active:scale-95 transition-all">
              <Plus strokeWidth={3} />
            </button>
          </motion.header>

          <Stats />

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[300px] flex flex-col justify-between"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-2xl text-emerald-950">Quick Actions</h3>
                <button className="text-emerald-500 font-bold text-sm hover:underline">View All</button>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: 'Visitor Pass', color: 'bg-emerald-50' },
                  { label: 'Facility', color: 'bg-blue-50' },
                  { label: 'SOS', color: 'bg-red-50' }
                ].map((action) => (
                  <motion.div 
                    key={action.label} 
                    whileHover={{ y: -5, scale: 1.05 }}
                    className="aspect-square bg-gray-50/50 rounded-3xl flex flex-col items-center justify-center gap-3 border border-gray-100 hover:border-emerald-200 hover:bg-white transition-all cursor-pointer group shadow-sm hover:shadow-xl hover:shadow-emerald-500/5"
                  >
                    <div className={`w-14 h-14 ${action.color} rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                      <Plus size={24} className="text-gray-800" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-emerald-600">{action.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-emerald-900 p-8 rounded-3xl shadow-sm text-white min-h-[256px]"
            >
              <h3 className="font-black text-2xl mb-6">Society Announcements</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-1.5 bg-emerald-400 rounded-full" />
                  <div>
                    <p className="font-bold text-lg">Annual General Meeting</p>
                    <p className="text-emerald-400 font-semibold">Tomorrow at 6:30 PM (Lobby A)</p>
                  </div>
                </div>
                <div className="flex gap-4 opacity-50">
                  <div className="w-1.5 bg-white rounded-full" />
                  <div>
                    <p className="font-bold">Pest Control Service</p>
                    <p className="text-sm font-medium">Completed yesterday</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </section>
  );
}
