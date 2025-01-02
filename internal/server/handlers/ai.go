package handlers

import (
	"io"
	"net/http"
	"synthesis/internal/database"
	"synthesis/internal/models"
	"synthesis/internal/services/completion"

	"github.com/gin-gonic/gin"
)

type AiHandler struct {
	db database.Service
}

func NewAiHandler(db database.Service) *AiHandler {
	return &AiHandler{db: db}
}

func (h *AiHandler) GetAiCompletion(c *gin.Context) {
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
