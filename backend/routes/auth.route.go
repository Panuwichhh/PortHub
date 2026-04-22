package routes

import (
	"backend/controllers"
	"backend/handlers"
	"backend/middleware"
	"database/sql"
	"time"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(rg *gin.RouterGroup, db *sql.DB) {
	// Auth endpoints — ใช้ rate limit เข้มงวดกว่า (10 req/min) ป้องกัน brute force
	authLimiter := middleware.RateLimitMiddleware(10, time.Minute)

	rg.POST("/register", authLimiter, func(c *gin.Context) {
		controllers.Register(c, db)
	})

	rg.POST("/login", authLimiter, func(c *gin.Context) {
		controllers.Login(c, db)
	})

	rg.POST("/forgot-password", authLimiter, func(c *gin.Context) {
		controllers.ForgotPassword(c, db)
	})

	rg.POST("/verify-otp", authLimiter, func(c *gin.Context) {
		controllers.VerifyOTP(c, db)
	})

	rg.POST("/reset-password", authLimiter, func(c *gin.Context) {
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
		users.GET("/me/projects/:id", handlers.GetProjectByID(db))
		users.POST("/me/projects", handlers.CreateProject(db))
		users.PUT("/me/projects/:id", handlers.UpdateProject(db))
		users.DELETE("/me/projects/:id", handlers.DeleteProject(db))
		users.PUT("/me/dashboard-visibility", handlers.SetDashboardVisibility(db))
	}
}

// ProjectRoutes registers GET /api/projects/:id for fetching a single project by id (auth required).
func ProjectRoutes(rg *gin.RouterGroup, db *sql.DB) {
	projects := rg.Group("/projects")
	projects.Use(middleware.AuthMiddleware())
	{
		projects.GET("/:id", handlers.GetProjectByID(db))
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
