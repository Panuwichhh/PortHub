package controllers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// โครงสร้างข้อมูลสำหรับรับจากหน้าเว็บ
type User struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Register(c *gin.Context, db *sql.DB) {
	var input User
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	// เข้ารหัสรหัสผ่าน
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)

	// บันทึกลง Database (แก้ไขชื่อคอลัมน์เป็น password_hash)
	query := "INSERT INTO users (email, password_hash) VALUES ($1, $2)"
	_, err := db.Exec(query, input.Email, string(hashedPassword))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "อีเมลนี้ถูกใช้งานแล้ว หรือเกิดข้อผิดพลาดที่ระบบ"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "สมัครสมาชิกสำเร็จ!"})
}

func Login(c *gin.Context, db *sql.DB) {
	var input User
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	var storedPassword string
	// แก้ไขคำสั่ง SELECT ให้ดึงจาก password_hash
	query := "SELECT password_hash FROM users WHERE email = $1"
	err := db.QueryRow(query, input.Email).Scan(&storedPassword)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ไม่พบอีเมลนี้ในระบบ"})
		return
	}

	// ตรวจสอบรหัสผ่าน
	if err := bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "รหัสผ่านไม่ถูกต้อง"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "เข้าสู่ระบบสำเร็จ!", "token": "fake-jwt-token"})
}
