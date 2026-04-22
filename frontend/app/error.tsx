"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console (production: send to monitoring service)
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7ff] via-white to-[#fef3ff] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center bg-white/80 backdrop-blur-xl p-12 rounded-3xl shadow-2xl border border-white/60 max-w-md w-full"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-6"
        >
          ⚠️
        </motion.div>
        <h2 className="text-2xl font-black text-gray-900 mb-3">Something went wrong</h2>
        <p className="text-gray-500 font-semibold mb-8 text-sm">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            className="px-6 py-3 bg-gradient-to-r from-[#1d7cf2] to-purple-500 text-white rounded-2xl font-black shadow-xl"
          >
            Try again
          </motion.button>
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-black"
            >
              Go home
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
