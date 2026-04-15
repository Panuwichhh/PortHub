package main

import (
	"backend/routes"
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

func main() {
	// 1. เชื่อมต่อ Database (ปรับให้รองรับทั้ง Local และ Docker)
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "localhost"
	}
	portDB := os.Getenv("DB_PORT")
	if portDB == "" {
		portDB = "5432"
	}
	userDB := os.Getenv("DB_USER")
	if userDB == "" {
		userDB = "postgres"
	}
	passDB := os.Getenv("DB_PASSWORD")
	if passDB == "" {
		passDB = "190946"
	}
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "porthub_db"
	}

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", host, portDB, userDB, passDB, dbName)
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("❌ Error opening database:", err)
	}
	defer db.Close()

	if err = db.Ping(); err != nil {
		log.Fatal("❌ ไม่สามารถเชื่อมต่อ Database ได้ (Ping failed):", err)
	}
	fmt.Println("✅ Database connected successfully")

	// รัน migration: เพิ่มคอลัมน์ show_on_dashboard ถ้ายังไม่มี (ไม่ต้องรัน SQL เอง)
	_, err = db.Exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS show_on_dashboard BOOLEAN DEFAULT false")
	if err != nil {
		log.Printf("⚠️ Migration show_on_dashboard (อาจมีอยู่แล้ว): %v", err)
	} else {
		fmt.Println("✅ Migration: show_on_dashboard column OK")
	}

	// อัปเดตค่า NULL เป็น false สำหรับ user เก่าๆ
	_, err = db.Exec("UPDATE users SET show_on_dashboard = false WHERE show_on_dashboard IS NULL")
	if err != nil {
		log.Printf("⚠️ Migration update NULL values: %v", err)
	} else {
		fmt.Println("✅ Migration: Updated NULL values to false")
	}

	// สร้างตาราง published_profiles และ published_projects (ไม่ใช้ foreign key ก่อน)
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS published_profiles (
			user_id INTEGER PRIMARY KEY,
			user_name VARCHAR(255),
			email VARCHAR(255),
			phone VARCHAR(50),
			university VARCHAR(255),
			faculty VARCHAR(255),
			major VARCHAR(255),
			gpa DECIMAL(3,2),
			job_interest TEXT,
			profile_image_url TEXT,
			skills TEXT,
			published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		log.Printf("⚠️ Migration published_profiles: %v", err)
	} else {
		fmt.Println("✅ Migration: published_profiles table OK")
	}

	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS published_projects (
			published_project_id SERIAL PRIMARY KEY,
			user_id INTEGER NOT NULL,
			project_id INTEGER NOT NULL,
			project_name VARCHAR(255),
			description TEXT,
			image_url TEXT,
			published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(user_id, project_id)
		)
	`)
	if err != nil {
		log.Printf("⚠️ Migration published_projects: %v", err)
	} else {
		fmt.Println("✅ Migration: published_projects table OK")
	}

	_, err = db.Exec("CREATE INDEX IF NOT EXISTS idx_published_projects_user_id ON published_projects(user_id)")
	if err != nil {
		log.Printf("⚠️ Migration index: %v", err)
	} else {
		fmt.Println("✅ Migration: Index created")
	}

	// คัดลอกข้อมูล users ที่มี show_on_dashboard = true ไปยัง published_profiles
	_, err = db.Exec(`
		INSERT INTO published_profiles (
			user_id, user_name, email, phone, university, faculty, major, gpa, 
			job_interest, profile_image_url, skills, published_at, updated_at
		)
		SELECT 
			u.user_id,
			u.user_name,
			u.email,
			u.phone,
			u.university,
			u.faculty,
			u.major,
			u.gpa,
			u.job_interest,
			u.profile_image_url,
			COALESCE(
				(
					SELECT json_agg(s.skill_name)::text
					FROM user_skills us
					JOIN skills s ON us.skill_id = s.skill_id
					WHERE us.user_id = u.user_id
				),
				'[]'
			) as skills,
			NOW(),
			NOW()
		FROM users u
		WHERE u.show_on_dashboard = true
		ON CONFLICT (user_id) DO UPDATE SET
			user_name = EXCLUDED.user_name,
			email = EXCLUDED.email,
			phone = EXCLUDED.phone,
			university = EXCLUDED.university,
			faculty = EXCLUDED.faculty,
			major = EXCLUDED.major,
			gpa = EXCLUDED.gpa,
			job_interest = EXCLUDED.job_interest,
			profile_image_url = EXCLUDED.profile_image_url,
			skills = EXCLUDED.skills,
			updated_at = NOW()
	`)
	if err != nil {
		log.Printf("⚠️ Migration copy users: %v", err)
	} else {
		fmt.Println("✅ Migration: Copied existing users to published_profiles")
	}

	// คัดลอก projects ของ users ที่ publish แล้ว
	_, err = db.Exec(`
		INSERT INTO published_projects (
			user_id, project_id, project_name, description, image_url, published_at
		)
		SELECT 
			p.user_id,
			p.project_id,
			p.project_name,
			p.description,
			p.image_url,
			NOW()
		FROM projects p
		WHERE p.user_id IN (SELECT user_id FROM users WHERE show_on_dashboard = true)
		ON CONFLICT (user_id, project_id) DO UPDATE SET
			project_name = EXCLUDED.project_name,
			description = EXCLUDED.description,
			image_url = EXCLUDED.image_url,
			published_at = NOW()
	`)
	if err != nil {
		log.Printf("⚠️ Migration copy projects: %v", err)
	} else {
		fmt.Println("✅ Migration: Copied existing projects to published_projects")
	}

	// 2. สร้าง Server
	r := gin.Default()

	// --- Middleware สำหรับ CORS (แก้ไขให้ครอบคลุม) ---
	allowOrigin := os.Getenv("CORS_ORIGIN")
	if allowOrigin == "" {
		allowOrigin = "http://localhost:3000"
	}
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", allowOrigin)
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, Origin, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// 3. จัดกลุ่ม API
	// ถ้า Group เป็น "/api" แล้วข้างใน routes.AuthRoutes มี "/forgot-password"
	// URL ของจริงจะเป็น http://localhost:8080/api/forgot-password
	api := r.Group("/api")
	{
		routes.AuthRoutes(api, db)
		routes.UserRoutes(api, db)
		routes.ProjectRoutes(api, db)
		routes.DashboardRoutes(api, db)
	}

	// 4. เริ่มรัน Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("\n🔥 [SERVER START] http://localhost:%s\n", port)
	fmt.Println("📌 Available Routes:")
	// บรรทัดนี้จะช่วยนายเช็คว่า Route เข้าไปในระบบหรือยัง
	for _, route := range r.Routes() {
		fmt.Printf("   %s %s\n", route.Method, route.Path)
	}
	fmt.Println("------------------------------------------")

	if err := r.Run(":" + port); err != nil {
		log.Fatal("❌ Server run error:", err)
	}
}
