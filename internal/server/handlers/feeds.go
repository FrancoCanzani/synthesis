package handlers

import (
	"context"
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
    userId := c.GetString("user_id")
    if userId == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
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
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "failed to parse feed"})
        return
    }

    feedSource := &models.FeedSource{
        Link:            feedURL,
        SourceLink:      feed.Link,
        UserId:         userId,
        UpdateFrequency: "1h",
        Active:          true,
        FailureCount:    0,
        CreatedAt:       time.Now(),
        UpdatedAt:       time.Now(),
    }

    feedModel := &models.Feed{
        Link:           feedURL,
        SourceLink:     feed.Link,
        UserId:        userId,
        Title:          feed.Title,
        Description:    feed.Description,
        Updated:        feed.Updated,
        UpdatedParsed:  feed.UpdatedParsed,
        FeedType:       feed.FeedType,
        CreatedAt:      time.Now(),
        UpdatedAt:      time.Now(),
    }

    feedItems := make([]*models.FeedItem, 0)
    for _, item := range feed.Items {
        feedItem := &models.FeedItem{
            SourceLink:      feedURL,
            UserId:         userId,
            Title:          item.Title,
            Description:    item.Description,
            Link:           item.Link,
            Published:      item.Published,
            PublishedParsed: item.PublishedParsed,
            Updated:        item.Updated,
            UpdatedParsed:  item.UpdatedParsed,
            GUID:           item.GUID,
            Read:           false,
            Starred:        false,
            CreatedAt:      time.Now(),
            UpdatedAt:      time.Now(),
        }
        feedItems = append(feedItems, feedItem)
    }

    err = h.db.CreateFeed(ctx, feedSource, feedModel, feedItems)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create feed"})
        return
    }

    c.JSON(http.StatusCreated, gin.H{
        "feed": feedModel,
        "items_count": len(feedItems),
    })
}

func (h *FeedsHandler) GetFeedsHandler(c *gin.Context) {
    userId := c.GetString("user_id")
    if userId == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
        return
    }

    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    feeds, err := h.db.GetFeeds(ctx, userId)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch feeds"})
        return
    }

    c.JSON(http.StatusOK, feeds)
}