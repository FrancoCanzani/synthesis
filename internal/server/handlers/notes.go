package handlers

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"synthesis/internal/database"
	"synthesis/internal/models"
	"time"

	"github.com/gin-gonic/gin"
)

type NotesHandler struct {
	db database.Service
}

func NewNotesHandler(db database.Service) *NotesHandler {
	return &NotesHandler{db: db}
}

func (h *NotesHandler) UpsertNoteHandler(c *gin.Context) {
	var note *models.Note

	if err := c.BindJSON(&note); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid json structure"})
		return
	}

	userId := c.GetString("userId")

	// Check if the note already exists
	existing, err := h.db.GetNote(c.Request.Context(), note.Id, userId)
	if err != nil {
		// Note doesn't exist, create it
		dbNote := &models.Note{
			Id:        note.Id,
			UserId:    userId,
			Title:     note.Title,
			Content:   note.Content,
			CreatedAt: time.Now(),
		}

		result, err := h.db.CreateNote(c.Request.Context(), dbNote)

		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		note.CreatedAt = result.CreatedAt
		note.UpdatedAt = result.UpdatedAt
		note.Id = result.Id
		note.UserId = userId

		c.JSON(http.StatusCreated, note)
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

	result, err := h.db.UpdateNote(c.Request.Context(), dbNote, userId)

	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
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

func (h *NotesHandler) DeleteNoteHandler(c *gin.Context) {
	id := c.Query("id")

	userId := c.GetString("userId")

	err := h.db.DeleteNote(c.Request.Context(), id, userId)

	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Note deleted successfully"})
}

func (h *NotesHandler) GetNoteHandler(c *gin.Context) {
	id := c.Param("id")

	userId := c.GetString("userId")

	note, err := h.db.GetNote(c.Request.Context(), id, userId)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, note)
}

func (h *NotesHandler) GetPublicNoteHandler(c *gin.Context) {
	public_id := c.Param("public_id")

	note, err := h.db.GetPublicNote(c.Request.Context(), public_id)
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

func (h *NotesHandler) GetNotesHandler(c *gin.Context) {
	userId := c.GetString("userId")

	notes, err := h.db.GetNotes(c.Request.Context(), userId)

	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, notes)
}
