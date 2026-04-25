package controllers

import (
	"database/sql"
	"fmt"
	"math/rand"
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
// 1. Register
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
		utils.BadRequest(c, "ข้อมูลไม่ถูกต้อง")
		return
	}

	emailNorm := strings.ToLower(strings.TrimSpace(input.Email))

	if emailNorm == "" || input.Password == "" {
		utils.BadRequest(c, "กรุณากรอก email และ password")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.Internal(c, "hash password ไม่สำเร็จ")
		return
	}

	tx, err := db.Begin()
	if err != nil {
		utils.Internal(c, "DB error")
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
		utils.Error(c, 500, "สมัครสมาชิกไม่สำเร็จ (email อาจซ้ำ)", err.Error())
		return
	}

	// Insert skills
	for _, skillName := range input.Skills {

		skillName = strings.TrimSpace(skillName)
		if skillName == "" {
			continue
		}

		var skillID int

		err := tx.QueryRow(
			"SELECT skill_id FROM skills WHERE LOWER(skill_name)=LOWER($1)",
			skillName,
		).Scan(&skillID)

		if err == sql.ErrNoRows {
			err = tx.QueryRow(
				"INSERT INTO skills (skill_name) VALUES ($1) RETURNING skill_id",
				skillName,
			).Scan(&skillID)

			if err != nil {
				tx.Rollback()
				utils.Internal(c, "Insert skill error")
				return
			}
		} else if err != nil {
			tx.Rollback()
			utils.Internal(c, "Skill lookup error")
			return
		}

		_, err = tx.Exec(
			"INSERT INTO user_skills (user_id, skill_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
			userID,
			skillID,
		)

		if err != nil {
			tx.Rollback()
			utils.Internal(c, "Insert user skill error")
			return
		}
	}

	if err := tx.Commit(); err != nil {
		utils.Internal(c, "Commit error")
		return
	}

	utils.Success(c, 201, "สมัครสมาชิกสำเร็จ!", gin.H{
		"user_id": userID,
	})
}

// ---------------------------------------------------------
// 2. Login
// ---------------------------------------------------------
func Login(c *gin.Context, db *sql.DB) {

	var input User
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, "ข้อมูลไม่ถูกต้อง")
		return
	}

	emailNorm := strings.ToLower(strings.TrimSpace(input.Email))

	var storedPassword string
	var userID int

	err := db.QueryRow(
		"SELECT user_id, password_hash FROM users WHERE LOWER(email)=$1",
		emailNorm,
	).Scan(&userID, &storedPassword)

	if err != nil {
		utils.Unauthorized(c, "ไม่พบอีเมลนี้ในระบบ")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(input.Password)); err != nil {
		utils.Unauthorized(c, "รหัสผ่านไม่ถูกต้อง")
		return
	}

	token, err := utils.GenerateToken(fmt.Sprintf("%d", userID))
	if err != nil {
		utils.Internal(c, "สร้าง token ไม่สำเร็จ")
		return
	}

	// 🔥 รองรับทั้ง format ใหม่ + เก่า
	utils.Success(c, 200, "เข้าสู่ระบบสำเร็จ!", gin.H{
		"token": token,
	})
}

// ---------------------------------------------------------
// 3. Forgot Password
// ---------------------------------------------------------
func ForgotPassword(c *gin.Context, db *sql.DB) {

	var input struct {
		Email string `json:"email"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, "กรุณาระบุอีเมล")
		return
	}

	emailNorm := strings.ToLower(strings.TrimSpace(input.Email))

	var userID int
	var dbEmail string

	err := db.QueryRow(
		"SELECT user_id, email FROM users WHERE LOWER(email)=$1",
		emailNorm,
	).Scan(&userID, &dbEmail)

	if err != nil {
		utils.Unauthorized(c, "ไม่พบอีเมลนี้ในระบบ")
		return
	}

	otp := fmt.Sprintf("%04d", rand.New(rand.NewSource(time.Now().UnixNano())).Intn(10000))
	expiresAt := time.Now().Add(5 * time.Minute)

	db.Exec("DELETE FROM verification_codes WHERE user_id=$1", userID)

	_, err = db.Exec(
		"INSERT INTO verification_codes (user_id, code, expired_at) VALUES ($1,$2,$3)",
		userID, otp, expiresAt,
	)

	if err != nil {
		utils.Internal(c, "Database error")
		return
	}

	utils.SendOTPEmail(dbEmail, otp)

	utils.Success(c, 200, "ส่ง OTP แล้ว", nil)
}

// ---------------------------------------------------------
// 4. Verify OTP
// ---------------------------------------------------------
func VerifyOTP(c *gin.Context, db *sql.DB) {

	var input struct {
		Email string `json:"email"`
		OTP   string `json:"otp"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, "ข้อมูลไม่ถูกต้อง")
		return
	}

	emailNorm := strings.ToLower(strings.TrimSpace(input.Email))

	var storedOTP string
	var expiresAt time.Time

	query := `
	SELECT vc.code, vc.expired_at
	FROM verification_codes vc
	JOIN users u ON vc.user_id=u.user_id
	WHERE LOWER(u.email)=$1 AND vc.is_used=FALSE
	ORDER BY vc.created_at DESC LIMIT 1`

	err := db.QueryRow(query, emailNorm).Scan(&storedOTP, &expiresAt)

	if err != nil {
		utils.Unauthorized(c, "OTP ไม่ถูกต้องหรือหมดอายุ")
		return
	}

	if storedOTP != input.OTP || time.Now().After(expiresAt) {
		utils.Unauthorized(c, "OTP ไม่ถูกต้องหรือหมดอายุ")
		return
	}

	utils.Success(c, 200, "OTP ถูกต้อง", nil)
}

// ---------------------------------------------------------
// 5. Reset Password
// ---------------------------------------------------------
func ResetPassword(c *gin.Context, db *sql.DB) {

	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, "ข้อมูลไม่ถูกต้อง")
		return
	}

	emailNorm := strings.ToLower(strings.TrimSpace(input.Email))

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)

	_, err := db.Exec(
		"UPDATE users SET password_hash=$1 WHERE LOWER(email)=$2",
		string(hashedPassword), emailNorm,
	)

	if err != nil {
		utils.Internal(c, "เปลี่ยนรหัสผ่านไม่สำเร็จ")
		return
	}

	db.Exec("DELETE FROM verification_codes WHERE user_id=(SELECT user_id FROM users WHERE LOWER(email)=$1)", emailNorm)

	utils.Success(c, 200, "เปลี่ยนรหัสผ่านสำเร็จ!", nil)
}
