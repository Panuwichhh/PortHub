-- 1. สร้างตาราง USERS (เก็บข้อมูลพื้นฐาน)
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    user_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone VARCHAR(50),
    university VARCHAR(255),
    faculty VARCHAR(255),
    major VARCHAR(255),
    gpa DECIMAL(3,2),
    job_interest TEXT,
    profile_image_url TEXT,
    show_on_dashboard BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. สร้างตาราง VERIFICATION CODES (สำหรับ Forgot Password / ยืนยันเมล)
-- ปรับเป็น VARCHAR(4) ตามโจทย์รหัส 4 หลัก
CREATE TABLE IF NOT EXISTS verification_codes (
    code_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    code VARCHAR(4) NOT NULL, 
    type VARCHAR(50) DEFAULT 'forgot_password',
    is_used BOOLEAN DEFAULT FALSE,
    expired_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. สร้างตาราง PROJECTS
CREATE TABLE IF NOT EXISTS projects (
    project_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    project_name VARCHAR(255),
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. สร้างตาราง SKILLS
CREATE TABLE IF NOT EXISTS skills (
    skill_id SERIAL PRIMARY KEY,
    skill_name VARCHAR(100) UNIQUE
);

-- 5. สร้างตาราง USER_SKILLS (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_skills (
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(skill_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, skill_id)
);