# PortHub - คู่มือการติดตั้งและรันระบบ

## ✅ ระบบที่แก้ไขแล้ว

ระบบได้รับการปรับปรุงให้ **frontend เชื่อมต่อกับ backend และ database** อย่างสมบูรณ์แล้ว โดย:

- ✅ แก้ไข Dockerfile ให้ใช้ Go Modules แทน vendor
- ✅ สร้าง API helper functions สำหรับเชื่อมต่อ backend
- ✅ แก้ไขทุกหน้าให้เชื่อมต่อกับ backend API
- ✅ จัดการ JWT token authentication
- ✅ เพิ่ม toast notifications สำหรับ UX ที่ดีขึ้น

---

## 🚀 วิธีรันระบบ (แนะนำ 3 วิธี)

### วิธีที่ 1: รันทั้งหมดด้วย Docker (แนะนำ)

**ข้อดี:** ไม่ต้องติดตั้งอะไรเพิ่ม รันครั้งเดียวได้ทั้ง database และ backend

```bash
cd backend
docker-compose up -d
```

- **Database:** PostgreSQL จะรันที่ `localhost:5432`
- **Backend:** Go API จะรันที่ `localhost:8080`
- **Frontend:** ต้องรันแยก (ดูด้านล่าง)

จากนั้นรัน Frontend:

```bash
cd frontend
npm install
npm run dev
```

เปิดเบราว์เซอร์ที่ **http://localhost:3000**

---

### วิธีที่ 2: Docker เฉพาะ Database + รัน Backend/Frontend บนเครื่อง

**ข้อดี:** แก้โค้ด backend ได้สะดวก ไม่ต้อง rebuild Docker

```bash
# 1) รัน PostgreSQL ด้วย Docker
cd backend
docker-compose up -d postgres

# 2) รัน Backend บนเครื่อง
go mod tidy
go run .

# 3) รัน Frontend (เปิด terminal ใหม่)
cd frontend
npm install
npm run dev
```

---

### วิธีที่ 3: ไม่ใช้ Docker เลย

**ต้องมี:** PostgreSQL, Go, Node.js ติดตั้งบนเครื่อง

**1. ติดตั้งและรัน PostgreSQL**

```sql
CREATE USER porthub_user WITH PASSWORD 'porthub2024';
CREATE DATABASE porthub_db OWNER porthub_user;
```

รัน script สร้างตาราง: `backend/database/init.sql`

**2. รัน Backend**

```bash
cd backend
go mod tidy
go run .
```

**3. รัน Frontend**

```bash
cd frontend
npm install
npm run dev
```

---

## 📋 ฟีเจอร์ที่ทำงานได้แล้ว

### Authentication
- ✅ สมัครสมาชิก (Register) พร้อม skills
- ✅ เข้าสู่ระบบ (Login) + JWT token
- ✅ ลืมรหัสผ่าน (Forgot Password) + OTP
- ✅ ยืนยัน OTP (Verify Email)
- ✅ ตั้งรหัสผ่านใหม่ (Reset Password)

### User Profile
- ✅ ดูข้อมูล profile ของตัวเอง
- ✅ แก้ไขข้อมูล profile
- ✅ อัปโหลดรูปโปรไฟล์
- ✅ จัดการ skills

### Dashboard
- ✅ แสดงข้อมูล user ที่ login
- ✅ ค้นหา users (ตามชื่อ, university, major, job interest)

---

## 🔧 Configuration

### Backend (Go)

**Environment Variables** (ตั้งค่าผ่าน `docker-compose.yml` หรือ terminal):

```bash
DB_HOST=localhost        # หรือ "postgres" ถ้าใช้ Docker
DB_PORT=5432
DB_USER=porthub_user
DB_PASSWORD=porthub2024
DB_NAME=porthub_db
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=8080
```

### Frontend (Next.js)

ไฟล์ `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

---

## 🗄️ Database Schema

ตารางที่สร้างโดย `backend/database/init.sql`:

- **users** - ข้อมูลผู้ใช้ (email, password, university, faculty, major, gpa, job_interest, profile_image_url)
- **verification_codes** - รหัส OTP สำหรับ forgot password
- **projects** - โปรเจกต์ของผู้ใช้
- **skills** - รายการ skills
- **user_skills** - ความสัมพันธ์ user-skills (many-to-many)

---

## 🐛 Troubleshooting

### Backend ไม่เชื่อมต่อ Database

```bash
# ตรวจสอบว่า PostgreSQL รันอยู่
docker ps

# ดู logs
docker logs porthub-db

# Restart
docker-compose restart postgres
```

### Frontend ไม่เชื่อมต่อ Backend

1. ตรวจสอบว่า backend รันที่ `localhost:8080`
2. เช็ค CORS settings ใน `backend/main.go`
3. เปิด Browser DevTools ดู Network tab

### Docker Build ล้มเหลว

```bash
# ลบ cache แล้ว build ใหม่
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 📦 API Endpoints

### Authentication
- `POST /api/register` - สมัครสมาชิก
- `POST /api/login` - เข้าสู่ระบบ
- `POST /api/forgot-password` - ขอรหัส OTP
- `POST /api/verify-otp` - ตรวจสอบ OTP
- `POST /api/reset-password` - ตั้งรหัสผ่านใหม่

### User (ต้อง login)
- `GET /api/users/me` - ดูข้อมูลตัวเอง
- `PUT /api/users/me` - แก้ไขข้อมูลตัวเอง
- `GET /api/users/me/skills` - ดู skills ของตัวเอง

---

## 🎯 สิ่งที่ต้องพัฒนาต่อ (Optional)

1. **API สำหรับดู profile ของ user อื่น** - ตอนนี้ดูได้แค่ตัวเอง
2. **API สำหรับดูรายการ users ทั้งหมด** - สำหรับหน้า Dashboard
3. **API สำหรับจัดการ Projects** - CRUD operations
4. **Upload รูปภาพไปเก็บที่ server** - ตอนนี้เก็บ base64 ใน localStorage
5. **Email service** - ส่ง OTP ผ่านอีเมลจริง (ตอนนี้แสดงใน terminal)

---

## 📝 Notes

- **JWT Token** เก็บใน `localStorage` ของ browser
- **Projects** เก็บใน `localStorage` (ยังไม่มี API backend)
- **Default credentials** สำหรับ database: `porthub_user / porthub2024`
- **CORS** อนุญาตเฉพาะ `http://localhost:3000`

---

## 🔐 Security Notes

⚠️ **สำหรับ Production:**

1. เปลี่ยน `JWT_SECRET` ใน backend
2. เปลี่ยน `DB_PASSWORD` ใน docker-compose.yml
3. ใช้ HTTPS
4. เพิ่ม rate limiting
5. Validate input ทุก field
6. เก็บรูปภาพที่ cloud storage แทน base64

---

## 📞 Support

หากมีปัญหาหรือคำถาม:
1. ตรวจสอบ logs: `docker logs porthub-backend` และ `docker logs porthub-db`
2. ตรวจสอบว่า ports ไม่ถูกใช้งานโดยโปรแกรมอื่น
3. ลอง restart ทั้งระบบ: `docker-compose down && docker-compose up -d`

---

**Happy Coding! 🚀**
