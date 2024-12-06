package server

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func (s *Server) RegisterRoutes() http.Handler {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // Add frontend URL
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true, // Enable cookies/auth
	}))

	r.GET("/", s.HelloWorldHandler)
	r.GET("/health", s.HealthHandler)

	notes := r.Group("/notes")
	{
		notes.GET("/:id", s.GetNoteHandler)
		notes.GET("/all/:user_id", s.GetNotesHandler)
		notes.POST("/upsert", s.UpsertNoteHandler)
		notes.DELETE("/:id", s.DeleteNoteHandler)
	}

	return r
}