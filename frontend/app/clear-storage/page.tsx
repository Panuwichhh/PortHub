"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearStoragePage() {
  const router = useRouter();

  useEffect(() => {
    // Clear all localStorage
    localStorage.clear();
    
    // Redirect to login
    setTimeout(() => {
      router.push('/login');
    }, 500);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f7ff] via-white to-[#fef3ff]">
      <div className="text-center">
        <div className="text-6xl mb-4">🔄</div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">กำลังล้างข้อมูล...</h1>
        <p className="text-gray-500">กรุณารอสักครู่</p>
      </div>
    </div>
  );
}
