"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [university, setUniversity] = useState("");
  const [faculty, setFaculty] = useState("");
  const [major, setMajor] = useState("");
  const [gpa, setGpa] = useState("");
  const [phone, setPhone] = useState("");
  const [jobInterest, setJobInterest] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInputs, setSkillInputs] = useState<string[]>([""]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showEmailExistsPopup, setShowEmailExistsPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [particlePositions, setParticlePositions] = useState<Array<{ top: number; left: number; xOffset: number }>>([]);

  useEffect(() => {
    setMounted(true);
    setParticlePositions(
      [...Array(8)].map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        xOffset: Math.random() * 30 - 15,
      }))
    );
  }, []);

  const addSkillInput = () => setSkillInputs((prev) => [...prev, ""]);

  const updateSkillInput = (index: number, value: string) => {
    setSkillInputs((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const addSkillFromInput = (index: number) => {
    const value = skillInputs[index]?.trim();
    if (value && !skills.includes(value)) {
      setSkills((prev) => [...prev, value]);
      setSkillInputs((prev) => {
        const next = prev.filter((_, i) => i !== index);
        return next.length > 0 ? next : [""];
      });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const removeSkillInput = (index: number) => {
    setSkillInputs((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowEmailExistsPopup(false);

    // Validation
    if (!email || !password || !username) {
      toast.error('Please enter Email, Password and Username');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (phone.length > 10) {
      toast.error('Phone number must not exceed 10 digits');
      return;
    }

    const gpaNum = gpa ? parseFloat(gpa) : 0;
    if (gpa !== '' && (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4)) {
      toast.error('GPA must be between 0.00 and 4.00');
      return;
    }

    setIsSubmitting(true);

    try {
      await authAPI.register({
        email: email.trim(),
        password: password,
        user_name: username.trim(),
        phone: phone.trim(),
        university: university.trim(),
        faculty: faculty.trim(),
        major: major.trim(),
        gpa: gpaNum,
        job_interest: jobInterest.trim(),
        skills: skills,
      });

      setShowSuccessPopup(true);
      toast.success('Registration successful!');
    } catch (error) {
      const msg = error instanceof Error ? error.message : '';
      const isEmailUsed = msg.includes('ถูกใช้งานแล้ว');
      if (isEmailUsed) {
        setShowEmailExistsPopup(true);
      } else {
        console.error("Registration Error:", error);
        toast.error(msg || 'Registration failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToLogin = () => {
    setShowSuccessPopup(false);
    router.push('/login');
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#f0f7ff] via-white to-[#fef3ff] flex flex-col font-sans overflow-x-hidden">
      
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
            opacity: [0.03, 0.06, 0.03],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-1/3 -right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#1d7cf2] to-blue-300 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            rotate: [0, -180, -360],
            opacity: [0.03, 0.07, 0.03],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-1/3 -left-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-purple-300 to-pink-200 rounded-full blur-[150px]"
        />

        {/* Floating Particles - only on client to avoid hydration mismatch */}
        {mounted && particlePositions.map((pos, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -40, 0],
              x: [0, pos.xOffset, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              delay: i * 0.7,
            }}
            className="absolute w-2 h-2 bg-[#1d7cf2] rounded-full"
            style={{
              top: `${pos.top}%`,
              left: `${pos.left}%`,
            }}
          />
        ))}
      </div>

      {/* Enhanced Navbar */}
      <nav className="w-full py-5 px-6 md:px-12 flex justify-between items-center bg-white/60 backdrop-blur-xl border-b border-white/40 opacity-30 select-none shadow-lg shadow-blue-100/20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative text-2xl font-black italic text-black group"
        >
          Port<span className="text-[#1d7cf2]">Hub</span>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-12 h-12 rounded-2xl border-2 border-[#1d7cf2] bg-gradient-to-br from-[#1d7cf2]/10 to-purple-500/10"
        />
      </nav>

      {/* Background Text */}
      <main className="flex-1 flex flex-col items-center justify-center opacity-5 select-none pointer-events-none">
        <motion.h1 
          animate={{
            scale: [1, 1.02, 1],
            opacity: [0.05, 0.08, 0.05],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
          className="text-[10vw] font-black text-black leading-none"
        >
          Port<span className="text-[#1d7cf2]">Hub</span>
        </motion.h1>
      </main>

      {/* Enhanced Register Form */}
      <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/5 backdrop-blur-[2px] overflow-y-auto z-20">
        <motion.form 
          onSubmit={handleSubmit}
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white/80 backdrop-blur-2xl w-full max-w-[1000px] my-8 p-10 md:p-14 rounded-3xl shadow-2xl flex flex-col md:flex-row gap-12 relative border-2 border-white/60 overflow-hidden"
        >
          
          {/* Decorative Elements */}
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-[#1d7cf2]/10 to-purple-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              rotate: [360, 0],
              scale: [1, 1.3, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-16 -left-16 w-40 h-40 bg-gradient-to-tr from-pink-500/10 to-orange-500/10 rounded-full blur-3xl"
          />

          {/* Left Section */}
          <div className="flex-1 space-y-5 relative z-10">
            <motion.h2 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl font-black bg-gradient-to-r from-gray-900 via-[#1d7cf2] to-purple-500 bg-clip-text text-transparent mb-8 pb-3 leading-[1.35]"
            >
              Register
            </motion.h2>
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-5 text-left"
            >
              <InputGroup label="Username" placeholder="" value={username} onChange={(e: any) => setUsername(e.target.value)} />
              <InputGroup label="E-mail" placeholder="" value={email} onChange={(e: any) => setEmail(e.target.value)} />
              
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
              
              <InputGroup label="Job Interest" placeholder="" value={jobInterest} onChange={(e: any) => setJobInterest(e.target.value)} />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-6 text-center md:text-left"
            >
              <Link href="/login">
                <motion.span 
                  whileHover={{ x: 3 }}
                  className="text-xs font-black text-[#1d7cf2] underline cursor-pointer italic hover:text-purple-500 transition-colors"
                >
                  Already have account? Log in
                </motion.span>
              </Link>
            </motion.div>
          </div>

          {/* Divider */}
          <motion.div 
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.5 }}
            className="hidden md:block w-[2px] bg-gradient-to-b from-transparent via-gray-200 to-transparent self-stretch mt-12 mb-4"
          />

          {/* Right Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex-1 space-y-5 pt-0 md:pt-16 relative z-10"
          >
            <div className="space-y-5 text-left">
              <InputGroup label="University" placeholder="" value={university} onChange={(e: any) => setUniversity(e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Faculty" placeholder="" value={faculty} onChange={(e: any) => setFaculty(e.target.value)} />
                <InputGroup label="Major" placeholder="" value={major} onChange={(e: any) => setMajor(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="GPAX" placeholder="0.00 - 4.00" value={gpa} onChange={(e: any) => setGpa(e.target.value)} type="number" min={0} max={4} step={0.01} />
                <InputGroup label="Phone" placeholder="" value={phone} onChange={(e: any) => setPhone(e.target.value)} maxLength={10} />
              </div>
              
              {/* Enhanced Skills Section */}
              <div>
                <label className="block text-[#1d7cf2] font-black text-sm mb-2 ml-1 uppercase tracking-wide">Skills</label>
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className="rounded-2xl border-2 border-gray-200 bg-white/80 backdrop-blur-xl p-5 space-y-4 focus-within:border-[#1d7cf2] focus-within:ring-4 focus-within:ring-[#1d7cf2]/10 transition-all shadow-lg"
                >
                  {/* Skills Tags */}
                  <div className="flex flex-wrap items-center gap-2">
                    <AnimatePresence>
                      {skills.map((skill) => (
                        <motion.span
                          key={skill}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-[#1d7cf2]/30 text-[#1d7cf2] text-sm font-bold shadow-md"
                        >
                          {skill}
                          <motion.button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            whileHover={{ scale: 1.2, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            className="hover:text-red-500 transition-colors"
                            aria-label={`ลบ ${skill}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                            </svg>
                          </motion.button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                    
                    <motion.button
                      type="button"
                      onClick={addSkillInput}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-[#1d7cf2] text-[#1d7cf2] hover:bg-gradient-to-r hover:from-[#1d7cf2] hover:to-purple-500 hover:text-white hover:border-transparent transition-all shadow-md shrink-0"
                      aria-label="เพิ่มช่องกรอก skill"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </motion.button>
                  </div>
                  
                  {/* Skill Inputs */}
                  <div className="space-y-3">
                    <AnimatePresence>
                      {skillInputs.map((value, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => updateSkillInput(index, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addSkillFromInput(index);
                              }
                            }}
                            placeholder="Type skill and press Enter"
                            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-[#1d7cf2]/30 bg-white/80 text-black focus:outline-none focus:border-[#1d7cf2] focus:ring-4 focus:ring-[#1d7cf2]/10 transition-all placeholder:text-gray-400 placeholder:text-sm font-semibold shadow-md"
                          />
                          <motion.button
                            type="button"
                            onClick={() => removeSkillInput(index)}
                            disabled={skillInputs.length <= 1}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-red-300 text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:pointer-events-none transition-all shrink-0 shadow-md"
                            aria-label="ลบช่องนี้"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                            </svg>
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="pt-8"
            >
              <motion.button 
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02, y: isSubmitting ? 0 : -2 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className="relative w-full py-4 bg-gradient-to-r from-[#1d7cf2] to-purple-500 text-white text-xl font-black rounded-2xl shadow-xl shadow-blue-300/40 hover:shadow-2xl hover:shadow-blue-400/50 transition-all uppercase tracking-wide overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <span className="relative z-10">{isSubmitting ? 'กำลังสมัคร...' : 'Sign Up'}</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.form>
      </div>

      {/* Email already in use Popup */}
      <AnimatePresence>
        {showEmailExistsPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowEmailExistsPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md p-10 rounded-3xl bg-white/95 backdrop-blur-2xl shadow-2xl border-2 border-red-200 overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-400/20 rounded-full blur-3xl" />
              <div className="relative z-10 text-center">
                <div className="mx-auto mb-6 w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-14 h-14 text-red-500">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">This email is already in use</h3>
                <p className="text-gray-600 font-semibold mb-8">This email is already registered. Please use another email or sign in.</p>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowEmailExistsPopup(false)}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#1d7cf2] to-purple-500 text-white font-bold text-lg shadow-xl"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Popup */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={handleGoToLogin}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md p-10 rounded-3xl bg-white/95 backdrop-blur-2xl shadow-2xl border-2 border-white/80 overflow-hidden"
            >
              {/* Glow effect */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-[#1d7cf2]/20 to-purple-500/20 rounded-full blur-3xl" />
              
              <div className="relative z-10 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                  className="mx-auto mb-6 w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl shadow-green-300/50"
                >
                  <CheckCircle2 className="w-14 h-14 text-white" strokeWidth={2.5} />
                </motion.div>
                
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl md:text-3xl font-black bg-gradient-to-r from-gray-900 via-green-600 to-emerald-600 bg-clip-text text-transparent mb-2"
                >
                  Registration successful!
                </motion.h3>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 font-semibold mb-8"
                >
                  Welcome to PortHub
                </motion.p>
                
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoToLogin}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#1d7cf2] to-purple-500 text-white font-bold text-lg shadow-xl shadow-blue-300/40 hover:shadow-2xl hover:shadow-blue-400/50 transition-all"
                >
                  Go to Login
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Enhanced InputGroup Component
function InputGroup({ label, placeholder, type = "text", value, onChange, isPassword, showPassword, togglePassword, maxLength, min, max, step }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <label className="block text-[#1d7cf2] font-black text-sm mb-2 ml-1 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input 
          required
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          min={min}
          max={max}
          step={step}
          className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-[#1d7cf2] focus:ring-4 focus:ring-[#1d7cf2]/10 transition-all text-black bg-white shadow-lg font-semibold placeholder:text-gray-400"
        />
        {isPassword && (
          <motion.button
            type="button"
            onClick={togglePassword}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1d7cf2] transition-colors"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}