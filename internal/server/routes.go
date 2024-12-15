package server

import (
	"net/http"
	"synthesis/internal/auth"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)


func (s *Server) RegisterRoutes() http.Handler {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	r.GET("/", s.HelloWorldHandler)
	r.GET("/health", s.HealthHandler)

	notes := r.Group("/notes")

	notes.Use(auth.AuthRequired())
	{
		notes.GET("/:id", s.GetNoteHandler)
		notes.GET("/all", s.GetNotesHandler)
		notes.POST("", s.UpsertNoteHandler)
		notes.DELETE("/:id", s.DeleteNoteHandler)
	}

	r.GET("/article", s.GetArticleContent)

	r.GET("/ai/generate", s.GetAiCompletion)

	return r
}