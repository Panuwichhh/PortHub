"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Phone,
  ExternalLink,
  GraduationCap,
  Code2,
  Briefcase,
  User,
  Award,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

export default function ProfileDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id ?? "";

  const [user, setUser] = useState<any>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    router.push("/login");
    return;
  }

  const fetchData = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [userRes,skillsRes] = await Promise.all([
        fetch("http://localhost:8080/api/users/me", { headers }),
        fetch("http://localhost:8080/api/users/me/skills", { headers }),
      ]);

      if (userRes.status === 401 || skillsRes.status === 401) {
         handleLogout();
         return;
       }

       if (!userRes.ok || !skillsRes.ok) {
         throw new Error("Failed to fetch data");
       }

      const userData = await userRes.json();
       const skillsData = await skillsRes.json();

      console.log("User:", userData);
      
      setUser(userData);
       setSkills(skillsData); // ← ต้องมี state นี้
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);


  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading profile...
      </div>
    );

  if (!user) return null;

  const profileImage =
    user.profile_image_url && user.profile_image_url.trim() !== ""
      ? user.profile_image_url
      : "/default-profile.png";

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

            <h1 className="text-3xl font-black tracking-tight mb-2">
              {user.user_name}
            </h1>
            <p className="text-[#1d7cf2] font-black text-xs uppercase tracking-widest mb-8">
              {user.role}
            </p>

            <div className="space-y-3 bg-gray-50/50 p-6 rounded-[2rem] text-left border border-gray-100">
              <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                <Phone className="w-4 h-4 text-[#1d7cf2]" /> {user.phone}
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                <Mail className="w-4 h-4 text-[#1d7cf2]" />
                {user.email}
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-50 text-left">
              <div className="flex gap-4">
                <div className="p-3 bg-blue-50 rounded-2xl text-[#1d7cf2] h-fit">
                  <GraduationCap className="w-6 h-6" />
                   </div>
               
                    <div>
                      <h4 className="font-black text-[10px] uppercase text-gray-400 tracking-widest">
                        Education
                      </h4>
                      <p className="font-black text-gray-900 leading-tight mt-1">
                        {user.university}
                      </p>
                      <p className="text-xs font-bold text-gray-500 mt-1">
                        {user.faculty} | {user.major}
                      </p>
                      <p className="text-[10px] font-black text-[#1d7cf2] mt-2 bg-blue-50 inline-block px-2 py-0.5 rounded-lg">
                        GPAX {user.gpa}
                      </p>                   
                    </div>
                  </div>
                </div>
                    
          </motion.div>


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
              {skills.length > 0 ? (
  skills.map((skill, idx) => (
    <span
      key={idx}
      className="px-4 py-2 bg-gray-50 border border-gray-100 text-[10px] font-black text-gray-600 rounded-xl hover:bg-[#1d7cf2] hover:text-white transition-all cursor-default"
    >
      {skill.toUpperCase()}
    </span>
  ))
) : (
  <span className="text-gray-400 text-sm">No skills yet</span>
)}
            </div>
          </motion.div>

          
        </aside>

        {/* RIGHT */}
        <section className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[3rem] p-10 shadow-sm border">
            <h4 className="font-black text-xs uppercase text-[#1d7cf2] mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Career Objectives
            </h4>
            <p className="text-2xl font-black">
              {user.job_interest || "Not specified"}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
