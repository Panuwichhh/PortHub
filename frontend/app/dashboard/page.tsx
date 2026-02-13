"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LogOut, 
  User, 
  Search, 
  GraduationCap, 
  Briefcase, 
  ExternalLink,
  LogIn
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [isGuest, setIsGuest] = useState(true); // เริ่มต้นเป็น Guest ก่อน
  const [isReady, setIsReady] = useState(false);

  // --- 1. ตรวจสอบสิทธิ์แบบ Hybrid ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsGuest(false); // ถ้ามี token แสดงว่าเป็นสมาชิก
    }
    setIsReady(true); // ไม่ว่าจะเป็นใครก็ให้พร้อมแสดงผลหน้าจอ
  }, []);

  // --- 2. ออกจากระบบ ---
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const users = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: "Alexander Pierce",
    job: "Creative Full Stack Developer & UI Designer",
    university: "Stanford University",
    major: "Computer Science",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
  }));

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-[#f8faff] font-sans text-black overflow-x-hidden">
      
      {/* 🌟 Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 md:px-12 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-3xl font-black italic tracking-tighter">
            Port<span className="text-[#1d7cf2]">Hub</span>
          </Link>
          
          <div className="hidden lg:flex items-center bg-gray-100 rounded-2xl px-4 py-2.5 w-80 group focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1d7cf2]/20 transition-all">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search talent..." 
              className="bg-transparent text-sm outline-none w-full font-bold"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-5">
          {/* 🌟 ปรับปุ่มตามสถานะ User 🌟 */}
          {isGuest ? (
            <Link href="/login">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1d7cf2] text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-200"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </motion.button>
            </Link>
          ) : (
            <>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </motion.button>

              <Link href="/profile/me">
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#1d7cf2] to-blue-400 flex items-center justify-center text-white shadow-lg shadow-blue-200 cursor-pointer"
                >
                  <User className="w-6 h-6" />
                </motion.div>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* --- Header Section --- */}
      <header className="max-w-[1400px] mx-auto pt-12 px-6 md:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {isGuest && (
            <div className="mb-4 inline-block px-4 py-1 bg-yellow-100 text-yellow-700 text-[9px] font-black uppercase rounded-lg tracking-widest">
              Viewing as Guest
            </div>
          )}
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900">
            Find the perfect <span className="text-[#1d7cf2]">Professional</span>
          </h2>
          <p className="mt-2 text-gray-400 font-bold uppercase tracking-[0.2em] text-xs">
            Discover {users.length} Talents in your network
          </p>
        </motion.div>
      </header>

      {/* --- Main Grid Layout --- */}
      <main className="max-w-[1400px] mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/profile/${user.id}`} className="group relative block h-full">
                <div className="bg-white p-7 rounded-[3rem] shadow-[0_15px_50px_rgba(0,0,0,0.03)] flex flex-col items-center hover:shadow-[0_40px_80px_rgba(29,124,242,0.1)] transition-all duration-500 border border-white h-full overflow-hidden">
                  
                  <div className="absolute top-6 left-8 text-[10px] font-black text-gray-200 uppercase tracking-widest group-hover:text-[#1d7cf2]/30 transition-colors">
                    ID: {user.id.toString().padStart(3, '0')}
                  </div>

                  <div className="relative mb-8 mt-4">
                    <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-2xl">
                      <img src={user.img} alt="Profile" className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-500" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white w-10 h-10 rounded-2xl shadow-xl flex items-center justify-center text-[#1d7cf2] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="w-full space-y-3 text-center">
                    <h3 className="text-2xl font-black tracking-tighter text-gray-900 group-hover:text-[#1d7cf2] transition-colors">
                      {user.name}
                    </h3>
                    <div className="flex justify-center">
                      <p className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-[#1d7cf2] font-black text-[11px] uppercase tracking-wide">
                        {user.job}
                      </p>
                    </div>

                    <div className="pt-6 space-y-2.5">
                      <div className="flex items-center justify-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {user.university}
                      </div>
                      <div className="flex items-center justify-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                        <Briefcase className="w-3.5 h-3.5" />
                        {user.major}
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 h-1.5 bg-[#1d7cf2] transition-all duration-500 w-0 group-hover:w-full" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Background Blobs */}
      <div className="fixed -top-24 -right-24 w-96 h-96 bg-[#1d7cf2]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed -bottom-24 -left-24 w-96 h-96 bg-blue-400/5 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
}