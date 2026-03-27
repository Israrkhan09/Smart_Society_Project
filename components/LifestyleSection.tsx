"use client";

import { motion } from "framer-motion";
import { Sparkles, Coffee, Heart, Camera } from "lucide-react";

const items = [
  { 
    title: "Vibrant Community", 
    desc: "Connect with neighbors through curated events and shared interests.",
    icon: Sparkles,
    bg: "bg-emerald-500" 
  },
  { 
    title: "Premium Amenities", 
    desc: "Experience luxury living with state-of-the-art facilities and services.",
    icon: Coffee,
    bg: "bg-amber-500" 
  },
  { 
    title: "Member Perks", 
    desc: "Exclusive discounts and early access to neighborhood services.",
    icon: Heart,
    bg: "bg-rose-500" 
  },
  { 
    title: "Snap & Share", 
    desc: "Share your best community moments on our private social wall.",
    icon: Camera,
    bg: "bg-blue-500" 
  },
];

export default function LifestyleSection() {
  return (
    <section id="lifestyle" className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
             <motion.span 
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               className="text-emerald-600 font-black text-xs uppercase tracking-widest mb-4 block"
             >
               Explore Lifestyle
             </motion.span>
             <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
               More than just a place, <span className="text-emerald-500/20">it&apos;s an experience.</span>
             </h2>
          </div>
          <p className="text-gray-500 text-lg font-medium max-w-sm mb-2">
            Discover why thousands of residents have chosen Smart-Society OS for their daily living.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="group relative h-[450px] rounded-[3rem] overflow-hidden border border-gray-100 shadow-2xl shadow-black/[0.03] cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
              <div className={`absolute inset-0 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 opacity-60 ${item.bg}/10`} />
              
              <div className="absolute bottom-10 left-8 right-8 z-20 transition-all duration-300 group-hover:bottom-12">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                  <item.icon className="text-gray-900" size={24} />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">{item.title}</h3>
                <p className="text-gray-300 font-medium text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
