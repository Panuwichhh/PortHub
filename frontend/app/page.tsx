import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f1f7ff] flex flex-col font-sans">
      {/* --- Header / Navbar --- */}
      <nav className="w-full py-4 px-6 md:px-12 flex justify-between items-center bg-white border-b border-gray-100 shadow-sm">
        <div className="text-2xl font-black tracking-tighter italic text-black">
          Port<span className="text-[#1d7cf2]">Hub</span>
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-8 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-2xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className=" flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
        <Link href="/login">
          <div className="cursor-pointer hover:opacity-80 transition-opacity">
            {/* SVG Profile Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#1d7cf2" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </div>
        </Link>
      </nav>

      {/* --- Hero Section --- */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center pb-20">
        {/* Main Title - ปรับ Port เป็นสีดำ (text-black) */}
        <h1 className="text-[15vw] md:text-[14rem] font-black tracking-tighter leading-none select-none text-black">
          Port<span className="text-[#1d7cf2]">Hub</span>
        </h1>
        
        {/* Subtitle */}
        <p className="mt-4 text-lg md:text-2xl font-medium tracking-[0.2em] text-black uppercase">
          Your Professional Hub
        </p>

        {/* Let's Go Button */}
        <Link href="/login">
          <button className="mt-12 px-12 py-3 bg-[#1d7cf2] text-white text-lg font-semibold rounded-lg shadow-[0_4px_14px_0_rgba(29,124,242,0.39)] hover:bg-[#1565c0] transition-all transform active:scale-95">
            Let's Go
          </button>
        </Link>
      </main>
    </div>
  );
}