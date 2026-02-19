package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

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
		phone           sql.NullString
			university      sql.NullString
			faculty         sql.NullString
			major           sql.NullString
			gpaStr          sql.NullString
			jobInterest     sql.NullString
			profileImageURL sql.NullString
		)

		query := `
		SELECT user_id, user_name, email, phone, university, faculty, major, gpa, job_interest, profile_image_url
			FROM users
			WHERE user_id = $1
		`

		err := db.QueryRow(query, userID).Scan(
			&userIDDB,
			&userName,
			&email,
		&phone,
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

		// ดึง skills จาก user_skills (ให้เหมือนฟิลด์อื่น โหลดจาก API เดียว)
		var skills []string
		skillRows, err := db.Query(`
			SELECT s.skill_name
			FROM user_skills us
			JOIN skills s ON us.skill_id = s.skill_id
			WHERE us.user_id = $1
		`, userID)
		if err == nil {
			defer skillRows.Close()
			for skillRows.Next() {
				var skill string
				if skillRows.Scan(&skill) == nil {
					skills = append(skills, skill)
				}
			}
		}
		if skills == nil {
			skills = []string{}
		}

		c.JSON(http.StatusOK, gin.H{
			"user_id":           userIDDB,
			"user_name":         userName.String,
			"email":             email,
		"phone":             phone.String,
			"university":        university.String,
			"faculty":           faculty.String,
			"major":             major.String,
			"gpa":               gpa,
			"job_interest":      jobInterest.String,
			"profile_image_url": profileImageURL.String,
		"skills":            skills,
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
		UserName        string   `json:"user_name"`
		Phone           string   `json:"phone"`
		University      string   `json:"university"`
		Faculty         string   `json:"faculty"`
		Major           string   `json:"major"`
		GPA             float64  `json:"gpa"`
		JobInterest     string   `json:"job_interest"`
		ProfileImageURL string   `json:"profile_image_url"`
		Skills          []string `json:"skills"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

	// GPAX 0–4.00
	gpa := input.GPA
	if gpa < 0 || gpa > 4 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "GPAX must be between 0 and 4.00"})
		return
	}

	tx, err := db.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}
	defer func() { _ = tx.Rollback() }()

		query := `
			UPDATE users
			SET user_name = $1,
			phone = $2,
			university = $3,
			faculty = $4,
			major = $5,
			gpa = $6,
			job_interest = $7,		
			profile_image_url = $8
		WHERE user_id = $9
	`
	result, err := tx.Exec(query,
			input.UserName,
		input.Phone,
			input.University,
			input.Faculty,
			input.Major,
		gpa,
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

	// อัปเดต skills: ลบของเก่าแล้วใส่ชุดใหม่ (ใน transaction เดียวกัน)
	if _, err := tx.Exec("DELETE FROM user_skills WHERE user_id = $1", userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update skills"})
		return
	}
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
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Insert skill error"})
				return
			}
		} else if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Skill lookup error"})
			return
		}
		if _, err := tx.Exec(
			"INSERT INTO user_skills (user_id, skill_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
			userID,
			skillID,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Insert user skill error"})
			return
		}
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Profile updated successfully",
	})
	}
}

func DeleteMe(db *sql.DB) gin.HandlerFunc {
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

		// ลบ user จาก database (CASCADE จะลบข้อมูลที่เกี่ยวข้องทั้งหมด)
		query := `DELETE FROM users WHERE user_id = $1`

		result, err := db.Exec(query, userID)

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
			"message": "Account deleted successfully",
		})
	}
}

// SetDashboardVisibility sets show_on_dashboard for the current user (publish/unpublish to dashboard).
func SetDashboardVisibility(db *sql.DB) gin.HandlerFunc {
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
		var input struct {
			ShowOnDashboard bool `json:"show_on_dashboard"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}
		_, err := db.Exec(
			"UPDATE users SET show_on_dashboard = $1 WHERE user_id = $2",
			input.ShowOnDashboard,
			userID,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"message": "Dashboard visibility updated",
			"show_on_dashboard": input.ShowOnDashboard,
		})
	}
}

// GetDashboardProfiles returns users who have show_on_dashboard = true, excluding the current user.
func GetDashboardProfiles(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDValue, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}
		currentID, ok := userIDValue.(int)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID type"})
			return
		}
		rows, err := db.Query(`
			SELECT user_id, user_name, profile_image_url, job_interest, university, faculty, major, gpa
			FROM users
			WHERE show_on_dashboard = true AND user_id != $1
			ORDER BY user_id
		`, currentID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "DB error"})
			return
		}
		defer rows.Close()
		var list []gin.H
		for rows.Next() {
			var uid int
			var userName, profileImageURL, jobInterest, university, faculty, major sql.NullString
			var gpaStr sql.NullString
			if err := rows.Scan(&uid, &userName, &profileImageURL, &jobInterest, &university, &faculty, &major, &gpaStr); err != nil {
				continue
			}
			var gpa float64
			if gpaStr.Valid {
				fmt.Sscanf(gpaStr.String, "%f", &gpa)
			}
			list = append(list, gin.H{
				"user_id":            uid,
				"user_name":          userName.String,
				"profile_image_url":  profileImageURL.String,
				"job_interest":       jobInterest.String,
				"university":         university.String,
				"faculty":            faculty.String,
				"major":              major.String,
				"gpa":                gpa,
			})
		}
		if list == nil {
			list = []gin.H{}
		}
		c.JSON(http.StatusOK, list)
	}
}

// GetPublicDashboardProfiles returns all users who have show_on_dashboard = true. No auth required (for guests).
func GetPublicDashboardProfiles(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := db.Query(`
			SELECT user_id, user_name, profile_image_url, job_interest, university, faculty, major, gpa
			FROM users
			WHERE show_on_dashboard = true
			ORDER BY user_id
		`)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "DB error"})
			return
		}
		defer rows.Close()
		var list []gin.H
		for rows.Next() {
			var uid int
			var userName, profileImageURL, jobInterest, university, faculty, major sql.NullString
			var gpaStr sql.NullString
			if err := rows.Scan(&uid, &userName, &profileImageURL, &jobInterest, &university, &faculty, &major, &gpaStr); err != nil {
				continue
			}
			var gpa float64
			if gpaStr.Valid {
				fmt.Sscanf(gpaStr.String, "%f", &gpa)
			}
			list = append(list, gin.H{
				"user_id":            uid,
				"user_name":          userName.String,
				"profile_image_url":  profileImageURL.String,
				"job_interest":       jobInterest.String,
				"university":         university.String,
				"faculty":            faculty.String,
				"major":              major.String,
				"gpa":                gpa,
			})
		}
		if list == nil {
			list = []gin.H{}
		}
		c.JSON(http.StatusOK, list)
	}
}

// GetPublicProfile returns a user's public profile (only if show_on_dashboard = true). No auth required.
func GetPublicProfile(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		idStr := c.Param("id")
		targetID, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user id"})
			return
		}
		var (
			userName        sql.NullString
			email           sql.NullString
			phone           sql.NullString
			university      sql.NullString
			faculty         sql.NullString
			major           sql.NullString
			gpaStr          sql.NullString
			jobInterest     sql.NullString
			profileImageURL sql.NullString
			showOnDashboard bool
		)
		row := db.QueryRow(`
			SELECT user_name, email, phone, university, faculty, major, gpa, job_interest, profile_image_url, COALESCE(show_on_dashboard, false)
			FROM users
			WHERE user_id = $1
		`, targetID)
		if err := row.Scan(&userName, &email, &phone, &university, &faculty, &major, &gpaStr, &jobInterest, &profileImageURL, &showOnDashboard); err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if !showOnDashboard {
			c.JSON(http.StatusNotFound, gin.H{"error": "Profile is not public"})
			return
		}
		var gpa float64
		if gpaStr.Valid {
			fmt.Sscanf(gpaStr.String, "%f", &gpa)
		}
		// skills
		var skills []string
		skillRows, err := db.Query(`
			SELECT s.skill_name FROM user_skills us
			JOIN skills s ON us.skill_id = s.skill_id
			WHERE us.user_id = $1
		`, targetID)
		if err == nil {
			defer skillRows.Close()
			for skillRows.Next() {
				var skill string
				if skillRows.Scan(&skill) == nil {
					skills = append(skills, skill)
				}
			}
		}
		if skills == nil {
			skills = []string{}
		}
		// projects
		var projects []gin.H
		projRows, err := db.Query(`
			SELECT project_id, project_name, description, image_url
			FROM projects WHERE user_id = $1 ORDER BY created_at DESC
		`, targetID)
		if err == nil {
			defer projRows.Close()
			for projRows.Next() {
				var projectID int
				var name, desc, imageURL sql.NullString
				if projRows.Scan(&projectID, &name, &desc, &imageURL) != nil {
					continue
				}
				images := []string{}
				if imageURL.Valid && imageURL.String != "" {
					_ = json.Unmarshal([]byte(imageURL.String), &images)
				}
				img := ""
				if len(images) > 0 {
					img = images[0]
				}
				projects = append(projects, gin.H{
					"id": "p" + strconv.Itoa(projectID),
					"title": name.String,
					"desc": desc.String,
					"img": img,
					"images": images,
				})
			}
		}
		if projects == nil {
			projects = []gin.H{}
		}
		c.JSON(http.StatusOK, gin.H{
			"user_id":           targetID,
			"user_name":         userName.String,
			"email":             email.String,
			"phone":             phone.String,
			"university":        university.String,
			"faculty":           faculty.String,
			"major":             major.String,
			"gpa":               gpa,
			"job_interest":      jobInterest.String,
			"profile_image_url": profileImageURL.String,
			"skills":            skills,
			"projects":          projects,
		})
	}
}
