"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Wrench, ShieldCheck, Siren, Calendar, Users, Bell } from "lucide-react";

const features = [
  {
    title: "Maintenance OS",
    description: "Submit and track maintenance requests with real-time updates and effortless scheduling.",
    icon: Wrench,
    color: "bg-blue-500",
  },
  {
    title: "Ironclad Security",
    description: "Advanced visitor management and 24/7 surveillance monitoring at your fingertips.",
    icon: ShieldCheck,
    color: "bg-emerald-500",
  },
  {
    title: "Instant SOS",
    description: "One-tap emergency assistance that notifies security and residents in seconds.",
    icon: Siren,
    color: "bg-red-500",
  },
];

export default function Features() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  return (
    <section ref={containerRef} className="py-30 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-20">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Engineered for Excellence
        </h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Every aspect of Smart-Society OS is crafted to provide a seamless, 
          luxurious living experience for every resident.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <FeatureCard key={index} feature={feature} index={index} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ feature, index }: { feature: any; index: number }) {
  const cardRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100 * (index + 1), -100 * (index + 1)]);

  return (
    <motion.div
      ref={cardRef}
      style={{ y }}
      className="glass-card p-10 rounded-[2.5rem] flex flex-col gap-6 group hover:translate-y-[-10px] transition-all duration-500"
    >
      <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center shadow-2xl shadow-black/10 text-white group-hover:scale-110 transition-transform duration-500`}>
        <feature.icon size={32} />
      </div>
      <div>
        <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
        <p className="text-gray-500 leading-relaxed">
          {feature.description}
        </p>
      </div>
      <button className="mt-4 text-emerald-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
        Learn more <span className="text-lg">→</span>
      </button>
    </motion.div>
  );
}
