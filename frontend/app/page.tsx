import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f1f7ff] flex flex-col font-sans">
      {/* --- Header / Navbar --- */}
      <nav className="w-full py-4 px-6 md:px-12 flex justify-between items-center bg-white border-b border-gray-100 shadow-sm">
        <div className="text-2xl font-black tracking-tighter italic text-black">
          Port<span className="text-[#1d7cf2]">Hub</span>
        </div>
        <Link href="/login">
          <div className="cursor-pointer hover:opacity-80 transition-opacity">
            {/* SVG Profile Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#1d7cf2" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </div>
        </Link>
      </nav>

      {/* --- Hero Section --- */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center pb-20">
        {/* Main Title - ปรับ Port เป็นสีดำ (text-black) */}
        <h1 className="text-[15vw] md:text-[14rem] font-black tracking-tighter leading-none select-none text-black">
          Port<span className="text-[#1d7cf2]">Hub</span>
        </h1>
        
        {/* Subtitle */}
        <p className="mt-4 text-lg md:text-2xl font-medium tracking-[0.2em] text-black uppercase">
          Your Professional Hub
        </p>

        {/* Let's Go Button */}
        <Link href="/login">
          <button className="mt-12 px-12 py-3 bg-[#1d7cf2] text-white text-lg font-semibold rounded-lg shadow-[0_4px_14px_0_rgba(29,124,242,0.39)] hover:bg-[#1565c0] transition-all transform active:scale-95">
            Let's Go
          </button>
        </Link>
      </main>
    </div>
  );
}