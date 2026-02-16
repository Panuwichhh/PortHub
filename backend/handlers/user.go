package handlers

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetMe(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {

		userIDValue, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		userID := userIDValue.(int)

		var (
			userIDDB        int
			userName        sql.NullString
			email           string
			university      sql.NullString
			faculty         sql.NullString
			major           sql.NullString
			gpaStr          sql.NullString
			jobInterest     sql.NullString
			profileImageURL sql.NullString
		)

		query := `
			SELECT user_id, user_name, email, university, faculty, major, gpa, job_interest, profile_image_url
			FROM users
			WHERE user_id = $1
		`

		err := db.QueryRow(query, userID).Scan(
			&userIDDB,
			&userName,
			&email,
			&university,
			&faculty,
			&major,
			&gpaStr,
			&jobInterest,
			&profileImageURL,
		)

		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		var gpa float64
		if gpaStr.Valid {
			fmt.Sscanf(gpaStr.String, "%f", &gpa)
		}

		c.JSON(http.StatusOK, gin.H{
			"user_id":           userIDDB,
			"user_name":         userName.String,
			"email":             email,
			"university":        university.String,
			"faculty":           faculty.String,
			"major":             major.String,
			"gpa":               gpa,
			"job_interest":      jobInterest.String,
			"profile_image_url": profileImageURL.String,
		})
	}
}

func GetMySkills(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {

		userIDValue, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		userID, ok := userIDValue.(int)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID type"})
			return
		}

		rows, err := db.Query(`
			SELECT s.skill_name
			FROM user_skills us
			JOIN skills s ON us.skill_id = s.skill_id
			WHERE us.user_id = $1
		`, userID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "DB error"})
			return
		}
		defer rows.Close()

		var skills []string

		for rows.Next() {
			var skill string
			rows.Scan(&skill)
			skills = append(skills, skill)
		}

		if skills == nil {
			skills = []string{}
		}

		c.JSON(http.StatusOK, skills)
	}
}

func UpdateMe(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {

		// ✅ ดึง user_id จาก middleware
		userIDValue, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		userID, ok := userIDValue.(int)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID type"})
			return
		}

		var input struct {
			UserName        string  `json:"user_name"`
			University      string  `json:"university"`
			Faculty         string  `json:"faculty"`
			Major           string  `json:"major"`
			GPA             float64 `json:"gpa"`
			JobInterest     string  `json:"job_interest"`
			ProfileImageURL string  `json:"profile_image_url"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		query := `
			UPDATE users
			SET user_name = $1,
				university = $2,
				faculty = $3,
				major = $4,
				gpa = $5,
				job_interest = $6,		
				profile_image_url = $7
			WHERE user_id = $8
		`

		result, err := db.Exec(query,
			input.UserName,
			input.University,
			input.Faculty,
			input.Major,
			input.GPA,
			input.JobInterest,
			input.ProfileImageURL,
			userID,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Profile updated successfully",
		})
	}
}
