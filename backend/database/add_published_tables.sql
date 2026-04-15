-- สร้างตารางสำหรับเก็บข้อมูล Published (ที่คนอื่นเห็น)
-- ข้อมูลจะถูกคัดลอกมาเมื่อกด "Publish to Dashboard" เท่านั้น

-- 1. ตาราง published_profiles (snapshot ของ profile ที่ publish)
CREATE TABLE IF NOT EXISTS published_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    user_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    university VARCHAR(255),
    faculty VARCHAR(255),
    major VARCHAR(255),
    gpa DECIMAL(3,2),
    job_interest TEXT,
    profile_image_url TEXT,
    skills TEXT, -- JSON array of skills
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ตาราง published_projects (snapshot ของ projects ที่ publish)
CREATE TABLE IF NOT EXISTS published_projects (
    published_project_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(project_id) ON DELETE CASCADE,
    project_name VARCHAR(255),
    description TEXT,
    image_url TEXT, -- JSON array of images
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, project_id)
);

-- 3. Index สำหรับ performance
CREATE INDEX IF NOT EXISTS idx_published_projects_user_id ON published_projects(user_id);

-- 4. ตรวจสอบตาราง
SELECT 'published_profiles' as table_name, COUNT(*) as count FROM published_profiles
UNION ALL
SELECT 'published_projects' as table_name, COUNT(*) as count FROM published_projects;
