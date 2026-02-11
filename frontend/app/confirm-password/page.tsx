"use client";

import React from 'react';
import Link from 'next/link';

export default function ConfirmPasswordPage() {
  return (
    <div className="relative min-h-screen bg-[#f1f7ff] flex flex-col font-sans overflow-hidden">
      
      {/* --- ส่วนพื้นหลังจำลอง (Navbar & Hero) --- */}
      <nav className="w-full py-4 px-6 md:px-12 flex justify-between items-center bg-white/50 border-b border-gray-100 opacity-30 select-none">
        <div className="text-2xl font-black tracking-tighter italic text-black">
          Port<span className="text-[#1d7cf2]">Hub</span>
        </div>
        <div className="w-10 h-10 rounded-full border-2 border-[#1d7cf2] flex items-center justify-center text-[#1d7cf2]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center pb-20 opacity-10 select-none">
        <h1 className="text-[15vw] md:text-[14rem] font-black tracking-tighter leading-none text-black">
          Port<span className="text-[#1d7cf2]">Hub</span>
        </h1>
        <p className="mt-4 text-lg md:text-2xl font-medium tracking-[0.2em] text-black uppercase">
          Your Professional Hub
        </p>
      </main>

      {/* --- New Password Card (Overlay) --- */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px] p-4">
        <div className="bg-white w-full max-w-[420px] p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white text-center">
          
          <h2 className="text-3xl font-black text-black mb-10 tracking-tight">New password</h2>
          
          <form className="space-y-6 text-left">
            <div>
              <label className="block text-[#1d7cf2] font-extrabold text-sm mb-2 ml-1">New Password</label>
              <input 
                type="password" 
                placeholder="New Password"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1d7cf2]/20 transition-all placeholder:text-gray-300 text-black shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[#1d7cf2] font-extrabold text-sm mb-2 ml-1">Confirm Password</label>
              <input 
                type="password" 
                placeholder="Confirm Password"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1d7cf2]/20 transition-all placeholder:text-gray-300 text-black shadow-sm"
              />
            </div>

            <div className="pt-4">
              {/* เมื่อเปลี่ยนรหัสสำเร็จ ปกติจะส่งกลับไปหน้า Login */}
              <Link href="/login">
                <button 
                  type="button"
                  className="w-full py-3.5 bg-[#1d7cf2] text-white text-lg font-black rounded-xl shadow-[0_8px_20px_rgba(29,124,242,0.3)] hover:bg-[#1565c0] transition-all transform active:scale-95 uppercase tracking-wide"
                >
                  Confirm Password
                </button>
              </Link>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}