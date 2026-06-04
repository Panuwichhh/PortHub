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

func getUserID(c *gin.Context) (int, bool) {
	userIDValue, exists := c.Get("user_id")
	if !exists {
		return 0, false
	}
	userID, ok := userIDValue.(int)
	return userID, ok
}

func GetMe(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {

		userID, ok := getUserID(c)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

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

		err := db.QueryRow(`
			SELECT user_id, user_name, email, phone, university, faculty, major, gpa, job_interest, profile_image_url
			FROM users WHERE user_id = $1
		`, userID).Scan(
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
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
			return
		}

		var gpa float64
		if gpaStr.Valid {
			fmt.Sscanf(gpaStr.String, "%f", &gpa)
		}

		// skills
		var skills []string
		rows, err := db.Query(`
			SELECT s.skill_name
			FROM user_skills us
			JOIN skills s ON us.skill_id = s.skill_id
			WHERE us.user_id = $1
		`, userID)

		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var skill string
				if rows.Scan(&skill) == nil {
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

		userID, ok := getUserID(c)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
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

		userID, ok := getUserID(c)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
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

		if input.GPA < 0 || input.GPA > 4 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "GPAX must be between 0 and 4.00"})
			return
		}

		tx, err := db.Begin()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
			return
		}
		defer func() { _ = tx.Rollback() }()

		_, err = tx.Exec(`
			UPDATE users SET
				user_name=$1, phone=$2, university=$3,
				faculty=$4, major=$5, gpa=$6,
				job_interest=$7, profile_image_url=$8
			WHERE user_id=$9
		`,
			input.UserName,
			input.Phone,
			input.University,
			input.Faculty,
			input.Major,
			input.GPA,
			input.JobInterest,
			input.ProfileImageURL,
			userID,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
			return
		}

		// skills
		_, err = tx.Exec("DELETE FROM user_skills WHERE user_id=$1", userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update skills"})
			return
		}

		for _, s := range input.Skills {
			s = strings.TrimSpace(s)
			if s == "" {
				continue
			}

			var skillID int
			err := tx.QueryRow("SELECT skill_id FROM skills WHERE LOWER(skill_name)=LOWER($1)", s).Scan(&skillID)

			if err == sql.ErrNoRows {
				err = tx.QueryRow("INSERT INTO skills (skill_name) VALUES ($1) RETURNING skill_id", s).Scan(&skillID)
			}
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Skill error"})
				return
			}

			_, err = tx.Exec("INSERT INTO user_skills (user_id, skill_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", userID, skillID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Insert skill error"})
				return
			}
		}

		if err := tx.Commit(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully"})
	}
}

func DeleteMe(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {

		userID, ok := getUserID(c)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		// Start transaction to ensure all deletions succeed or fail together
		tx, err := db.Begin()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
			return
		}
		defer func() { _ = tx.Rollback() }()

		// Delete from published_profiles (dashboard data)
		_, err = tx.Exec(`DELETE FROM published_profiles WHERE user_id = $1`, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete published profile"})
			return
		}

		// Delete from published_projects (dashboard data)
		_, err = tx.Exec(`DELETE FROM published_projects WHERE user_id = $1`, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete published projects"})
			return
		}

		// Delete from users (this will cascade delete projects, user_skills, verification_codes)
		result, err := tx.Exec(`DELETE FROM users WHERE user_id = $1`, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		// Commit transaction
		if err := tx.Commit(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit deletion"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Account deleted successfully"})
	}
}

// SetDashboardVisibility publishes current profile and projects to dashboard (creates snapshot).
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

		tx, err := db.Begin()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
			return
		}
		defer func() { _ = tx.Rollback() }()

		if input.ShowOnDashboard {
			// Publish: สร้าง snapshot ของ profile และ projects

			// 1. ดึงข้อมูล profile ปัจจุบัน
			var userName, email, phone, university, faculty, major, jobInterest, profileImageURL sql.NullString
			var gpaStr sql.NullString
			err := tx.QueryRow(`
				SELECT user_name, email, phone, university, faculty, major, gpa, job_interest, profile_image_url
				FROM users WHERE user_id = $1
			`, userID).Scan(&userName, &email, &phone, &university, &faculty, &major, &gpaStr, &jobInterest, &profileImageURL)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch profile"})
				return
			}

			// 2. ดึง skills
			skillRows, err := tx.Query(`
				SELECT s.skill_name FROM user_skills us
				JOIN skills s ON us.skill_id = s.skill_id
				WHERE us.user_id = $1
			`, userID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch skills"})
				return
			}
			var skills []string
			for skillRows.Next() {
				var skill string
				if skillRows.Scan(&skill) == nil {
					skills = append(skills, skill)
				}
			}
			skillRows.Close()
			skillsJSON, _ := json.Marshal(skills)

			// 3. บันทึก published_profile
			_, err = tx.Exec(`
				INSERT INTO published_profiles 
				(user_id, user_name, email, phone, university, faculty, major, gpa, job_interest, profile_image_url, skills, updated_at)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
				ON CONFLICT (user_id) DO UPDATE SET
					user_name = EXCLUDED.user_name,
					email = EXCLUDED.email,
					phone = EXCLUDED.phone,
					university = EXCLUDED.university,
					faculty = EXCLUDED.faculty,
					major = EXCLUDED.major,
					gpa = EXCLUDED.gpa,
					job_interest = EXCLUDED.job_interest,
					profile_image_url = EXCLUDED.profile_image_url,
					skills = EXCLUDED.skills,
					updated_at = NOW()
			`, userID, userName.String, email.String, phone.String, university.String, faculty.String, major.String, gpaStr.String, jobInterest.String, profileImageURL.String, string(skillsJSON))
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to publish profile"})
				return
			}

			// 4. ลบ published_projects เก่า
			_, err = tx.Exec("DELETE FROM published_projects WHERE user_id = $1", userID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear old projects"})
				return
			}

			// 5. คัดลอก projects ปัจจุบันไป published_projects
			_, err = tx.Exec(`
				INSERT INTO published_projects (user_id, project_id, project_name, description, image_url)
				SELECT user_id, project_id, project_name, description, image_url
				FROM projects WHERE user_id = $1
			`, userID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to publish projects"})
				return
			}

			// 6. ตั้งค่า show_on_dashboard = true
			_, err = tx.Exec("UPDATE users SET show_on_dashboard = true WHERE user_id = $1", userID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update visibility"})
				return
			}
		} else {
			// Unpublish: ลบ snapshot และตั้งค่า show_on_dashboard = false
			_, err = tx.Exec("DELETE FROM published_profiles WHERE user_id = $1", userID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unpublish profile"})
				return
			}
			_, err = tx.Exec("DELETE FROM published_projects WHERE user_id = $1", userID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unpublish projects"})
				return
			}
			_, err = tx.Exec("UPDATE users SET show_on_dashboard = false WHERE user_id = $1", userID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update visibility"})
				return
			}
		}

		if err := tx.Commit(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":           "Dashboard visibility updated",
			"show_on_dashboard": input.ShowOnDashboard,
		})
	}
}

// GetDashboardProfiles returns users who have published to dashboard (from published_profiles), excluding the current user.
// 🚀 Optimized query with limited fields for better performance
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
			FROM published_profiles
			WHERE user_id != $1
			ORDER BY updated_at DESC
			LIMIT 100
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
				"user_id":           uid,
				"user_name":         userName.String,
				"profile_image_url": profileImageURL.String,
				"job_interest":      jobInterest.String,
				"university":        university.String,
				"faculty":           faculty.String,
				"major":             major.String,
				"gpa":               gpa,
			})
		}
		if list == nil {
			list = []gin.H{}
		}
		c.JSON(http.StatusOK, list)
	}
}

// GetPublicDashboardProfiles returns all published profiles. No auth required (for guests).
// 🚀 Optimized query with limited fields for better performance
func GetPublicDashboardProfiles(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 🚀 Use prepared statement for better performance
		rows, err := db.Query(`
			SELECT user_id, user_name, profile_image_url, job_interest, university, faculty, major, gpa
			FROM published_profiles
			ORDER BY updated_at DESC
			LIMIT 100
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
				"user_id":           uid,
				"user_name":         userName.String,
				"profile_image_url": profileImageURL.String,
				"job_interest":      jobInterest.String,
				"university":        university.String,
				"faculty":           faculty.String,
				"major":             major.String,
				"gpa":               gpa,
			})
		}
		if list == nil {
			list = []gin.H{}
		}
		c.JSON(http.StatusOK, list)
	}
}

// GetPublicProfile returns a user's published profile (from published_profiles). No auth required.
func GetPublicProfile(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		idStr := c.Param("id")
		targetID, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user id"})
			return
		}

		// ดึงข้อมูลจาก published_profiles
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
			skillsJSON      sql.NullString
		)
		row := db.QueryRow(`
			SELECT user_name, email, phone, university, faculty, major, gpa, job_interest, profile_image_url, skills
			FROM published_profiles
			WHERE user_id = $1
		`, targetID)
		if err := row.Scan(&userName, &email, &phone, &university, &faculty, &major, &gpaStr, &jobInterest, &profileImageURL, &skillsJSON); err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{"error": "Profile not published"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		var gpa float64
		if gpaStr.Valid {
			fmt.Sscanf(gpaStr.String, "%f", &gpa)
		}

		// Parse skills
		var skills []string
		if skillsJSON.Valid && skillsJSON.String != "" {
			_ = json.Unmarshal([]byte(skillsJSON.String), &skills)
		}
		if skills == nil {
			skills = []string{}
		}

		// ดึง projects จาก published_projects
		var projects []gin.H
		projRows, err := db.Query(`
			SELECT project_id, project_name, description, image_url
			FROM published_projects WHERE user_id = $1 ORDER BY published_at DESC
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
					"id":     strconv.Itoa(projectID),
					"title":  name.String,
					"desc":   desc.String,
					"img":    img,
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
