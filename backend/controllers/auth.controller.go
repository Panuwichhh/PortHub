package controllers

import (
	"net/http"

	"backend/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// ===== mock user (แทน DB ก่อน) =====
var mockEmail = "admin@porthub.com"
var mockPasswordHash, _ = bcrypt.GenerateFromPassword(
	[]byte("123456"),
	10,
)

// ===================================

func Login(c *gin.Context) {
	var req LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid request",
		})
		return
	}

	if req.Email != mockEmail ||
		bcrypt.CompareHashAndPassword(mockPasswordHash, []byte(req.Password)) != nil {

		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "email or password incorrect",
		})
		return
	}

	token, err := utils.GenerateToken(req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "token error",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "login success",
		"token":   token,
	})
}
