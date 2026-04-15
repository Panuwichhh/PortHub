# 🔄 คืนข้อมูล Dashboard ที่หายไป

## ปัญหา
หลังจากเปลี่ยนระบบเป็น Draft/Published ข้อมูลใน Dashboard หายไป

## สาเหตุ
- ระบบใหม่ดึงข้อมูลจาก `published_profiles` และ `published_projects`
- แต่ตารางเหล่านี้ยังว่างเปล่า (ยังไม่มีข้อมูล)
- ต้องคัดลอกข้อมูล users ที่มี `show_on_dashboard = true` ไปยังตารางใหม่

## วิธีแก้ไข

### วิธีที่ 1: Restart Backend (แนะนำ - ง่ายที่สุด)

Backend จะรัน migration อัตโนมัติเมื่อ start:

```powershell
# หยุด backend เก่า (Ctrl+C)
cd backend
go run main.go
```

คุณจะเห็นข้อความ:
```
✅ Migration: Copied existing users to published_profiles
✅ Migration: Copied existing projects to published_projects
```

### วิธีที่ 2: รัน SQL โดยตรง

ถ้าไม่ต้องการ restart backend:

```powershell
cd backend/database
$env:PGPASSWORD = "190946"
psql -U postgres -d porthub_db -f migrate_existing_users.sql
```

## ตรวจสอบผลลัพธ์

### 1. ตรวจสอบใน Database
```sql
-- ดูจำนวน users ที่ publish
SELECT COUNT(*) FROM published_profiles;

-- ดูจำนวน projects ที่ publish
SELECT COUNT(*) FROM published_projects;

-- ดูรายละเอียด
SELECT user_id, user_name, email FROM published_profiles;
```

### 2. ตรวจสอบใน Dashboard
1. เปิด http://localhost:3000/dashboard
2. ควรเห็น users ที่เคยแสดงอยู่กลับมาแล้ว ✅

## การทำงานหลังจากนี้

### สำหรับ Users เก่า (ที่มี show_on_dashboard = true)
- ✅ แสดงใน Dashboard ทันที (ข้อมูลถูกคัดลอกไปแล้ว)
- เมื่อแก้ไข Profile/Project → Save → Dashboard ยังแสดงข้อมูลเก่า
- ต้องกด "Publish to Dashboard" เพื่ออัปเดตข้อมูลใหม่

### สำหรับ Users ใหม่
- แก้ไข Profile/Project → Save → ยังไม่แสดงใน Dashboard
- กด "Publish to Dashboard" → แสดงใน Dashboard

## หมายเหตุ

Migration นี้จะรันทุกครั้งที่ start backend แต่ใช้ `ON CONFLICT DO UPDATE` ดังนั้น:
- ถ้ามีข้อมูลอยู่แล้ว → อัปเดตข้อมูล
- ถ้ายังไม่มีข้อมูล → เพิ่มข้อมูลใหม่

## สรุป

```
Before:
- Dashboard ว่างเปล่า ❌

After:
- Dashboard แสดง users ที่มี show_on_dashboard = true ✅
- ข้อมูลถูกคัดลอกจาก users/projects → published_profiles/published_projects
```
