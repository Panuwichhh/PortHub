"use client";

import React, { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

// ─── ใช้ interface เดียวกับ profile page ────────────────────────────────────
interface Project {
  id: string;
  title: string;
  desc: string;
  img: string;
  images: string[];
}

// ✅ ใช้ storage key เดียวกับ profile page
const getStorageKey = (userId: string) => `porthub_projects_${userId}`;

// ─── โหลด projects จาก localStorage ────────────────────────────────────────
const loadProjectsFromStorage = (userId: string): Project[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    console.log('📂 [Project Detail] Loading projects for user:', userId);
    if (!raw) {
      console.log('📂 [Project Detail] No projects found');
      return [];
    }
    const parsed = JSON.parse(raw) as Project[];
    console.log('📂 [Project Detail] Loaded projects:', parsed.length);
    return parsed;
  } catch (error) {
    console.error('❌ [Project Detail] Error loading projects:', error);
    return [];
  }
};

export default function ProjectCaseStudyPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const userId = params.id as string;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  const dragStartX = useRef(0);
  const lastDragOffset = useRef(0);
  const isDraggingRef = useRef(false);

  // ✅ โหลด project จาก localStorage หา id ที่ตรงกัน
  useEffect(() => {
    if (!userId || !projectId) return;
    
    console.log('🔍 [Project Detail] Looking for project:', projectId);
    const all = loadProjectsFromStorage(userId);
    console.log('📋 [Project Detail] All projects:', all);
    
    const found = all.find(p => p.id === projectId);
    
    if (found) {
      console.log('✅ [Project Detail] Found project:', found);
      setProject(found);
      setNotFound(false);
    } else {
      console.log('❌ [Project Detail] Project not found');
      setNotFound(true);
    }
    
    setLoading(false);
  }, [userId, projectId]);

  const images = useMemo(() => {
    if (!project) return [];
    // ✅ ถ้ามี images array ให้ใช้ ถ้าไม่มีแต่มี img ให้ใช้ img ถ้าไม่มีเลยก็ให้ empty array
    if (project.images && project.images.length > 0) return project.images;
    if (project.img) return [project.img];
    return [];
  }, [project]);

  const imageCount = images.length;

  const goPrev = useCallback(() => {
    setCurrentImageIndex((i) => (i <= 0 ? imageCount - 1 : i - 1));
  }, [imageCount]);

  const goNext = useCallback(() => {
    setCurrentImageIndex((i) => (i >= imageCount - 1 ? 0 : i + 1));
  }, [imageCount]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (imageCount <= 1) return;
    dragStartX.current = "touches" in e ? e.touches[0].clientX : e.clientX;
    isDraggingRef.current = true;
  };

  const handleDragMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (imageCount <= 1 || !isDraggingRef.current) return;
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    const offset = x - dragStartX.current;
    lastDragOffset.current = offset;
    setDragOffset(offset);
  }, [imageCount]);

  const handleDragEnd = useCallback(() => {
    if (imageCount <= 1) return;
    const offset = lastDragOffset.current;
    const threshold = 50;
    if (offset > threshold) goPrev();
    else if (offset < -threshold) goNext();
    setDragOffset(0);
    isDraggingRef.current = false;
  }, [imageCount, goPrev, goNext]);

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f7ff] via-white to-[#fef3ff] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#1d7cf2] border-t-transparent rounded-full" />
      </div>
    );
  }

  // ─── Not found state ──────────────────────────────────────────────────────
  if (notFound || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f7ff] via-white to-[#fef3ff] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white/80 backdrop-blur-xl p-12 rounded-3xl shadow-2xl border border-white/60"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            🔍
          </motion.div>
          <p className="text-gray-600 font-bold mb-6 text-lg">ไม่พบโปรเจกต์</p>
          <Link href={`/profile/${userId}`}>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-[#1d7cf2] to-purple-500 text-white rounded-full font-black shadow-xl"
            >
              กลับไปโปรไฟล์
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7ff] via-white to-[#fef3ff] text-black font-sans pb-20 relative overflow-hidden">
      
      {/* Enhanced Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/3 -right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#1d7cf2] to-blue-300 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{ scale: [1, 1.4, 1], rotate: [0, -180, -360], opacity: [0.03, 0.07, 0.03] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/3 -left-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-purple-300 to-pink-200 rounded-full blur-[150px]"
        />
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -40, 0], x: [0, Math.random() * 30 - 15, 0], opacity: [0.2, 0.6, 0.2], scale: [1, 1.5, 1] }}
            transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.7 }}
            className="absolute w-2 h-2 bg-[#1d7cf2] rounded-full"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
          />
        ))}
      </div>

      {/* Navbar */}
      <nav className="w-full bg-white/60 backdrop-blur-2xl border-b border-white/40 px-6 md:px-12 py-4 flex justify-between items-center sticky top-0 z-50 shadow-lg shadow-blue-100/20">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} whileHover={{ scale: 1.05 }}
              className="relative text-2xl font-black italic tracking-tight cursor-pointer group"
            >
              <span className="relative z-10">Port<span className="text-[#1d7cf2] group-hover:text-purple-500 transition-colors duration-300">Hub</span></span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#1d7cf2]/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"
                animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </Link>
          <Link href="/dashboard">
            <motion.button
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
              className="relative px-6 py-2.5 bg-gradient-to-r from-[#1d7cf2] to-purple-500 text-white rounded-full font-bold text-sm shadow-xl shadow-blue-300/40 overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-200%', '200%'] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <span className="relative z-10 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                Go to Dashboard
              </span>
            </motion.button>
          </Link>
        </div>
        <Link href={`/profile/${userId}`}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1, rotate: 5, y: -2 }}
            className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1d7cf2] to-purple-500 flex items-center justify-center text-white shadow-xl shadow-blue-300/40 cursor-pointer overflow-hidden"
          >
            <User className="w-6 h-6 relative z-10" />
            <motion.div
              animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </Link>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-12 relative z-10">
        
        {/* Project Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="text-center mb-12 relative overflow-hidden px-2"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-40"
          >
            <Sparkles className="w-10 h-10 text-[#1d7cf2]" />
          </motion.div>
          <motion.h1 
            className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-gray-900 via-[#1d7cf2] to-purple-500 bg-clip-text text-transparent relative inline-block max-w-full break-words line-clamp-2"
            initial={{ scale: 0.9 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {project.title}
            <motion.div
              className="absolute -inset-2 bg-gradient-to-r from-[#1d7cf2]/10 to-purple-500/10 blur-2xl -z-10"
              animate={{ opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.h1>
        </motion.div>

        {/* Main Image Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          onHoverStart={() => setIsHovering(true)} onHoverEnd={() => setIsHovering(false)}
          className="max-w-3xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-2 border-white/60 bg-white/80 backdrop-blur-xl mb-8 relative group"
        >
          <motion.div
            animate={{ opacity: isHovering ? 0.7 : 0, scale: isHovering ? 1.05 : 1 }}
            className="absolute -inset-2 bg-gradient-to-r from-[#1d7cf2] via-purple-500 to-pink-500 rounded-3xl blur-2xl -z-10"
          />

          {imageCount > 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0, rotate: -180 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="absolute top-5 right-5 z-20 px-4 py-2 bg-black/70 backdrop-blur-md rounded-full text-white text-sm font-black flex items-center gap-2 shadow-xl"
            >
              <span className="text-[#1d7cf2]">{currentImageIndex + 1}</span>
              <span className="text-gray-400">/</span>
              <span>{imageCount}</span>
            </motion.div>
          )}

          <div
            className="aspect-[4/3] md:aspect-video relative bg-gradient-to-br from-gray-100 to-gray-200 select-none touch-pan-y"
            onMouseDown={handleDragStart} onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd} onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart} onTouchMove={handleDragMove} onTouchEnd={handleDragEnd}
          >
            {imageCount > 1 && (
              <>
                <motion.button
                  type="button" onClick={(e) => { e.stopPropagation(); goPrev(); }}
                  aria-label="รูปก่อนหน้า"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.15, x: -8 }} whileTap={{ scale: 0.9 }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl flex items-center justify-center text-[#1d7cf2] hover:bg-gradient-to-r hover:from-[#1d7cf2] hover:to-purple-500 hover:text-white transition-all border-2 border-white/60 group"
                >
                  <ChevronLeft className="w-7 h-7" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#1d7cf2]/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100"
                    animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.button>
                <motion.button
                  type="button" onClick={(e) => { e.stopPropagation(); goNext(); }}
                  aria-label="รูปถัดไป"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.15, x: 8 }} whileTap={{ scale: 0.9 }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl flex items-center justify-center text-[#1d7cf2] hover:bg-gradient-to-r hover:from-[#1d7cf2] hover:to-purple-500 hover:text-white transition-all border-2 border-white/60 group"
                >
                  <ChevronRight className="w-7 h-7" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#1d7cf2]/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100"
                    animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.button>
              </>
            )}

            {/* ✅ แสดงรูปถ้ามี ถ้าไม่มีแสดงพื้นที่เปล่า */}
            {imageCount > 0 ? (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-gray-100"
                style={{ x: dragOffset }}
                animate={{ x: dragOffset }}
                transition={{ type: "tween", duration: dragOffset ? 0 : 0.3 }}
              >
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    className="absolute inset-0 w-full flex items-center justify-center"
                    initial={{ opacity: 0, scale: 1.1, x: 30 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: -30 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <img
                      src={images[currentImageIndex]}
                      alt={`${project.title} - รูปที่ ${currentImageIndex + 1}`}
                      className="max-w-full max-h-full w-auto h-auto object-contain pointer-events-none"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <p className="text-gray-400 font-bold text-lg">ไม่มีรูปภาพ</p>
              </div>
            )}
          </div>

          {/* Dots */}
          {imageCount > 1 && (
            <div className="flex justify-center gap-2.5 py-6 bg-gradient-to-t from-white via-white/95 to-transparent">
              {images.map((_, idx) => (
                <motion.button
                  key={idx} type="button" aria-label={`รูปที่ ${idx + 1}`}
                  onClick={() => setCurrentImageIndex(idx)}
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + idx * 0.05 }}
                  whileHover={{ scale: 1.4, y: -2 }} whileTap={{ scale: 0.9 }}
                  className={`h-2.5 rounded-full transition-all shadow-lg ${
                    idx === currentImageIndex
                      ? "bg-gradient-to-r from-[#1d7cf2] to-purple-500 w-10"
                      : "bg-[#1d7cf2]/30 w-2.5 hover:bg-[#1d7cf2]/60"
                  }`}
                />
              ))}
            </div>
          )}
          {imageCount === 1 && (
            <div className="flex justify-center gap-2.5 py-6 bg-gradient-to-t from-white via-white/95 to-transparent">
              <motion.span
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="w-2.5 h-2.5 rounded-full shadow-md bg-gradient-to-r from-[#1d7cf2] to-purple-500"
              />
            </div>
          )}
        </motion.div>

        {/* Detail Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
          className="mb-16"
        >
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
            className="text-4xl md:text-5xl font-black tracking-tight text-center mb-10 relative inline-block w-full"
          >
            <span className="relative z-10 bg-gradient-to-r from-gray-900 via-[#1d7cf2] to-purple-500 bg-clip-text text-transparent">
              Detail
            </span>
            <motion.div
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.6, duration: 0.8 }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-gradient-to-r from-transparent via-[#1d7cf2] to-transparent rounded-full"
            />
          </motion.h2>

          <motion.div 
            whileHover={{ y: -8, scale: 1.01 }} transition={{ type: "spring", stiffness: 300 }}
            className="bg-white/70 backdrop-blur-2xl rounded-3xl p-10 md:p-14 shadow-2xl border-2 border-white/60 relative overflow-hidden group"
          >
            <motion.div
              animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-[#1d7cf2]/10 to-purple-500/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ rotate: [360, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-16 -left-16 w-40 h-40 bg-gradient-to-tr from-pink-500/10 to-orange-500/10 rounded-full blur-3xl"
            />

            <div className="relative z-10 overflow-hidden">
              <motion.p 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="text-gray-700 font-bold leading-relaxed text-lg whitespace-pre-line break-words max-h-96 overflow-y-auto pr-2"
              >
                {project.desc || 'ไม่มีรายละเอียดโปรเจกต์'}
              </motion.p>
            </div>
          </motion.div>
        </motion.section>
      </main>
    </div>
  );
}