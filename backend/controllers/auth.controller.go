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

// mock user
var email = "admin@test.com"
var passwordHash, _ = bcrypt.GenerateFromPassword([]byte("123456"), 10)

func Login(c *gin.Context) {
	var req LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if req.Email != email ||
		bcrypt.CompareHashAndPassword(passwordHash, []byte(req.Password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "email or password incorrect"})
		return
	}

	token, err := utils.GenerateToken(req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "token error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
	})
}
