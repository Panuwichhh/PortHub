# รัน PortHub ด้วย Docker (Database + Backend + Frontend)

## สิ่งที่สร้างไว้

| ไฟล์ | คำอธิบาย |
|------|-----------|
| `backend/Dockerfile` | Build และรัน Go API ใน container |
| `frontend/Dockerfile` | Build และรัน Next.js ใน container (standalone) |
| `docker-compose.yml` (ที่ root) | รัน DB + Backend + Frontend พร้อมกัน |

Database ใช้ image **postgres:16-alpine** โดยตรง (ไม่ต้องเขียน Dockerfile แยก)

---

## วิธีรัน

จากโฟลเดอร์ **root ของโปรเจกต์** (ที่มี `docker-compose.yml`):

```bash
docker-compose up -d --build
```

- `--build` = build image ใหม่จาก Dockerfile
- `-d` = รันในพื้นหลัง (detached)

รอ build จนครบ แล้วเปิดเบราว์เซอร์ที่ **http://localhost:3000**

---

## Port ที่ใช้

| Service | Port | URL (จากเครื่อง host) |
|---------|------|------------------------|
| Frontend | 3000 | http://localhost:3000 |
| Backend API | 8080 | http://localhost:8080 |
| PostgreSQL | 5432 | localhost:5432 (สำหรับ tools อย่าง pgAdmin) |

---

## คำสั่งอื่นที่ใช้บ่อย

```bash
# ดูสถานะ container
docker-compose ps

# ดู log (ทุก service)
docker-compose logs -f

# หยุดทุก container
docker-compose down

# หยุดและลบ volume (ข้อมูลใน DB หาย)
docker-compose down -v
```

---

## Environment (ปรับได้ใน docker-compose.yml)

- **DB:** `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- **Backend:** `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `CORS_ORIGIN`
- **Frontend:** build-time `NEXT_PUBLIC_API_URL` (ต้องเป็น URL ที่ browser เรียกได้ เช่น `http://localhost:8080/api`)

ถ้า deploy ขึ้น server จริง ให้เปลี่ยน `CORS_ORIGIN` และ `NEXT_PUBLIC_API_URL` เป็นโดเมนของเว็บจริง
