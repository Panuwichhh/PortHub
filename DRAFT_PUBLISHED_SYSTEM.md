# 🎯 ระบบ Draft/Published สำหรับ Profile และ Projects

## ภาพรวม

ระบบนี้แยกข้อมูลเป็น 2 ชุด:
- **Draft (Private)** = ข้อมูลล่าสุดที่คุณแก้ไข (เห็นแค่ตัวเอง)
- **Published (Public)** = Snapshot ที่เผยแพร่ไปยัง Dashboard (คนอื่นเห็น)

## การทำงาน

```
┌─────────────────────────────────────────────────────────┐
│ 1. แก้ไข Profile/Project → Save                        │
│    ✅ บันทึกใน users/projects (Draft)                  │
│    ✅ แสดงในหน้า Profile ของคุณ                        │
│    ❌ ยังไม่แสดงใน Dashboard                           │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 2. กด "Publish to Dashboard"                            │
│    ✅ คัดลอกข้อมูลไป published_profiles                │
│    ✅ คัดลอก projects ไป published_projects             │
│    ✅ แสดงใน Dashboard ให้คนอื่นเห็น                   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 3. แก้ไข Profile/Project อีกครั้ง → Save              │
│    ✅ อัปเดตใน users/projects (Draft)                  │
│    ✅ แสดงในหน้า Profile ของคุณ (ข้อมูลใหม่)          │
│    ❌ Dashboard ยังแสดงข้อมูลเก่า (Published)          │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 4. กด "Publish to Dashboard" อีกครั้ง                  │
│    ✅ อัปเดต published_profiles ด้วยข้อมูลใหม่        │
│    ✅ อัปเดต published_projects ด้วยข้อมูลใหม่        │
│    ✅ Dashboard แสดงข้อมูลใหม่                         │
└─────────────────────────────────────────────────────────┘
```

## โครงสร้างฐานข้อมูล

### ตารางเดิม (Draft/Private)
- `users` - ข้อมูล profile ล่าสุด (เห็นแค่ตัวเอง)
- `projects` - โปรเจคล่าสุด (เห็นแค่ตัวเอง)
- `user_skills` - skills ล่าสุด (เห็นแค่ตัวเอง)

### ตารางใหม่ (Published/Public)
- `published_profiles` - Snapshot ของ profile ที่ publish (คนอื่นเห็น)
- `published_projects` - Snapshot ของ projects ที่ publish (คนอื่นเห็น)

## API Endpoints

### 1. Publish to Dashboard
```http
PUT /api/users/me/dashboard-visibility
Content-Type: application/json

{
  "show_on_dashboard": true
}
```

**สิ่งที่เกิดขึ้น:**
1. คัดลอกข้อมูลจาก `users` → `published_profiles`
2. คัดลอก skills จาก `user_skills` → `published_profiles.skills` (JSON)
3. คัดลอกทุก project จาก `projects` → `published_projects`
4. ตั้งค่า `users.show_on_dashboard = true`

### 2. Unpublish from Dashboard
```http
PUT /api/users/me/dashboard-visibility
Content-Type: application/json

{
  "show_on_dashboard": false
}
```

**สิ่งที่เกิดขึ้น:**
1. ลบข้อมูลจาก `published_profiles`
2. ลบข้อมูลจาก `published_projects`
3. ตั้งค่า `users.show_on_dashboard = false`

### 3. Get Dashboard Profiles (สำหรับ logged-in users)
```http
GET /api/dashboard/profiles
Authorization: Bearer <token>
```

**ดึงข้อมูลจาก:** `published_profiles` (ไม่รวมตัวเอง)

### 4. Get Public Dashboard Profiles (สำหรับ guests)
```http
GET /api/dashboard/public-profiles
```

**ดึงข้อมูลจาก:** `published_profiles` (ทุกคน)

### 5. Get Public Profile
```http
GET /api/dashboard/profiles/:id
```

**ดึงข้อมูลจาก:** 
- `published_profiles` (profile)
- `published_projects` (projects)

## วิธีใช้งาน

### 1. Start Backend Server
```powershell
cd backend
go run main.go
```

ระบบจะสร้างตารางใหม่อัตโนมัติ:
```
✅ Migration: published_profiles table OK
✅ Migration: published_projects table OK
✅ Migration: Index created
```

### 2. ทดสอบการทำงาน

#### A. แก้ไข Profile
1. เข้า http://localhost:3000/profile/[user_id]
2. กด Edit Profile → แก้ไขข้อมูล → Save
3. ✅ เห็นข้อมูลใหม่ในหน้า Profile
4. ❌ Dashboard ยังไม่แสดงข้อมูลใหม่

#### B. Publish to Dashboard
1. กดปุ่ม "Publish to Dashboard"
2. ✅ ข้อความแสดง: "Published to Dashboard! ✅ คนอื่นเห็นโปรไฟล์คุณแล้ว"
3. ✅ Dashboard แสดงข้อมูลที่ publish

#### C. แก้ไขอีกครั้ง
1. แก้ไข Profile/Project → Save
2. ✅ เห็นข้อมูลใหม่ในหน้า Profile
3. ❌ Dashboard ยังแสดงข้อมูลเก่า (ที่ publish ครั้งก่อน)

#### D. Publish อีกครั้ง
1. กดปุ่ม "Publish to Dashboard" อีกครั้ง
2. ✅ Dashboard อัปเดตเป็นข้อมูลใหม่

## ข้อดี

✅ **ควบคุมได้ว่าเมื่อไหร่จะเผยแพร่**
- แก้ไขได้เท่าที่ต้องการก่อน publish
- ไม่ต้องกังวลว่าคนอื่นจะเห็นข้อมูลที่ยังไม่เสร็จ

✅ **ข้อมูล Draft และ Published แยกกัน**
- Draft = ข้อมูลล่าสุดที่คุณกำลังแก้ไข
- Published = Snapshot ที่คนอื่นเห็น

✅ **ปลอดภัย**
- คนอื่นเห็นเฉพาะข้อมูลที่คุณ publish เท่านั้น
- ไม่มีการรั่วไหลของข้อมูล Draft

## ข้อควรระวัง

⚠️ **ต้องกด Publish ทุกครั้งที่ต้องการอัปเดต Dashboard**
- ถ้าแก้ไขแล้วไม่ publish → Dashboard จะแสดงข้อมูลเก่า

⚠️ **การลบ Project**
- ถ้าลบ project จาก Draft แล้ว publish → project จะหายจาก Dashboard
- ถ้าลบ project แต่ไม่ publish → Dashboard ยังแสดง project เก่าอยู่

## ตรวจสอบข้อมูล

### ตรวจสอบใน Database
```sql
-- ดูข้อมูล Draft (ล่าสุด)
SELECT user_id, user_name, email FROM users;

-- ดูข้อมูล Published (ที่คนอื่นเห็น)
SELECT user_id, user_name, email FROM published_profiles;

-- ดู Projects Draft
SELECT project_id, user_id, project_name FROM projects;

-- ดู Projects Published
SELECT project_id, user_id, project_name FROM published_projects;
```

## สรุป

ระบบนี้ให้คุณ**ควบคุมได้เต็มที่**ว่าเมื่อไหร่จะเผยแพร่ข้อมูลไปยัง Dashboard:
- แก้ไข → Save → เห็นแค่ตัวเอง
- Publish → คนอื่นเห็น
- แก้ไขอีก → Save → เห็นแค่ตัวเอง
- Publish อีกครั้ง → คนอื่นเห็นข้อมูลใหม่
