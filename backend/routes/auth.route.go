package routes

import (
	"backend/controllers"
	"backend/handlers"
	"backend/middleware"
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

func UserRoutes(rg *gin.RouterGroup, db *sql.DB) {

	users := rg.Group("/users")
	users.Use(middleware.AuthMiddleware())
	{
		users.GET("/me", handlers.GetMe(db))
		users.PUT("/me", handlers.UpdateMe(db))
		users.DELETE("/me", handlers.DeleteMe(db))
		users.GET("/me/skills", handlers.GetMySkills(db))
		users.GET("/me/projects", handlers.GetMyProjects(db))
		users.POST("/me/projects", handlers.CreateProject(db))
		users.DELETE("/me/projects/:id", handlers.DeleteProject(db))
		users.PUT("/me/dashboard-visibility", handlers.SetDashboardVisibility(db))
	}
}

// DashboardRoutes registers dashboard APIs: list (auth) and public profile (no auth).
func DashboardRoutes(rg *gin.RouterGroup, db *sql.DB) {
	dashboard := rg.Group("/dashboard")
	{
		dashboard.GET("/profiles", middleware.AuthMiddleware(), handlers.GetDashboardProfiles(db))
		dashboard.GET("/public-profiles", handlers.GetPublicDashboardProfiles(db))
		dashboard.GET("/profiles/:id", handlers.GetPublicProfile(db))
	}
}
