# PortHub – คำถามที่พบบ่อย: การเก็บรูป, ข้อมูล Profile/Project, และการออนไลน์

---

## 1. รูปเก็บไว้ที่ไหน? ใช้ Cloudinary ไหม?

**ตอบ: ไม่ได้ใช้ Cloudinary**

- **รูปโปรไฟล์ (Profile picture)** และ **รูปใน Project** ถูก **compress เป็น base64** ที่ฝั่ง frontend แล้วส่งไปเก็บใน **ฐานข้อมูล PostgreSQL** โดยตรง
  - ตาราง `users` มีคอลัมน์ `profile_image_url` (ประเภท TEXT) เก็บสตริง base64 ของรูปโปรไฟล์
  - ตาราง `projects` มีคอลัมน์ `image_url` (ประเภท TEXT) เก็บ JSON ของ array รูป (แต่ละรูปเป็น base64)

**ข้อดี:** ไม่ต้องตั้งค่า cloud, ไม่มีค่าใช้จ่ายเก็บรูปแยก  
**ข้อเสีย:** ฐานข้อมูลโตเร็วถ้ามีรูปเยอะ, โหลดช้าถ้ารูปใหญ่

ถ้าอนาคตอยากย้ายไป **Cloudinary** (หรือ storage อื่น):
- อัปโหลดรูปไป Cloudinary ได้ URL
- เก็บแค่ **URL** ใน `profile_image_url` / `image_url` แทน base64
- ต้องเพิ่ม API/key และ logic อัปโหลดที่ backend หรือ frontend

---

## 2. ก่อนกด "Update to Dashboard" ข้อมูล Profile และ Project เก็บไว้ที่ไหนยังไง?

### Profile (ชื่อ, เบอร์, มหาวิทยาลัย, เกรด, skills, รูปโปรไฟล์ ฯลฯ)

- **เก็บใน PostgreSQL เท่านั้น** ผ่าน API
  - **แก้ไขในหน้า Profile** → กด Save ใน modal แก้ไข → เรียก **PUT /api/users/me** → อัปเดตในตาราง `users` (และ `user_skills`)
- **ยังไม่กด "Update to Dashboard"** = ข้อมูลก็อยู่ใน DB อยู่แล้ว แค่ค่า `show_on_dashboard` ยังเป็น `false` จึงไม่โผล่ใน Dashboard

### Projects (ชื่อโปรเจกต์, รูป, คำอธิบาย)

- **เก็บใน PostgreSQL** ผ่าน API
  - กด Save โปรเจกต์ → เรียก **POST /api/users/me/projects** → INSERT ลงตาราง `projects` (รูปเป็น base64 ใน `image_url`)
- **Fallback:** ถ้าเรียก API ไม่ได้ (เช่น backend ล่ม) ฝั่ง frontend จะ **บันทึกลง localStorage** ด้วย key ประมาณ `porthub_projects_<user_id>` และยังแสดงในหน้า Profile ได้ แต่ข้อมูลนี้อยู่แค่ใน browser นั้น ไม่ sync ไป server

สรุป:
- **Profile:** เก็บใน **PostgreSQL** ผ่าน API เท่านั้น
- **Project:** เก็บใน **PostgreSQL** ผ่าน API เป็นหลัก และมี **localStorage** เป็นแค่ fallback เมื่อ API ล้มเหลว

---

## 3. ถ้าจะให้เว็บออนไลน์ ให้เพื่อนเข้าใช้ได้ ต้องทำยังไง?

ต้อง **deploy 3 ส่วน** ให้อยู่บน server จริง (ไม่รันแค่ในเครื่อง):

| ส่วน | ตอนนี้รันที่ | วิธีทำให้ออนไลน์ (ตัวอย่าง) |
|------|----------------|-----------------------------|
| **Frontend** (Next.js) | localhost:3000 | ใช้ **Vercel** หรือ **Netlify** (รองรับ Next.js ดี) |
| **Backend** (Go/Gin API) | localhost:8080 | ใช้ **Railway**, **Render**, **Fly.io** หรือ VPS (เช่น DigitalOcean, AWS) |
| **Database** (PostgreSQL) | localhost:5432 | ใช้ **Neon**, **Supabase**, **Railway** หรือ PostgreSQL บน VPS เดียวกับ backend |

### ขั้นตอนคร่าวๆ

1. **เตรียม Database ออนไลน์**
   - สมัคร Neon / Supabase / Railway ฯลฯ สร้าง PostgreSQL
   - ได้ connection string แบบ `postgres://user:pass@host:5432/dbname?sslmode=require`
   - รัน script สร้างตารางจาก `backend/database/init.sql` และ migration (เช่น `add_show_on_dashboard.sql`) บน DB นี้

2. **Deploy Backend (Go)**
   - อัปโหลดโค้ด backend ไป GitHub
   - เชื่อม repo กับ Railway / Render / Fly.io
   - ตั้ง **Environment variables:** เช่น `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (หรือ connection string ตามที่แต่ละ platform ใช้)
   - Build command: `go build -o server .` (หรือตามที่ platform กำหนด), Run: `./server`
   - ได้ URL API เช่น `https://your-api.railway.app`

3. **Deploy Frontend (Next.js)**
   - อัปโหลดโค้ด frontend ไป GitHub
   - เชื่อม repo กับ **Vercel**
   - ตั้ง **Environment variable:** `NEXT_PUBLIC_API_URL=https://your-api.railway.app/api` (ใช้ URL จากขั้นที่ 2)
   - Vercel จะ build และได้ URL เช่น `https://porthub.vercel.app`

4. **ตั้ง CORS ที่ Backend**
   - ใน backend (main.go) ตอนนี้ตั้ง CORS ไว้ที่ `http://localhost:3000`
   - ต้องเพิ่ม origin ของเว็บจริง เช่น `https://porthub.vercel.app` ให้ backend อนุญาต request จากโดเมนนี้

5. **แชร์ลิงก์ให้เพื่อน**
   - ให้เพื่อนเข้า **https://porthub.vercel.app** (หรือโดเมนที่ได้)
   - แต่ละคนสมัคร/ล็อกอินด้วย account ของตัวเอง จึงใช้ระบบออนไลน์ได้

### สิ่งที่ต้องไม่ลืม

- ใช้ **HTTPS** ทั้ง frontend และ backend
- เก็บ **รหัสผ่าน DB และ secret อื่นๆ** ใน environment variables ของ hosting ไม่ใส่ในโค้ด
- หลัง deploy แล้ว ทดสอบสมัคร, ล็อกอิน, แก้ Profile, สร้าง Project และกด "Update to Dashboard" ว่าใช้งานได้ครบ

ถ้าบอกได้ว่าพื้นที่ไหนจะใช้ deploy (เช่น Vercel + Railway หรือ VPS เอง) สามารถเขียนเป็นขั้นตอนเฉพาะสำหรับ stack นั้นได้อีกทีครับ
