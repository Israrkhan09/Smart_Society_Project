"use client";

import { motion } from "framer-motion";
import { UserPlus, MessageCircle, BarChart, HardDrive } from "lucide-react";

export default function SolutionsSection() {
  const solutions = [
    {
      title: "Visitor Management",
      desc: "Digital gate passes and real-time alerts for all incoming guests.",
      icon: UserPlus,
    },
    {
      title: "Direct Concierge",
      desc: "Instant communication with society management and helpdesk.",
      icon: MessageCircle,
    },
    {
      title: "Utility Tracking",
      desc: "Monitor your water and electricity consumption with smart insights.",
      icon: BarChart,
    },
    {
      title: "Secure Storage",
      desc: "Encrypted storage for society documents and property records.",
      icon: HardDrive,
    },
  ];

  return (
    <section id="solutions" className="py-30 px-6 bg-[#FAFAFA] relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.span 
             initial={{ opacity: 0, y: 10 }}
             whileInView={{ opacity: 1, y: 0 }}
             className="text-emerald-500 font-black text-sm uppercase tracking-widest mb-4 inline-block"
          >
            Our Ecosystem
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Every Corner, Covered.</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Beyond basic management. We provide a complete digital ecosystem for your neighborhood&apos;s complex needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {solutions.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/[0.02] group"
            >
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-500 transition-colors duration-500">
                <item.icon className="text-emerald-600 group-hover:text-white transition-colors duration-500" size={28} />
              </div>
              <h3 className="text-xl font-black mb-4 text-emerald-950">{item.title}</h3>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
