# PowerShell script to fix show_on_dashboard column
# รันคำสั่งนี้เพื่อแก้ไขค่า show_on_dashboard ให้เป็น false สำหรับ user ทั้งหมด

$env:PGPASSWORD = "190946"

Write-Host "🔧 Fixing show_on_dashboard column..." -ForegroundColor Yellow
Write-Host ""

# รัน SQL script
psql -U postgres -d porthub_db -f fix_show_on_dashboard.sql

Write-Host ""
Write-Host "✅ Done! All users now have show_on_dashboard = false by default" -ForegroundColor Green
Write-Host "💡 Users need to click 'Publish to Dashboard' to appear in the dashboard" -ForegroundColor Cyan
