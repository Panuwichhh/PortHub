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

	connStr := fmt.Sprintf("host=%s port=5432 user=postgres password=190946 dbname=porthub_db sslmode=disable", host)
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("❌ Error opening database:", err)
	}
	defer db.Close()

	if err = db.Ping(); err != nil {
		log.Fatal("❌ ไม่สามารถเชื่อมต่อ Database ได้ (Ping failed):", err)
	}
	fmt.Println("✅ Database connected successfully")

	// 2. สร้าง Server
	r := gin.Default()

	// --- Middleware สำหรับ CORS (แก้ไขให้ครอบคลุม) ---
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
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
