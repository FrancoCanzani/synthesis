package server

import (
	"database/sql"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"synthesis/internal/models"
	articleScraper "synthesis/internal/services/article-scraper"
	"synthesis/internal/services/completion"
	"time"

	"github.com/gin-gonic/gin"
)

func (s *Server) HelloWorldHandler(c *gin.Context) {
	resp := make(map[string]string)
	resp["message"] = "Hello World"

	c.JSON(http.StatusOK, resp)
}

func (s *Server) HealthHandler(c *gin.Context) {
	c.JSON(http.StatusOK, s.db.Health())
}

func (s *Server) UpsertNoteHandler(c *gin.Context) {
	var note *models.Note

	if err := c.BindJSON(&note); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json structure"})
		return
	}

	userIdValue, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User Id not found"})
		return
	}

	userId, ok := userIdValue.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user Id type"})
		return
	}

	// Check if the note already exists
	existing, err := s.db.GetNote(c.Request.Context(), note.Id, userId)
	if err != nil {
		// Note doesn't exist, create it
		dbNote := &models.Note{
			Id:        note.Id,
			UserId:    userId,
			Title:     note.Title,
			Content:   note.Content,
			CreatedAt: time.Now(),
		}

		result, err := s.db.CreateNote(c.Request.Context(), dbNote)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		note.CreatedAt = result.CreatedAt
		note.UpdatedAt = result.UpdatedAt
		note.Id = result.Id
		note.UserId = userId

		c.JSON(http.StatusCreated, note)
		return
	}

	// Update existing note
	dbNote := &models.Note{
		Id:       existing.Id,
		UserId:   userId,
		Title:    note.Title,
		Content:  note.Content,
		Public:   note.Public,
		PublicId: note.PublicId,
		Deleted:  note.Deleted,
	}

	result, err := s.db.UpdateNote(c.Request.Context(), dbNote, userId)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	note.CreatedAt = result.CreatedAt
	note.UpdatedAt = result.UpdatedAt
	note.Id = result.Id
	note.UserId = userId
	note.Public = result.Public
	note.PublicId = result.PublicId

	c.JSON(http.StatusOK, note)
}

func (s *Server) DeleteNoteHandler(c *gin.Context) {
	id := c.Query("id")

	userIdValue, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User Id not found"})
		return
	}

	userId, ok := userIdValue.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user Id type"})
		return
	}

	err := s.db.DeleteNote(c.Request.Context(), id, userId)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Note deleted successfully"})
}

func (s *Server) GetNoteHandler(c *gin.Context) {
	id := c.Param("id")

	userIdValue, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User Id not found"})
		return
	}

	userId, ok := userIdValue.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user Id type"})
		return
	}

	note, err := s.db.GetNote(c.Request.Context(), id, userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, note)
}

func (s *Server) GetPublicNoteHandler(c *gin.Context) {
	public_id := c.Param("public_id")

	note, err := s.db.GetPublicNote(c.Request.Context(), public_id)
	fmt.Println(err)

	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows) || strings.Contains(err.Error(), "not found"):
			c.JSON(http.StatusNotFound, gin.H{"error": "Note not found or not public"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch note"})
		}
		return
	}

	note.UserId = ""
	c.JSON(http.StatusOK, note)
}

func (s *Server) GetNotesHandler(c *gin.Context) {
	userIdValue, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User Id not found"})
		return
	}

	userId, ok := userIdValue.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user Id type"})
		return
	}

	notes, err := s.db.GetNotes(c.Request.Context(), userId)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, notes)
}

func (s *Server) GetArticleHandler(c *gin.Context) {
	articleURL := c.Query("url")

	if articleURL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "URL parameter is required"})
		return
	}

	_, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User Id not found"})
		return
	}

	article, err := articleScraper.GetArticle(articleURL)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, article)
}

func (s *Server) GetArticlesHandler(c *gin.Context) {
	userIdValue, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User Id not found"})
		return
	}

	userId, ok := userIdValue.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user Id type"})
		return
	}

	articles, err := s.db.GetArticles(c.Request.Context(), userId)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, articles)
}

func (s *Server) CreateArticleHandler(c *gin.Context) {
	var article *models.Article

	if err := c.BindJSON(&article); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid article structure"})
		return
	}

	userIdValue, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User Id not found"})
		return
	}

	userId, ok := userIdValue.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user Id type"})
		return
	}

	article.UserId = &userId

	_, err := s.db.CreateArticle(c.Request.Context(), article)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, article)
}

func (s *Server) DeleteArticleHandler(c *gin.Context) {
	id := c.Query("id")

	userIdValue, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User Id not found"})
		return
	}

	userId, ok := userIdValue.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user Id type"})
		return
	}

	err := s.db.DeleteArticle(c.Request.Context(), id, userId)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Article deleted successfully"})
}

func (s *Server) GetAiCompletion(c *gin.Context) {
	var completionRequest models.CompletionRequest

	if err := c.ShouldBindJSON(&completionRequest); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	messages, err := completion.GenerateTextCompletion(completionRequest)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Status(http.StatusOK)

	c.Stream(func(w io.Writer) bool {
		select {
		case <-c.Request.Context().Done():
			return false
		case msg, ok := <-messages:
			if !ok {
				return false
			}
			io.WriteString(w, msg)
			c.Writer.Flush()
			return true
		}
	})
}
