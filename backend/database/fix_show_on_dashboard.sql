-- แก้ไข show_on_dashboard ให้เป็น false สำหรับ user ทั้งหมด
-- เพื่อให้แน่ใจว่าไม่มี user ใดแสดงใน Dashboard โดยไม่ได้ตั้งใจ

-- 1. เพิ่มคอลัมน์ถ้ายังไม่มี
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_on_dashboard BOOLEAN DEFAULT false;

-- 2. ตั้งค่า show_on_dashboard = false สำหรับ user ทั้งหมดที่เป็น NULL
UPDATE users SET show_on_dashboard = false WHERE show_on_dashboard IS NULL;

-- 3. ตั้งค่า show_on_dashboard = false สำหรับ user ทั้งหมด (ถ้าต้องการ reset ทั้งหมด)
-- UPDATE users SET show_on_dashboard = false;

-- 4. ตรวจสอบผลลัพธ์
SELECT user_id, user_name, email, show_on_dashboard FROM users ORDER BY user_id;
