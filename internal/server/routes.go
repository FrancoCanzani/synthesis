package server

import (
	"net/http"
	"synthesis/internal/auth"
	"synthesis/internal/server/handlers"
	"synthesis/internal/services/helmet"
	"synthesis/internal/services/logger"
	rateLimit "synthesis/internal/services/rate-limit"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func (s *Server) RegisterRoutes() http.Handler {
	router := gin.Default()

	router.Use(helmet.Default())

	router.Use(logger.ZeroLogger())

	rl := rateLimit.NewRateLimiter(10, 50) // 10 RPS, burst of 50

	router.Use(rateLimit.RateLimitMiddleware(rl))

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	generalHandler := handlers.NewGeneralHandler(s.db)
	articlesHandler := handlers.NewArticlesHandler(s.db)
	notesHandler := handlers.NewNotesHandler(s.db)
	feedsHandler := handlers.NewFeedsHandler(s.db)
	aiHandler := handlers.NewAiHandler(s.db)

	router.GET("/", generalHandler.HelloWorldHandler)
	router.GET("/health", generalHandler.HealthHandler)

	notes := router.Group("/notes")

	articles := router.Group("/articles")

	feeds := router.Group("/feeds")

	notes.GET("/public/:public_id", notesHandler.GetPublicNoteHandler)

	notes.Use(auth.AuthMiddleware())
	{
		notes.GET("/:id", notesHandler.GetNoteHandler)
		notes.GET("/all", notesHandler.GetNotesHandler)
		notes.POST("", notesHandler.UpsertNoteHandler)
		notes.DELETE("", notesHandler.DeleteNoteHandler)
	}

	articles.Use(auth.AuthMiddleware())
	{
		articles.GET("/:id", articlesHandler.GetArticleHandler)
		articles.GET("", articlesHandler.GetArticleScrapingHandler)
		articles.GET("/all", articlesHandler.GetArticlesHandler)
		articles.POST("", articlesHandler.CreateArticleHandler)
		articles.DELETE("", articlesHandler.DeleteArticleHandler)
	}

	feeds.Use(auth.AuthMiddleware())
	{
		feeds.POST("", feedsHandler.CreateFeedHandler)
		feeds.GET("", feedsHandler.GetFeedItemsHandler)
		feeds.DELETE("", feedsHandler.DeleteFeedHandler)
		feeds.PUT("", feedsHandler.UpdateFeedItemHandler)
		feeds.PUT("/mark-all-read", feedsHandler.MarkAllFeedItemsAsReadHandler)
	}

	ai := router.Group("/ai")
	ai.POST("/assistant", aiHandler.GetAiCompletion)

	router.POST("/email", generalHandler.EmailHandler)

	return router
}
