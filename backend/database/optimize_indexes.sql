-- 🚀 Performance Optimization: Database Indexes
-- สร้าง indexes เพื่อเพิ่มความเร็วในการ query

-- 1. Index สำหรับ users table
CREATE INDEX IF NOT EXISTS idx_users_show_on_dashboard ON users(show_on_dashboard) WHERE show_on_dashboard = true;
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_name ON users(user_name);

-- 2. Index สำหรับ published_profiles table
CREATE INDEX IF NOT EXISTS idx_published_profiles_user_id ON published_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_published_profiles_user_name ON published_profiles(user_name);
CREATE INDEX IF NOT EXISTS idx_published_profiles_updated_at ON published_profiles(updated_at DESC);

-- 3. Index สำหรับ published_projects table
CREATE INDEX IF NOT EXISTS idx_published_projects_user_id ON published_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_published_projects_published_at ON published_projects(published_at DESC);

-- 4. Index สำหรับ projects table
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- 5. Index สำหรับ user_skills table
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON user_skills(skill_id);

-- 6. Index สำหรับ skills table
CREATE INDEX IF NOT EXISTS idx_skills_skill_name ON skills(skill_name);
CREATE INDEX IF NOT EXISTS idx_skills_skill_name_lower ON skills(LOWER(skill_name));

-- 7. Composite indexes สำหรับ queries ที่ใช้บ่อย
CREATE INDEX IF NOT EXISTS idx_published_profiles_composite ON published_profiles(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_composite ON projects(user_id, created_at DESC);

-- 8. VACUUM และ ANALYZE เพื่อ optimize performance
VACUUM ANALYZE users;
VACUUM ANALYZE published_profiles;
VACUUM ANALYZE published_projects;
VACUUM ANALYZE projects;
VACUUM ANALYZE user_skills;
VACUUM ANALYZE skills;

-- 9. Update statistics
ANALYZE users;
ANALYZE published_profiles;
ANALYZE published_projects;
ANALYZE projects;
ANALYZE user_skills;
ANALYZE skills;
