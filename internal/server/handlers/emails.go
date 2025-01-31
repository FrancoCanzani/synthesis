package handlers

import (
	"fmt"
	"net/http"
	"synthesis/internal/database"
	"synthesis/internal/models"

	"github.com/gin-gonic/gin"
)

type EmailHandler struct {
	db database.Service
}

func NewEmailHandler(db database.Service) *EmailHandler {
	return &EmailHandler{db: db}
}

func (h *EmailHandler) ReceivedEmailHandler(c *gin.Context) {
    fmt.Println("Email Handler")

    var parsedEmail models.ReceivedEmail
    if err := c.ShouldBind(&parsedEmail); err != nil {
        c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form data: " + err.Error()})
        return
    }

    // // Handle attachments (if any)
    // form, _ := c.MultipartForm()
    // if form != nil {
    //     files := form.File["attachment"] // Mailgun sends attachments as "attachment-1", "attachment-2", etc.
    //     for _, file := range files {
    //         // Save or process the attachment
    //         fmt.Println("Attachment:", file.Filename)
    //     }
    // }

    fmt.Printf("Parsed Email: %+v\n", parsedEmail)

    c.JSON(http.StatusOK, parsedEmail)
}