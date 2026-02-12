"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  // เพิ่ม State สำหรับเปิด/ปิดตา
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("สมัครสมาชิกสำเร็จ! 🎉");
        router.push('/login');
      } else {
        alert("เกิดข้อผิดพลาด: " + data.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("ไม่สามารถเชื่อมต่อกับ Server ได้");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f1f7ff] flex flex-col font-sans overflow-x-hidden">
      <nav className="w-full py-4 px-6 md:px-12 flex justify-between items-center bg-white/50 opacity-20 select-none">
        <div className="text-2xl font-black italic text-black">Port<span className="text-[#1d7cf2]">Hub</span></div>
        <div className="w-10 h-10 rounded-full border-2 border-[#1d7cf2]"></div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center opacity-5 select-none">
        <h1 className="text-[10vw] font-black text-black leading-none">Port<span className="text-[#1d7cf2]">Hub</span></h1>
      </main>

      <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/5 backdrop-blur-[2px] overflow-y-auto">
        <form onSubmit={handleSubmit} className="bg-white w-full max-w-[950px] my-8 p-8 md:p-12 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row gap-10 relative">
          
          <div className="flex-1 space-y-4">
            <h2 className="text-4xl font-black text-black mb-8">Register</h2>
            
            <div className="space-y-4 text-left">
              <InputGroup label="Username" placeholder="" value={username} onChange={(e: any) => setUsername(e.target.value)} />
              <InputGroup label="E-mail" placeholder="" value={email} onChange={(e: any) => setEmail(e.target.value)} />
              
              {/* ช่อง Password พร้อมไอคอนลูกตา */}
              <InputGroup 
                label="Password" 
                placeholder="" 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e: any) => setPassword(e.target.value)}
                isPassword={true}
                showPassword={showPassword}
                togglePassword={() => setShowPassword(!showPassword)}
              />
              
              <InputGroup label="Job Interest" placeholder="" />
            </div>

            <div className="pt-6 text-center md:text-left">
              <Link href="/login">
                <span className="text-[11px] font-extrabold text-[#1d7cf2] underline cursor-pointer italic hover:text-[#1565c0] transition-colors">
                  Already have account? Log in
                </span>
              </Link>
            </div>
          </div>

          <div className="hidden md:block w-[1.5px] bg-gray-100 self-stretch mt-12 mb-4"></div>

          <div className="flex-1 space-y-4 pt-0 md:pt-16">
            <div className="space-y-4 text-left">
              <InputGroup label="University" placeholder="" />
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Faculty" placeholder="" />
                <InputGroup label="Major" placeholder="" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="GPAX" placeholder="" />
                <InputGroup label="Phone" placeholder="" />
              </div>
              
              <div className="relative">
                <label className="block text-[#1d7cf2] font-extrabold text-sm mb-1 ml-1 uppercase tracking-tight">Skills</label>
                <div className="relative">
                  <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-[#1d7cf2]/20 transition-all bg-white" />
                  <button 
                    type="button" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full border-2 border-[#1d7cf2] text-[#1d7cf2] hover:bg-[#1d7cf2] hover:text-white transition-all active:scale-90 shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button type="submit" className="w-full py-3.5 bg-[#1d7cf2] text-white text-xl font-black rounded-xl shadow-[0_10px_20px_rgba(29,124,242,0.3)] hover:bg-[#1565c0] transition-all transform active:scale-95 uppercase tracking-wide">
                Sign Up
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ปรับปรุง InputGroup ให้รองรับไอคอนลูกตา
function InputGroup({ label, placeholder, type = "text", value, onChange, isPassword, showPassword, togglePassword }: any) {
  return (
    <div className="w-full">
      <label className="block text-[#1d7cf2] font-extrabold text-sm mb-1 ml-1 uppercase tracking-tight">{label}</label>
      <div className="relative">
        <input 
          required
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1d7cf2]/20 transition-all text-black bg-white"
        />
        {isPassword && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1d7cf2] transition-colors"
          >
            {showPassword ? (
              // ไอคอนเปิดตา
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            ) : (
              // ไอคอนปิดตา
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}