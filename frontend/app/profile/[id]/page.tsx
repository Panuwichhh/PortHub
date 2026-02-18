"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Phone, ExternalLink, User, Sparkles, Award, GraduationCap, Code, Edit, Trash2, X, Upload, ZoomIn, ZoomOut, Check, AlertCircle, Presentation
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import Cropper from 'react-easy-crop';
import { userAPI, tokenManager } from '@/lib/api';

type Area = { x: number; y: number; width: number; height: number };
import toast from 'react-hot-toast';

interface ProfileData {
  user_id: number;
  user_name: string;
  email: string;
  phone?: string;
  university?: string;
  faculty?: string;
  major?: string;
  gpa?: number;
  job_interest?: string;
  profile_image_url?: string;
  skills: string[];
}

interface Project {
  id: string;
  title: string;
  desc: string;
  img: string;
  images: string[];
}

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300";

// ─── localStorage helpers ────────────────────────────────────────────────────
const getStorageKey = (userId: string) => `porthub_projects_${userId}`;

const loadProjectsFromStorage = (userId: string): Project[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Project[];
    console.log('📂 Loaded projects:', parsed.length);
    return parsed;
  } catch (error) {
    console.error('❌ Error loading projects:', error);
    return [];
  }
};

const saveProjectsToStorage = (userId: string, projects: Project[]) => {
  if (typeof window === 'undefined') return;
  try {
    const jsonStr = JSON.stringify(projects);
    const sizeKB = Math.round(jsonStr.length / 1024);
    console.log('💾 Saving projects... Size:', sizeKB, 'KB');
    
    localStorage.setItem(getStorageKey(userId), jsonStr);
    console.log('✅ Saved successfully!');
  } catch (error) {
    console.error('❌ Error saving projects:', error);
    alert('Error: Storage full. Please remove some old projects.');
    throw error;
  }
};

// ✅ Compress Image Function
const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize ถ้ารูปใหญ่เกินไป
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        // แปลงเป็น base64 พร้อม compress
        const compressed = canvas.toDataURL('image/jpeg', quality);
        
        // เช็คขนาด
        const sizeKB = Math.round(compressed.length / 1024);
        console.log(`📸 Compressed: ${sizeKB}KB (Original: ~${Math.round(file.size / 1024)}KB)`);
        
        if (sizeKB > 500) {
          console.warn('⚠️ Image still large after compression');
        }
        
        resolve(compressed);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
// ─────────────────────────────────────────────────────────────────────────────

export default function ProfileDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    user_id: 0, user_name: '', email: '', phone: '', university: '', faculty: '',
    major: '', gpa: 0, job_interest: '', profile_image_url: '', skills: []
  });
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editFormData, setEditFormData] = useState<ProfileData>({ ...profileData });
  const [skillInputs, setSkillInputs] = useState<string[]>([""]);
  
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [editProjectData, setEditProjectData] = useState({ title: '', desc: '' });
  const [projectGalleryFiles, setProjectGalleryFiles] = useState<File[]>([]);
  const [projectGalleryPreviews, setProjectGalleryPreviews] = useState<string[]>([]);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
  const [deleteProjectIdx, setDeleteProjectIdx] = useState<number | null>(null);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  
  const [uploadingProject, setUploadingProject] = useState(false);

  // โหลด projects จาก API เมื่อเป็น profile ของตัวเอง (refresh/login แล้วยังอยู่)
  useEffect(() => {
    if (!userId) return;
    setProjectsLoaded(false);
    if (!isOwnProfile) {
      setProjects([]);
      setProjectsLoaded(true);
      return;
    }
    if (!tokenManager.hasToken()) {
      setProjects([]);
      setProjectsLoaded(true);
      return;
    }
    userAPI.getMyProjects()
      .then((res) => {
        const list = Array.isArray(res) ? res.map((p: { id: string; title: string; desc: string; img?: string; images?: string[] }) => ({
          id: p.id,
          title: p.title,
          desc: p.desc,
          img: p.img ?? '',
          images: Array.isArray(p.images) ? p.images : [],
        })) : [];
        setProjects(list);
        setProjectsLoaded(true);
      })
      .catch(() => {
        // fallback: แสดงจาก localStorage เหมือนเดิมเมื่อ API error (เช่น JSON parse error)
        const stored = loadProjectsFromStorage(userId);
        setProjects(stored);
        setProjectsLoaded(true);
      });
  }, [userId, isOwnProfile]);

  useEffect(() => {
    if (!userId) return;
    fetchProfileData();
  }, [userId]);

  const checkIfOwnProfile = async () => {
    if (!tokenManager.hasToken()) { 
      setIsOwnProfile(false); 
      return; 
    }
    
    try {
      const data = await userAPI.getMe();
      setIsOwnProfile(data.user_id.toString() === userId);
    } catch (error) { 
      console.error("Check own profile error:", error);
      setIsOwnProfile(false); 
    }
  };

  const fetchProfileData = async (options?: { skillsOverride?: string[] }) => {
    try {
      let own = false;
      if (tokenManager.hasToken()) {
        try {
          const me = await userAPI.getMe();
          own = me.user_id.toString() === userId;
          setIsOwnProfile(own);
        } catch (_e) {
          setIsOwnProfile(false);
        }
      } else {
        setIsOwnProfile(false);
      }

      if (own) {
        const data = await userAPI.getMe();
        let skillsList: string[] = [];
        if (options?.skillsOverride !== undefined) {
          skillsList = Array.isArray(options.skillsOverride) ? options.skillsOverride : [];
        } else if (Array.isArray(data.skills) && data.skills.length > 0) {
          skillsList = data.skills;
        } else {
          try {
            const skillsRes = await userAPI.getMySkills();
            skillsList = Array.isArray(skillsRes) ? skillsRes : [];
          } catch (_e) {
            skillsList = [];
          }
        }
        const mappedData: ProfileData = {
          user_id: data.user_id,
          user_name: data.user_name || 'No Name',
          email: data.email || '',
          phone: data.phone || '',
          university: data.university || 'No University',
          faculty: data.faculty || 'No Faculty',
          major: data.major || 'No Major',
          gpa: data.gpa || 0,
          job_interest: data.job_interest || 'No Job Interest',
          profile_image_url: data.profile_image_url || '',
          skills: skillsList
        };
        setProfileData(mappedData);
        setEditFormData(mappedData);
        setProfileLoading(false);
      } else {
        // โหลด public profile ของคนอื่น (หรือ guest ดู profile ที่ publish แล้ว)
        try {
          const pub = await userAPI.getPublicProfile(userId);
          const mappedData: ProfileData = {
            user_id: pub.user_id,
            user_name: pub.user_name || 'No Name',
            email: '',
            phone: pub.phone || '',
            university: pub.university || 'No University',
            faculty: pub.faculty || 'No Faculty',
            major: pub.major || 'No Major',
            gpa: pub.gpa || 0,
            job_interest: pub.job_interest || 'No Job Interest',
            profile_image_url: pub.profile_image_url || '',
            skills: Array.isArray(pub.skills) ? pub.skills : []
          };
          setProfileData(mappedData);
          setEditFormData(mappedData);
          const projList: Project[] = Array.isArray(pub.projects)
            ? pub.projects.map((p: { id: string; title: string; desc: string; img: string; images?: string[] }) => ({
                id: p.id,
                title: p.title,
                desc: p.desc,
                img: p.img ?? '',
                images: Array.isArray(p.images) ? p.images : []
              }))
            : [];
          setProjects(projList);
        } catch (e) {
          console.error('Fetch public profile error:', e);
          toast.error('Profile not found or not published to Dashboard');
        }
        setProfileLoading(false);
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
      toast.error('Profile not found or backend is not ready');
      setProfileLoading(false);
    }
  };

  const openEditProjectModal = () => {
    setEditProjectData({ title: '', desc: '' });
    setProjectGalleryFiles([]);
    setProjectGalleryPreviews([]);
    setShowEditProjectModal(true);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const totalFiles = projectGalleryFiles.length + files.length;
    if (totalFiles > 4) {
      alert('สามารถอัปโหลดได้สูงสุด 4 รูปเท่านั้น! 🚫');
      return;
    }

    // เช็คขนาดไฟล์
    const oversizedFiles = files.filter(f => f.size > 10 * 1024 * 1024); // 10MB
    if (oversizedFiles.length > 0) {
      alert('มีไฟล์ที่ใหญ่เกิน 10MB กรุณาเลือกไฟล์ที่เล็กกว่า');
      return;
    }

    // Compress images และสร้าง previews
    const newPreviews: string[] = [];
    for (const file of files) {
      const preview = URL.createObjectURL(file);
      newPreviews.push(preview);
    }

    setProjectGalleryFiles(prev => [...prev, ...files]);
    setProjectGalleryPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeGalleryImage = (idx: number) => {
    setProjectGalleryFiles(prev => prev.filter((_, i) => i !== idx));
    setProjectGalleryPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveProject = async () => {
    if (!editProjectData.title.trim()) {
      alert('กรุณากรอกชื่อ Project! 📝');
      return;
    }

    setUploadingProject(true);

    try {
      console.log('💾 Compressing and saving project...');

      // Compress รูปทั้งหมด
      let compressedImages: string[] = [];
      if (projectGalleryFiles.length > 0) {
        console.log('🖼️ Compressing', projectGalleryFiles.length, 'images...');
        
        for (let i = 0; i < projectGalleryFiles.length; i++) {
          const file = projectGalleryFiles[i];
          console.log(`Compressing image ${i + 1}/${projectGalleryFiles.length}...`);
          
          // Compress image ด้วย quality 0.7 และ maxWidth 800px
          const compressed = await compressImage(file, 800, 0.7);
          compressedImages.push(compressed);
        }
        
        console.log('✅ All images compressed successfully');
      }

      const newProject: Project = {
        id: `p${Date.now()}`,
        title: editProjectData.title,
        desc: editProjectData.desc,
        img: compressedImages[0] ?? '',
        images: compressedImages,
      };

      try {
        const created = await userAPI.createProject({
          title: editProjectData.title,
          desc: editProjectData.desc,
          images: compressedImages,
        }) as { id: string; title: string; desc: string; img: string; images: string[] } | null;
        if (created?.id) {
          newProject.id = created.id;
          newProject.img = created.img ?? compressedImages[0] ?? '';
          newProject.images = Array.isArray(created.images) ? created.images : compressedImages;
        }
      } catch (_apiErr) {
        toast.error('Failed to save to server. Saved locally.');
      }

      const updated = [...projects, newProject];
      saveProjectsToStorage(userId, updated);
      setProjects(updated);
      setShowEditProjectModal(false);
      setSuccessMessage('Project added successfully! 🚀');
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Failed to save project');
    } finally {
      setUploadingProject(false);
    }
  };

  const openDeleteProjectModal = (idx: number) => {
    setDeleteProjectIdx(idx);
    setShowDeleteProjectModal(true);
  };

  const confirmDeleteProject = async () => {
    if (deleteProjectIdx === null) return;
    const projectToDelete = projects[deleteProjectIdx];
    if (!projectToDelete) return;
    try {
      await userAPI.deleteProject(projectToDelete.id);
      setProjects(prev => prev.filter((_, i) => i !== deleteProjectIdx));
      setShowDeleteProjectModal(false);
      setDeleteProjectIdx(null);
      setSuccessMessage('Project deleted successfully! 🗑️');
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
    } catch (e) {
      toast.error('Failed to delete project');
    }
  };

  const handleUpdateToDashboard = async () => {
    if (!tokenManager.hasToken()) {
      toast.error('Please log in first');
      return;
    }
    try {
      await userAPI.setDashboardVisibility(true);
      setSuccessMessage('Published to Dashboard successfully! ✅');
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
      toast.success('Published to Dashboard successfully!');
    } catch (error) {
      console.error('Update to dashboard error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to publish to Dashboard');
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!tokenManager.hasToken()) { 
      toast.error('Please log in first'); 
      return; 
    }
    
    try {
      await userAPI.deleteMe();
      toast.success('Account deleted successfully!');
      tokenManager.removeToken();
      router.push('/');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to delete account');
      }
    }
  };


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setImageSrc(reader.result as string); setShowCropModal(true); };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', reject);
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
    return new Promise(resolve => {
      canvas.toBlob(blob => {
        if (!blob) return;
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => resolve(reader.result as string);
      }, 'image/jpeg');
    });
  };

  const handleCropConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      const url = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCroppedImage(url);
      setEditFormData(prev => ({ ...prev, profile_image_url: url }));
      setShowCropModal(false); setZoom(1); setCrop({ x: 0, y: 0 });
    } catch (e) { console.error(e); }
  };

  const handleCropCancel = () => { setShowCropModal(false); setImageSrc(null); setZoom(1); setCrop({ x: 0, y: 0 }); };

  const openEditModal = () => {
    if (!isOwnProfile) return;
    setEditFormData({ ...profileData, skills: profileData.skills ?? [] });
    setSkillInputs([""]); 
    setCroppedImage(null);
    setShowEditModal(true);
  };

  const addSkillInput = () => setSkillInputs(prev => [...prev, ""]);
  
  const SKILL_MAX_LENGTH = 100;
  const updateSkillInput = (index: number, value: string) => {
    if (value.length > SKILL_MAX_LENGTH) {
      toast.error(`Skills field must not exceed ${SKILL_MAX_LENGTH} characters`);
    }
    const capped = value.slice(0, SKILL_MAX_LENGTH);
    setSkillInputs(prev => prev.map((v, i) => (i === index ? capped : v)));
  };
  
  const addSkillFromInput = (index: number) => {
    const raw = skillInputs[index]?.trim();
    const value = raw ? raw.slice(0, SKILL_MAX_LENGTH) : '';
    const currentSkills = editFormData.skills ?? [];
    if (value && !currentSkills.includes(value)) {
      setEditFormData(prev => ({ ...prev, skills: [...(prev.skills ?? []), value] }));
      setSkillInputs(prev => { 
        const next = [...prev]; 
        next[index] = ""; 
        return next; 
      });
    }
  };
  
  const removeSkill = (s: string) => {
    setEditFormData(prev => ({ ...prev, skills: (prev.skills ?? []).filter(x => x !== s) }));
  };
  
  const removeSkillInput = (index: number) => {
    setSkillInputs(prev => prev.length <= 1 ? prev : prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!tokenManager.hasToken()) { 
      toast.error('Please log in first'); 
      return; 
    }
    
    try {
      const gpaRaw = editFormData.gpa ?? 0;
      const gpa = Number.isFinite(gpaRaw) ? Math.max(0, Math.min(4, gpaRaw)) : 0;
      const savedSkills = (editFormData.skills ?? []).slice();
      await userAPI.updateMe({
        user_name: editFormData.user_name,
        phone: editFormData.phone || '',
        university: editFormData.university || '',
        faculty: editFormData.faculty || '', 
        major: editFormData.major || '', 
        gpa,
        job_interest: editFormData.job_interest || '',
        profile_image_url: croppedImage || editFormData.profile_image_url || '',
        skills: savedSkills as string[],
      });

      await fetchProfileData({ skillsOverride: savedSkills });
      setShowEditModal(false);
      setSuccessMessage('Profile saved successfully! 🎉');
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
      toast.success('Profile saved successfully!');
    } catch (error) {
      console.error('Update profile error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to save profile');
      }
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f7ff] via-white to-[#fef3ff] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#1d7cf2] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7ff] via-white to-[#fef3ff] text-black font-sans relative overflow-hidden">
      
      <div className="fixed inset-0 pointer-events-none">
        <motion.div animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/3 -right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#1d7cf2] to-blue-300 rounded-full blur-[150px]" />
        <motion.div animate={{ scale: [1, 1.4, 1], rotate: [0, -180, -360], opacity: [0.03, 0.07, 0.03] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/3 -left-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-purple-300 to-pink-200 rounded-full blur-[150px]" />
        {[...Array(6)].map((_, i) => (
          <motion.div key={i} animate={{ y: [0, -30, 0], x: [0, Math.random() * 20 - 10, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
            className="absolute w-2 h-2 bg-[#1d7cf2] rounded-full"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }} />
        ))}
      </div>

      {/* Navbar */}
      <nav className="w-full bg-white/60 backdrop-blur-2xl border-b border-white/40 px-6 md:px-12 py-4 flex justify-between items-center sticky top-0 z-50 shadow-lg shadow-blue-100/20">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} whileHover={{ scale: 1.05 }}
              className="relative text-2xl font-black italic tracking-tight cursor-pointer group">
              <span className="relative z-10">Port<span className="text-[#1d7cf2] group-hover:text-purple-500 transition-colors duration-300">Hub</span></span>
              <motion.div className="absolute inset-0 bg-gradient-to-r from-[#1d7cf2]/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"
                animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            </motion.div>
          </Link>
          <Link href="/dashboard">
            <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
              className="relative px-6 py-2.5 bg-gradient-to-r from-[#1d7cf2] to-purple-500 text-white rounded-full font-bold text-sm shadow-xl shadow-blue-300/40 overflow-hidden group">
              <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-200%', '200%'] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
              <span className="relative z-10 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                Go to Dashboard
              </span>
            </motion.button>
          </Link>
        </div>
        {isOwnProfile && (
          <Link href={`/profile/${userId}`}>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1, rotate: 5, y: -2 }}
              className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1d7cf2] to-purple-500 flex items-center justify-center text-white shadow-xl shadow-blue-300/40 cursor-pointer overflow-hidden">
              <User className="w-6 h-6 relative z-10" />
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent" />
            </motion.div>
          </Link>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        
        {/* Left Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          
          {/* Profile Card */}
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6 }} whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white/70 backdrop-blur-2xl rounded-3xl p-8 text-center border border-white/60 shadow-2xl shadow-blue-200/20 relative overflow-hidden">
            <motion.div animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-[#1d7cf2]/10 to-purple-500/10 rounded-full blur-2xl" />
            <motion.div animate={{ rotate: [360, 0], scale: [1, 1.2, 1] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-12 -left-12 w-32 h-32 bg-gradient-to-tr from-pink-500/10 to-orange-500/10 rounded-full blur-2xl" />
            {isOwnProfile && (
              <motion.button onClick={openEditModal} whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                className="absolute top-4 right-4 w-10 h-10 bg-gradient-to-r from-[#1d7cf2] to-purple-500 rounded-full flex items-center justify-center text-white shadow-xl z-20">
                <Edit className="w-5 h-5" />
              </motion.button>
            )}
            <div className="relative w-36 h-36 mx-auto mb-6">
              <motion.div animate={{ rotate: [0, 360], scale: [1, 1.15, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-[#1d7cf2] via-purple-500 to-pink-500 opacity-30 blur-xl" />
              <motion.div whileHover={{ scale: 1.05, rotate: 5 }}
                className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-2xl bg-gray-100">
                {profileData.profile_image_url ? (
                  <img src={profileData.profile_image_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
              </motion.div>
              <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-4 border-white shadow-lg" />
            </div>
            <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="text-2xl font-black mb-1 bg-gradient-to-r from-gray-900 via-[#1d7cf2] to-purple-500 bg-clip-text text-transparent">
              {profileData.user_name}
            </motion.h1>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="mt-6 space-y-3 text-left relative z-10">
              {profileData.phone && (
                <motion.div whileHover={{ x: 5, scale: 1.02 }} className="flex items-center gap-3 text-sm group cursor-pointer">
                  <div className="p-2.5 bg-blue-50 rounded-xl group-hover:bg-gradient-to-r group-hover:from-[#1d7cf2] group-hover:to-blue-500 transition-all shadow-md">
                    <Phone className="w-4 h-4 text-[#1d7cf2] group-hover:text-white transition-colors" />
                  </div>
                  <span className="group-hover:text-[#1d7cf2] transition-colors font-semibold">{profileData.phone}</span>
                </motion.div>
              )}
              <motion.div whileHover={{ x: 5, scale: 1.02 }} className="flex items-center gap-3 text-sm group cursor-pointer">
                <div className="p-2.5 bg-blue-50 rounded-xl group-hover:bg-gradient-to-r group-hover:from-[#1d7cf2] group-hover:to-blue-500 transition-all shadow-md">
                  <Mail className="w-4 h-4 text-[#1d7cf2] group-hover:text-white transition-colors" />
                </div>
                <span className="break-all group-hover:text-[#1d7cf2] transition-colors font-semibold">{profileData.email}</span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* University Info */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-2xl shadow-blue-200/20 relative overflow-hidden group">
            <motion.div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity"
              animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
              <GraduationCap className="w-20 h-20 text-[#1d7cf2]" />
            </motion.div>
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}
                className="p-2.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-md">
                <GraduationCap className="w-5 h-5 text-[#1d7cf2]" />
              </motion.div>
              <h3 className="font-black text-lg">University</h3>
            </div>
            <div className="space-y-2 text-sm relative z-10">
              {[
                { label: 'Name', value: profileData.university },
                { label: 'Faculty', value: profileData.faculty },
                { label: 'Major', value: profileData.major },
              ].map(({ label, value }, i) => (
                <motion.p key={label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }} whileHover={{ x: 5 }}
                  className="hover:text-[#1d7cf2] transition-colors cursor-default">
                  <span className="font-bold">{label}:</span> {value}
                </motion.p>
              ))}
              <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                whileHover={{ x: 5, scale: 1.05 }} className="cursor-default">
                <span className="font-bold">GPAX:</span>{' '}
                <span className="text-[#1d7cf2] font-black text-lg">{profileData.gpa?.toFixed(2) || '0.00'}</span>
              </motion.p>
            </div>
          </motion.div>

          {/* Skills */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-2xl shadow-blue-200/20 relative overflow-visible group">
            <motion.div className="absolute bottom-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity"
              animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }}>
              <Code className="w-20 h-20 text-[#1d7cf2]" />
            </motion.div>
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}
                className="p-2.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-md">
                <Code className="w-5 h-5 text-[#1d7cf2]" />
              </motion.div>
              <h3 className="font-black text-lg">Skills</h3>
            </div>
            <div className="flex flex-wrap gap-2 relative z-10">
              {(profileData.skills ?? []).length > 0 ? (profileData.skills ?? []).map((skill, idx) => (
                <motion.span key={idx} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + idx * 0.1 }} whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0], y: -2 }}
                  className="px-4 py-2 border-2 border-[#1d7cf2] text-[#1d7cf2] rounded-xl text-sm font-bold hover:bg-gradient-to-r hover:from-[#1d7cf2] hover:to-purple-500 hover:text-white hover:border-transparent transition-all cursor-default shadow-md hover:shadow-xl">
                  {skill}
                </motion.span>
              )) : (
                <p className="text-gray-400 text-sm">No skills added yet</p>
              )}
            </div>
          </motion.div>

          {/* Update + Delete Account Buttons */}
          {isOwnProfile && (
            <div className="space-y-3">
              <motion.button
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={handleUpdateToDashboard}
                className="relative w-full py-4 bg-gradient-to-r from-[#1d7cf2] to-purple-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-300/40 overflow-hidden flex items-center justify-center gap-2">
                <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-200%', '200%'] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 relative z-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span className="relative z-10 uppercase tracking-widest">Update to Dashboard</span>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-red-300/40 flex items-center justify-center gap-2 hover:from-red-600 hover:to-red-700 transition-all">
                <Trash2 className="w-5 h-5" />
                <span className="uppercase tracking-widest">Delete Account</span>
              </motion.button>
            </div>
          )}
        </aside>

        {/* Right Content */}
        <section className="lg:col-span-8 space-y-10">
          
          {/* Job Interest */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white/70 backdrop-blur-2xl rounded-3xl p-8 border border-white/60 shadow-2xl shadow-blue-200/20 relative overflow-hidden group">
            <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles className="w-16 h-16 text-[#1d7cf2]" />
            </motion.div>
            <div className="flex items-center gap-2 mb-4">
              <motion.div whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.5 }}
                className="p-2.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-md">
                <Award className="w-5 h-5 text-[#1d7cf2]" />
              </motion.div>
              <h2 className="text-2xl font-black">Job Interest</h2>
            </div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="text-[#1d7cf2] text-xl font-bold leading-relaxed">
              {profileData.job_interest}
            </motion.p>
          </motion.div>

          <motion.hr initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5, duration: 0.8 }}
            className="border-gray-200/50" />

          {/* Projects Section */}
          <div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black bg-gradient-to-r from-gray-900 to-[#1d7cf2] bg-clip-text text-transparent">Projects</h2>
                <motion.div animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                  <Sparkles className="w-7 h-7 text-[#1d7cf2]" />
                </motion.div>
              </div>
              {isOwnProfile && (
                <motion.button
                  onClick={openEditProjectModal}
                  whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                  className="relative px-6 py-2.5 bg-gradient-to-r from-[#1d7cf2] to-purple-500 text-white rounded-full font-bold text-sm shadow-xl shadow-blue-300/40 overflow-hidden group flex items-center gap-2">
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-200%', '200%'] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
                  <Edit className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Add Project</span>
                </motion.button>
              )}
            </motion.div>
            
            {!projectsLoaded ? (
              <div className="flex justify-center py-20">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 border-4 border-[#1d7cf2] border-t-transparent rounded-full" />
              </div>
            ) : projects.length > 0 ? (
              <div className="space-y-8">
                {projects.map((project, idx) => (
                  <motion.div key={project.id}
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.15 }} whileHover={{ y: -10, scale: 1.02 }}
                    onHoverStart={() => setHoveredProject(idx)} onHoverEnd={() => setHoveredProject(null)}
                    className="bg-white/70 backdrop-blur-2xl border-2 border-[#1d7cf2] rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl transition-all duration-300 relative group">
                    <motion.div animate={{ opacity: hoveredProject === idx ? 0.6 : 0, scale: hoveredProject === idx ? 1.05 : 1 }}
                      className="absolute -inset-2 bg-gradient-to-r from-[#1d7cf2] via-purple-500 to-pink-500 rounded-3xl blur-2xl -z-10" />
                    
                    {isOwnProfile && (
                      <motion.button
                        onClick={() => openDeleteProjectModal(idx)}
                        whileHover={{ scale: 1.1, rotate: 10 }} whileTap={{ scale: 0.9 }}
                        className="absolute top-4 right-4 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white shadow-xl z-20 hover:bg-red-600">
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    )}

                    <div className="md:w-72 h-56 md:h-auto flex-shrink-0 relative overflow-hidden bg-gray-100">
                      {project.img ? (
                        <>
                          <motion.img whileHover={{ scale: 1.15 }} transition={{ duration: 0.4 }}
                            src={project.img} alt={project.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                        </>
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Presentation className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                      <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.5 + idx * 0.1, type: "spring" }} whileHover={{ scale: 1.1, rotate: 360 }}
                        className="absolute top-4 left-4 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center font-black text-lg text-[#1d7cf2] shadow-xl border-2 border-[#1d7cf2]">
                        {idx + 1}
                      </motion.div>
                    </div>

                    <div className="flex-1 p-8 flex flex-col justify-between relative min-w-0 overflow-hidden">
                      <div className="min-h-0 flex flex-col">
                        <motion.h3 className="text-2xl font-black bg-gradient-to-r from-[#1d7cf2] to-purple-500 bg-clip-text text-transparent mb-3 flex items-center gap-2 shrink-0 min-w-0 overflow-hidden"
                          whileHover={{ x: 5 }}>
                          <span className="truncate">{project.title}</span>
                          <motion.span animate={{ x: hoveredProject === idx ? [0, 8, 0] : 0 }}
                            transition={{ duration: 0.6, repeat: hoveredProject === idx ? Infinity : 0 }}
                            className="text-[#1d7cf2] shrink-0">→</motion.span>
                        </motion.h3>
                        <p className="text-gray-600 text-sm leading-relaxed font-medium line-clamp-3 overflow-hidden break-words">{project.desc}</p>
                      </div>
                      <div className="mt-6 flex justify-end shrink-0">
                        <Link href={`/profile/${userId}/project/${project.id}`}>
                          <motion.button type="button" whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.95 }}
                            className="relative px-8 py-3 bg-gradient-to-r from-[#1d7cf2] to-purple-500 text-white rounded-full font-black text-sm flex items-center gap-2 shadow-xl shadow-blue-300/40 overflow-hidden group">
                            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                              animate={{ x: ['-200%', '200%'] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
                            <span className="relative z-10">Explore</span>
                            <ExternalLink className="w-4 h-4 relative z-10" />
                          </motion.button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-7xl mb-6"
                >
                  📦
                </motion.div>
                <p className="text-gray-400 text-lg font-semibold">No projects yet</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Edit Project Modal */}
      <AnimatePresence>
        {showEditProjectModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
            onClick={() => setShowEditProjectModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-[760px] overflow-hidden border border-white/60">

              <motion.button onClick={() => setShowEditProjectModal(false)}
                whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center text-gray-500 shadow-lg z-20 transition-all">
                <X className="w-5 h-5" />
              </motion.button>

              <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8">
                
                <div className="flex-1 flex flex-col gap-4">
                  <motion.div
                    onClick={() => {
                      if (projectGalleryFiles.length >= 4) {
                        alert('สามารถอัปโหลดได้สูงสุด 4 รูปเท่านั้น! 🚫');
                        return;
                      }
                      galleryInputRef.current?.click();
                    }}
                    whileHover={{ scale: 1.02, borderColor: '#1d7cf2' }}
                    className="relative flex flex-col items-center justify-center w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-[#1d7cf2]/40 bg-blue-50/50 cursor-pointer hover:bg-blue-50 transition-all overflow-hidden">
                    <input ref={galleryInputRef} type="file" multiple accept="image/*"
                      onChange={handleGalleryUpload} className="hidden" />
                    
                    {projectGalleryPreviews.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3 w-full p-3">
                        {projectGalleryPreviews.slice(0, 4).map((src, i) => (
                          <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-white shadow-md flex items-center justify-center ring-2 ring-[#1d7cf2]/10">
                            <img src={src} alt="" className="w-full h-full object-contain" />
                            <motion.button
                              onClick={e => { e.stopPropagation(); removeGalleryImage(i); }}
                              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              className="absolute top-1.5 right-1.5 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-600 z-10">
                              <X className="w-4 h-4" />
                            </motion.button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity }}
                          className="w-14 h-14 bg-[#1d7cf2]/10 rounded-2xl flex items-center justify-center mb-3">
                          <Upload className="w-7 h-7 text-[#1d7cf2]" />
                        </motion.div>
                        <p className="text-[#1d7cf2] font-bold text-sm">Click to upload images</p>
                        <p className="text-gray-400 text-xs mt-1">PNG, JPG, WEBP (Max 4 images, 10MB each)</p>
                      </>
                    )}
                  </motion.div>

                  <p className="text-xs text-gray-400 font-semibold text-center">
                    {projectGalleryPreviews.length === 0 ? 'No files uploaded yet.' : `${projectGalleryPreviews.length}/4 file(s) uploaded`}
                  </p>
                </div>

                <div className="flex-1 flex flex-col gap-5">
                  <div>
                    <label className="block text-[#1d7cf2] font-black text-sm mb-2 uppercase tracking-wide">Project Name</label>
                    <input
                      type="text"
                      value={editProjectData.title}
                      onChange={e => setEditProjectData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter project name..."
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-[#1d7cf2] focus:ring-4 focus:ring-[#1d7cf2]/10 transition-all text-black bg-white shadow-sm font-semibold placeholder:text-gray-300"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <label className="block text-[#1d7cf2] font-black text-sm mb-2 uppercase tracking-wide">Detail</label>
                    <textarea
                      value={editProjectData.desc}
                      onChange={e => setEditProjectData(prev => ({ ...prev, desc: e.target.value }))}
                      placeholder="Describe your project..."
                      rows={6}
                      className="flex-1 w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-[#1d7cf2] focus:ring-4 focus:ring-[#1d7cf2]/10 transition-all text-black bg-white shadow-sm font-semibold placeholder:text-gray-300 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="px-8 md:px-10 pb-8">
                <motion.button
                  onClick={handleSaveProject}
                  whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                  disabled={!editProjectData.title.trim() || uploadingProject}
                  className="relative w-full py-4 bg-gradient-to-r from-[#1d7cf2] to-purple-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-300/40 overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed">
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-200%', '200%'] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
                  <span className="relative z-10">
                    {uploadingProject ? 'Saving...' : 'Save'}
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Project Modal */}
      <AnimatePresence>
        {showDeleteProjectModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-lg flex items-center justify-center p-4 z-[110]"
            onClick={() => setShowDeleteProjectModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-[420px] p-10 text-center overflow-hidden border border-white/60">
              
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-full blur-3xl" />

              <div className="relative z-10">
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                  className="flex justify-center mb-6">
                  <div className="relative w-20 h-20 rounded-full border-4 border-[#1d7cf2] flex items-center justify-center bg-white shadow-2xl shadow-blue-200/50">
                    <Presentation className="w-10 h-10 text-[#1d7cf2]" />
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full border-4 border-[#1d7cf2]/30" />
                  </div>
                </motion.div>

                <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="text-2xl font-black text-[#1d7cf2] mb-2">Delete project ?</motion.h3>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="text-gray-500 font-bold text-sm mb-8">Are you sure you want to delete your project?</motion.p>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="flex gap-4">
                  <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDeleteProjectModal(false)}
                    className="relative flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#1d7cf2] to-blue-500 text-white font-black text-sm uppercase tracking-wide shadow-xl overflow-hidden">
                    <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-200%', '200%'] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
                    <span className="relative z-10">Cancel</span>
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                    onClick={confirmDeleteProject}
                    className="relative flex-1 py-4 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-black text-sm uppercase tracking-wide shadow-xl overflow-hidden">
                    <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-200%', '200%'] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
                    <span className="relative z-10">Delete</span>
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Image Crop Modal */}
      <AnimatePresence>
        {showCropModal && imageSrc && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[150]"
            onClick={handleCropCancel}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }} onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#1d7cf2] to-purple-500 p-6 flex justify-between items-center">
                <h3 className="text-2xl font-black text-white">Crop Image</h3>
                <motion.button onClick={handleCropCancel} whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all">
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
              <div className="relative w-full h-96 bg-gray-100">
                <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false}
                  onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
              </div>
              <div className="p-6 space-y-4 bg-gray-50">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <ZoomOut className="w-4 h-4 text-[#1d7cf2]" />Zoom
                    </label>
                    <span className="text-sm font-bold text-[#1d7cf2]">{Math.round(zoom * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="range" min={1} max={3} step={0.1} value={zoom}
                      onChange={e => setZoom(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1d7cf2]" />
                    <ZoomIn className="w-4 h-4 text-[#1d7cf2]" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <motion.button onClick={handleCropCancel} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all">Cancel</motion.button>
                  <motion.button onClick={handleCropConfirm} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 bg-gradient-to-r from-[#1d7cf2] to-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg">
                    <Check className="w-5 h-5" />Apply
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100] overflow-y-auto"
            onClick={() => setShowEditModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="bg-white/90 backdrop-blur-2xl w-full max-w-[1000px] my-8 p-10 md:p-14 rounded-3xl shadow-2xl flex flex-col md:flex-row gap-12 relative border-2 border-white/60 overflow-hidden max-h-[90vh] overflow-y-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <motion.button onClick={() => setShowEditModal(false)} whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                className="absolute top-4 right-4 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white shadow-xl z-20 hover:bg-red-600">
                <X className="w-6 h-6" />
              </motion.button>
              <div className="flex-1 space-y-5 relative z-10">
                <h2 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-[#1d7cf2] to-purple-500 bg-clip-text text-transparent mb-8">Edit Profile</h2>
                <div className="flex flex-col items-center mb-6">
                  <div className="relative w-32 h-32 mb-4">
                    {(croppedImage || editFormData.profile_image_url) ? (
                      <img src={croppedImage || editFormData.profile_image_url} alt="Profile Preview"
                        className="w-full h-full rounded-full object-cover border-4 border-[#1d7cf2] shadow-xl" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gray-100 border-4 border-[#1d7cf2] shadow-xl" />
                    )}
                    <label className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-r from-[#1d7cf2] to-purple-500 rounded-full flex items-center justify-center text-white shadow-xl cursor-pointer hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5" />
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 font-semibold">Click icon to upload & crop image</p>
                </div>
                <div className="space-y-5 text-left">
                  <InputGroup label="Name" value={editFormData.user_name} onChange={(e: any) => setEditFormData(prev => ({ ...prev, user_name: e.target.value }))} maxLength={255} />
                  <InputGroup label="E-mail" value={editFormData.email} onChange={(e: any) => setEditFormData(prev => ({ ...prev, email: e.target.value }))} disabled={true} />
                  <InputGroup label="Phone" value={editFormData.phone} onChange={(e: any) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))} maxLength={50} />
                  <InputGroup label="Job Interest" value={editFormData.job_interest} onChange={(e: any) => setEditFormData(prev => ({ ...prev, job_interest: e.target.value }))} maxLength={500} />
                </div>
              </div>
              <div className="hidden md:block w-[2px] bg-gradient-to-b from-transparent via-gray-200 to-transparent self-stretch mt-12 mb-4" />
              <div className="flex-1 space-y-5 pt-0 md:pt-16 relative z-10">
                <div className="space-y-5 text-left">
                  <InputGroup label="University" value={editFormData.university} onChange={(e: any) => setEditFormData(prev => ({ ...prev, university: e.target.value }))} maxLength={255} />
                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Faculty" value={editFormData.faculty} onChange={(e: any) => setEditFormData(prev => ({ ...prev, faculty: e.target.value }))} maxLength={255} />
                    <InputGroup label="Major" value={editFormData.major} onChange={(e: any) => setEditFormData(prev => ({ ...prev, major: e.target.value }))} maxLength={255} />
                  </div>
                  <InputGroup label="GPAX" value={editFormData.gpa?.toString() ?? ''} onChange={(e: any) => { const v = parseFloat(e.target.value); const gpa = Number.isFinite(v) ? Math.max(0, Math.min(4, v)) : 0; setEditFormData(prev => ({ ...prev, gpa })); }} type="number" step="0.01" min={0} max={4} placeholder="0–4.00" />
                  <div>
                    <label className="block text-[#1d7cf2] font-black text-sm mb-2 ml-1 uppercase tracking-wide">Skills</label>
                    <div className="rounded-2xl border-2 border-gray-200 bg-white/80 p-5 space-y-4 focus-within:border-[#1d7cf2] transition-all shadow-lg">
                      <div className="flex flex-wrap items-center gap-2">
                        <AnimatePresence>
                          {(editFormData.skills ?? []).map(skill => (
                            <motion.span key={skill} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-[#1d7cf2]/30 text-[#1d7cf2] text-sm font-bold shadow-md">
                              {skill}
                              <motion.button type="button" onClick={() => removeSkill(skill)} whileHover={{ scale: 1.2, rotate: 90 }} whileTap={{ scale: 0.9 }} className="hover:text-red-500 transition-colors">
                                <X className="w-4 h-4" />
                              </motion.button>
                            </motion.span>
                          ))}
                        </AnimatePresence>
                        <motion.button type="button" onClick={addSkillInput} whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                          className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-[#1d7cf2] text-[#1d7cf2] hover:bg-gradient-to-r hover:from-[#1d7cf2] hover:to-purple-500 hover:text-white hover:border-transparent transition-all shadow-md shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        </motion.button>
                      </div>
                      <div className="space-y-3">
                        <AnimatePresence>
                          {skillInputs.map((value, index) => (
                            <motion.div key={index} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2">
                              <input type="text" value={value} onChange={e => updateSkillInput(index, e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkillFromInput(index); } }}
                                placeholder="Type skill and press Enter"
                                maxLength={SKILL_MAX_LENGTH}
                                className="flex-1 px-4 py-2.5 rounded-xl border-2 border-[#1d7cf2]/30 bg-white/80 text-black focus:outline-none focus:border-[#1d7cf2] focus:ring-4 focus:ring-[#1d7cf2]/10 transition-all placeholder:text-gray-400 placeholder:text-sm font-semibold shadow-md" />
                              <motion.button type="button" onClick={() => removeSkillInput(index)} disabled={skillInputs.length <= 1}
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-red-300 text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:pointer-events-none transition-all shrink-0 shadow-md">
                                <Trash2 className="w-5 h-5" />
                              </motion.button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-8">
                  <motion.button type="button" onClick={handleSave} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                    className="relative w-full py-4 bg-gradient-to-r from-[#1d7cf2] to-purple-500 text-white text-xl font-black rounded-2xl shadow-xl overflow-hidden">
                    <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-200%', '200%'] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
                    <span className="relative z-10">Save</span>
                  </motion.button>
                </div>
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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-[200]"
            onClick={() => setShowSuccessPopup(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-md p-10 text-center overflow-hidden border-2 border-green-500/20"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-400/10 to-emerald-500/10 rounded-full blur-3xl"
              />
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="flex justify-center mb-6"
              >
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}>
                    <Check className="w-12 h-12 text-white" strokeWidth={3} />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-4 border-green-400"
                  />
                </div>
              </motion.div>
              <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent mb-3">
                Success!
              </motion.h3>
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="text-gray-600 font-bold text-lg mb-2">
                {successMessage}
              </motion.p>
              <div className="mt-6 w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "100%" }} animate={{ width: "0%" }}
                  transition={{ duration: 3, ease: "linear" }}
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-full"
                />
              </div>
              <motion.button onClick={() => setShowSuccessPopup(false)}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="mt-6 px-8 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold rounded-xl hover:shadow-lg transition-all">
                OK
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-200/30 w-full max-w-md p-10 text-center border border-white/60"
            >
              {/* Warning icon - ธีมน้ำเงิน-ม่วง */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1d7cf2] to-purple-500 flex items-center justify-center shadow-lg shadow-blue-300/50">
                  <AlertCircle className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
              </div>

              <h3 className="text-xl font-black bg-gradient-to-r from-[#1d7cf2] to-purple-500 bg-clip-text text-transparent mb-2">
                Delete account ?
              </h3>

              <p className="text-gray-600 font-semibold text-sm mb-8">
                Are you sure you want to delete your account ?
              </p>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#1d7cf2] to-purple-500 text-white font-black text-sm shadow-xl shadow-blue-300/40 hover:shadow-blue-400/50 transition-shadow"
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteAccount}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-black text-sm shadow-xl shadow-red-300/40 hover:shadow-red-400/50 transition-shadow"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputGroup({ label, placeholder = '', type = "text", value, onChange, disabled = false, maxLength, min, max, step }: any) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value;
    if (maxLength != null && v.length > maxLength) {
      toast.error(`${label} must not exceed ${maxLength} characters`);
      v = v.slice(0, maxLength);
    }
    onChange({ ...e, target: { ...e.target, value: v } });
  };
  return (
    <div className="w-full">
      <label className="block text-[#1d7cf2] font-black text-sm mb-2 ml-1 uppercase tracking-wide">{label}</label>
      <input type={type} value={value ?? ''} onChange={handleChange} placeholder={placeholder} disabled={disabled} maxLength={maxLength} min={min} max={max} step={step}
        className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-[#1d7cf2] focus:ring-4 focus:ring-[#1d7cf2]/10 transition-all text-black bg-white shadow-lg font-semibold placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed" />
    </div>
  );
}