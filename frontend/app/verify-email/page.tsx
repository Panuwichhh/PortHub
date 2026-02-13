"use client";

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [timer, setTimer] = useState(30); // ตัวนับเวลาถอยหลัง 30 วิ
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  // สร้าง Array ของ Ref เพื่ออ้างอิงถึงช่อง Input ทั้ง 4 ช่อง
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // 1. ดึงข้อมูล Email และเริ่มนับถอยหลัง
  useEffect(() => {
    const savedEmail = sessionStorage.getItem('reset_email');
    if (!savedEmail) {
      router.push('/forgot-password'); // ถ้าไม่มีอีเมลค้างไว้ให้กลับไปหน้าแรก
      return;
    }
    setEmail(savedEmail);

    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => clearInterval(interval);
  }, [timer, router]);

  // ฟังก์ชันจัดการการพิมพ์
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (value.length === 1 && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  // ฟังก์ชันจัดการการกดปุ่ม Backspace
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !inputRefs[index].current?.value && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  // 2. ฟังก์ชันตรวจสอบรหัส OTP กับ Backend
  const handleVerifyOTP = async () => {
    const otpCode = inputRefs.map(ref => ref.current?.value).join('');
    
    if (otpCode.length < 4) {
      alert("กรุณากรอกรหัสให้ครบ 4 หลัก");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await response.json();

      if (response.ok) {
        // ถ้ารหัสถูกต้อง ให้ไปหน้ากรอกรหัสใหม่
        router.push('/new-password');
      } else {
        alert(data.error || "รหัสไม่ถูกต้อง กรุณาลองใหม่");
      }
    } catch (error) {
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  // 3. ฟังก์ชันส่งรหัสใหม่ (Resend)
  const handleResend = async () => {
    if (!canResend) return;

    try {
      await fetch('http://localhost:8080/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setTimer(30);
      setCanResend(false);
      alert("ส่งรหัสใหม่ไปยังอีเมลของคุณแล้ว");
    } catch (error) {
      alert("ส่งรหัสใหม่ไม่สำเร็จ");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f1f7ff] flex flex-col font-sans overflow-hidden">
      
      {/* --- ส่วนพื้นหลังจำลอง --- */}
      <nav className="w-full py-4 px-6 md:px-12 flex justify-between items-center bg-white/50 border-b border-gray-100 opacity-30 select-none">
        <div className="text-2xl font-black tracking-tighter italic text-black">Port<span className="text-[#1d7cf2]">Hub</span></div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center pb-20 opacity-10 select-none">
        <h1 className="text-[15vw] md:text-[14rem] font-black tracking-tighter leading-none text-black">Port<span className="text-[#1d7cf2]">Hub</span></h1>
      </main>

      {/* --- Verify Email Card --- */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px] p-4">
        <div className="bg-white w-full max-w-[420px] p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white text-center">
          
          <h2 className="text-3xl font-black text-black mb-4 tracking-tight">Verify email address</h2>
          
          <p className="text-gray-400 text-[11px] font-bold leading-relaxed mb-8 italic">
            Verification code send to :<br />
            <span className="text-[#1d7cf2]">{email}</span>
          </p>

          <div className="flex justify-center gap-3 mb-10">
            {inputRefs.map((ref, index) => (
              <input 
                key={index}
                ref={ref}
                type="text"
                maxLength={1}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-14 h-16 md:w-16 md:h-20 bg-gray-100 border-none rounded-2xl text-center text-2xl font-black text-black focus:ring-2 focus:ring-[#1d7cf2]/30 focus:bg-white transition-all outline-none"
              />
            ))}
          </div>

          <div className="pt-2">
            <button 
              onClick={handleVerifyOTP}
              disabled={loading}
              className="w-full py-3.5 bg-[#1d7cf2] text-white text-lg font-black rounded-xl shadow-[0_8px_20px_rgba(29,124,242,0.3)] hover:bg-[#1565c0] transition-all transform active:scale-95 uppercase tracking-wide disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Confirm Code"}
            </button>
          </div>

          <div className="mt-8">
            <p className="text-[10px] font-bold text-gray-400 italic uppercase tracking-wider">
              Didn't receive code? 
              {canResend ? (
                <button 
                  onClick={handleResend}
                  type="button" 
                  className="text-[#1d7cf2] ml-1 hover:underline cursor-pointer"
                >
                  Resend
                </button>
              ) : (
                <span className="ml-1 text-gray-300">Resend in {timer}s</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}