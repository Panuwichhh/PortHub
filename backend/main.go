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
	// 1. เชื่อมต่อ Database
	connStr := "host=localhost port=5432 user=postgres password=190946 dbname=porthub_db sslmode=disable"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err = db.Ping(); err != nil {
		log.Fatal("ไม่สามารถเชื่อมต่อ Database ได้:", err)
	}

	// 2. สร้าง Server
	r := gin.Default()

	// --- Middleware สำหรับ CORS (ต้องวางไว้ก่อน Routes) ---
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// 3. จัดกลุ่ม API และเรียกใช้ Routes
	api := r.Group("/api")
	{
		routes.AuthRoutes(api, db)
	}

	fmt.Println("🚀 Server is running on http://localhost:8080")
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r.Run(":" + port)
}
