"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Hassan Abbas",
    role: "Property Manager",
    text: "Smart-Society OS has cut our administrative overhead by 40%. The visitor pass system is a game changer for our security team.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hassan",
  },
  {
    name: "Ayesha Malik",
    role: "Resident",
    text: "I love how easy it is to book the gym or submit a complaint. Everything is literally in my pocket now. A truly modern experience.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ayesha",
  },
  {
    name: "Zainab Rashid",
    role: "Society Board Member",
    text: "The financial transparency and automated utility tracking have brought a level of trust to our community that we never had before.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zainab",
  },
];

export default function TrustSection() {
  return (
    <section className="py-30 px-6 bg-emerald-950 relative overflow-hidden text-white">
      {/* Decorative Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-1 text-emerald-400 mb-6"
          >
            {[...Array(5)].map((_, i) => (
              <Star key={i} fill="currentColor" size={20} />
            ))}
            <span className="ml-3 font-black text-sm uppercase tracking-widest text-white/60">Trusted by 200+ Communities</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
             Why Smart-Society <span className="text-emerald-500 underline decoration-emerald-500/30 underline-offset-8">Wins.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] relative flex flex-col justify-between"
            >
              <Quote className="text-emerald-500/20 absolute top-8 right-8" size={32} />
              
              <p className="text-xl font-medium leading-relaxed mb-10 text-emerald-50/80">
                &quot;{t.text}&quot;
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 p-1 border border-emerald-500/30 overflow-hidden">
                   <img src={t.image} alt={t.name} className="w-full h-full" />
                </div>
                <div>
                  <h4 className="font-black text-lg">{t.name}</h4>
                  <p className="text-emerald-400/80 text-sm font-bold">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
