package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
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
	userId := c.GetString("userId")

	feedLink := c.Query("feedLink")
	if feedLink == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "feedLink parameter is required"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	exists, err := h.db.FeedExists(ctx, feedLink, userId)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "failed to check feed existence"})
		return
	}
	if exists {
		c.AbortWithStatusJSON(http.StatusConflict, gin.H{"error": "feed already exists"})
		return
	}

	fp := gofeed.NewParser()
	feed, err := fp.ParseURLWithContext(feedLink, ctx)

	fmt.Println(feed)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "failed to parse feed"})
		return
	}

	feedSource := &models.FeedSource{
		FeedLink:        feedLink,
		Link:            &feed.Link,
		UserId:          userId,
		UpdateFrequency: "1h",
		LastFetch:       time.Now(),
		Active:          true,
		FailureCount:    0,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	feedModel := &models.Feed{
		FeedLink:      feedLink,
		Link:          &feed.Link,
		UserId:        userId,
		Title:         &feed.Title,
		Description:   &feed.Description,
		Updated:       &feed.Updated,
		UpdatedParsed: feed.UpdatedParsed,
		FeedType:      &feed.FeedType,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	if feed.Image != nil && feed.Image.URL != "" {
		feedModel.ImageUrl = &feed.Image.URL
		if feed.Image.Title != "" {
			feedModel.ImageTitle = &feed.Image.Title
		}
	}

	feedItems := make([]*models.FeedItem, 0)
	for _, item := range feed.Items {
		feedItem := &models.FeedItem{
			UserId:          userId,
			Title:           &item.Title,
			Description:     &item.Description,
			Content:         &item.Content,
			FeedLink:        feedLink,
			Link:            &item.Link,
			Published:       &item.Published,
			PublishedParsed: item.PublishedParsed,
			Updated:         &item.Updated,
			UpdatedParsed:   item.UpdatedParsed,
			GUID:            &item.GUID,
			Read:            false,
			Starred:         false,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		}

		if item.Image != nil && item.Image.URL != "" {
			feedItem.ImageUrl = &item.Image.URL
			if item.Image.Title != "" {
				feedItem.ImageTitle = &item.Image.Title
			}
		}

		feedItems = append(feedItems, feedItem)
	}

	err = h.db.CreateFeed(ctx, feedSource, feedModel, feedItems)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "failed to create feed"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"feed":       feedModel,
		"itemsCount": len(feedItems),
	})
}

func (h *FeedsHandler) GetFeedItemsHandler(c *gin.Context) {
	userId := c.GetString("userId")

	limit := 50
	offset := 0

	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	if offsetStr := c.Query("offset"); offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
			offset = o
		}
	}

	order := c.Query("order")

	if order != "" {
		if order != "ASC" && order != "DESC" {
			order = "DESC"
		}
	}

	items, err := h.db.GetFeedItems(c, userId, order, limit, offset)
	if err != nil {
		fmt.Println(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch items"})
		return
	}

	c.JSON(http.StatusOK, items)
}

func (h *FeedsHandler) DeleteFeedHandler(c *gin.Context) {
	feedLink := c.Query("feedLink")

	if feedLink == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "feed link not provided"})
		return
	}

	userId := c.GetString("userId")

	err := h.db.DeleteFeed(c.Request.Context(), feedLink, userId)
	fmt.Println(err)

	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "failed to delete feed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "feed deleted successfully"})
}

func (h *FeedsHandler) UpdateFeedItemHandler(c *gin.Context) {
	type UpdateRequest struct {
		Id        int64  `json:"id" binding:"required"`
		Attribute string `json:"attribute" binding:"required"`
		Value     any    `json:"value" binding:"required"`
	}

	var req UpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request payload"})
		return
	}

	userId := c.GetString("userId")

	allowedAttributes := map[string]bool{
		"read":    true,
		"starred": true,
	}

	if !allowedAttributes[req.Attribute] {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid attribute"})
		return
	}

	err := h.db.UpdateFeedItem(c.Request.Context(), req.Id, userId, req.Attribute, req.Value)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "failed to update post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "post updated successfully"})
}

func (h *FeedsHandler) MarkAllFeedItemsAsReadHandler(c *gin.Context) {
	userId := c.GetString("userId")

	err := h.db.MarkAllFeedItemsAsRead(c.Request.Context(), userId)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "failed to update feed items"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "all feeds marked as read successfully"})
}
