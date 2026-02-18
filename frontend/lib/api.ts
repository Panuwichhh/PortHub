// API Configuration และ Helper Functions สำหรับเชื่อมต่อ Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// ฟังก์ชันช่วยสำหรับการเรียก API
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const isGet = (options.method || 'GET').toUpperCase() === 'GET';
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...(isGet ? { cache: 'no-store' as RequestCache } : {}),
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
  // สมัครสมาชิก
  register: async (data: RegisterData) => {
    return fetchAPI('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // เข้าสู่ระบบ
  login: async (data: LoginData): Promise<LoginResponse> => {
    return fetchAPI('/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }) as Promise<LoginResponse>;
  },

  // ขอรหัส OTP (Forgot Password)
  forgotPassword: async (email: string) => {
    return fetchAPI('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // ตรวจสอบรหัส OTP
  verifyOTP: async (email: string, otp: string) => {
    return fetchAPI('/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  // ตั้งรหัสผ่านใหม่
  resetPassword: async (email: string, password: string) => {
    return fetchAPI('/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
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
  // ดึงข้อมูล profile ของตัวเอง
  getMe: async (): Promise<UserProfile> => {
    return fetchAPI('/users/me', { method: 'GET' }) as Promise<UserProfile>;
  },

  // อัปเดต profile
  updateMe: async (data: UpdateProfileData) => {
    return fetchAPI('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // ดึง skills ของตัวเอง (normalize เป็น array เสมอ)
  getMySkills: async (): Promise<string[]> => {
    const res = await fetchAPI('/users/me/skills', { method: 'GET' });
    return Array.isArray(res) ? res : [];
  },

  // โปรเจกต์
  getMyProjects: async (): Promise<Array<{ id: string; title: string; desc: string; img: string; images: string[] }>> => {
    const res = await fetchAPI('/users/me/projects', { method: 'GET' });
    return Array.isArray(res) ? res : [];
  },
  createProject: async (data: { title: string; desc: string; images: string[] }) => {
    return fetchAPI('/users/me/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  deleteProject: async (id: string) => {
    return fetchAPI(`/users/me/projects/${id}`, { method: 'DELETE' });
  },

  // ลบบัญชี
  deleteMe: async () => {
    return fetchAPI('/users/me', {
      method: 'DELETE',
    });
  },

  // Publish to dashboard (show profile to others)
  setDashboardVisibility: async (show: boolean) => {
    return fetchAPI('/users/me/dashboard-visibility', {
      method: 'PUT',
      body: JSON.stringify({ show_on_dashboard: show }),
    });
  },

  // List profiles on dashboard (excludes current user; auth required)
  getDashboardProfiles: async (): Promise<UserProfile[]> => {
    const res = await fetchAPI('/dashboard/profiles', { method: 'GET' });
    return Array.isArray(res) ? (res as UserProfile[]) : [];
  },

  // List profiles on dashboard for guests (no auth; all users with show_on_dashboard = true)
  getPublicDashboardProfiles: async (): Promise<UserProfile[]> => {
    const res = await fetchAPI('/dashboard/public-profiles', { method: 'GET' });
    return Array.isArray(res) ? (res as UserProfile[]) : [];
  },

  // Public profile of a user (only if they have show_on_dashboard = true; no auth required)
  getPublicProfile: async (userId: string): Promise<{
    user_id: number;
    user_name: string;
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
  // บันทึก token
  setToken: (token: string) => {
    localStorage.setItem('token', token);
  },

  // ดึง token
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // ลบ token (logout)
  removeToken: () => {
    localStorage.removeItem('token');
  },

  // เช็คว่ามี token หรือไม่
  hasToken: (): boolean => {
    return !!localStorage.getItem('token');
  },
};

// ==================== Helper Functions ====================

// ฟังก์ชันสำหรับ redirect ไปหน้า login ถ้าไม่มี token
export const requireAuth = () => {
  if (typeof window !== 'undefined' && !tokenManager.hasToken()) {
    window.location.href = '/login';
    return false;
  }
  return true;
};

// ฟังก์ชันสำหรับ logout
export const logout = () => {
  tokenManager.removeToken();
  window.location.href = '/login';
};
