package utils

import (
	"github.com/gin-gonic/gin"
)

// ------------------------------
// SUCCESS
// ------------------------------
func Success(c *gin.Context, code int, message string, data interface{}) {
	c.JSON(code, gin.H{
		"status":  "success",
		"message": message,
		"data":    data,
		"error":   nil,

		// 🔥 รองรับของเก่า
		"token": extractToken(data),
	})
}

// ------------------------------
// ERROR (generic)
// ------------------------------
func Error(c *gin.Context, code int, message string, err interface{}) {
	c.JSON(code, gin.H{
		"status":  "error",
		"message": message,
		"data":    nil,
		"error":   err,
	})
}

// ------------------------------
// BAD REQUEST 400
// ------------------------------
func BadRequest(c *gin.Context, message string) {
	c.JSON(400, gin.H{
		"status":  "error",
		"message": message,
		"data":    nil,
		"error":   "BAD_REQUEST",
	})
}

// ------------------------------
// UNAUTHORIZED 401
// ------------------------------
func Unauthorized(c *gin.Context, message string) {
	c.JSON(401, gin.H{
		"status":  "error",
		"message": message,
		"data":    nil,
		"error":   "UNAUTHORIZED",
	})
}

// ------------------------------
// INTERNAL 500
// ------------------------------
func Internal(c *gin.Context, message string) {
	c.JSON(500, gin.H{
		"status":  "error",
		"message": message,
		"data":    nil,
		"error":   "INTERNAL_ERROR",
	})
}

// ------------------------------
// HELPER: extract token
// ------------------------------
func extractToken(data interface{}) string {
	if m, ok := data.(gin.H); ok {
		if token, exists := m["token"]; exists {
			if t, ok := token.(string); ok {
				return t
			}
		}
	}
	return ""
}
