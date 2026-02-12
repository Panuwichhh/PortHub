package routes

import (
	"backend/controllers"
	"database/sql"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(rg *gin.RouterGroup, db *sql.DB) {
	// สมัครสมาชิก: เรียกไปที่ /api/register
	rg.POST("/register", func(c *gin.Context) {
		controllers.Register(c, db)
	})

	// เข้าสู่ระบบ: เรียกไปที่ /api/login
	rg.POST("/login", func(c *gin.Context) {
		controllers.Login(c, db)
	})
}
