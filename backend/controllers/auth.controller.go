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

	var input struct {
		Email       string   `json:"email"`
		Password    string   `json:"password"`
		UserName    string   `json:"user_name"`
		Phone       string   `json:"phone"`
		University  string   `json:"university"`
		Faculty     string   `json:"faculty"`
		Major       string   `json:"major"`
		GPA         float64  `json:"gpa"`
		JobInterest string   `json:"job_interest"`
		Skills      []string `json:"skills"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	emailNorm := strings.ToLower(strings.TrimSpace(input.Email))

	if emailNorm == "" || input.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณากรอก email และ password"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "hash password ไม่สำเร็จ"})
		return
	}

	tx, err := db.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB error"})
		return
	}

	var userID int

	userQuery := `
	INSERT INTO users 
	(email, password_hash, user_name, phone, university, faculty, major, gpa, job_interest)
	VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
	RETURNING user_id
	`

	err = tx.QueryRow(userQuery,
		emailNorm,
		string(hashedPassword),
		input.UserName,
		input.Phone,
		input.University,
		input.Faculty,
		input.Major,
		input.GPA,
		input.JobInterest,
	).Scan(&userID)

	if err != nil {
		tx.Rollback()
		fmt.Println("❌ Insert user error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "อีเมลนี้ถูกใช้งานแล้ว"})
		return
	}
	fmt.Println("Skills from frontend:", input.Skills)

	// Insert skills
	for _, skillName := range input.Skills {

		skillName = strings.TrimSpace(skillName)
		if skillName == "" {
			continue
		}

		var skillID int

		// เช็คว่ามี skill นี้แล้วหรือยัง
		err := tx.QueryRow(
			"SELECT skill_id FROM skills WHERE LOWER(skill_name)=LOWER($1)",
			skillName,
		).Scan(&skillID)

		if err == sql.ErrNoRows {
			// ยังไม่มี → สร้างใหม่
			err = tx.QueryRow(
				"INSERT INTO skills (skill_name) VALUES ($1) RETURNING skill_id",
				skillName,
			).Scan(&skillID)

			if err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Insert skill error"})
				return
			}
		} else if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Skill lookup error"})
			return
		}

		// ผูก skill กับ user
		_, err = tx.Exec(
			"INSERT INTO user_skills (user_id, skill_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
			userID,
			skillID,
		)

		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Insert user skill error"})
			return
		}
	}

	err = tx.Commit()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Commit error"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "สมัครสมาชิกสำเร็จ!",
		"user_id": userID,
	})
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

	emailNorm := strings.ToLower(strings.TrimSpace(input.Email))
	fmt.Println("LOGIN EMAIL INPUT:", emailNorm)

	var storedPassword string
	var userID int

	query := "SELECT user_id, password_hash FROM users WHERE LOWER(email) = $1"
	err := db.QueryRow(query, emailNorm).Scan(&userID, &storedPassword)
	if err != nil {
		fmt.Println("LOGIN QUERY ERROR:", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ไม่พบอีเมลนี้ในระบบ"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "รหัสผ่านไม่ถูกต้อง"})
		return
	}

	// สร้าง JWT โดยใช้ user_id
	token, err := utils.GenerateToken(fmt.Sprintf("%d", userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้าง token ได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "เข้าสู่ระบบสำเร็จ!",
		"token":   token,
	})
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
	
	// แสดง OTP ใน Terminal เสมอเพื่อ debug
	fmt.Printf("\n🔑 [DEBUG] OTP Code: %s (Email: %s)\n\n", otp, dbEmail)
	
	if err != nil {
		fmt.Println("⚠️ Email Send Error (OTP still saved):", err)
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
