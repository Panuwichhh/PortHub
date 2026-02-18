"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ConfirmPasswordPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const savedEmail = sessionStorage.getItem('reset_email');
    if (!savedEmail) {
      router.push('/forgot-password');
      return;
    }
    setEmail(savedEmail);
  }, [router]);

  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return { label: "", color: "bg-gray-200", width: "0%" };
    if (pwd.length < 8) return { label: "Weak (Min. 8)", color: "bg-red-500", width: "33%" };
    if (pwd.match(/[A-Z]/) && pwd.match(/[0-9]/)) 
      return { label: "Strong", color: "bg-green-500", width: "100%" };
    return { label: "Medium", color: "bg-yellow-500", width: "66%" };
  };

  const strength = getPasswordStrength(formData.newPassword);
  const isMismatch = formData.confirmPassword !== "" && formData.newPassword !== formData.confirmPassword;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(email, formData.newPassword);
      
      setIsSuccess(true);
      sessionStorage.removeItem('reset_email');
      toast.success('Password changed successfully!');
      
      setTimeout(() => router.push('/login'), 3000);
    } catch (error) {
      console.error("Reset Password Error:", error);
      
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Success View
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f7ff] via-white to-[#fef3ff] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.03, 0.06, 0.03],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-0 right-0 w-96 h-96 bg-green-400 rounded-full blur-[150px]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white/80 backdrop-blur-2xl w-full max-w-[460px] p-12 rounded-3xl shadow-2xl text-center relative overflow-hidden border-2 border-white/60"
        >
          {/* Confetti Effect */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -20 }}
              animate={{ 
                opacity: [0, 1, 0],
                y: [0, 100],
                x: [0, (i - 3) * 30]
              }}
              transition={{ 
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 1
              }}
              className="absolute w-2 h-2 bg-green-400 rounded-full"
              style={{ top: '20%', left: '50%' }}
            />
          ))}

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-24 h-24 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </motion.div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent mb-4"
          >
            Done!
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 font-semibold mb-8"
          >
            Your password has been reset.<br/>We're taking you to the login page...
          </motion.p>

          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 3, ease: "linear" }}
              className="bg-gradient-to-r from-green-500 to-emerald-400 h-full"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  // Main Form View
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#f0f7ff] via-white to-[#fef3ff] flex flex-col font-sans overflow-hidden">
      
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
            opacity: [0.03, 0.06, 0.03],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/3 -right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#1d7cf2] to-blue-300 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            rotate: [0, -180, -360],
            opacity: [0.03, 0.07, 0.03],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/3 -left-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-purple-300 to-pink-200 rounded-full blur-[150px]"
        />
      </div>

      {/* Navbar */}
      <nav className="w-full py-6 px-12 flex justify-between items-center z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-black tracking-tighter italic text-black select-none relative group"
        >
          Port<span className="text-[#1d7cf2]">Hub</span>
        </motion.div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white/80 backdrop-blur-2xl w-full max-w-[480px] p-12 rounded-3xl shadow-2xl border-2 border-white/60 relative overflow-hidden"
        >
          {/* Decorative Elements */}
          <motion.div
            animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-[#1d7cf2]/10 to-purple-500/10 rounded-full blur-3xl"
          />

          <div className="relative z-10">
            {/* Back Button */}
            <motion.button 
              onClick={() => router.back()}
              whileHover={{ x: -3, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute -left-2 -top-2 text-gray-400 hover:text-[#1d7cf2] transition-colors"
            >
              <ArrowLeft size={22} />
            </motion.button>

            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-xl">
                <Lock className="w-8 h-8 text-[#1d7cf2]" />
              </div>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-black bg-gradient-to-r from-gray-900 via-[#1d7cf2] to-purple-500 bg-clip-text text-transparent mb-2 text-center tracking-tight"
            >
              New password
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 text-sm text-center mb-8 px-4 font-semibold"
            >
              Create a new password that you haven't used before.
            </motion.p>
            
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              {/* New Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="relative"
              >
                <label className="block text-[#1d7cf2] font-black text-xs mb-2 ml-1 uppercase tracking-wide">New Password</label>
                <div className="relative">
                  <input 
                    type={showPass ? "text" : "password"} 
                    placeholder="At least 8 characters"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-[#1d7cf2] focus:ring-4 focus:ring-[#1d7cf2]/10 transition-all text-black shadow-lg font-semibold placeholder:text-gray-400"
                    required
                  />
                  <motion.button 
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1d7cf2] transition-colors"
                  >
                    {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                  </motion.button>
                </div>
                
                {/* Strength Meter */}
                <AnimatePresence>
                  {formData.newPassword && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 px-1"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold uppercase text-gray-500">
                          Password Strength: <span className="text-[#1d7cf2]">{strength.label}</span>
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: "0%" }}
                          animate={{ width: strength.width }}
                          transition={{ duration: 0.5 }}
                          className={`h-full ${strength.color}`}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Confirm Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-[#1d7cf2] font-black text-xs mb-2 ml-1 uppercase tracking-wide">Confirm Password</label>
                <input 
                  type={showPass ? "text" : "password"} 
                  placeholder="Repeat your new password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className={`w-full px-5 py-3.5 rounded-2xl border-2 transition-all text-black shadow-lg font-semibold placeholder:text-gray-400 focus:outline-none focus:ring-4 ${
                    isMismatch 
                      ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100" 
                      : "border-gray-200 focus:border-[#1d7cf2] focus:ring-[#1d7cf2]/10"
                  }`}
                  required
                />
                <AnimatePresence>
                  {isMismatch && (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="mt-2 text-xs font-bold text-red-500 ml-1 flex items-center gap-2"
                    >
                      <motion.span
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="w-1.5 h-1.5 bg-red-500 rounded-full"
                      />
                      Passwords do not match!
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="pt-4"
              >
                <motion.button 
                  type="submit"
                  disabled={loading || isMismatch || formData.newPassword.length < 8}
                  whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -2 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="relative w-full py-4 bg-gradient-to-r from-[#1d7cf2] to-purple-500 text-white text-xl font-black rounded-2xl shadow-xl shadow-blue-300/40 hover:shadow-2xl hover:shadow-blue-400/50 transition-all uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: loading ? ['-200%', '200%'] : '-200%' }}
                    transition={{ duration: 1.5, repeat: loading ? Infinity : 0, ease: "linear" }}
                  />
                  {loading ? (
                    <span className="flex items-center justify-center gap-3 relative z-10">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Processing
                    </span>
                  ) : (
                    <span className="relative z-10">Update Password</span>
                  )}
                </motion.button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}