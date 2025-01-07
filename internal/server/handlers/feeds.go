package handlers

import (
	"context"
	"fmt"
	"net/http"
	"synthesis/internal/database"
	"synthesis/internal/models"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/mmcdole/gofeed"
)

type FeedsHandler struct {
	db database.Service
}

func NewFeedsHandler(db database.Service) *FeedsHandler {
	return &FeedsHandler{db: db}
}

func (h *FeedsHandler) CreateFeedHandler(c *gin.Context) {
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

	feedURL := c.Query("url")
	if feedURL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "url parameter is required"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	exists, err := h.db.FeedExists(ctx, feedURL, userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check feed existence"})
		return
	}
	if exists {
		c.JSON(http.StatusConflict, gin.H{"error": "feed already exists for this user"})
		return
	}

	fp := gofeed.NewParser()
	feed, err := fp.ParseURLWithContext(feedURL, ctx)
	
	fmt.Println(feed)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to parse feed"})
		return
	}

	feedSource := &models.FeedSource{
		Link:            feedURL,
		UserId:          userId,
		UpdateFrequency: "1h",
		Active:          true,
		FailureCount:    0,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	feedModel := &models.Feed{
		Link:          feedURL,
		UserId:        userId,
		Title:         feed.Title,
		Description:   feed.Description,
		Updated:       feed.Updated,
		UpdatedParsed: feed.UpdatedParsed,
		FeedType:      feed.FeedType,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	feedItems := make([]*models.FeedItem, 0)
	for _, item := range feed.Items {
		feedItem := &models.FeedItem{
			SourceLink:      feedURL,
			UserId:          userId,
			Title:           item.Title,
			Description:     item.Description,
			Link:            item.Link,
			Published:       item.Published,
			PublishedParsed: item.PublishedParsed,
			Updated:         item.Updated,
			UpdatedParsed:   item.UpdatedParsed,
			GUID:            item.GUID,
			Read:            false,
			Starred:         false,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		}
		feedItems = append(feedItems, feedItem)
	}

	err = h.db.CreateFeed(ctx, feedSource, feedModel, feedItems)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create feed"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"feed":        feedModel,
		"items_count": len(feedItems),
	})
}

func (h *FeedsHandler) GetFeedsHandler(c *gin.Context) {
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

	feeds, err := h.db.GetFeeds(c.Request.Context(), userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch feeds"})
		return
	}

	c.JSON(http.StatusOK, feeds)
}

func (h *FeedsHandler) DeleteFeedHandler(c *gin.Context) {
	link := c.Query("link")

	if link == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "feed link not provided"})
		return 
	}

	userIdValue, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user Id not found"})
		return
	}

	userId, ok := userIdValue.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user Id type"})
		return
	}

	err := h.db.DeleteFeed(c.Request.Context(), link, userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete feed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "feed deleted successfully"})
}

func (h *FeedsHandler) UpdateFeedItemHandler(c *gin.Context) {
	type UpdateRequest struct {
		Link   string `json:"link" binding:"required"`
		Attribute string `json:"attribute" binding:"required"`
		Value     any    `json:"value" binding:"required"`
	}

	var req UpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request payload"})
		return
	}

	userIdValue, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user ID not found"})
		return
	}

	userId, ok := userIdValue.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid User ID type"})
		return
	}

	allowedAttributes := map[string]bool{
		"read":    true,
		"starred": true,
	}

	if !allowedAttributes[req.Attribute] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid attribute"})
		return
	}

	err := h.db.UpdateFeedItem(c.Request.Context(), req.Link, userId, req.Attribute, req.Value)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "post updated successfully"})
}

func (h *FeedsHandler) MarAllFeedItemsAsReadHandler(c *gin.Context) {
	userIdValue, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user Id not found"})
		return
	}

	userId, ok := userIdValue.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user Id type"})
		return
	}

	err := h.db.MarAllFeedItemsAsRead(c.Request.Context(), userId)
	if err != nil {
		fmt.Println(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update feed items"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "all feeds marked as read successfully"})
}