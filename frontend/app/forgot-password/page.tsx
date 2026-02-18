"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleConfirmMail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      await authAPI.forgotPassword(email.trim());
      
      // บันทึกอีเมลไว้สำหรับหน้า verify
      sessionStorage.setItem('reset_email', email.trim());
      
      toast.success('OTP code has been sent to your email');
      router.push('/verify-email');
    } catch (error) {
      if (error instanceof Error) {
        const msg = error.message;
        if (msg.includes('ไม่พบอีเมล') || msg.includes('not found')) {
          setErrorMessage('This email is not registered. Please check or sign up.');
          toast.error('This email is not registered');
        } else {
          setErrorMessage(msg);
          toast.error(msg);
        }
      } else {
        setErrorMessage('Cannot connect to server. Please try again.');
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
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            className="absolute w-2 h-2 bg-[#1d7cf2] rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
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
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center pb-20 opacity-5 select-none pointer-events-none">
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

      {/* Enhanced Forgot Password Card */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px] p-4 z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white/80 backdrop-blur-2xl w-full max-w-[460px] p-12 rounded-3xl shadow-2xl border-2 border-white/60 text-center relative overflow-hidden"
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
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center shadow-xl"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-[#1d7cf2]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h2 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-black bg-gradient-to-r from-gray-900 via-[#1d7cf2] to-purple-500 bg-clip-text text-transparent mb-4 tracking-tight"
            >
              Forget password
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 text-sm font-semibold leading-relaxed mb-8 px-2"
            >
              Please write email to receive a confirmation code<br />
              to set a new password
            </motion.p>

            <form onSubmit={handleConfirmMail} className="space-y-6 text-left">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-[#1d7cf2] font-black text-sm mb-2 ml-1 uppercase tracking-wide">E-mail</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorMessage(""); }}
                  placeholder="your@email.com"
                  className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-[#1d7cf2] focus:ring-4 focus:ring-[#1d7cf2]/10 transition-all placeholder:text-gray-400 text-black shadow-lg font-semibold"
                  required
                />
                {errorMessage && (
                  <p className="mt-2 text-sm font-semibold text-red-500">
                    {errorMessage}
                  </p>
                )}
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-2"
              >
                <motion.button 
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative w-full py-4 bg-gradient-to-r from-[#1d7cf2] to-purple-500 text-white text-xl font-black rounded-2xl shadow-xl shadow-blue-300/40 hover:shadow-2xl hover:shadow-blue-400/50 transition-all uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: loading ? ['-200%', '200%'] : '-200%' }}
                    transition={{ duration: 1.5, repeat: loading ? Infinity : 0, ease: "linear" }}
                  />
                  <span className="relative z-10">{loading ? "Sending..." : "Confirm Mail"}</span>
                </motion.button>
              </motion.div>
            </form>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8"
            >
              <Link href="/login">
                <motion.span 
                  whileHover={{ x: -3 }}
                  className="text-xs font-black text-gray-500 hover:text-[#1d7cf2] cursor-pointer transition-colors uppercase tracking-wider inline-flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                  </svg>
                  Back to Sign in
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}