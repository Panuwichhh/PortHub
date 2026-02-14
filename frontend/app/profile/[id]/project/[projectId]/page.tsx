"use client";

import React, { useMemo, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, User, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { mockUser } from "../../mockProfileData";

export default function ProjectCaseStudyPage() {
  const params = useParams();
  const projectId = Number(params.projectId);
  const userId = params.id;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartX = useRef(0);
  const lastDragOffset = useRef(0);
  const isDraggingRef = useRef(false);

  const project = useMemo(() => {
    if (Number.isNaN(projectId) || projectId < 0 || projectId >= mockUser.projects.length) {
      return null;
    }
    return mockUser.projects[projectId];
  }, [projectId]);

  const detail = project?.detail;
  const images = detail?.images && detail.images.length > 0 ? detail.images : (project ? [project.img] : []);
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

  if (!project) {
    return (
      <div className="min-h-screen bg-[#f8faff] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 font-bold mb-4">ไม่พบโปรเจกต์</p>
          <Link href={`/profile/${userId}`} className="text-[#1d7cf2] font-black underline">
            กลับไปโปรไฟล์
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faff] text-black font-sans pb-20">
      {/* Navbar */}
      <nav className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 px-6 md:px-12 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href={`/profile/${userId}`}>
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
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1d7cf2] to-blue-400 flex items-center justify-center text-white shadow-lg shadow-blue-100">
          <User className="w-6 h-6" />
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-10">
        {/* Project Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black tracking-tight text-center mb-10"
        >
          {project.title}
        </motion.h1>

        {/* Main Image (Hero) - เลื่อนด้วยปุ่มหรือลาก (swipe) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100 bg-white mb-6 relative"
        >
          <div
            className="aspect-[4/3] md:aspect-video relative bg-gray-100 select-none touch-pan-y"
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            {/* ปุ่มเลื่อนซ้าย */}
            {imageCount > 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                aria-label="รูปก่อนหน้า"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-[#1d7cf2] hover:bg-[#1d7cf2] hover:text-white transition-all active:scale-95"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {/* ปุ่มเลื่อนขวา */}
            {imageCount > 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                aria-label="รูปถัดไป"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-[#1d7cf2] hover:bg-[#1d7cf2] hover:text-white transition-all active:scale-95"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            <motion.div
              className="absolute inset-0 flex"
              style={{ x: dragOffset }}
              animate={{ x: dragOffset }}
              transition={{ type: "tween", duration: dragOffset ? 0 : 0.3 }}
            >
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={currentImageIndex}
                  className="absolute inset-0 w-full"
                  initial={{ opacity: 0.7, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0.7, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <img
                    src={images[currentImageIndex]}
                    alt={`${project.title} - รูปที่ ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover pointer-events-none"
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Carousel Dots */}
          {imageCount > 1 && (
            <div className="flex justify-center gap-2 py-4">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`รูปที่ ${idx + 1}`}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === currentImageIndex
                      ? "bg-[#1d7cf2] scale-110"
                      : "bg-[#1d7cf2]/30 hover:bg-[#1d7cf2]/50"
                  }`}
                />
              ))}
            </div>
          )}
          {imageCount === 1 && (
            <div className="flex justify-center gap-2 py-4">
              {[0, 1, 2, 3, 4].map((idx) => (
                <span
                  key={idx}
                  className={`w-2 h-2 rounded-full ${
                    idx <= 1 ? "bg-[#1d7cf2]" : "bg-[#1d7cf2]/20"
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Detail Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-8">
            Detail
          </h2>
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100">
            {detail?.fullDescription ? (
              <>
                <p className="text-gray-700 font-bold leading-relaxed mb-6 whitespace-pre-line">
                  {detail.fullDescription}
                </p>
                {detail.features && detail.features.length > 0 && (
                  <div>
                    <p className="text-[#1d7cf2] font-black text-sm uppercase tracking-wider mb-4">
                      ฟีเจอร์หลัก
                    </p>
                    <ul className="space-y-3">
                      {detail.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="text-gray-700 font-bold leading-relaxed flex gap-2"
                        >
                          <span className="text-[#1d7cf2] shrink-0">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-600 font-bold leading-relaxed">
                {project.desc}
              </p>
            )}
          </div>
        </motion.section>
      </main>
    </div>
  );
}
