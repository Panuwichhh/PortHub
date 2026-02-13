package routes

import (
	"backend/controllers"
	"database/sql"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(rg *gin.RouterGroup, db *sql.DB) {
	// ใช้ rg (RouterGroup) ที่ส่งมาจาก main.go เพื่อสร้างเส้นทางภายใต้ /api

	// 1. สมัครสมาชิก: POST /api/register
	rg.POST("/register", func(c *gin.Context) {
		controllers.Register(c, db)
	})

	// 2. เข้าสู่ระบบ: POST /api/login
	rg.POST("/login", func(c *gin.Context) {
		controllers.Login(c, db)
	})

	// --- เส้นทางสำหรับระบบ Forgot Password ---

	// 3. ขอรหัส OTP: POST /api/forgot-password
	rg.POST("/forgot-password", func(c *gin.Context) {
		controllers.ForgotPassword(c, db)
	})

	// 4. ตรวจสอบรหัส OTP: POST /api/verify-otp
	rg.POST("/verify-otp", func(c *gin.Context) {
		controllers.VerifyOTP(c, db)
	})

	// 5. ตั้งรหัสผ่านใหม่: POST /api/reset-password
	rg.POST("/reset-password", func(c *gin.Context) {
		controllers.ResetPassword(c, db)
	})
}
