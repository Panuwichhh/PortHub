# PortHub 🚀

**PortHub** คือแพลตฟอร์ม Portfolio Hub สำหรับนักศึกษาและมืออาชีพ ที่ช่วยให้ผู้ใช้สร้างโปรไฟล์ส่วนตัว จัดการโปรเจค และแสดงผลงานต่อสาธารณะผ่าน Dashboard กลาง

---

## 📋 สารบัญ

- [ภาพรวมระบบ](#ภาพรวมระบบ)
- [Tech Stack](#tech-stack)
- [โครงสร้างโปรเจค](#โครงสร้างโปรเจค)
- [ฟีเจอร์หลัก](#ฟีเจอร์หลัก)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [การ Setup และรันระบบ](#การ-setup-และรันระบบ)
- [Environment Variables](#environment-variables)
- [การรันแบบ Development](#การรันแบบ-development)
- [การรันแบบ Docker (Production)](#การรันแบบ-docker-production)

---

## ภาพรวมระบบ

```
┌─────────────────────────────────────────────────────┐
│                     PortHub                         │
│                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌────────┐ │
│  │   Frontend   │───▶│   Backend    │───▶│  DB    │ │
│  │  Next.js 16  │    │  Go + Gin    │    │Postgres│ │
│  │  Port: 3000  │    │  Port: 8080  │    │  5432  │ │
│  └──────────────┘    └──────────────┘    └────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
| เทคโนโลยี | เวอร์ชัน | หน้าที่ |
|---|---|---|
| Next.js | 16.1.6 | React Framework (App Router) |
| React | 19.2.3 | UI Library |
| TypeScript | ^5 | Type Safety |
| Tailwind CSS | ^4 | Styling |
| Framer Motion | ^12 | Animations |
| Lucide React | ^0.563 | Icons |
| React Hot Toast | ^2.6 | Notifications |
| React Easy Crop | ^5.5 | Image Cropping |

### Backend
| เทคโนโลยี | เวอร์ชัน | หน้าที่ |
|---|---|---|
| Go | 1.24 | Programming Language |
| Gin | v1.11 | HTTP Web Framework |
| golang-jwt/jwt | v5 | JWT Authentication |
| lib/pq | v1.11 | PostgreSQL Driver |
| jackc/pgx | v5.8 | PostgreSQL Driver (advanced) |
| bcrypt | - | Password Hashing |

### Database & Infrastructure
| เทคโนโลยี | เวอร์ชัน | หน้าที่ |
|---|---|---|
| PostgreSQL | 16-alpine | Relational Database |
| Docker | - | Containerization |
| Docker Compose | - | Multi-container Orchestration |

---

## โครงสร้างโปรเจค

```
PortHub/
├── docker-compose.yml          # Orchestration ทั้งระบบ
│
├── backend/                    # Go API Server
│   ├── Dockerfile
│   ├── go.mod / go.sum
│   ├── main.go                 # Entry point + DB migration
│   ├── controllers/
│   │   └── auth.controller.go  # Register, Login, Forgot/Reset Password
│   ├── handlers/
│   │   ├── user.go             # Profile CRUD, Dashboard visibility
│   │   └── project.go          # Project CRUD
│   ├── middleware/
│   │   ├── auth.go             # JWT Authentication middleware
│   │   └── ratelimit.go        # Rate limiting middleware
│   ├── routes/
│   │   └── auth.route.go       # Route definitions
│   ├── utils/
│   │   ├── jwt.go              # JWT helpers
│   │   └── email.go            # Email (OTP) utilities
│   └── database/
│       ├── init.sql            # Initial schema
│       └── *.sql               # Migration scripts
│
└── frontend/                   # Next.js Application
    ├── Dockerfile
    ├── package.json
    ├── next.config.ts
    ├── tailwind.config.ts
    └── app/
        ├── layout.tsx           # Root layout + ThemeProvider
        ├── globals.css          # Global styles + Dark mode
        ├── page.tsx             # Home page (redirect)
        ├── providers/
        │   └── ThemeProvider.tsx # Dark/Light mode context
        ├── dashboard/
        │   ├── page.tsx         # Dashboard หลัก
        │   └── UserCard.tsx     # Card component
        ├── profile/[id]/
        │   └── page.tsx         # Profile detail + Project management
        ├── login/page.tsx
        ├── register/page.tsx
        ├── forgot-password/page.tsx
        ├── verify-email/page.tsx
        ├── new-password/page.tsx
        └── lib/
            └── api.ts           # API client functions
```

---

## ฟีเจอร์หลัก

### 🔐 Authentication
- **Register** — สมัครสมาชิกพร้อมข้อมูลโปรไฟล์ครบถ้วน
- **Login** — เข้าสู่ระบบด้วย Email + Password (JWT Token)
- **Forgot Password** — ขอรหัส OTP 4 หลักทางอีเมล
- **Verify OTP** — ยืนยันรหัส OTP (หมดอายุใน 10 นาที)
- **Reset Password** — ตั้งรหัสผ่านใหม่
- **Rate Limiting** — จำกัด 10 requests/นาที สำหรับ auth endpoints

### 👤 User Profile
- แก้ไขข้อมูลส่วนตัว (ชื่อ, มหาวิทยาลัย, คณะ, สาขา, GPA, ความสนใจ)
- อัปโหลดและ crop รูปโปรไฟล์
- จัดการ Skills (เพิ่ม/ลบ)
- ลบบัญชีผู้ใช้ (พร้อมลบข้อมูล Dashboard)

### 📁 Project Management
- สร้าง/แก้ไข/ลบโปรเจค
- อัปโหลดรูปภาพ Gallery (สูงสุด 4 รูป, auto-compress)
- Partial update (ส่งแค่ field ที่ต้องการแก้ไข)
- Validation ความยาวชื่อ (≤ 255 ตัวอักษร)

### 🌐 Dashboard
- แสดงโปรไฟล์ที่ publish แล้วทั้งหมด
- ค้นหาตาม ชื่อ, ความสนใจ, มหาวิทยาลัย, สาขา (Debounce 300ms)
- Guest mode (ดูได้โดยไม่ต้อง login)
- Publish/Unpublish โปรไฟล์ไปยัง Dashboard

### 🌙 Dark Mode
- Toggle Dark/Light mode ด้วยปุ่มใน Navbar
- จำ preference ไว้ใน localStorage
- ใช้งานได้ทุกหน้า

---

## API Endpoints

### Authentication (Rate limit: 10 req/min)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/register` | สมัครสมาชิก | ❌ |
| POST | `/api/login` | เข้าสู่ระบบ | ❌ |
| POST | `/api/forgot-password` | ขอ OTP | ❌ |
| POST | `/api/verify-otp` | ยืนยัน OTP | ❌ |
| POST | `/api/reset-password` | ตั้งรหัสผ่านใหม่ | ❌ |

### User Profile (ต้อง login)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/users/me` | ดึงข้อมูลตัวเอง | ✅ |
| PUT | `/api/users/me` | แก้ไขโปรไฟล์ | ✅ |
| DELETE | `/api/users/me` | ลบบัญชี | ✅ |
| GET | `/api/users/me/skills` | ดึง skills | ✅ |
| PUT | `/api/users/me/dashboard-visibility` | Publish/Unpublish | ✅ |

### Projects (ต้อง login)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/projects` | ดึงโปรเจคทั้งหมด | ✅ |
| GET | `/api/projects/:id` | ดึงโปรเจคตาม ID | ✅ |
| GET | `/api/users/me/projects` | ดึงโปรเจคของตัวเอง | ✅ |
| GET | `/api/users/me/projects/:id` | ดึงโปรเจคตาม ID | ✅ |
| POST | `/api/users/me/projects` | สร้างโปรเจค | ✅ |
| PUT | `/api/users/me/projects/:id` | แก้ไขโปรเจค | ✅ |
| DELETE | `/api/users/me/projects/:id` | ลบโปรเจค | ✅ |

### Dashboard (Public)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/dashboard/public-profiles` | โปรไฟล์ทั้งหมด (Guest) | ❌ |
| GET | `/api/dashboard/profiles` | โปรไฟล์ (ไม่รวมตัวเอง) | ✅ |
| GET | `/api/dashboard/profiles/:id` | โปรไฟล์สาธารณะตาม ID | ❌ |

---

## Database Schema

```sql
-- Users
users (
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
  created_at TIMESTAMP
)

-- Projects
projects (
  project_id SERIAL PRIMARY KEY,
  user_id INTEGER → users(user_id) CASCADE,
  project_name VARCHAR(255),
  description TEXT,
  image_url TEXT,  -- JSON array of image URLs
  created_at TIMESTAMP
)

-- Skills
skills (skill_id, skill_name UNIQUE)
user_skills (user_id, skill_id) -- Many-to-Many

-- OTP
verification_codes (
  code_id, user_id, code VARCHAR(4),
  type, is_used, expired_at, created_at
)

-- Published Snapshots (Dashboard)
published_profiles (user_id PK, user_name, email, ..., skills TEXT, updated_at)
published_projects (published_project_id, user_id, project_id, ...)
```

---

## การ Setup และรันระบบ

### ✅ Prerequisites

| เครื่องมือ | เวอร์ชันขั้นต่ำ | ดาวน์โหลด |
|---|---|---|
| Docker Desktop | 24+ | https://www.docker.com/products/docker-desktop |
| Docker Compose | 2.20+ | (มาพร้อม Docker Desktop) |
| Git | 2.x | https://git-scm.com |

> **หมายเหตุ:** ไม่จำเป็นต้องติดตั้ง Go, Node.js, หรือ PostgreSQL บนเครื่อง — Docker จัดการทั้งหมด

---

## การรันแบบ Docker (Production)

### 1. Clone โปรเจค

```bash
git clone https://github.com/your-username/PortHub.git
cd PortHub
```

### 2. รันทั้งระบบด้วยคำสั่งเดียว

```bash
docker compose up --build
```

> ครั้งแรกจะใช้เวลา 3-5 นาที เพราะต้อง download images และ build

### 3. เข้าใช้งาน

| Service | URL |
|---|---|
| 🌐 Frontend | http://localhost:3000 |
| ⚙️ Backend API | http://localhost:8080/api |
| 🗄️ Database | localhost:5432 |

### 4. หยุดระบบ

```bash
# หยุดแต่เก็บข้อมูล
docker compose down

# หยุดและลบข้อมูลทั้งหมด (reset)
docker compose down -v
```

### 5. Rebuild หลังแก้ไขโค้ด

```bash
# Rebuild ทั้งหมด
docker compose up --build

# Rebuild เฉพาะ backend
docker compose up -d --build backend

# Rebuild เฉพาะ frontend
docker compose up -d --build frontend
```

### 6. ดู Logs

```bash
# ดู logs ทั้งหมด
docker compose logs -f

# ดู logs เฉพาะ service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

---

## การรันแบบ Development

### Backend (Go)

**Prerequisites:** Go 1.24+, PostgreSQL 16

```bash
cd backend

# ติดตั้ง dependencies
go mod download

# ตั้งค่า environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=postgres
export DB_PASSWORD=190946
export DB_NAME=porthub_db
export PORT=8080
export CORS_ORIGIN=http://localhost:3000

# รัน server
go run main.go
```

### Frontend (Next.js)

**Prerequisites:** Node.js 20+

```bash
cd frontend

# ติดตั้ง dependencies
npm install

# สร้างไฟล์ .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8080/api" > .env.local

# รัน development server
npm run dev
```

เข้าใช้งานที่ http://localhost:3000

### Database (PostgreSQL)

```bash
# รัน PostgreSQL ด้วย Docker เพียงอย่างเดียว
docker run -d \
  --name porthub-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=190946 \
  -e POSTGRES_DB=porthub_db \
  -p 5432:5432 \
  postgres:16-alpine

# รัน initial schema
psql -h localhost -U postgres -d porthub_db -f backend/database/init.sql
```

---

## Environment Variables

### Backend

| Variable | Default | Description |
|---|---|---|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USER` | `postgres` | Database username |
| `DB_PASSWORD` | `190946` | Database password |
| `DB_NAME` | `porthub_db` | Database name |
| `PORT` | `8080` | API server port |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed CORS origin |

### Frontend

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api` | Backend API URL |

> สร้างไฟล์ `frontend/.env.local` สำหรับ development:
> ```
> NEXT_PUBLIC_API_URL=http://localhost:8080/api
> ```

---

## 🔧 การแก้ไขปัญหาที่พบบ่อย

### ❌ Port ถูกใช้งานอยู่แล้ว

```bash
# ตรวจสอบ port ที่ใช้งาน
netstat -ano | findstr :3000
netstat -ano | findstr :8080
netstat -ano | findstr :5432

# หยุด container ที่รันอยู่
docker compose down
```

### ❌ Database connection failed

```bash
# ตรวจสอบสถานะ container
docker ps

# ดู logs ของ database
docker logs porthub-db

# รอให้ database พร้อมก่อน (health check)
docker compose up db
# แล้วค่อยรัน backend
docker compose up backend
```

### ❌ Frontend ไม่สามารถเชื่อมต่อ Backend

1. ตรวจสอบว่า backend รันอยู่: `docker ps`
2. ทดสอบ API: `curl http://localhost:8080/api/dashboard/public-profiles`
3. ตรวจสอบ `NEXT_PUBLIC_API_URL` ใน `.env.local`

### ❌ Build ล้มเหลว

```bash
# ลบ cache และ build ใหม่
docker compose down
docker system prune -f
docker compose up --build
```

---

## 📊 Connection Pool

Backend ตั้งค่า PostgreSQL connection pool ไว้ดังนี้:

```
Max Open Connections : 100
Max Idle Connections : 25
Connection Max Lifetime: 5 minutes
```

---

## 🔒 Security

- **Password Hashing** — bcrypt
- **JWT Authentication** — HS256, expire ใน 24 ชั่วโมง
- **Rate Limiting** — 200 req/min (global), 10 req/min (auth endpoints)
- **CORS** — จำกัดเฉพาะ origin ที่กำหนด
- **Input Validation** — ตรวจสอบ GPA (0-4), title length (≤255), required fields
- **Cascade Delete** — ลบ user แล้วลบข้อมูลที่เกี่ยวข้องทั้งหมด (projects, skills, published data)

---

## 📄 License

MIT License — สามารถนำไปใช้และดัดแปลงได้อย่างอิสระ
