package server

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)


type Note struct {
    ID        int64     `json:"id"`
    UserID    int64     `json:"user_id"`
    Title     string    `json:"title"`
    Content   string    `json:"content"`
    CreatedAt string 	`json:"created_at"`
    UpdatedAt string 	`json:"updated_at"`
}

func (s *Server) HelloWorldHandler(c *gin.Context) {
    resp := make(map[string]string)
    resp["message"] = "Hello World"

    c.JSON(http.StatusOK, resp)
}

func (s *Server) HealthHandler(c *gin.Context) {
    c.JSON(http.StatusOK, s.db.Health())
}

func (s *Server) UpdateNoteHanler(c *gin.Context) {
	var note Note

	if err := c.BindJSON(&note); err != nil {
		err := errors.New("invalid json structure")
		if err != nil {
			c.JSON(http.StatusBadRequest, err)
		}
	}

    c.JSON(http.StatusOK, note)
}

