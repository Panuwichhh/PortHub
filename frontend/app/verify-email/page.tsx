"use client";

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    const savedEmail = sessionStorage.getItem('reset_email');
    if (!savedEmail) {
      router.push('/forgot-password');
      return;
    }
    setEmail(savedEmail);

    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => clearInterval(interval);
  }, [timer, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (value.length === 1 && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !inputRefs[index].current?.value && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = inputRefs.map(ref => ref.current?.value).join('');
    
    if (otpCode.length < 4) {
      toast.error("Please enter all 4 digits", {
        duration: 3000,
        style: {
          borderRadius: '12px',
          background: '#ef4444',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 'bold',
        },
      });
      return;
    }

    setLoading(true);
    try {
      await authAPI.verifyOTP(email, otpCode);
      
      toast.success('Code verified successfully! 🎉', {
        duration: 2000,
        style: {
          borderRadius: '12px',
          background: '#10b981',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 'bold',
        },
      });
      router.push('/new-password');
    } catch (error) {
      // Clear input fields เมื่อใส่ผิด
      inputRefs.forEach(ref => {
        if (ref.current) ref.current.value = '';
      });
      inputRefs[0].current?.focus();
      
      if (error instanceof Error) {
        toast.error(error.message + ' Please try again.', {
          duration: 4000,
          style: {
            borderRadius: '12px',
            background: '#ef4444',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 'bold',
          },
        });
      } else {
        toast.error("Cannot connect to server", {
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#ef4444',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 'bold',
          },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      await authAPI.forgotPassword(email);
      
      setTimer(30);
      setCanResend(false);
      toast.success("New code has been sent to your email");
    } catch (error) {
      console.error("Resend OTP Error:", error);
      toast.error("Failed to resend code");
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
          className="relative text-2xl font-black tracking-tighter italic text-black group"
        >
          Port<span className="text-[#1d7cf2]">Hub</span>
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

      {/* Enhanced Verify Email Card */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px] p-4 z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white/80 backdrop-blur-2xl w-full max-w-[480px] p-12 rounded-3xl shadow-2xl border-2 border-white/60 text-center relative overflow-hidden"
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
                animate={{ 
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-[#1d7cf2]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
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
              Verify email address
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 text-sm font-semibold leading-relaxed mb-10"
            >
              Verification code send to:<br />
              <span className="text-[#1d7cf2] font-black">{email}</span>
            </motion.p>

            {/* OTP Input Fields */}
            <div className="flex justify-center gap-3 mb-10">
              {inputRefs.map((ref, index) => (
                <motion.input 
                  key={index}
                  ref={ref}
                  type="text"
                  maxLength={1}
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                  whileFocus={{ scale: 1.1, y: -5 }}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-16 h-20 md:w-18 md:h-24 bg-white border-2 border-gray-200 rounded-2xl text-center text-3xl font-black text-[#1d7cf2] focus:border-[#1d7cf2] focus:ring-4 focus:ring-[#1d7cf2]/20 transition-all outline-none shadow-lg"
                />
              ))}
            </div>

            {/* Confirm Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="pt-2"
            >
              <motion.button 
                onClick={handleVerifyOTP}
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
                <span className="relative z-10">{loading ? "Verifying..." : "Confirm Code"}</span>
              </motion.button>
            </motion.div>

            {/* Resend Section */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8"
            >
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Didn't receive code?{' '}
                {canResend ? (
                  <motion.button 
                    onClick={handleResend}
                    type="button"
                    whileHover={{ scale: 1.05, x: 3 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-[#1d7cf2] ml-1 hover:underline cursor-pointer font-black"
                  >
                    Resend
                  </motion.button>
                ) : (
                  <span className="ml-1 text-gray-400 font-black">
                    Resend in{' '}
                    <motion.span
                      key={timer}
                      initial={{ scale: 1.2, color: '#1d7cf2' }}
                      animate={{ scale: 1, color: '#9ca3af' }}
                      className="inline-block"
                    >
                      {timer}s
                    </motion.span>
                  </span>
                )}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}