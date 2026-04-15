# แก้ปัญหา User เก่าแสดงใน Dashboard โดยไม่ได้ตั้งใจ

## ปัญหา
User เก่าๆ ที่สร้างก่อนหน้านี้ยังแสดงใน Dashboard แม้ว่าจะไม่ได้กด "Publish to Dashboard"

## สาเหตุ
- User เก่าๆ อาจมีค่า `show_on_dashboard = NULL` หรือค่าอื่นที่ไม่ใช่ `false`
- ต้องอัปเดตฐานข้อมูลให้ทุก user มีค่า `show_on_dashboard = false` เป็นค่าเริ่มต้น

## วิธีแก้ไข

### วิธีที่ 1: รัน PowerShell Script (แนะนำ)
```powershell
cd backend/database
./run_fix_show_on_dashboard.ps1
```

### วิธีที่ 2: รัน SQL โดยตรง
```powershell
cd backend/database
$env:PGPASSWORD = "190946"
psql -U postgres -d porthub_db -f fix_show_on_dashboard.sql
```

### วิธีที่ 3: Restart Backend Server
Backend จะรัน migration อัตโนมัติเมื่อเริ่มต้น:
```powershell
cd backend
go run main.go
```

## ตรวจสอบผลลัพธ์

### ตรวจสอบในฐานข้อมูล
```sql
SELECT user_id, user_name, email, show_on_dashboard 
FROM users 
ORDER BY user_id;
```

ผลลัพธ์ที่ถูกต้อง:
- ทุก user ควรมี `show_on_dashboard = false` (หรือ `f`)
- เฉพาะ user ที่กด "Publish to Dashboard" แล้วเท่านั้นที่จะเป็น `true` (หรือ `t`)

### ตรวจสอบใน Dashboard
1. เปิด http://localhost:3000/dashboard
2. ควรเห็นเฉพาะ user ที่กด "Publish to Dashboard" แล้วเท่านั้น
3. User ที่ยังไม่ได้กดจะไม่แสดง

## การทำงานที่ถูกต้อง

```
1. สร้าง User ใหม่
   → show_on_dashboard = false (ค่าเริ่มต้น)
   → ไม่แสดงใน Dashboard

2. แก้ไข Profile/Project
   → show_on_dashboard ยังคงเป็น false
   → ยังไม่แสดงใน Dashboard

3. กด "Publish to Dashboard"
   → show_on_dashboard = true
   → แสดงใน Dashboard ให้คนอื่นเห็น
```

## หมายเหตุ
- การแก้ไขนี้จะไม่ลบข้อมูล user ใดๆ
- เพียงแค่ตั้งค่า `show_on_dashboard = false` สำหรับทุกคน
- User สามารถกด "Publish to Dashboard" ได้ตามปกติ
