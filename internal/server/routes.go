package server

import (
	"net/http"
	"synthesis/internal/auth"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func (s *Server) RegisterRoutes() http.Handler {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	router.GET("/", s.HelloWorldHandler)
	router.GET("/health", s.HealthHandler)

	notes := router.Group("/notes")

	notes.GET("/public/:public_id", s.GetPublicNoteHandler)

	notes.Use(auth.AuthRequired())
	{
		notes.GET("/:id", s.GetNoteHandler)
		notes.GET("/all", s.GetNotesHandler)
		notes.POST("", s.UpsertNoteHandler)
		notes.DELETE("/:id", s.DeleteNoteHandler)
	}

	router.GET("/article", s.GetArticleHandler)

	ai := router.Group("/ai")
	ai.POST("/assistant", s.GetAiCompletion)

	return router
}
