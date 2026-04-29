import { memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GraduationCap, Briefcase, ExternalLink } from 'lucide-react';

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

interface UserCardProps {
  user: UserProfile;
  index: number;
  isDark?: boolean;
}

// 🚀 Memoized UserCard component - จะ re-render ก็ต่อเมื่อ user หรือ index เปลี่ยน
const UserCard = memo(({ user, index, isDark = false }: UserCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.5, type: "spring", stiffness: 100 }}
    >
      <Link href={`/profile/${user.user_id}`} className="group relative block h-full">
        <motion.div 
          whileHover={{ y: -10 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`relative backdrop-blur-xl p-8 rounded-3xl flex flex-col items-center transition-all duration-500 border h-full overflow-hidden
            ${isDark
              ? 'bg-[#21262d]/80 border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:shadow-[0_30px_80px_rgba(29,124,242,0.25)]'
              : 'bg-white/80 border-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:shadow-[0_30px_80px_rgba(29,124,242,0.2)]'
            }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#1d7cf2]/0 via-purple-500/0 to-pink-500/0 group-hover:from-[#1d7cf2]/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500 rounded-3xl" />
          
          <motion.div 
            className={`absolute top-6 left-6 text-xs font-black uppercase tracking-widest group-hover:text-[#1d7cf2]/40 transition-all duration-300
              ${isDark ? 'text-gray-600' : 'text-gray-200'}`}
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
                alt={user.user_name}
                loading="lazy"
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
              className={`text-xl font-black tracking-tight group-hover:text-[#1d7cf2] transition-colors leading-tight
                ${isDark ? 'text-gray-100' : 'text-gray-900'}`}
              whileHover={{ scale: 1.05 }}
            >
              {user.user_name || 'No Name'}
            </motion.h3>
            
            <div className="flex justify-center">
              <motion.p 
                whileHover={{ scale: 1.05, y: -2 }}
                className={`inline-block px-4 py-2 rounded-xl backdrop-blur-xl border font-black text-xs uppercase tracking-wide shadow-lg line-clamp-2
                  ${isDark
                    ? 'bg-blue-900/30 border-blue-700/40 text-blue-300 shadow-blue-900/20'
                    : 'bg-gradient-to-r from-blue-50/80 to-purple-50/80 border-blue-100/50 text-[#1d7cf2] shadow-blue-100/30'
                  }`}
              >
                {user.job_interest || 'No Job Interest'}
              </motion.p>
            </div>
            
            <div className={`pt-6 space-y-3 border-t ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
              <motion.div 
                className={`flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest
                  ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                whileHover={{ x: 3 }}
              >
                <GraduationCap className="w-4 h-4 text-[#1d7cf2]" />
                <span className="truncate">{user.university || 'No University'}</span>
              </motion.div>
              
              <motion.div 
                className={`flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest
                  ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                whileHover={{ x: 3 }}
              >
                <Briefcase className="w-4 h-4 text-purple-500" />
                <span className="truncate">{user.major || 'No Major'}</span>
              </motion.div>
            </div>
            
            {user.gpa && (
              <div className="pt-3">
                <span className={`text-xs font-black ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
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
  );
});

UserCard.displayName = 'UserCard';

export default UserCard;
