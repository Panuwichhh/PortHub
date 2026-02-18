"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Rocket, Star } from 'lucide-react';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate particles only on client side
  const particles = mounted ? Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
    xOffset: Math.random() * 20 - 10,
  })) : [];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col font-sans text-black overflow-hidden">
      
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.05, 0.08, 0.05],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1d7cf2] rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-400 rounded-full blur-[100px]"
        />
        
        {/* Floating Particles - Only render on client */}
        {mounted && particles.map((particle) => (
          <motion.div
            key={particle.id}
            animate={{
              y: [0, -30, 0],
              x: [0, particle.xOffset, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
            className="absolute w-1 h-1 bg-[#1d7cf2] rounded-full"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
          />
        ))}
      </div>

      {/* Mouse Follow Effect */}
      {mounted && (
        <motion.div
          className="fixed w-96 h-96 bg-[#1d7cf2]/5 rounded-full blur-3xl pointer-events-none"
          animate={{
            x: mousePosition.x - 192,
            y: mousePosition.y - 192,
          }}
          transition={{
            type: "spring",
            stiffness: 50,
            damping: 30,
          }}
        />
      )}

      {/* Header / Navbar */}
      <nav className="z-10 w-full py-6 px-6 md:px-12 flex justify-between items-center bg-white/50 backdrop-blur-xl border-b border-white/50 sticky top-0 shadow-sm">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          className="text-2xl font-black tracking-tighter italic"
        >
          Port<span className="text-[#1d7cf2]">Hub</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-6"
        >
          {/* Sign In Button */}
          <Link 
            href="/login"
            className="text-sm font-bold hover:text-[#1d7cf2] transition-all hover:scale-110 uppercase tracking-widest cursor-pointer"
          >
            Sign In
          </Link>
          
          {/* Get Started Button */}
          <Link 
            href="/register"
            className="px-5 py-2 bg-gradient-to-r from-black to-gray-800 text-white text-[10px] font-black rounded-full hover:shadow-lg hover:scale-105 active:scale-95 transition-all uppercase tracking-widest inline-block"
          >
            Get Started
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <main className="z-10 flex-1 flex flex-col items-center justify-center px-4 text-center py-20 relative">
        
        {/* Floating Icons */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-[10%] text-[#1d7cf2] opacity-20"
        >
          <Rocket className="w-16 h-16" />
        </motion.div>
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-40 right-[15%] text-[#1d7cf2] opacity-20"
        >
          <Zap className="w-12 h-12" />
        </motion.div>
        <motion.div
          animate={{
            y: [0, -15, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-40 left-[20%] text-[#1d7cf2] opacity-20"
        >
          <Star className="w-10 h-10" />
        </motion.div>

        {/* Floating Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          className="mb-6 flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-full shadow-lg"
        >
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Sparkles className="w-4 h-4 text-[#1d7cf2]" />
          </motion.div>
          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Next Gen Portfolio Hub</span>
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <motion.h1 
            className="text-[18vw] md:text-[14rem] font-black tracking-tighter leading-[0.8] select-none"
            animate={{
              textShadow: [
                "0 0 20px rgba(29,124,242,0.3)",
                "0 0 40px rgba(29,124,242,0.5)",
                "0 0 20px rgba(29,124,242,0.3)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <span className="bg-gradient-to-r from-black via-[#1d7cf2] to-black bg-clip-text text-transparent">
              Port
            </span>
            <span className="text-[#1d7cf2]">Hub</span>
          </motion.h1>
          
          {/* Enhanced Shadow */}
          <motion.h1 
            className="absolute top-2 left-0 w-full text-[18vw] md:text-[14rem] font-black tracking-tighter leading-[0.8] select-none text-[#1d7cf2]/10 -z-10 blur-sm"
            animate={{
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            PortHub
          </motion.h1>

          {/* Sparkle Effects */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-[#1d7cf2] rounded-full"
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 2) * 60}%`,
              }}
            />
          ))}
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-sm md:text-xl font-bold tracking-[0.3em] uppercase text-gray-400"
        >
          <motion.span
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            Your Professional Digital Identity
          </motion.span>
        </motion.p>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex flex-wrap gap-3 justify-center"
        >
          {['Portfolio', 'Projects', 'Skills'].map((item, i) => (
            <motion.span
              key={item}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              whileHover={{ scale: 1.1, y: -2 }}
              className="px-4 py-2 bg-white/60 backdrop-blur-md border border-gray-200/50 rounded-full text-xs font-bold text-gray-600 shadow-sm"
            >
              {item}
            </motion.span>
          ))}
        </motion.div>

        {/* LET'S GO Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Link href="/dashboard">
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 30px 60px rgba(29,124,242,0.5)" }}
              whileTap={{ scale: 0.95 }}
              className="group relative mt-12 flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[#1d7cf2] to-blue-400 text-white text-xl font-black rounded-2xl shadow-[0_20px_40px_rgba(29,124,242,0.3)] transition-all uppercase tracking-tighter overflow-hidden"
            >
              {/* Button Glow Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <span className="relative z-10">LET'S GO</span>
              <motion.div
                className="relative z-10"
                animate={{
                  x: [0, 5, 0],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
              >
                <ArrowRight className="w-6 h-6" />
              </motion.div>
            </motion.button>
          </Link>
          
          {/* ข้อความเสริมใต้ปุ่ม */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-4 text-xs text-gray-400 font-medium"
          >
            เข้าชมแบบ Guest • ไม่ต้องสมัครสมาชิก
          </motion.p>
        </motion.div>

        {/* ✅ ลบส่วน Stats Section ออกแล้ว */}

      </main>

      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="z-10 py-10 text-center text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase"
      >
        © 2026 PortHub • Build with Passion
      </motion.footer>
    </div>
  );
}