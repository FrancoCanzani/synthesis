package handlers

import (
	"net/http"
	"synthesis/internal/database"
	"synthesis/internal/models"
	articleScraper "synthesis/internal/services/article-scraper"

	"github.com/gin-gonic/gin"
)

type ArticlesHandler struct {
	db database.Service
}

func NewArticlesHandler(db database.Service) *ArticlesHandler {
	return &ArticlesHandler{db: db}
}

func (h *ArticlesHandler) GetArticleScrapingHandler(c *gin.Context) {
	articleURL := c.Query("url")

	if articleURL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "URL parameter is required"})
		return
	}

	_, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User Id not found"})
		return
	}

	article, err := articleScraper.GetArticle(articleURL)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, article)
}

func (h *ArticlesHandler) GetArticleHandler(c *gin.Context) {
	articleId := c.Param("id")

	if articleId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid article id"})
		return
	}

	userIdValue, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User Id not found"})
		return
	}

	userId, ok := userIdValue.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user Id type"})
		return
	}

	article, err := h.db.GetArticle(c, userId, articleId)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, article)

}

func (h *ArticlesHandler) GetArticlesHandler(c *gin.Context) {
	userIdValue, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User Id not found"})
		return
	}

	userId, ok := userIdValue.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user Id type"})
		return
	}

	articles, err := h.db.GetArticles(c.Request.Context(), userId)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, articles)
}

func (h *ArticlesHandler) CreateArticleHandler(c *gin.Context) {
	var article *models.Article

	if err := c.BindJSON(&article); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid article structure"})
		return
	}

	userIdValue, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User Id not found"})
		return
	}

	userId, ok := userIdValue.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user Id type"})
		return
	}

	article.UserId = &userId

	_, err := h.db.CreateArticle(c.Request.Context(), article)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, article)
}

func (h *ArticlesHandler) DeleteArticleHandler(c *gin.Context) {
	articleId := c.Query("id")

	userIdValue, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User Id not found"})
		return
	}

	userId, ok := userIdValue.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user Id type"})
		return
	}

	err := h.db.DeleteArticle(c.Request.Context(), articleId, userId)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Article deleted successfully"})
}
