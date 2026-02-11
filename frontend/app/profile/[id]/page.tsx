"use client";

import React from 'react';

export default function ProfileDetailPage() {
  const userData = {
    name: "Cho yi hyun",
    phone: "0975XXXXXX",
    email: "choyihyun1@gmail.com",
    university: "University Name",
    faculty: "Engineer",
    major: "Software",
    gpax: "4.00",
    skills: ["Wireframe", "Python", "Communication", "Resreach", "Planning"],
    jobInterest: "Website Developer, Full-Stack Developer, Backend / Frontend Developer, UX/UI Designer",
    projects: [
      {
        title: "UniConnect",
        desc: "เป็นแอปพลิเคชันที่ออกแบบมาเพื่อสร้างชุมชนออนไลน์สำหรับนักศึกษาภายในมหาวิทยาลัย ช่วยให้พวก...",
        img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400"
      },
      {
        title: "Leaf & Bloom",
        desc: "เป็นโมบายแอปพลิเคชันที่ออกแบบมาเพื่อช่วยให้ผู้ที่รักการปลูกต้นไม้ในร่ม สามารถดูแล ...",
        img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=400"
      }
    ]
  };

  return (
    <div className="h-screen w-full bg-white font-sans text-black overflow-hidden flex flex-col">
      
      {/* --- Header / Navbar --- */}
      <nav className="h-14 shrink-0 px-6 flex justify-between items-center bg-white border-b border-gray-200 z-50">
        <div className="text-2xl font-black italic tracking-tighter">
          Port<span className="text-[#1d7cf2]">Hub</span>
        </div>
        <div className="w-8 h-8 rounded-full border-2 border-[#1d7cf2] flex items-center justify-center text-[#1d7cf2]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </nav>

      <div className="flex-1 flex flex-row overflow-hidden">
        
        {/* --- LEFT SIDEBAR (Profile) --- */}
        <aside className="w-[340px] bg-white flex flex-col shrink-0 h-full overflow-y-auto border-r border-gray-100">
          <div className="p-8 flex flex-col">
            
            {/* Profile Image - Centered */}
            <div className="flex justify-center mb-6">
              <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm">
                <img 
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Info Section - Left Aligned */}
            <div className="text-left space-y-4">
              <div>
                <h1 className="text-2xl font-black text-gray-900 mb-2">{userData.name}</h1>
                <div className="text-[13px] text-gray-600 space-y-1 font-medium">
                  <p className="flex items-center gap-2">📞 {userData.phone}</p>
                  <p className="flex items-center gap-2">✉️ {userData.email}</p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-black text-gray-900 mb-1">University Name</h2>
                <div className="text-[14px] text-gray-700 font-medium space-y-0.5">
                  <p>Faculty: {userData.faculty}</p>
                  <p>Major: {userData.major}</p>
                  <p>GPAX: {userData.gpax}</p>
                </div>
              </div>

              {/* Skills Area */}
              <div>
                <h2 className="text-lg font-black text-gray-900 mb-3 uppercase tracking-tight">Skill</h2>
                <div className="flex flex-wrap gap-2">
                  {userData.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 border border-[#1d7cf2] text-[#1d7cf2] bg-white rounded-md text-[12px] font-bold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </aside>

        {/* --- RIGHT CONTENT (Job & Projects) --- */}
        <main className="flex-1 bg-[#f8fbff] p-10 overflow-hidden flex flex-col">
          
          {/* Job Interest Section */}
          <div className="mb-8">
            <h2 className="text-[16px] font-black text-gray-900 mb-2">Job Interest</h2>
            <p className="text-[#1d7cf2] text-xl font-black leading-tight max-w-2xl">
              {userData.jobInterest}
            </p>
          </div>

          {/* Divider Line */}
          <div className="w-full h-px bg-gray-200 mb-8"></div>

          {/* Projects Section */}
          <div className="flex-1 flex flex-col min-h-0">
            <h2 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-tight shrink-0">Project</h2>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-5">
              {userData.projects.map((proj, idx) => (
                <div key={idx} className="flex bg-white rounded-xl border border-blue-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow h-44 shrink-0">
                  {/* Project Image */}
                  <div className="w-48 h-full shrink-0">
                    <img src={proj.img} className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Project Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-black text-[#1d7cf2] mb-1">{proj.title}</h3>
                      <p className="text-gray-500 text-[13px] font-medium leading-relaxed line-clamp-2">
                        {proj.desc}
                      </p>
                    </div>
                    
                    {/* Explore Button */}
                    <div className="flex justify-end">
                      <button className="bg-[#1d7cf2] text-white px-6 py-1.5 rounded-lg font-black text-[11px] shadow-sm hover:bg-blue-600 transition-colors">
                        Explore
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}