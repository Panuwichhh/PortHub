"use client";

import React from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen bg-[#f1f7ff] flex flex-col font-sans overflow-x-hidden">
      
      {/* --- พื้นหลังจำลอง (Navbar & Hero) เพื่อให้ดูเหมือน Overlay --- */}
      <nav className="w-full py-4 px-6 md:px-12 flex justify-between items-center bg-white/50 opacity-20 select-none">
        <div className="text-2xl font-black italic text-black">
          Port<span className="text-[#1d7cf2]">Hub</span>
        </div>
        <div className="w-10 h-10 rounded-full border-2 border-[#1d7cf2]"></div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center opacity-5 select-none">
        <h1 className="text-[10vw] font-black text-black leading-none">
          Port<span className="text-[#1d7cf2]">Hub</span>
        </h1>
      </main>

      {/* --- Register Card (The Main Content) --- */}
      <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/5 backdrop-blur-[2px] overflow-y-auto">
        <div className="bg-white w-full max-w-[950px] my-8 p-8 md:p-12 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row gap-10 relative">
          
          {/* ฝั่งซ้าย: ข้อมูลพื้นฐาน */}
          <div className="flex-1 space-y-4">
            <h2 className="text-4xl font-black text-black mb-8">Register</h2>
            
            <div className="space-y-4 text-left">
              <InputGroup label="Username" placeholder="" />
              <InputGroup label="E-mail" placeholder="" />
              <InputGroup label="Password" placeholder="" type="password" />
              <InputGroup label="Job Interest" placeholder="" />
            </div>

            <div className="pt-6 text-center md:text-left">
              <Link href="/login">
                <span className="text-[11px] font-extrabold text-[#1d7cf2] underline cursor-pointer italic hover:text-[#1565c0] transition-colors">
                  Already have auccount? Log in
                </span>
              </Link>
            </div>
          </div>

          {/* เส้นแบ่งกลาง (แสดงเฉพาะหน้าจอใหญ่ md ขึ้นไป) */}
          <div className="hidden md:block w-[1.5px] bg-gray-100 self-stretch mt-12 mb-4"></div>

          {/* ฝั่งขวา: ข้อมูลการศึกษา/ทักษะ */}
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

              {/* ช่อง Skills พร้อมปุ่มบวกวงกลม */}
              <div className="relative">
                <label className="block text-[#1d7cf2] font-extrabold text-sm mb-1 ml-1 uppercase tracking-tight">Skills</label>
                <div className="relative">
                  <input 
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1d7cf2]/20 text-black transition-all" 
                  />
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

            {/* ปุ่ม Sign Up */}
            <div className="pt-8">
              <button className="w-full py-3.5 bg-[#1d7cf2] text-white text-xl font-black rounded-xl shadow-[0_10px_20px_rgba(29,124,242,0.3)] hover:bg-[#1565c0] transition-all transform active:scale-95 uppercase tracking-wide">
                Sign Up
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Reusable Component สำหรับช่อง Input เพื่อลดการเขียนซ้ำ
function InputGroup({ label, placeholder, type = "text" }: { label: string, placeholder: string, type?: string }) {
  return (
    <div className="w-full">
      <label className="block text-[#1d7cf2] font-extrabold text-sm mb-1 ml-1 uppercase tracking-tight">{label}</label>
      <input 
        type={type}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1d7cf2]/20 transition-all text-black bg-white"
      />
    </div>
  );
}