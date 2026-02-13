"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#f1f7ff] flex flex-col font-sans text-black overflow-hidden">
      
      {/* 🌟 ลูกเล่นที่ 1: Animated Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1d7cf2]/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-400/10 rounded-full blur-[100px]" />

      {/* --- Header / Navbar --- */}
      <nav className="z-10 w-full py-6 px-6 md:px-12 flex justify-between items-center bg-white/30 backdrop-blur-md border-b border-white/20 sticky top-0">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-black tracking-tighter italic"
        >
          Port<span className="text-[#1d7cf2]">Hub</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-6"
        >
          <Link href="/login" className="text-sm font-bold hover:text-[#1d7cf2] transition-colors uppercase tracking-widest">Sign In</Link>
          <Link href="/register">
            <button className="px-5 py-2 bg-black text-white text-[10px] font-black rounded-full hover:bg-gray-800 transition-all uppercase tracking-widest">
              Get Started
            </button>
          </Link>
        </motion.div>
      </nav>

      {/* --- Hero Section --- */}
      <main className="z-10 flex-1 flex flex-col items-center justify-center px-4 text-center py-20 relative">
        
        {/* Floating Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-[#1d7cf2]" />
          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Next Gen Portfolio Hub</span>
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <h1 className="text-[18vw] md:text-[14rem] font-black tracking-tighter leading-[0.8] select-none text-black">
            Port<span className="text-[#1d7cf2]">Hub</span>
          </h1>
          {/* เงาสะท้อนสวยๆ */}
          <h1 className="absolute top-2 left-0 w-full text-[18vw] md:text-[14rem] font-black tracking-tighter leading-[0.8] select-none text-[#1d7cf2]/5 -z-10 blur-[2px]">
            PortHub
          </h1>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-sm md:text-xl font-bold tracking-[0.3em] uppercase text-gray-400"
        >
          Your Professional Digital Identity
        </motion.p>

        {/* 🌟 LET'S GO Button: แก้ไขให้ไปหน้า Dashboard ทันที 🌟 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link href="/dashboard"> {/* เปลี่ยนจุดหมายปลายทางเป็น /dashboard */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group mt-12 flex items-center gap-3 px-10 py-4 bg-[#1d7cf2] text-white text-xl font-black rounded-2xl shadow-[0_20px_40px_rgba(29,124,242,0.3)] hover:shadow-[0_25px_50px_rgba(29,124,242,0.4)] transition-all uppercase tracking-tighter"
            >
              LET'S GO
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>

      </main>

      <footer className="z-10 py-10 text-center text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
        © 2026 PortHub • Build with Passion
      </footer>
    </div>
  );
}