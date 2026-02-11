"use client";

import React from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  // จำลองข้อมูล User 8 คน (ในอนาคตจะดึงข้อมูลนี้มาจาก Backend/Database)
  const users = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1, // ID สำหรับใช้ทำ Dynamic Route เช่น /profile/1, /profile/2
    name: "Name",
    job: "Jobbbbbbbbbbbbbbbbbbb bbbbbbb",
    university: "University",
    major: "Major",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
  }));

  return (
    <div className="min-h-screen bg-[#f1f7ff] font-sans text-black">
      
      {/* --- Navbar --- */}
      <nav className="w-full py-4 px-6 md:px-12 flex justify-between items-center bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="text-2xl font-black italic tracking-tighter">
          Port<span className="text-[#1d7cf2]">Hub</span>
        </div>
        
        {/* User Profile Icon - ฝั่งขวาบน */}
        <button className="w-10 h-10 rounded-full border-2 border-[#1d7cf2] flex items-center justify-center text-[#1d7cf2] hover:bg-[#1d7cf2] hover:text-white transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </button>
      </nav>

      {/* --- Main Content: Grid ของผู้ใช้งาน --- */}
      <main className="max-w-[1200px] mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {users.map((user) => (
            /* เชื่อมโยงไปยังหน้า profile/[id] */
            <Link href={`/profile/${user.id}`} key={user.id} className="group">
              <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.06)] flex flex-col items-start hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-all transform group-hover:-translate-y-2 cursor-pointer h-full border border-white">
                
                {/* วงกลมรูปโปรไฟล์ */}
                <div className="w-full flex justify-center mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-50 shadow-md">
                    <img 
                      src={user.img} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* ข้อมูลชื่อและตำแหน่ง */}
                <div className="w-full space-y-1">
                  <h3 className="text-2xl font-black tracking-tight text-black">{user.name}</h3>
                  <p className="text-[#1d7cf2] font-extrabold text-[13px] leading-tight break-words min-h-[2.5rem]">
                    {user.job}
                  </p>
                  
                  {/* เส้นแบ่งและข้อมูลมหาวิทยาลัย */}
                  <div className="flex items-center gap-2 text-gray-400 text-[11px] font-bold mt-3">
                    <span>{user.university}</span>
                    <span className="w-[1.5px] h-3 bg-gray-200"></span>
                    <span>{user.major}</span>
                  </div>
                </div>
                
              </div>
            </Link>
          ))}
          
        </div>
      </main>

    </div>
  );
}