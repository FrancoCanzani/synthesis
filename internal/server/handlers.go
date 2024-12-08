package server

import (
	"net/http"
	"synthesis/internal/database"
	"time"

	"github.com/gin-gonic/gin"
)


type Note struct {
    ID        string    `json:"id"`
    UserID    string     `json:"user_id"`
    Title     string    `json:"title"`
    Content   string    `json:"content"`
    CreatedAt string    `json:"created_at"`
    UpdatedAt string    `json:"updated_at"`
}

func (s *Server) HelloWorldHandler(c *gin.Context) {
    resp := make(map[string]string)
    resp["message"] = "Hello World"

    c.JSON(http.StatusOK, resp)
}

func (s *Server) HealthHandler(c *gin.Context) {
    c.JSON(http.StatusOK, s.db.Health())
}

func (s *Server) UpsertNoteHandler(c *gin.Context) {
    var note *Note
    
    if err := c.BindJSON(&note); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json structure"})
        return
    }

    userIdValue, exists := c.Get("userId")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
        return
    }

    userId, ok := userIdValue.(string)
    if !ok {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID type"})
        return
    }

    note.UserID = userId

    // Check if note exists
    existing, err := s.db.GetNote(c.Request.Context(), note.ID, userId)
    if err != nil {
        // Note doesn't exist, create it
        dbNote := &database.Note{
            ID:      note.ID,     
            UserID:  userId,  
            Title:   note.Title,
            Content: note.Content,
        }

        result, err := s.db.CreateNote(c.Request.Context(), dbNote)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }

        note.CreatedAt = result.CreatedAt.Format(time.RFC3339)
        note.UpdatedAt = result.UpdatedAt.Format(time.RFC3339)
        note.ID = result.ID
        note.UserID = userId  

        c.JSON(http.StatusCreated, note)
        return
    }

    // Update existing note
    dbNote := &database.Note{
        ID:      existing.ID,
        UserID:  userId,  
        Title:   note.Title,
        Content: note.Content,
    }

    result, err := s.db.UpdateNote(c.Request.Context(), dbNote, userId)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    note.CreatedAt = result.CreatedAt.Format(time.RFC3339)
    note.UpdatedAt = result.UpdatedAt.Format(time.RFC3339)
    note.ID = result.ID
    note.UserID = userId  

    c.JSON(http.StatusOK, note)
}

func (s * Server) DeleteNoteHandler(c *gin.Context) {
    id := c.Param("id")

    userIdValue, exists := c.Get("userId")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
        return
    }

    userId, ok := userIdValue.(string)
    if !ok {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID type"})
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
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
        return
    }

    userId, ok := userIdValue.(string)
    if !ok {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID type"})
        return
    }

    note, err := s.db.GetNote(c.Request.Context(), id, userId)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, note)
}

func (s * Server) GetNotesHandler(c *gin.Context) {
    userIdValue, exists := c.Get("userId")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
        return
    }

    userId, ok := userIdValue.(string)
    if !ok {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID type"})
        return
    }

    notes, err := s.db.GetNotes(c.Request.Context(), userId)

    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, notes)
}