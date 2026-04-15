-- คัดลอกข้อมูล users ที่มี show_on_dashboard = true ไปยัง published_profiles
-- เพื่อให้แสดงใน Dashboard ได้ทันที

-- 1. คัดลอก users ที่ publish แล้ว
INSERT INTO published_profiles (
    user_id, user_name, email, phone, university, faculty, major, gpa, 
    job_interest, profile_image_url, skills, published_at, updated_at
)
SELECT 
    u.user_id,
    u.user_name,
    u.email,
    u.phone,
    u.university,
    u.faculty,
    u.major,
    u.gpa,
    u.job_interest,
    u.profile_image_url,
    COALESCE(
        (
            SELECT json_agg(s.skill_name)::text
            FROM user_skills us
            JOIN skills s ON us.skill_id = s.skill_id
            WHERE us.user_id = u.user_id
        ),
        '[]'
    ) as skills,
    NOW(),
    NOW()
FROM users u
WHERE u.show_on_dashboard = true
ON CONFLICT (user_id) DO UPDATE SET
    user_name = EXCLUDED.user_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    university = EXCLUDED.university,
    faculty = EXCLUDED.faculty,
    major = EXCLUDED.major,
    gpa = EXCLUDED.gpa,
    job_interest = EXCLUDED.job_interest,
    profile_image_url = EXCLUDED.profile_image_url,
    skills = EXCLUDED.skills,
    updated_at = NOW();

-- 2. คัดลอก projects ของ users ที่ publish แล้ว
INSERT INTO published_projects (
    user_id, project_id, project_name, description, image_url, published_at
)
SELECT 
    p.user_id,
    p.project_id,
    p.project_name,
    p.description,
    p.image_url,
    NOW()
FROM projects p
WHERE p.user_id IN (SELECT user_id FROM users WHERE show_on_dashboard = true)
ON CONFLICT (user_id, project_id) DO UPDATE SET
    project_name = EXCLUDED.project_name,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    published_at = NOW();

-- 3. ตรวจสอบผลลัพธ์
SELECT 'published_profiles' as table_name, COUNT(*) as count FROM published_profiles
UNION ALL
SELECT 'published_projects' as table_name, COUNT(*) as count FROM published_projects;
