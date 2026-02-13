"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Mail, Phone, ExternalLink, 
  GraduationCap, Code2, Briefcase, User, LogOut,
  Award, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfileDetailPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const user = {
    name: "Cho Yi Hyun",
    role: "Senior UI/UX Designer",
    phone: "097-5XX-XXXX",
    email: "choyihyun1@gmail.com",
    university: "Stanford University",
    faculty: "Engineering",
    major: "Software Engineering",
    gpax: "4.00",
    skills: ["Wireframe", "Python", "Communication", "Research", "Planning"],
    interests: "Website Developer, Full-Stack Developer, Backend / Frontend Developer, UX/UI Designer",
    projects: [
      {
        title: "UniConnect",
        category: "Web Application",
        desc: "แอปพลิเคชันที่ออกแบบมาเพื่อสร้างชุมชนออนไลน์สำหรับนักศึกษาภายในมหาวิทยาลัย ช่วยให้การแลกเปลี่ยนความรู้เป็นเรื่องง่าย...",
        img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600"
      },
      {
        title: "Leaf & Bloom",
        category: "Mobile Design",
        desc: "โมบายแอปพลิเคชันที่ช่วยให้ผู้รักการปลูกต้นไม้ในร่ม สามารถดูแลและวิเคราะห์สุขภาพต้นไม้ได้ผ่าน AI...",
        img: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=600"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#f8faff] text-black font-sans pb-20">
      
      {/* 🌟 Navbar: Full Functionality */}
      <nav className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 px-6 md:px-12 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/dashboard">
            <motion.div 
              whileHover={{ x: -5 }}
              className="p-2 bg-gray-50 hover:bg-white hover:shadow-sm rounded-xl transition-all text-gray-400 hover:text-[#1d7cf2] cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.div>
          </Link>
          <div className="text-2xl font-black italic tracking-tighter">
            Port<span className="text-[#1d7cf2]">Hub</span>
          </div>
        </div>

        <div className="flex items-center gap-5">
          
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1d7cf2] to-blue-400 flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <User className="w-6 h-6" />
          </div>
        </div>
      </nav>

      {/* --- Header Space --- */}
      <div className="w-full h-32 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50" />

      <main className="max-w-7xl mx-auto px-6 -mt-16 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 🌟 Left Column: Personal Identity Card */}
        <aside className="lg:col-span-4 space-y-8 h-fit lg:sticky lg:top-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-white text-center relative overflow-hidden"
          >
            {/* Profile Pic with Ring */}
            <div className="relative w-44 h-44 mx-auto mb-8">
              <div className="absolute inset-0 bg-blue-50 rounded-[3rem] rotate-6 border border-blue-100" />
              <img 
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300" 
                alt="Avatar" 
                className="relative w-full h-full rounded-[3rem] object-cover shadow-2xl border-4 border-white" 
              />
            </div>

            <h1 className="text-3xl font-black tracking-tight mb-2">{user.name}</h1>
            <p className="text-[#1d7cf2] font-black text-xs uppercase tracking-widest mb-8">{user.role}</p>
            
            <div className="space-y-3 bg-gray-50/50 p-6 rounded-[2rem] text-left border border-gray-100">
              <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                <Phone className="w-4 h-4 text-[#1d7cf2]" /> {user.phone}
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                <Mail className="w-4 h-4 text-[#1d7cf2]" /> {user.email}
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-50 text-left">
              <div className="flex gap-4">
                <div className="p-3 bg-blue-50 rounded-2xl text-[#1d7cf2] h-fit">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-[10px] uppercase text-gray-400 tracking-widest">Education</h4>
                  <p className="font-black text-gray-900 leading-tight mt-1">{user.university}</p>
                  <p className="text-xs font-bold text-gray-500 mt-1">{user.faculty} | {user.major}</p>
                  <p className="text-[10px] font-black text-[#1d7cf2] mt-2 bg-blue-50 inline-block px-2 py-0.5 rounded-lg">GPAX {user.gpax}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Skill Bento Box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-white"
          >
            <h4 className="font-black text-xs uppercase text-gray-400 tracking-widest mb-6 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#1d7cf2]" /> Technical Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, idx) => (
                <span key={idx} className="px-4 py-2 bg-gray-50 border border-gray-100 text-[10px] font-black text-gray-600 rounded-xl hover:bg-[#1d7cf2] hover:text-white transition-all cursor-default">
                  {skill.toUpperCase()}
                </span>
              ))}
            </div>
          </motion.div>
        </aside>

        {/* 🌟 Right Column: Detailed Info & Projects */}
        <section className="lg:col-span-8 space-y-8">
          
          {/* Job Interest Bento */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[3rem] p-10 shadow-sm border border-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5"><Sparkles className="w-24 h-24" /></div>
            <h4 className="font-black text-xs uppercase text-[#1d7cf2] tracking-[0.2em] mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Career Objectives
            </h4>
            <p className="text-2xl font-black leading-snug text-gray-800 tracking-tight">
              {user.interests}
            </p>
          </motion.div>

          {/* Project Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-3xl font-black tracking-tight">Featured <span className="text-[#1d7cf2]">Projects</span></h2>
              <Award className="w-6 h-6 text-yellow-400" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user.projects.map((project, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -8 }}
                  className="group bg-white rounded-[3rem] overflow-hidden shadow-sm border border-white flex flex-col h-full hover:shadow-[0_30px_60px_rgba(29,124,242,0.1)] transition-all duration-500"
                >
                  <div className="h-52 overflow-hidden relative">
                    <img src={project.img} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-5 left-5 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-[#1d7cf2]">
                      {project.category}
                    </div>
                  </div>
                  <div className="p-8 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="text-xl font-black mb-3 group-hover:text-[#1d7cf2] transition-colors">{project.title}</h3>
                      <p className="text-gray-400 text-xs font-bold leading-relaxed line-clamp-2">
                        {project.desc}
                      </p>
                    </div>
                    <button className="mt-8 flex items-center justify-center gap-2 px-6 py-3.5 bg-black text-white w-full rounded-2xl font-black text-[10px] tracking-widest shadow-lg hover:bg-[#1d7cf2] transition-all transform active:scale-95">
                      VIEW CASE STUDY <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}