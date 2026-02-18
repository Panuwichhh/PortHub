"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, User, Search, GraduationCap, Briefcase, ExternalLink, LogIn, DoorOpen
} from 'lucide-react';
import { userAPI, tokenManager, logout } from '@/lib/api';
import toast from 'react-hot-toast';

interface UserProfile {
  user_id: number;
  user_name: string;
  email: string;
  profile_image_url?: string;
  job_interest?: string;
  university?: string;
  major?: string;
  gpa?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [isGuest, setIsGuest] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCurrentUser = async () => {
    try {
      const data = await userAPI.getMe();
      setCurrentUser(data);
    } catch (error) {
      if (error instanceof Error && (
        error.message.includes('Unauthorized') ||
        error.message.includes('Invalid user ID') ||
        error.message.includes('Invalid token') ||
        error.message.includes('User not found')
      )) {
        toast.error('Session expired. Please sign in again.');
        tokenManager.removeToken();
        setIsGuest(true);
        setCurrentUser(null);
        setUsers([]);
        router.push('/login');
      }
    }
  };

  const fetchDashboardProfiles = async () => {
    try {
      const list = await userAPI.getDashboardProfiles();
      setUsers(Array.isArray(list) ? list : []);
    } catch {
      setUsers([]);
    }
  };

  const fetchPublicDashboardProfiles = async () => {
    try {
      const list = await userAPI.getPublicDashboardProfiles();
      setUsers(Array.isArray(list) ? list : []);
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => {
    const hasToken = tokenManager.hasToken();
    if (hasToken) {
      setIsGuest(false);
      fetchCurrentUser();
      fetchDashboardProfiles();
    } else {
      setIsGuest(true);
      setCurrentUser(null);
      fetchPublicDashboardProfiles();
    }
    setIsReady(true);
  }, [router]);

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  const filteredUsers = users.filter(user => 
    user.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.job_interest?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.university?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.major?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7ff] via-white to-[#fef3ff] font-sans text-black overflow-x-hidden relative">
      
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03], rotate: [0, 180, 360] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/3 -left-1/4 w-2/3 h-2/3 bg-gradient-to-br from-[#1d7cf2] to-blue-300 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.03, 0.07, 0.03], rotate: [0, -180, -360] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/3 -right-1/4 w-2/3 h-2/3 bg-gradient-to-tl from-purple-300 to-pink-200 rounded-full blur-[120px]"
        />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-white/60 backdrop-blur-2xl border-b border-white/40 shadow-lg shadow-blue-100/20">
        <div className="px-6 md:px-12 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-3xl font-black italic tracking-tighter relative"
              >
                <span className="relative z-10">
                  Port<span className="text-[#1d7cf2] group-hover:text-purple-500 transition-colors duration-300">Hub</span>
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#1d7cf2]/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            </Link>
            
            <div className="hidden lg:flex items-center bg-white/80 backdrop-blur-xl rounded-2xl px-5 py-3 w-80 shadow-lg shadow-blue-100/30 border border-blue-100/50 group focus-within:shadow-xl focus-within:shadow-blue-200/40 focus-within:border-[#1d7cf2]/50 transition-all duration-300">
              <Search className="w-5 h-5 text-gray-400 mr-3 group-focus-within:text-[#1d7cf2] transition-colors" />
              <input 
                type="text" 
                placeholder="Search talent..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-sm outline-none w-full font-bold placeholder:text-gray-400"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            {isGuest ? (
              <Link href="/login">
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-[#1d7cf2] to-blue-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-300/50 overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <LogIn className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Sign In</span>
                </motion.button>
              </Link>
            ) : (
              <>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowLogoutModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50/80 backdrop-blur-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </motion.button>

                <Link href={`/profile/${currentUser?.user_id || ''}`}>
                  <motion.div 
                    whileHover={{ y: -3, rotate: 5 }}
                    className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1d7cf2] to-purple-500 flex items-center justify-center text-white shadow-xl shadow-blue-300/40 cursor-pointer overflow-hidden"
                  >
                    <User className="w-6 h-6 relative z-10" />
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent"
                    />
                  </motion.div>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="max-w-[1400px] mx-auto pt-16 pb-8 px-6 md:px-12 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {isGuest && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              className="mb-6 inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-50/90 to-orange-50/90 backdrop-blur-xl border-2 border-yellow-300/50 text-orange-600 text-sm font-black rounded-2xl tracking-wide shadow-xl shadow-orange-200/50"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.2, 1, 1.2, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-2xl"
              >
                👀
              </motion.div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black uppercase tracking-wider">Guest Mode</span>
                  <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] rounded-full font-black uppercase">Limited</span>
                </div>
                <p className="text-xs font-semibold text-orange-500 mt-0.5">
                  Sign in to unlock full features
                </p>
              </div>
            </motion.div>
          )}
          
          <motion.h2 
            className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Find the perfect{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-[#1d7cf2] via-purple-500 to-[#1d7cf2] bg-clip-text text-transparent">
                Professional
              </span>
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-[#1d7cf2]/20 to-purple-500/20 blur-xl -z-10"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {!isGuest && currentUser ? `Welcome back, ${currentUser.user_name}!` : 'Discover Talents in your network'}
          </motion.p>
        </motion.div>
      </header>

      {/* Main Grid */}
      <main className="max-w-[1400px] mx-auto p-6 md:p-12 relative">
        <>
            {!isGuest && currentUser && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <h3 className="text-2xl font-black bg-gradient-to-r from-gray-900 via-[#1d7cf2] to-purple-500 bg-clip-text text-transparent mb-2">
                  Welcome, {currentUser.user_name}!
                </h3>
                <p className="text-gray-500 font-semibold">
                  View your profile from the menu above · Others who published to Dashboard appear below
                </p>
              </motion.div>
            )}
            {filteredUsers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              />
            ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.user_id}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.08, duration: 0.5, type: "spring", stiffness: 100 }}
              >
                <Link href={`/profile/${user.user_id}`} className="group relative block h-full">
                  <motion.div 
                    whileHover={{ y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] flex flex-col items-center hover:shadow-[0_30px_80px_rgba(29,124,242,0.2)] transition-all duration-500 border border-white/60 h-full overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1d7cf2]/0 via-purple-500/0 to-pink-500/0 group-hover:from-[#1d7cf2]/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500 rounded-3xl" />
                    
                    <motion.div 
                      className="absolute top-6 left-6 text-xs font-black text-gray-200 uppercase tracking-widest group-hover:text-[#1d7cf2]/40 transition-all duration-300"
                      whileHover={{ scale: 1.1, x: 5 }}
                    >
                      ID: {user.user_id.toString().padStart(3, '0')}
                    </motion.div>
                    
                    <div className="relative mb-8 mt-4">
                      <motion.div
                        whileHover={{ rotate: 0, scale: 1.05 }}
                        className="relative w-36 h-36 rounded-3xl overflow-hidden rotate-3 group-hover:rotate-0 transition-all duration-500 shadow-2xl"
                      >
                        <img 
                          src={user.profile_image_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"} 
                          alt="Profile" 
                          className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1d7cf2]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </motion.div>
                      
                      <motion.div
                        className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#1d7cf2] to-purple-500 blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        whileHover={{ scale: 1, rotate: 0 }}
                        className="absolute -bottom-3 -right-3 bg-gradient-to-r from-[#1d7cf2] to-purple-500 w-12 h-12 rounded-2xl shadow-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </motion.div>
                    </div>
                    
                    <div className="w-full space-y-4 text-center relative z-10">
                      <motion.h3 
                        className="text-xl font-black tracking-tight text-gray-900 group-hover:text-[#1d7cf2] transition-colors leading-tight"
                        whileHover={{ scale: 1.05 }}
                      >
                        {user.user_name || 'No Name'}
                      </motion.h3>
                      
                      <div className="flex justify-center">
                        <motion.p 
                          whileHover={{ scale: 1.05, y: -2 }}
                          className="inline-block px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-xl border border-blue-100/50 text-[#1d7cf2] font-black text-xs uppercase tracking-wide shadow-lg shadow-blue-100/30 line-clamp-2"
                        >
                          {user.job_interest || 'No Job Interest'}
                        </motion.p>
                      </div>
                      
                      <div className="pt-6 space-y-3 border-t border-gray-100">
                        <motion.div 
                          className="flex items-center justify-center gap-2 text-gray-500 text-xs font-black uppercase tracking-widest"
                          whileHover={{ x: 3 }}
                        >
                          <GraduationCap className="w-4 h-4 text-[#1d7cf2]" />
                          <span className="truncate">{user.university || 'No University'}</span>
                        </motion.div>
                        
                        <motion.div 
                          className="flex items-center justify-center gap-2 text-gray-500 text-xs font-black uppercase tracking-widest"
                          whileHover={{ x: 3 }}
                        >
                          <Briefcase className="w-4 h-4 text-purple-500" />
                          <span className="truncate">{user.major || 'No Major'}</span>
                        </motion.div>
                      </div>
                      
                      {user.gpa && (
                        <div className="pt-3">
                          <span className="text-xs font-black text-gray-400">
                            GPA: {user.gpa.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <motion.div 
                      initial={{ width: "0%" }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.4 }}
                      className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-[#1d7cf2] via-purple-500 to-pink-500 rounded-b-3xl"
                    />
                    
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1.5 h-1.5 bg-[#1d7cf2] rounded-full opacity-0 group-hover:opacity-100"
                          style={{ top: `${20 + i * 20}%`, left: `${10 + i * 20}%` }}
                          animate={{ y: [0, -10, 0], x: [0, 5, 0], scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
            )}
        </>
      </main>

      {/* Logout Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-lg" 
            onClick={() => setShowLogoutModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-[420px] p-10 text-center overflow-hidden border border-white/50"
            >
              <motion.div
                animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#1d7cf2]/10 to-purple-500/10 rounded-full blur-3xl"
              />
              <motion.div
                animate={{ rotate: [360, 0], scale: [1, 1.3, 1] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-500/10 to-orange-500/10 rounded-full blur-2xl"
              />
              
              <div className="relative z-10">
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                  className="flex justify-center mb-6"
                >
                  <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1d7cf2] to-purple-500 flex items-center justify-center shadow-2xl shadow-blue-300/50">
                    <DoorOpen className="w-10 h-10 text-white relative z-10" />
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-br from-[#1d7cf2] to-purple-500 rounded-2xl"
                    />
                  </div>
                </motion.div>
                
                <motion.h3 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-black bg-gradient-to-r from-[#1d7cf2] to-purple-500 bg-clip-text text-transparent mb-2"
                >
                  You leaving...
                </motion.h3>
                
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-600 font-bold text-sm mb-8"
                >
                  Are you sure?
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-4"
                >
                  <motion.button 
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowLogoutModal(false)} 
                    className="relative flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#1d7cf2] to-purple-500 text-white font-black text-sm uppercase tracking-wide shadow-xl shadow-blue-300/40 overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="relative z-10">Cancel</span>
                  </motion.button>
                  
                  <motion.button 
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout} 
                    className="relative flex-1 py-4 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-black text-sm uppercase tracking-wide shadow-xl shadow-red-300/40 overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="relative z-10">Log out</span>
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}