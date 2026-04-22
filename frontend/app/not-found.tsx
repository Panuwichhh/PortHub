import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7ff] via-white to-[#fef3ff] flex items-center justify-center p-4">
      <div className="text-center bg-white/80 backdrop-blur-xl p-12 rounded-3xl shadow-2xl border border-white/60 max-w-md w-full">
        <div className="text-8xl font-black text-[#1d7cf2] mb-4">404</div>
        <h2 className="text-2xl font-black text-gray-900 mb-3">Page not found</h2>
        <p className="text-gray-500 font-semibold mb-8 text-sm">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/dashboard">
          <button className="px-8 py-3 bg-gradient-to-r from-[#1d7cf2] to-purple-500 text-white rounded-2xl font-black shadow-xl hover:shadow-2xl transition-all">
            Go to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}
