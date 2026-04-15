-- ตรวจสอบสถานะ show_on_dashboard ของ users ทั้งหมด
SELECT 
    user_id, 
    user_name, 
    email, 
    show_on_dashboard,
    CASE 
        WHEN show_on_dashboard = true THEN '✅ แสดงใน Dashboard'
        WHEN show_on_dashboard = false THEN '❌ ไม่แสดงใน Dashboard'
        ELSE '⚠️ NULL (ต้องแก้ไข)'
    END as status
FROM users 
ORDER BY user_id;
