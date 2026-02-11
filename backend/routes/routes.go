package routes

import (
	"backend/controllers"

	"github.com/gin-gonic/gin"
)

func Register(r *gin.Engine) {
	api := r.Group("/api")
	{
		api.POST("/login", controllers.Login)
	}
}
