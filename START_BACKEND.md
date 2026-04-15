# 🚀 วิธีรัน Backend Server

## ปัญหาที่พบ
- Port 8080 ถูกใช้งานอยู่แล้ว
- ต้องหยุด backend instance เก่าก่อน

## วิธีแก้ไข

### 1. หยุด Backend เก่า
กด **Ctrl+C** ใน terminal ที่รัน backend อยู่

หรือถ้าไม่พบ terminal ให้ใช้คำสั่ง:
```powershell
# หา process ที่ใช้ port 8080
netstat -ano | findstr :8080

# Kill process (แทน PID ด้วยเลขที่ได้จากคำสั่งด้านบน)
taskkill /PID <PID> /F
```

### 2. รัน Backend ใหม่
```powershell
cd backend
go run main.go
```

### 3. ตรวจสอบผลลัพธ์
คุณควรเห็นข้อความ:
```
✅ Database connected successfully
✅ Migration: show_on_dashboard column OK
✅ Migration: Updated NULL values to false
✅ Migration: published_profiles table OK
✅ Migration: published_projects table OK
✅ Migration: Index created
🔥 [SERVER START] http://localhost:8080
```

## ทดสอบการทำงาน

### 1. ทดสอบ API
```powershell
# ทดสอบ health check
curl http://localhost:8080/api/dashboard/public-profiles
```

### 2. ทดสอบ Frontend
1. เปิด http://localhost:3000/dashboard
2. ควรไม่เห็น user ใดๆ (เพราะยังไม่มีใครกด Publish)

### 3. ทดสอบ Publish
1. Login เข้าระบบ
2. ไปที่ Profile ของคุณ
3. แก้ไข Profile → Save
4. ตรวจสอบ Dashboard → ยังไม่เห็นข้อมูล ✅
5. กด "Publish to Dashboard"
6. ตรวจสอบ Dashboard → เห็นข้อมูลแล้ว ✅

## หมายเหตุ

- ถ้า migration ล้มเหลว ให้ลบตารางเก่าออกก่อน:
```sql
DROP TABLE IF EXISTS published_projects CASCADE;
DROP TABLE IF EXISTS published_profiles CASCADE;
```

- ถ้ายังมีปัญหา ให้ตรวจสอบ log ใน terminal
