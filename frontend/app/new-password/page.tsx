"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';

export default function ConfirmPasswordPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState("");

  // 1. ดึง Email และป้องกันการเข้าหน้านี้โดยตรงโดยไม่มี Email
  useEffect(() => {
    const savedEmail = sessionStorage.getItem('reset_email');
    if (!savedEmail) {
      router.push('/forgot-password');
      return;
    }
    setEmail(savedEmail);
  }, [router]);

  // 2. ฟังก์ชันตรวจสอบความแข็งแรงรหัสผ่าน (UI Feedback)
  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return { label: "", color: "bg-gray-200", width: "0%" };
    if (pwd.length < 8) return { label: "Weak (Min. 8)", color: "bg-red-500", width: "33%" };
    if (pwd.match(/[A-Z]/) && pwd.match(/[0-9]/)) 
      return { label: "Strong", color: "bg-green-500", width: "100%" };
    return { label: "Medium", color: "bg-yellow-500", width: "66%" };
  };

  const strength = getPasswordStrength(formData.newPassword);
  const isMismatch = formData.confirmPassword !== "" && formData.newPassword !== formData.confirmPassword;

  // 3. ฟังก์ชันส่งข้อมูลไป Backend
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email, 
          password: formData.newPassword 
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        // ล้าง Session เพื่อความปลอดภัย
        sessionStorage.removeItem('reset_email');
        // หน่วงเวลาให้ User เห็นความสำเร็จก่อนไปหน้า Login
        setTimeout(() => router.push('/login'), 3000);
      } else {
        const data = await response.json();
        alert(data.error || "Reset password failed");
      }
    } catch (error) {
      alert("Connection error. Please check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // --- View: หน้าจอตอนทำสำเร็จ ---
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#f1f7ff] flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-[420px] p-10 rounded-[2.5rem] shadow-xl text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-black text-black mb-4">Done!</h2>
          <p className="text-gray-500 mb-8">Your password has been reset. We're taking you to the login page...</p>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#1d7cf2] h-full animate-progress-shrink"></div>
          </div>
        </div>
      </div>
    );
  }

  // --- View: หน้าจอปกติ ---
  return (
    <div className="relative min-h-screen bg-[#f1f7ff] flex flex-col font-sans overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1d7cf2]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1d7cf2]/5 rounded-full blur-3xl"></div>

      <nav className="w-full py-6 px-12 flex justify-between items-center z-10">
        <div className="text-2xl font-black tracking-tighter italic text-black select-none">
          Port<span className="text-[#1d7cf2]">Hub</span>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="bg-white w-full max-w-[420px] p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-white/50 relative">
          
          <button 
            onClick={() => router.back()}
            className="absolute left-8 top-10 text-gray-400 hover:text-black transition-colors"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex justify-center mb-6">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <Lock className="w-8 h-8 text-[#1d7cf2]" />
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-black mb-2 text-center tracking-tight">New password</h2>
          <p className="text-gray-400 text-sm text-center mb-8 px-4">Create a new password that you haven't used before.</p>
          
          <form onSubmit={handleUpdatePassword} className="space-y-5">
            {/* New Password */}
            <div className="relative">
              <label className="block text-[#1d7cf2] font-extrabold text-[10px] mb-1.5 ml-1 uppercase tracking-widest">New Password</label>
              <div className="relative">
                <input 
                  type={showPass ? "text" : "password"} 
                  placeholder="At least 8 characters"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  className="w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1d7cf2]/20 transition-all text-black shadow-sm"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#1d7cf2]"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Strength Meter */}
              {formData.newPassword && (
                <div className="mt-3 px-1 animate-in fade-in slide-in-from-top-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold uppercase text-gray-400 tracking-tighter">Password Strength: {strength.label}</span>
                  </div>
                  <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-700 ease-out ${strength.color}`} 
                      style={{ width: strength.width }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[#1d7cf2] font-extrabold text-[10px] mb-1.5 ml-1 uppercase tracking-widest">Confirm Password</label>
              <input 
                type={showPass ? "text" : "password"} 
                placeholder="Repeat your new password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className={`w-full px-5 py-3.5 rounded-xl border transition-all text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1d7cf2]/20 ${
                  isMismatch ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
                required
              />
              {isMismatch && (
                <p className="mt-2 text-[10px] font-bold text-red-500 ml-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full inline-block"></span>
                  Passwords do not match!
                </p>
              )}
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={loading || isMismatch || formData.newPassword.length < 8}
                className="w-full py-4 bg-[#1d7cf2] text-white text-lg font-black rounded-xl shadow-[0_10px_25px_rgba(29,124,242,0.3)] hover:bg-[#1565c0] transition-all transform active:scale-[0.97] uppercase tracking-widest disabled:bg-gray-200 disabled:shadow-none disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing</span>
                  </div>
                ) : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx global>{`
        @keyframes progress-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-progress-shrink {
          animation: progress-shrink 3s linear forwards;
        }
      `}</style>
    </div>
  );
}