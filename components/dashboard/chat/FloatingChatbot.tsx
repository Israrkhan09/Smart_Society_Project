"use client";

import React, { useState } from "react";
import { Sparkles, X, MessageSquare, ShieldAlert, FileText, BellRing, Settings, HelpCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 z-[100] group flex items-center justify-center w-14 h-14 bg-slate-900 rounded-2xl shadow-2xl shadow-slate-900/40 border border-slate-700/50 hover:scale-105 active:scale-95 transition-all duration-300 ${isOpen ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-teal-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
        <Sparkles className="relative z-10 text-emerald-400 w-6 h-6 animate-pulse" />
      </button>

      {/* Full Panel Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-end justify-end pointer-events-none">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm pointer-events-auto transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Chatbot Panel */}
          <div className="relative w-full max-w-[440px] h-[calc(100vh-2rem)] m-4 bg-white rounded-3xl shadow-2xl flex flex-col pointer-events-auto border border-slate-100 overflow-hidden transform transition-all duration-500 ease-out translate-y-0 opacity-100">
            {/* Header */}
            <div className="flex-shrink-0 p-6 bg-slate-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-lg font-black uppercase tracking-wider">Engine AI</h2>
                  </div>
                  <p className="text-xs font-medium text-slate-400">Your intelligent neighborhood assistant</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-6 custom-scrollbar">
              {/* AI Message */}
              <div className="flex gap-3 max-w-[90%]">
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-700">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">
                    Good morning! I am Engine AI, your dedicated society assistant. How can I streamline your day?
                  </p>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button 
                  onClick={() => { setIsOpen(false); router.push('/dashboard/sos'); }}
                  className="flex flex-col items-center justify-center p-4 bg-rose-50 rounded-2xl border border-rose-100 hover:bg-rose-100 transition-colors gap-2 group"
                >
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-rose-500 group-hover:scale-110 transition-transform">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-600">Emergency SOS</span>
                </button>
                <button 
                  onClick={() => { setIsOpen(false); router.push('/dashboard/visitors'); }}
                  className="flex flex-col items-center justify-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-colors gap-2 group"
                >
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-600 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Visitor Pass</span>
                </button>
                <button 
                  onClick={() => { setIsOpen(false); router.push('/dashboard/complaints'); }}
                  className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-colors gap-2 group"
                >
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-500 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">Register Issue</span>
                </button>
                <button 
                  onClick={() => { setIsOpen(false); router.push('/dashboard/messages'); }}
                  className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-2xl border border-purple-100 hover:bg-purple-100 transition-colors gap-2 group"
                >
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-purple-500 group-hover:scale-110 transition-transform">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-600">Check Notices</span>
                </button>
              </div>

              {/* Suggestions List */}
              <div className="space-y-2 pt-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-3">AI Recommendations</p>
                {[
                  "How do I register a new vehicle?",
                  "What are the maintenance dues this month?",
                  "Contact building admin urgently",
                  "What are the current society rules?",
                  "Book clubhouse for an event"
                ].map((q, idx) => (
                  <button key={idx} className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-slate-300 transition-colors text-left group">
                    <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{q}</span>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 p-4 bg-white border-t border-slate-100">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  placeholder="Ask Engine AI anything..." 
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                />
                <button className="absolute right-2 w-8 h-8 flex items-center justify-center bg-slate-900 text-emerald-400 rounded-xl hover:bg-slate-800 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex justify-center mt-3 gap-4">
                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <ShieldAlert className="w-3 h-3" /> Secure & Private
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <Sparkles className="w-3 h-3" /> GPT-4 Powered
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1; 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8; 
        }
      `}</style>
    </>
  );
}
