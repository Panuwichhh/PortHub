// API Configuration และ Helper Functions สำหรับเชื่อมต่อ Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// 🚀 Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// 🚀 Invalidate specific endpoint cache (call after PUT/POST/DELETE)
export const invalidateCache = (...endpoints: string[]) => {
  endpoints.forEach(ep => {
    const url = `${API_BASE_URL}${ep}`;
    cache.delete(url);
  });
};

// 🚀 Clear all cache
export const clearCache = () => {
  cache.clear();
};

// ฟังก์ชันช่วยสำหรับการเรียก API
// bypassCache = true → ข้าม cache และดึงข้อมูลสดจาก server เสมอ
async function fetchAPI(endpoint: string, options: RequestInit = {}, bypassCache = false) {
  const url = `${API_BASE_URL}${endpoint}`;
  const isGet = (options.method || 'GET').toUpperCase() === 'GET';

  // ใช้ cache เฉพาะ GET ที่ไม่ bypass
  if (isGet && !bypassCache) {
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      ...options.headers,
    },
    cache: 'no-store' as RequestCache,
  };

  // เพิ่ม Authorization header ถ้ามี token
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);
    const text = await response.text();
    let data: unknown = null;
    const trimmed = text?.trim();
    if (trimmed) {
      try {
        data = JSON.parse(trimmed);
      } catch (_e) {
        throw new Error('Server returned invalid response');
      }
    }

    if (!response.ok) {
      const errMsg = (data as { error?: string })?.error || 'เกิดข้อผิดพลาด';
      if (response.status === 401 || String(errMsg).includes('Invalid')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      }
      throw new Error(errMsg);
    }

    // Cache GET responses (ยกเว้น bypass)
    if (isGet && !bypassCache && data) {
      cache.set(url, { data, timestamp: Date.now() });
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
  }
}

// ==================== Auth APIs ====================

export interface RegisterData {
  email: string;
  password: string;
  user_name: string;
  phone: string;
  university: string;
  faculty: string;
  major: string;
  gpa: number;
  job_interest: string;
  skills: string[];
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
}

export const authAPI = {
  register: async (data: RegisterData) => {
    return fetchAPI('/register', { method: 'POST', body: JSON.stringify(data) });
  },

  login: async (data: LoginData): Promise<LoginResponse> => {
    return fetchAPI('/login', { method: 'POST', body: JSON.stringify(data) }) as Promise<LoginResponse>;
  },

  forgotPassword: async (email: string) => {
    return fetchAPI('/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
  },

  verifyOTP: async (email: string, otp: string) => {
    return fetchAPI('/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) });
  },

  resetPassword: async (email: string, password: string) => {
    return fetchAPI('/reset-password', { method: 'POST', body: JSON.stringify({ email, password }) });
  },
};

// ==================== User APIs ====================

export interface UserProfile {
  user_id: number;
  user_name: string;
  email: string;
  phone?: string;
  university: string;
  faculty: string;
  major: string;
  gpa: number;
  job_interest: string;
  profile_image_url: string;
  skills?: string[];
}

export interface UpdateProfileData {
  user_name: string;
  phone?: string;
  university: string;
  faculty: string;
  major: string;
  gpa: number;
  job_interest: string;
  profile_image_url: string;
  skills?: string[];
}

export const userAPI = {
  // ดึงข้อมูล profile ของตัวเอง — bypass cache เสมอเพื่อให้ได้ข้อมูลล่าสุด
  getMe: async (): Promise<UserProfile> => {
    return fetchAPI('/users/me', { method: 'GET' }, true) as Promise<UserProfile>;
  },

  // อัปเดต profile แล้วล้าง cache ที่เกี่ยวข้อง
  updateMe: async (data: UpdateProfileData) => {
    const result = await fetchAPI('/users/me', { method: 'PUT', body: JSON.stringify(data) });
    invalidateCache('/users/me', '/users/me/skills', '/users/me/projects');
    return result;
  },

  // ดึง skills — bypass cache
  getMySkills: async (): Promise<string[]> => {
    const res = await fetchAPI('/users/me/skills', { method: 'GET' }, true);
    return Array.isArray(res) ? res : [];
  },

  // ดึง projects — bypass cache
  getMyProjects: async (): Promise<Array<{ id: string; title: string; desc: string; img: string; images: string[] }>> => {
    const res = await fetchAPI('/users/me/projects', { method: 'GET' }, true);
    return Array.isArray(res) ? res : [];
  },

  getMyProjectById: async (id: string): Promise<{ id: string; title: string; desc: string; img: string; images: string[] }> => {
    return fetchAPI(`/users/me/projects/${id}`, { method: 'GET' }, true) as Promise<{ id: string; title: string; desc: string; img: string; images: string[] }>;
  },

  createProject: async (data: { title: string; desc: string; images: string[] }) => {
    const result = await fetchAPI('/users/me/projects', { method: 'POST', body: JSON.stringify(data) });
    invalidateCache('/users/me/projects');
    return result;
  },

  updateProject: async (id: string, data: { title: string; desc: string; images: string[] }) => {
    const result = await fetchAPI(`/users/me/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    invalidateCache('/users/me/projects', `/users/me/projects/${id}`);
    return result;
  },

  deleteProject: async (id: string) => {
    const result = await fetchAPI(`/users/me/projects/${id}`, { method: 'DELETE' });
    invalidateCache('/users/me/projects', `/users/me/projects/${id}`);
    return result;
  },

  deleteMe: async () => {
    return fetchAPI('/users/me', { method: 'DELETE' });
  },

  // Publish to dashboard
  setDashboardVisibility: async (show: boolean) => {
    const result = await fetchAPI('/users/me/dashboard-visibility', {
      method: 'PUT',
      body: JSON.stringify({ show_on_dashboard: show }),
    });
    // ล้าง dashboard cache ด้วยเพื่อให้ผู้อื่นเห็นข้อมูลใหม่
    invalidateCache('/dashboard/profiles', '/dashboard/public-profiles');
    return result;
  },

  // Dashboard profiles (cached 5 นาที — ข้อมูลไม่เปลี่ยนบ่อย)
  getDashboardProfiles: async (): Promise<UserProfile[]> => {
    const res = await fetchAPI('/dashboard/profiles', { method: 'GET' });
    return Array.isArray(res) ? (res as UserProfile[]) : [];
  },

  getPublicDashboardProfiles: async (): Promise<UserProfile[]> => {
    const res = await fetchAPI('/dashboard/public-profiles', { method: 'GET' });
    return Array.isArray(res) ? (res as UserProfile[]) : [];
  },

  getPublicProfile: async (userId: string): Promise<{
    user_id: number;
    user_name: string;
    email?: string;
    phone?: string;
    university: string;
    faculty: string;
    major: string;
    gpa: number;
    job_interest: string;
    profile_image_url: string;
    skills: string[];
    projects: Array<{ id: string; title: string; desc: string; img: string; images: string[] }>;
  }> => {
    return fetchAPI(`/dashboard/profiles/${userId}`, { method: 'GET' }) as Promise<{
      user_id: number;
      user_name: string;
      email?: string;
      phone?: string;
      university: string;
      faculty: string;
      major: string;
      gpa: number;
      job_interest: string;
      profile_image_url: string;
      skills: string[];
      projects: Array<{ id: string; title: string; desc: string; img: string; images: string[] }>;
    }>;
  },
};

// ==================== Token Management ====================

export const tokenManager = {
  setToken: (token: string) => {
    localStorage.setItem('token', token);
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  removeToken: () => {
    localStorage.removeItem('token');
  },

  hasToken: (): boolean => {
    return !!localStorage.getItem('token');
  },
};

// ==================== Helper Functions ====================

export const requireAuth = () => {
  if (typeof window !== 'undefined' && !tokenManager.hasToken()) {
    window.location.href = '/login';
    return false;
  }
  return true;
};

export const logout = () => {
  tokenManager.removeToken();
  window.location.href = '/login';
};
