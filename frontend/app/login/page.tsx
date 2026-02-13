"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// --- เพิ่ม Import toast ---
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedEmail = localStorage.getItem('remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (rememberMe) {
          localStorage.setItem('remember_email', email);
        } else {
          localStorage.removeItem('remember_email');
        }
        localStorage.setItem('token', data.token);
        
        // --- แสดงแจ้งเตือนสำเร็จ ---
        toast.success('ยินดีต้อนรับกลับมา!');
        router.push('/dashboard');
      } else {
        // --- ตรวจสอบเงื่อนไข Error ---
        if (data.error && data.error.includes("ไม่พบอีเมล")) {
          setShowPopup(true);
        } else {
          // --- ใช้ toast แสดง Error รหัสผ่านผิดแบบสวยๆ ---
          toast.error(data.error || "อีเมลหรือรหัสผ่านไม่ถูกต้อง", {
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
      }
    } catch (error) {
      toast.error("เชื่อมต่อ Server ไม่ได้ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f1f7ff] flex flex-col font-sans overflow-hidden">
      
      {/* --- วาง Toaster ไว้บนสุดของ Container หลัก เพื่อให้ Pop-up แสดงผลได้ --- */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* --- โค้ดส่วน UI เดิมของนาย (ตัดมาเฉพาะส่วนสำคัญ) --- */}
      <nav className="w-full py-4 px-6 md:px-12 flex justify-between items-center bg-white/50 border-b border-gray-100 opacity-30 select-none">
        <div className="text-2xl font-black tracking-tighter italic text-black">Port<span className="text-[#1d7cf2]">Hub</span></div>
        <div className="w-10 h-10 rounded-full border-2 border-[#1d7cf2] flex items-center justify-center text-[#1d7cf2]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center pb-20 opacity-10 select-none">
        <h1 className="text-[15vw] md:text-[14rem] font-black tracking-tighter leading-none text-black">Port<span className="text-[#1d7cf2]">Hub</span></h1>
      </main>

      <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px] p-4">
        <div className="bg-white w-full max-w-[400px] p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white">
          <h2 className="text-4xl font-black text-center mb-8 text-black tracking-tight">Sign in</h2>
          
          <form onSubmit={handleLogin} className="space-y-5 text-left">
            <div>
              <label className="block text-[#1d7cf2] font-extrabold text-sm mb-1.5 ml-1 uppercase">E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1d7cf2]/20 transition-all text-black shadow-sm font-medium" required />
            </div>

            <div>
              <label className="block text-[#1d7cf2] font-extrabold text-sm mb-1.5 ml-1 uppercase">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1d7cf2]/20 transition-all text-black shadow-sm font-medium" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1d7cf2]">
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                  )}
                </button>
              </div>
              <div className="flex justify-between items-center mt-2 px-1">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-3.5 h-3.5 rounded border-gray-300 text-[#1d7cf2] focus:ring-[#1d7cf2]" />
                  <span className="text-[10px] font-bold text-[#1d7cf2] uppercase tracking-tight">Remember me</span>
                </label>
                <Link href="/forgot-password"><span className="text-[#1d7cf2] text-[10px] font-bold hover:underline cursor-pointer italic">Forget password?</span></Link>
              </div>
            </div>

            <div className="block pt-2">
              <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#1d7cf2] text-white text-xl font-black rounded-xl shadow-[0_8px_20px_rgba(29,124,242,0.3)] hover:bg-[#1565c0] transition-all transform active:scale-95 uppercase tracking-wide">
                {loading ? "Checking..." : "Sign in"}
              </button>
              <div className="text-center">
                <p className="text-sm text-gray-400 mt-2">Don't have an account? <Link href="/register" className="text-[#1d7cf2] hover:underline">Register</Link></p>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* --- Popup Modal "ไม่พบบัญชี" (คงเดิมไว้) --- */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
           {/* ... โค้ดเดิมของนาย ... */}
           <div className="bg-white w-full max-w-sm p-8 rounded-[2rem] shadow-2xl text-center">
            <div className="w-16 h-16 bg-blue-50 text-[#1d7cf2] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-black mb-2">ไม่พบบัญชีในระบบ</h3>
            <p className="text-sm text-gray-600 mb-6">ดูเหมือนว่าคุณยังไม่ได้เป็นสมาชิกกับเรา <br/>สมัครสมาชิกตอนนี้เพื่อเริ่มต้นใช้งาน</p>
            <div className="flex flex-col space-y-3">
              <Link href="/register" className="w-full py-3 bg-[#1d7cf2] text-white font-bold rounded-xl hover:bg-[#1565c0] transition-colors">
                สมัครสมาชิกใหม่
              </Link>
              <button onClick={() => setShowPopup(false)} className="w-full py-3 text-gray-400 font-bold hover:text-black transition-colors">
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}