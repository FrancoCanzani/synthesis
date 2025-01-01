package scraper

import (
	"fmt"
	"net/http"
	"net/url"
	"synthesis/internal/models"
	"time"

	readability "github.com/go-shiori/go-readability"
)

func createHTTPClient() *http.Client {
	return &http.Client{
		Timeout: 30 * time.Second,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if len(via) >= 10 {
				return fmt.Errorf("too many redirects")
			}
			return nil
		},
	}
}

func buildRequest(urlStr string) (*http.Request, error) {
	req, err := http.NewRequest("GET", urlStr, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
	req.Header.Set("Accept-Language", "en-US,en;q=0.5")

	return req, nil
}

// helper to make readabilityArticle responses variables if they are empty
func toPointer(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

func GetArticle(urlStr string) (models.Article, error) {
	parsedURL, err := url.Parse(urlStr)
	if err != nil {
		return models.Article{}, fmt.Errorf("failed to parse URL: %v", err)
	}

	client := createHTTPClient()

	req, err := buildRequest(urlStr)
	if err != nil {
		return models.Article{}, fmt.Errorf("failed to create request: %v", err)
	}

	resp, err := client.Do(req)
	if err != nil {
		return models.Article{}, fmt.Errorf("failed to fetch URL: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return models.Article{}, fmt.Errorf("received non-200 status code: %d", resp.StatusCode)
	}

	readabilityArticle, err := readability.FromReader(resp.Body, parsedURL)
	if err != nil {
		return models.Article{}, fmt.Errorf("failed to parse article: %v", err)
	}

	article := models.Article{
		Title:         toPointer(readabilityArticle.Title),
		SiteName:      toPointer(readabilityArticle.SiteName),
		URL:           urlStr,
		Author:        toPointer(readabilityArticle.Byline),
		Excerpt:       toPointer(readabilityArticle.Excerpt),
		Image:         toPointer(readabilityArticle.Image),
		Favicon:       toPointer(readabilityArticle.Favicon),
		Content:       toPointer(readabilityArticle.Content),
		TextContent:   toPointer(readabilityArticle.TextContent),
		PublishedTime: readabilityArticle.PublishedTime,
		ModifiedTime:  readabilityArticle.ModifiedTime,
		Language:      toPointer(readabilityArticle.Language),
		Length:        &readabilityArticle.Length,
		ScrapedAt:     time.Now(),
	}

	return article, nil
}
