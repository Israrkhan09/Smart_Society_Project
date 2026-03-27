"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { label: "Active Visitors", target: 42, suffix: "" },
  { label: "Tasks Solved", target: 890, suffix: "+" },
  { label: "Amenities Used", target: 95, suffix: "%" },
  { label: "Security Health", target: 100, suffix: "%" },
];

export default function Stats() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 h-32" />;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <StatCard key={i} stat={stat} index={i} />
      ))}
    </div>
  );
}

function StatCard({ stat, index }: { stat: any; index: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = stat.target;
      const duration = 2000;
      let startTimestamp: number | null = null;

      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };

      window.requestAnimationFrame(step);
    }
  }, [isInView, stat.target]);

  return (
    <motion.div 
      ref={ref} 
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
    >
      <p className="text-gray-400 text-sm font-medium mb-1">{stat.label}</p>
      <div className="text-3xl font-black text-emerald-900 tracking-tight flex items-baseline gap-1">
        {count}
        <span className="text-lg font-bold text-emerald-500">{stat.suffix}</span>
      </div>
      <div className="mt-3 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
        <motion.div
           initial={{ width: 0 }}
           animate={isInView ? { width: '100%' } : {}}
           transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
           className="h-full bg-emerald-500 rounded-full"
        />
      </div>
    </motion.div>
  );
}
