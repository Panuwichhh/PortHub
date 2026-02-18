"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { authAPI, tokenManager } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();

  const [particlePositions, setParticlePositions] = useState<Array<{ top: number; left: number; xOffset: number }>>([]);

  useEffect(() => {
    if (tokenManager.hasToken()) {
      router.push('/dashboard');
    }

    setParticlePositions(
      Array(6).fill(0).map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        xOffset: Math.random() * 20 - 10,
      }))
    );
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter Email and Password');
      return;
    }

    setLoading(true);

    try {
      const data = await authAPI.login({
        email: email.trim(),
        password: password,
      });

      // บันทึก token
      tokenManager.setToken(data.token);
      
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("ไม่พบอีเมล")) {
          setShowPopup(true);
        } else {
          toast.error(error.message, {
            style: {
              borderRadius: '12px',
              background: '#333',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 'bold',
            },
            duration: 3000,
          });
        }
      } else {
        toast.error("Cannot connect to server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#f0f7ff] via-white to-[#fef3ff] flex flex-col font-sans overflow-hidden">
      
      <Toaster position="top-center" reverseOrder={false} />

      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
            opacity: [0.03, 0.06, 0.03],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-1/3 -right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#1d7cf2] to-blue-300 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            rotate: [0, -180, -360],
            opacity: [0.03, 0.07, 0.03],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-1/3 -left-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-purple-300 to-pink-200 rounded-full blur-[150px]"
        />

        {/* Floating Particles */}
        {particlePositions.map((pos, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              x: [0, pos.xOffset, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            className="absolute w-2 h-2 bg-[#1d7cf2] rounded-full"
            style={{
              top: `${pos.top}%`,
              left: `${pos.left}%`,
            }}
          />
        ))}
      </div>

      {/* Enhanced Navbar */}
      <nav className="w-full py-5 px-6 md:px-12 flex justify-between items-center bg-white/60 backdrop-blur-xl border-b border-white/40 opacity-40 select-none shadow-lg shadow-blue-100/20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative text-2xl font-black tracking-tighter italic text-black group cursor-pointer"
        >
          Port<span className="text-[#1d7cf2] group-hover:text-purple-500 transition-colors">Hub</span>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#1d7cf2]/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-12 h-12 rounded-2xl border-2 border-[#1d7cf2] bg-gradient-to-br from-[#1d7cf2]/10 to-purple-500/10 flex items-center justify-center text-[#1d7cf2] backdrop-blur-xl shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </motion.div>
      </nav>

      {/* Background Text */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center pb-20 opacity-5 select-none pointer-events-none relative">
        <motion.h1 
          animate={{
            scale: [1, 1.02, 1],
            opacity: [0.05, 0.08, 0.05],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
          className="text-[15vw] md:text-[14rem] font-black tracking-tighter leading-none text-black"
        >
          Port<span className="text-[#1d7cf2]">Hub</span>
        </motion.h1>
      </main>

      {/* Enhanced Login Form */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px] p-4 z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white/80 backdrop-blur-2xl w-full max-w-[440px] p-12 rounded-3xl shadow-2xl border-2 border-white/60 relative overflow-hidden"
        >
          {/* Decorative Elements */}
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-[#1d7cf2]/10 to-purple-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              rotate: [360, 0],
              scale: [1, 1.3, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-12 -left-12 w-32 h-32 bg-gradient-to-tr from-pink-500/10 to-orange-500/10 rounded-full blur-2xl"
          />

          <div className="relative z-10">
            {/* ✅ แก้ตรงนี้ - เปลี่ยนจาก bg-clip-text เป็น gradient ธรรมดา */}
            <motion.h2 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl font-black text-center mb-10 tracking-tight"
              style={{
                background: 'linear-gradient(to right, #1a1a1a, #1d7cf2, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                paddingBottom: '4px', // เพิ่ม padding เพื่อไม่ให้ตัดล่าง
              }}
            >
              Sign in
            </motion.h2>
            
            <form onSubmit={handleLogin} className="space-y-6 text-left" autoComplete="off">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-[#1d7cf2] font-black text-sm mb-2 ml-1 uppercase tracking-wide">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-[#1d7cf2] focus:ring-4 focus:ring-[#1d7cf2]/10 transition-all text-black shadow-lg font-semibold placeholder:text-gray-400"
                  autoComplete="off"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-[#1d7cf2] font-black text-sm mb-2 ml-1 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-[#1d7cf2] focus:ring-4 focus:ring-[#1d7cf2]/10 transition-all text-black shadow-lg font-semibold placeholder:text-gray-400"
                    autoComplete="off"
                    required
                  />
                  <motion.button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1d7cf2] transition-colors"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </motion.button>
                </div>
                <div className="flex justify-end items-center mt-3 px-1">
                  <Link href="/forgot-password">
                    <motion.span 
                      whileHover={{ x: 3 }}
                      className="text-[#1d7cf2] text-xs font-bold hover:underline cursor-pointer italic"
                    >
                      Forget password?
                    </motion.span>
                  </Link>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-2"
              >
                <motion.button 
                  type="submit" 
                  disabled={loading}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative w-full py-4 bg-gradient-to-r from-[#1d7cf2] to-purple-500 text-white text-xl font-black rounded-2xl shadow-xl shadow-blue-300/40 hover:shadow-2xl hover:shadow-blue-400/50 transition-all uppercase tracking-wide overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: loading ? ['-200%', '200%'] : '-200%' }}
                    transition={{ duration: 1.5, repeat: loading ? Infinity : 0, ease: "linear" }}
                  />
                  <span className="relative z-10">{loading ? "Checking..." : "Sign in"}</span>
                </motion.button>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center mt-4"
                >
                  <p className="text-sm text-gray-500 font-semibold">
                    Don't have an account?{' '}
                    <Link href="/register">
                      <motion.span 
                        whileHover={{ x: 3 }}
                        className="text-[#1d7cf2] font-black hover:underline inline-block"
                      >
                        Register
                      </motion.span>
                    </Link>
                  </p>
                </motion.div>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Popup Modal */}
      <AnimatePresence>
        {showPopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-lg"
            onClick={() => setShowPopup(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/90 backdrop-blur-2xl w-full max-w-md p-10 rounded-3xl shadow-2xl text-center relative overflow-hidden border-2 border-white/60"
            >
              {/* Decorative Elements */}
              <motion.div
                animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#1d7cf2]/10 to-purple-500/10 rounded-full blur-3xl"
              />

              <div className="relative z-10">
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-20 h-20 bg-gradient-to-r from-blue-50 to-purple-50 text-[#1d7cf2] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                  </svg>
                </motion.div>

                <motion.h3 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl font-black text-gray-900 mb-3"
                >
                  Account not found
                </motion.h3>
                
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-gray-600 font-semibold mb-8 leading-relaxed"
                >
                  It looks like you&apos;re not a member yet.<br/>
                  Sign up now to get started.
                </motion.p>

                <div className="flex flex-col space-y-3">
                  <Link href="/register">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative w-full py-4 bg-gradient-to-r from-[#1d7cf2] to-purple-500 text-white font-black rounded-2xl shadow-xl shadow-blue-300/40 transition-all overflow-hidden group"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-200%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                      <span className="relative z-10">Sign up</span>
                    </motion.button>
                  </Link>
                  
                  <motion.button 
                    onClick={() => setShowPopup(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-4 text-gray-500 font-black hover:text-gray-900 transition-colors rounded-2xl hover:bg-gray-100"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}