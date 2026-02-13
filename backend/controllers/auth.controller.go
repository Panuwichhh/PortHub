package controllers

import (
	"database/sql"
	"fmt"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"backend/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	OTP      string `json:"otp"`
}

// ---------------------------------------------------------
// 1. Register: สมัครสมาชิก
// ---------------------------------------------------------
func Register(c *gin.Context, db *sql.DB) {
	var input User
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	emailNorm := strings.ToLower(strings.TrimSpace(input.Email))

	query := "INSERT INTO users (email, password_hash) VALUES ($1, $2)"
	_, err := db.Exec(query, emailNorm, string(hashedPassword))
	if err != nil {
		fmt.Println("❌ Register Error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "อีเมลนี้ถูกใช้งานแล้ว"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "สมัครสมาชิกสำเร็จ!"})
}

// ---------------------------------------------------------
// 2. Login: เข้าสู่ระบบ
// ---------------------------------------------------------
func Login(c *gin.Context, db *sql.DB) {
	var input User
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	var storedPassword string
	emailNorm := strings.ToLower(strings.TrimSpace(input.Email))
	query := "SELECT password_hash FROM users WHERE LOWER(email) = $1"
	err := db.QueryRow(query, emailNorm).Scan(&storedPassword)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ไม่พบอีเมลนี้ในระบบ"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "รหัสผ่านไม่ถูกต้อง"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "เข้าสู่ระบบสำเร็จ!", "token": "fake-jwt-token"})
}

// ---------------------------------------------------------
// 3. ForgotPassword: สร้าง OTP และส่งเมล
// ---------------------------------------------------------
func ForgotPassword(c *gin.Context, db *sql.DB) {
	var input struct {
		Email string `json:"email"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาระบุอีเมล"})
		return
	}

	fmt.Println("📩 Request Forgot Password for:", input.Email)

	// 1. เช็คว่ามี User ไหม และเอา user_id + email จริงจาก DB (เปรียบเทียบอีเมลไม่สนใจตัวพิมพ์ใหญ่/เล็ก)
	emailNorm := strings.ToLower(strings.TrimSpace(input.Email))
	var userID int
	var dbEmail string
	err := db.QueryRow("SELECT user_id, email FROM users WHERE LOWER(email) = $1", emailNorm).Scan(&userID, &dbEmail)
	if err != nil {
		fmt.Println("❌ User not found:", input.Email)
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบอีเมลนี้ในระบบ"})
		return
	}

	// 2. สุ่มเลข 4 หลัก
	source := rand.NewSource(time.Now().UnixNano())
	r := rand.New(source)
	otp := fmt.Sprintf("%04d", r.Intn(10000))
	expiresAt := time.Now().Add(5 * time.Minute)

	// 3. บันทึกลงตาราง verification_codes
	// ล้างรหัสเก่าที่ยังไม่ได้ใช้ของ user คนนี้ออกก่อน
	db.Exec("DELETE FROM verification_codes WHERE user_id = $1", userID)

	query := "INSERT INTO verification_codes (user_id, code, expired_at) VALUES ($1, $2, $3)"
	_, err = db.Exec(query, userID, otp, expiresAt)
	if err != nil {
		fmt.Println("❌ DB Insert Error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// 4. ส่งเมล (ใช้ email จาก DB เพื่อส่งไปที่ถูกต้อง)
	err = utils.SendOTPEmail(dbEmail, otp)
	if err != nil {
		fmt.Println("⚠️ Email Send Error (OTP still saved):", err)
		fmt.Printf("\n>>> [TERMINAL DEBUG] OTP IS: %s <<<\n\n", otp)
		// คืน 200 เพื่อให้ frontend เด้งไปหน้า verify-email ได้ (ใช้รหัสจาก Terminal เทส)
		c.JSON(http.StatusOK, gin.H{"message": "ส่งรหัส OTP เรียบร้อยแล้ว (รหัสแสดงใน Terminal เพราะส่งเมลยังไม่สำเร็จ)"})
		return
	}

	fmt.Println("✅ OTP sent successfully to", dbEmail)
	c.JSON(http.StatusOK, gin.H{"message": "ส่งรหัส OTP เรียบร้อยแล้ว"})
}

// ---------------------------------------------------------
// 4. VerifyOTP: เช็ครหัส
// ---------------------------------------------------------
func VerifyOTP(c *gin.Context, db *sql.DB) {
	var input struct {
		Email string `json:"email"`
		OTP   string `json:"otp"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	emailNorm := strings.ToLower(strings.TrimSpace(input.Email))
	var storedOTP string
	var expiresAt time.Time

	query := `
		SELECT vc.code, vc.expired_at 
		FROM verification_codes vc
		JOIN users u ON vc.user_id = u.user_id
		WHERE LOWER(u.email) = $1 AND vc.is_used = FALSE
		ORDER BY vc.created_at DESC LIMIT 1`

	err := db.QueryRow(query, emailNorm).Scan(&storedOTP, &expiresAt)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว"})
		return
	}

	if storedOTP != input.OTP {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "รหัส OTP ไม่ถูกต้อง"})
		return
	}

	if time.Now().After(expiresAt) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "รหัส OTP หมดอายุแล้ว"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "รหัสถูกต้อง"})
}

// ---------------------------------------------------------
// 5. ResetPassword: เปลี่ยนรหัสใหม่
// ---------------------------------------------------------
func ResetPassword(c *gin.Context, db *sql.DB) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	emailNorm := strings.ToLower(strings.TrimSpace(input.Email))

	// อัปเดตรหัสผ่าน (ค้นหาผู้ใช้แบบไม่สนใจตัวพิมพ์ใหญ่/เล็ก)
	_, err := db.Exec("UPDATE users SET password_hash = $1 WHERE LOWER(email) = $2", string(hashedPassword), emailNorm)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "เปลี่ยนรหัสผ่านไม่สำเร็จ"})
		return
	}

	// ลบ OTP ทิ้งหลังใช้สำเร็จ
	db.Exec("DELETE FROM verification_codes WHERE user_id = (SELECT user_id FROM users WHERE LOWER(email) = $1)", emailNorm)

	c.JSON(http.StatusOK, gin.H{"message": "เปลี่ยนรหัสผ่านสำเร็จ!"})
}
