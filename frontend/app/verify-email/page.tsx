"use client";

import React, { useRef } from 'react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  // สร้าง Array ของ Ref เพื่ออ้างอิงถึงช่อง Input ทั้ง 4 ช่อง
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // ฟังก์ชันจัดการการพิมพ์
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    
    // ถ้ามีการกรอกตัวเลข และไม่ใช่ช่องสุดท้าย ให้กระโดดไปช่องถัดไป
    if (value.length === 1 && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  // ฟังก์ชันจัดการการกดปุ่ม (เช่น Backspace)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // ถ้ากด Backspace และช่องปัจจุบันว่างอยู่ (และไม่ใช่ช่องแรก) ให้ย้อนไปช่องก่อนหน้า
    if (e.key === 'Backspace' && !inputRefs[index].current?.value && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f1f7ff] flex flex-col font-sans overflow-hidden">
      
      {/* --- ส่วนพื้นหลังจำลอง --- */}
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

      {/* --- Verify Email Card (Overlay) --- */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px] p-4">
        <div className="bg-white w-full max-w-[420px] p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white text-center">
          
          <h2 className="text-3xl font-black text-black mb-4 tracking-tight">Verify email address</h2>
          
          <p className="text-gray-400 text-[11px] font-bold leading-relaxed mb-8 italic">
            Verification code send to :<br />
            <span className="text-gray-400/80">test1@gmail.com</span>
          </p>

          {/* ช่องกรอกรหัส 4 หลักพร้อม Logic Auto-focus */}
          <div className="flex justify-center gap-3 mb-10">
            {inputRefs.map((ref, index) => (
              <input 
                key={index}
                ref={ref}
                type="text"
                maxLength={1}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-14 h-16 md:w-16 md:h-20 bg-gray-100 border-none rounded-2xl text-center text-2xl font-black text-black focus:ring-2 focus:ring-[#1d7cf2]/30 focus:bg-white transition-all outline-none"
              />
            ))}
          </div>

          <div className="pt-2">
            <Link href="/confirm-password">
              <button 
                type="button"
                className="w-full py-3.5 bg-[#1d7cf2] text-white text-lg font-black rounded-xl shadow-[0_8px_20px_rgba(29,124,242,0.3)] hover:bg-[#1565c0] transition-all transform active:scale-95 uppercase tracking-wide"
              >
                Confirm Code
              </button>
            </Link>
          </div>

          <div className="mt-8">
            <p className="text-[10px] font-bold text-gray-400 italic uppercase tracking-wider">
              Didn't receive code? 
              <button type="button" className="text-[#1d7cf2] ml-1 hover:underline cursor-pointer">
                Resend
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}