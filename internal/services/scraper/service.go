package scraper

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
)

type ArticleMetadata struct {
	Title       string    `json:"title"`
	SiteTitle   string    `json:"site_name"`
	URL         string    `json:"url"`
	Author      string    `json:"author"`
	Description string    `json:"description"`
	Image       string    `json:"image"`
	Content     string    `json:"content"`
	PublishDate string    `json:"publish_date"`
	Category    string    `json:"category"`
	Language    string    `json:"language"`
	ReadingTime int       `json:"reading_time"`
	ScrapedAt   time.Time `json:"scraped_at"`
}

// Common article content selectors for different news sites
var contentSelectors = []string{
	"article",
	".article-text",
	".article-body",
	".nota-contenido",  // Common in Spanish news sites
	".article__content",
	".article-content",
	"[itemprop='articleBody']",
	".entry-content",
	".post-content",
	".main-content",
	".content-body",
	".story-body",
	"#article-body",
	".body-content",
}

// Elements to exclude
var excludeSelectors = []string{
	"script",
	"style",
	"iframe",
	"form",
	".advertisement",
	".social-share",
	".related-articles",
	".newsletter",
	".comments",
	".tags",
	".sidebar",
	"nav",
	"header",
	"footer",
}

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

func buildRequest(url string) (*http.Request, error) {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	// Add common headers to mimic a browser
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
	req.Header.Set("Accept-Language", "en-US,en;q=0.5")
	
	return req, nil
}

func cleanText(text string) string {
	// Remove extra whitespace
	text = regexp.MustCompile(`\s+`).ReplaceAllString(text, " ")
	// Remove special characters
	text = regexp.MustCompile(`[^\p{L}\p{N}\p{P}\s]`).ReplaceAllString(text, "")
	return strings.TrimSpace(text)
}

func extractContent(doc *goquery.Document) string {
	var content strings.Builder
	
	// First remove unwanted elements
	doc.Find(strings.Join(excludeSelectors, ", ")).Remove()

	// Try each content selector
	for _, selector := range contentSelectors {
		articles := doc.Find(selector)
		if articles.Length() > 0 {
			articles.Find("p").Each(func(i int, s *goquery.Selection) {
				text := cleanText(s.Text())
				if len(text) > 0 {
					content.WriteString(text)
					content.WriteString("\n\n")
				}
			})
			
			if content.Len() > 0 {
				break
			}
		}
	}

	// If no content found with selectors, try generic paragraph extraction
	if content.Len() == 0 {
		doc.Find("p").Each(func(i int, s *goquery.Selection) {
			text := cleanText(s.Text())
			if len(text) > 50 { // Only include paragraphs with substantial content
				content.WriteString(text)
				content.WriteString("\n\n")
			}
		})
	}

	return strings.TrimSpace(content.String())
}

func GetArticle(url string) (ArticleMetadata, error) {
	client := createHTTPClient()
	
	// Create request with headers
	req, err := buildRequest(url)
	if err != nil {
		return ArticleMetadata{}, fmt.Errorf("failed to create request: %v", err)
	}

	// Fetch the page
	resp, err := client.Do(req)
	if err != nil {
		return ArticleMetadata{}, fmt.Errorf("failed to fetch URL: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return ArticleMetadata{}, fmt.Errorf("received non-200 status code: %d", resp.StatusCode)
	}

	// Read the body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return ArticleMetadata{}, fmt.Errorf("failed to read response body: %v", err)
	}

	// Parse the HTML
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(string(body)))
	if err != nil {
		return ArticleMetadata{}, fmt.Errorf("failed to parse HTML: %v", err)
	}

	// Create article metadata
	article := ArticleMetadata{
		URL:       url,
		ScrapedAt: time.Now(),
	}

	// Extract metadata with fallbacks
	article.Title = doc.Find("h1").First().Text()
	if article.Title == "" {
		article.Title = doc.Find("title").Text()
	}
	article.Title = cleanText(article.Title)

	article.Description, _ = doc.Find(`meta[name="description"]`).Attr("content")
	if article.Description == "" {
		article.Description, _ = doc.Find(`meta[property="og:description"]`).Attr("content")
	}

	// Extract author with multiple selectors
	authorSelectors := []string{
		`meta[name="author"]`,
		`[class*="author"]`,
		`[rel="author"]`,
		`.author`,
		`.byline`,
	}
	
	for _, selector := range authorSelectors {
		if author := doc.Find(selector).First(); author.Length() > 0 {
			if content, exists := author.Attr("content"); exists {
				article.Author = content
				break
			}
			article.Author = cleanText(author.Text())
			if article.Author != "" {
				break
			}
		}
	}

	// Extract publish date
	dateSelectors := []string{
		`meta[property="article:published_time"]`,
		`meta[name="publication_date"]`,
		`time[datetime]`,
		`[class*="date"]`,
	}
	
	for _, selector := range dateSelectors {
		if date := doc.Find(selector).First(); date.Length() > 0 {
			if content, exists := date.Attr("content"); exists {
				article.PublishDate = content
				break
			}
			if content, exists := date.Attr("datetime"); exists {
				article.PublishDate = content
				break
			}
			article.PublishDate = cleanText(date.Text())
			if article.PublishDate != "" {
				break
			}
		}
	}

	// Extract content
	article.Content = extractContent(doc)
	if article.Content == "" {
		log.Printf("Warning: No content extracted for URL: %s", url)
		return article, fmt.Errorf("no content found in article")
	}

	// Calculate reading time
	article.ReadingTime = len(strings.Fields(article.Content)) / 200

	return article, nil
}