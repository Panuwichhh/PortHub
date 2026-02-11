"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ถ้า backend ใช้ cookie
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // ตัวอย่าง: ถ้า backend ส่ง token กลับมา
      // localStorage.setItem("token", data.token);

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f1f7ff] flex flex-col font-sans overflow-hidden">
      
      {/* --- Background Elements --- */}
      <nav className="w-full py-4 px-6 md:px-12 flex justify-between items-center bg-white/50 border-b border-gray-100 opacity-30 select-none">
        <div className="text-2xl font-black tracking-tighter italic text-black">
          Port<span className="text-[#1d7cf2]">Hub</span>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center pb-20 opacity-10 select-none">
        <h1 className="text-[15vw] md:text-[14rem] font-black tracking-tighter leading-none text-black">
          Port<span className="text-[#1d7cf2]">Hub</span>
        </h1>
      </main>

      {/* --- Sign In Card --- */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px] p-4">
        <div className="bg-white w-full max-w-[400px] p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white">
          <h2 className="text-4xl font-black text-center mb-8 text-black tracking-tight">
            Sign in
          </h2>

          <form className="space-y-5 text-left" onSubmit={handleLogin}>
            <div>
              <label className="block text-[#1d7cf2] font-extrabold text-sm mb-1.5 ml-1 uppercase">
                E-mail
              </label>
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1d7cf2]/20 transition-all placeholder:text-gray-300 text-black shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-[#1d7cf2] font-extrabold text-sm mb-1.5 ml-1 uppercase">
                Password
              </label>
              <input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1d7cf2]/20 transition-all placeholder:text-gray-300 text-black shadow-sm"
                required
              />

              <div className="text-right mt-1.5">
                <Link href="/forgot-password">
                  <span className="text-[#1d7cf2] text-[10px] font-bold hover:underline cursor-pointer italic">
                    Forget password?
                  </span>
                </Link>
              </div>
            </div>

            {/* error message */}
            {error && (
              <p className="text-red-500 text-xs font-bold text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#1d7cf2] text-white text-xl font-black rounded-xl shadow-[0_8px_20px_rgba(29,124,242,0.3)] hover:bg-[#1565c0] transition-all transform active:scale-95 uppercase tracking-wide disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="text-center mt-8">
            <p className="text-[10px] font-bold text-gray-400 italic uppercase tracking-wider">
              Don't have an account?
              <Link href="/register">
                <span className="text-[#1d7cf2] ml-1 hover:underline cursor-pointer">
                  Sign up
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
