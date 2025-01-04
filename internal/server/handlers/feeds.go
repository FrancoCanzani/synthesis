package handlers

import (
	"net/http"
	"synthesis/internal/database"

	"github.com/gin-gonic/gin"
	"github.com/mmcdole/gofeed"
)

type FeedsHandler struct {
	db database.Service
}

func NewFeedsHandler(db database.Service) *FeedsHandler {
	return &FeedsHandler{db: db}
}

func (h *FeedsHandler) GetFeedHandler(c *gin.Context) {
	feedURL := c.Query("url")

	fp := gofeed.NewParser()
	feed, err := fp.ParseURL(feedURL)

	if err != nil {
		return
	}

	c.JSON(http.StatusOK, feed)
}
