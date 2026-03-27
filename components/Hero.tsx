"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading Reveal
      gsap.fromTo(
        ".char",
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.05,
          duration: 1.2,
          ease: "expo.out",
          delay: 0.5,
        }
      );

      // Parallax Mockup
      gsap.to(mockupRef.current, {
        y: -100,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, containerRef); // Scoped to containerRef

    return () => ctx.revert();
  }, []);

  const title = "The Future of Neighborhoods";

  return (
    <section
      ref={containerRef}
      className="relative min-h-[140vh] flex flex-col items-center pt-40 px-6 overflow-hidden"
    >
      {/* Background Shapes */}
      <div className="absolute top-20 left-[-10%] w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-3xl -z-10 animate-float" />
      <div className="absolute top-80 right-[-10%] w-[400px] h-[400px] bg-emerald-200/20 rounded-full blur-3xl -z-10" style={{ animation: 'float 8s ease-in-out infinite reverse' }} />

      <h1
        ref={headingRef}
        className="text-6xl md:text-8xl font-black text-center max-w-5xl leading-[0.9] tracking-tighter"
      >
        {title.split(" ").map((word, i) => (
          <span key={i} className="inline-block overflow-hidden mr-4 last:mr-0">
             {word.split("").map((char, j) => (
               <span key={j} className="char inline-block">{char}</span>
             ))}
          </span>
        ))}
      </h1>

      <p className="mt-8 text-xl text-gray-500 text-center max-w-2xl font-medium">
        Elevate your community experience with a premium, all-in-one operating system designed for the modern lifestyle.
      </p>

      <div className="mt-12 flex gap-4">
        <button className="bg-emerald-500 text-white px-8 py-4 rounded-full text-lg font-bold shadow-2xl shadow-emerald-500/30 hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95">
          Join the Evolution
        </button>
        <button className="bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-full text-lg font-bold shadow-sm hover:bg-gray-50 transition-all">
          View Demo
        </button>
      </div>

      <div
        ref={mockupRef}
        className="mt-24 relative w-full max-w-6xl aspect-[16/9] bg-white rounded-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-gray-100 p-4 ring-1 ring-black/5 overflow-hidden"
      >
        <div className="w-full h-full bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-50/50 to-transparent" />
          
          {/* Mockup UI Elements */}
          <div className="w-4/5 h-4/5 glass-card rounded-2xl shadow-2xl p-8 flex flex-col gap-6 scale-110">
            <div className="flex items-center justify-between">
              <div className="h-6 w-32 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex gap-2">
                 <div className="w-8 h-8 rounded-lg bg-emerald-100" />
                 <div className="w-8 h-8 rounded-lg bg-emerald-100" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 h-full">
              <div className="col-span-2 bg-emerald-50/50 rounded-xl" />
              <div className="bg-white border border-gray-100 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
