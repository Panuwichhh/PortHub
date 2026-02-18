# Run migration: add show_on_dashboard to users table
# ใช้ได้เมื่อมี psql ใน PATH หรือระบุ path ของ psql

$env:PGPASSWORD = "190946"
$db = "porthub_db"
$user = "postgres"
$host = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }

$sql = Get-Content -Raw -Path "$PSScriptRoot\add_show_on_dashboard.sql"
& psql -h $host -p 5432 -U $user -d $db -c $sql
if ($LASTEXITCODE -eq 0) { Write-Host "OK: show_on_dashboard column added." } else { Write-Host "Error running migration. Try running the SQL manually." }
