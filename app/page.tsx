"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import SolutionsSection from "@/components/SolutionsSection";
import LifestyleSection from "@/components/LifestyleSection";
import TrustSection from "@/components/TrustSection";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="relative min-h-screen bg-[#FAFAFA]">
      <Navbar />
      
      <div id="overview">
        <Hero />
      </div>

      <div id="features" className="bg-white">
        <Features />
      </div>

      <SolutionsSection />
      
      <LifestyleSection />

      <TrustSection />

      <footer className="py-30 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col gap-4 max-w-xs text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg shadow-lg shadow-emerald-500/20" />
              <span className="text-2xl font-black tracking-tighter">SmartSociety<span className="text-emerald-500">OS</span></span>
            </div>
            <p className="text-gray-400 font-medium text-sm leading-relaxed">
              Elevating community living through digital-first infrastructure.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-12 text-center md:text-left justify-center md:justify-end">
            <div className="flex flex-col gap-4">
              <span className="font-black text-xs uppercase tracking-widest text-emerald-900">Platform</span>
              <div className="flex flex-col gap-2">
                <a href="#features" className="text-gray-500 hover:text-emerald-600 transition-colors font-semibold text-sm">Features</a>
                <a href="#solutions" className="text-gray-500 hover:text-emerald-600 transition-colors font-semibold text-sm">Solutions</a>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-black text-xs uppercase tracking-widest text-emerald-900">Legal</span>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-gray-500 hover:text-emerald-600 transition-colors font-semibold text-sm">Privacy</a>
                <a href="#" className="text-gray-500 hover:text-emerald-600 transition-colors font-semibold text-sm">Terms</a>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-black text-xs uppercase tracking-widest text-emerald-900">Company</span>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-gray-500 hover:text-emerald-600 transition-colors font-semibold text-sm">About</a>
                <a href="#" className="text-gray-500 hover:text-emerald-600 transition-colors font-semibold text-sm">Contact</a>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-20 flex flex-col items-center gap-4">
          <div className="w-full h-px bg-gray-100" />
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest">
            © 2026 Smart-Society Technologies. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
