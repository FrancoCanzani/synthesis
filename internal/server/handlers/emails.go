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

	email, err := h.db.SaveEmail(c, parsedEmail)

	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Failed to save email: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, email)
}

func (h *EmailHandler) GetEmailsHandler(c *gin.Context) {
	alias := c.Query("alias")

	fmt.Println(alias)

	if alias == "" {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Alias is required"})
		return
	}

	var parsedEmail models.ReceivedEmail

	if err := c.ShouldBind(&parsedEmail); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form data: " + err.Error()})
		return
	}

	emails, err := h.db.GetEmails(c, alias)

	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Failed to save email: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, emails)
}

func (h *EmailHandler) UpdateEmailItemHandler(c *gin.Context) {
	type UpdateRequest struct {
		Id             int64  `json:"id" binding:"required"`
		RecipientAlias string `json:"recipient_alias" binding:"required"`
		Attribute      string `json:"attribute" binding:"required"`
		Value          any    `json:"value" binding:"required"`
	}

	var req UpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request payload"})
		return
	}

	allowedAttributes := map[string]bool{
		"read":    true,
		"starred": true,
	}

	if !allowedAttributes[req.Attribute] {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid attribute"})
		return
	}

	err := h.db.UpdateEmailItem(c.Request.Context(), req.Id, req.RecipientAlias, req.Attribute, req.Value)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "failed to update email"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "email updated successfully"})
}
