"use client";

import React from "react";
import { motion } from "framer-motion";

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{title}</h1>
        <p className="text-gray-500 font-medium mt-2">This module is currently being optimized for the premium Smart-Society experience.</p>
        
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
             <div key={i} className="h-40 bg-gray-50 rounded-[2rem] border border-gray-100 border-dashed animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
