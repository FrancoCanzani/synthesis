package handlers

import (
	"net/http"
	"synthesis/internal/database"

	"github.com/gin-gonic/gin"
)

type GeneralHandler struct {
	db database.Service
}

func NewGeneralHandler(db database.Service) *GeneralHandler {
	return &GeneralHandler{db: db}
}

func (h *GeneralHandler) HelloWorldHandler(c *gin.Context) {
	resp := make(map[string]string)
	resp["message"] = "Hello World"

	c.JSON(http.StatusOK, resp)
}

func (h *GeneralHandler) HealthHandler(c *gin.Context) {
	c.JSON(http.StatusOK, h.db.Health())
}
