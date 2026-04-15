# 🔧 แก้ปัญหา Dashboard แสดง User ที่ไม่ได้ Publish

## ปัญหา
User เก่าๆ แสดงใน Dashboard แม้ว่าจะไม่ได้กด "Publish to Dashboard"

## วิธีแก้ไข (เลือก 1 วิธี)

### ✅ วิธีที่ 1: Restart Backend Server (แนะนำ - ง่ายที่สุด)

1. หยุด backend server (กด Ctrl+C)
2. รัน backend ใหม่:
```powershell
cd backend
go run main.go
```

3. ระบบจะรัน migration อัตโนมัติและแสดงข้อความ:
```
✅ Reset: Set show_on_dashboard = false for X users
💡 Users need to click 'Publish to Dashboard' to appear in dashboard
```

4. เสร็จแล้ว! ตรวจสอบ Dashboard ที่ http://localhost:3000/dashboard

### 📝 หมายเหตุสำคัญ

หลังจากรัน backend ครั้งแรกแล้ว ควร **ลบหรือ comment** โค้ดนี้ออกจาก `backend/main.go` (บรรทัด 60-68):

```go
// 🔧 FIX: Reset ค่า show_on_dashboard เป็น false สำหรับ user ทั้งหมด (ครั้งเดียว)
// ลบบรรทัดนี้หลังจากรันครั้งแรกแล้ว หรือ comment ออก
result, err := db.Exec("UPDATE users SET show_on_dashboard = false")
if err != nil {
    log.Printf("⚠️ Reset show_on_dashboard: %v", err)
} else {
    rowsAffected, _ := result.RowsAffected()
    fmt.Printf("✅ Reset: Set show_on_dashboard = false for %d users\n", rowsAffected)
    fmt.Println("💡 Users need to click 'Publish to Dashboard' to appear in dashboard")
}
```

**เปลี่ยนเป็น:**
```go
// Migration สำหรับ show_on_dashboard เสร็จสิ้นแล้ว
```

## ตรวจสอบผลลัพธ์

### ใน Dashboard
- เปิด http://localhost:3000/dashboard
- ควรไม่เห็น user ใดๆ (หรือเห็นเฉพาะที่กด Publish แล้ว)

### ใน Profile
- เข้า http://localhost:3000/profile/[user_id]
- แก้ไข Profile/Project → Save
- ข้อความจะแสดง: "Profile saved! 💾 (ยังไม่แสดงใน Dashboard)"
- กด "Publish to Dashboard" → ข้อความจะแสดง: "Published to Dashboard! ✅ คนอื่นเห็นโปรไฟล์คุณแล้ว"
- ตรวจสอบ Dashboard อีกครั้ง → ควรเห็น profile ของคุณแล้ว

## การทำงานที่ถูกต้อง

```
┌─────────────────────────────────────────────────────────┐
│ 1. สร้าง/แก้ไข Profile/Project                         │
│    → show_on_dashboard = false                          │
│    → แสดงเฉพาะในหน้า Profile ของตัวเอง                 │
│    → ❌ ไม่แสดงใน Dashboard                            │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 2. กด "Publish to Dashboard"                            │
│    → show_on_dashboard = true                           │
│    → ✅ แสดงใน Dashboard ให้คนอื่นเห็น                │
└─────────────────────────────────────────────────────────┘
```

## ถ้ายังมีปัญหา

ลองตรวจสอบในฐานข้อมูลโดยตรง:
```sql
-- เชื่อมต่อ PostgreSQL
psql -U postgres -d porthub_db

-- ตรวจสอบค่า show_on_dashboard
SELECT user_id, user_name, email, show_on_dashboard 
FROM users 
ORDER BY user_id;

-- ถ้าต้องการ reset ทั้งหมดด้วยตัวเอง
UPDATE users SET show_on_dashboard = false;
```
