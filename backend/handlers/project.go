package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetMyProjects returns all projects for the current user.
func GetMyProjects(db *sql.DB) gin.HandlerFunc {
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
			SELECT project_id, project_name, description, image_url
			FROM projects
			WHERE user_id = $1
			ORDER BY created_at DESC
		`, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "DB error"})
			return
		}
		defer rows.Close()

		var list []gin.H
		for rows.Next() {
			var projectID int
			var name, desc, imageURL sql.NullString
			if err := rows.Scan(&projectID, &name, &desc, &imageURL); err != nil {
				continue
			}
			images := []string{}
			if imageURL.Valid && imageURL.String != "" {
				_ = json.Unmarshal([]byte(imageURL.String), &images)
			}
			if images == nil {
				images = []string{}
			}
			img := ""
			if len(images) > 0 {
				img = images[0]
			}
			list = append(list, gin.H{
				"id":     strconv.Itoa(projectID),
				"title":  name.String,
				"desc":   desc.String,
				"img":    img,
				"images": images,
			})
		}
		if list == nil {
			list = []gin.H{}
		}
		c.JSON(http.StatusOK, list)
	}
}

// CreateProject creates a new project for the current user.
func CreateProject(db *sql.DB) gin.HandlerFunc {
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
			Title  string   `json:"title"`
			Desc   string   `json:"desc"`
			Images []string `json:"images"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		imageJSON, _ := json.Marshal(input.Images)
		if input.Images == nil {
			imageJSON = []byte("[]")
		}

		var projectID int
		err := db.QueryRow(`
			INSERT INTO projects (user_id, project_name, description, image_url)
			VALUES ($1, $2, $3, $4)
			RETURNING project_id
		`, userID, input.Title, input.Desc, string(imageJSON)).Scan(&projectID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create project"})
			return
		}

		img := ""
		if len(input.Images) > 0 {
			img = input.Images[0]
		}
		c.JSON(http.StatusOK, gin.H{
			"id":     strconv.Itoa(projectID),
			"title":  input.Title,
			"desc":   input.Desc,
			"img":    img,
			"images": input.Images,
		})
	}
}

// DeleteProject deletes a project by id (e.g. "123" or "p123" -> project_id 123).
func DeleteProject(db *sql.DB) gin.HandlerFunc {
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

		idStr := c.Param("id")
		if idStr == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project id"})
			return
		}
		if len(idStr) > 1 && idStr[0] == 'p' {
			idStr = idStr[1:]
		}
		projectID, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project id"})
			return
		}

		result, err := db.Exec(`
			DELETE FROM projects WHERE project_id = $1 AND user_id = $2
		`, projectID, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete"})
			return
		}
		rows, _ := result.RowsAffected()
		if rows == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
	}
}
