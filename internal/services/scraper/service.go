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
	"golang.org/x/text/language"
	"golang.org/x/text/language/display"
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
	".nota-contenido",
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

// Category selectors commonly used across news sites
var categorySelectors = []string{
	`meta[property="article:section"]`,
	`meta[name="category"]`,
	".category",
	"[class*='category']",
	"[class*='section']",
	".breadcrumb",
	"[itemtype='http://schema.org/BreadcrumbList']",
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

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
	req.Header.Set("Accept-Language", "en-US,en;q=0.5")
	
	return req, nil
}

func cleanText(text string) string {
	text = regexp.MustCompile(`\s+`).ReplaceAllString(text, " ")
	text = regexp.MustCompile(`[^\p{L}\p{N}\p{P}\s]`).ReplaceAllString(text, "")
	return strings.TrimSpace(text)
}

func extractSiteName(doc *goquery.Document, url string) string {
	// Try meta tags first
	if siteName, exists := doc.Find(`meta[property="og:site_name"]`).Attr("content"); exists {
		return cleanText(siteName)
	}

	// Try structured data
	if siteName := doc.Find(`[itemtype="http://schema.org/Organization"] [itemprop="name"]`).First().Text(); siteName != "" {
		return cleanText(siteName)
	}

	// Try common site name locations
	siteNameSelectors := []string{
		".site-name",
		"#site-name",
		".brand",
		".logo",
		"[class*='brand']",
		"[class*='logo']",
	}

	for _, selector := range siteNameSelectors {
		if siteName := doc.Find(selector).First().Text(); siteName != "" {
			return cleanText(siteName)
		}
	}

	// Extract domain name as fallback
	if domain := regexp.MustCompile(`^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)`).FindStringSubmatch(url); len(domain) > 1 {
		return domain[1]
	}

	return ""
}

func extractMainImage(doc *goquery.Document) string {
	// Try Open Graph image
	if image, exists := doc.Find(`meta[property="og:image"]`).Attr("content"); exists {
		return image
	}

	// Try Twitter image
	if image, exists := doc.Find(`meta[name="twitter:image"]`).Attr("content"); exists {
		return image
	}

	// Try schema.org image
	if image, exists := doc.Find(`[itemtype="http://schema.org/Article"] [itemprop="image"]`).Attr("content"); exists {
		return image
	}

	// Try article featured image
	imageSelectors := []string{
		".featured-image img",
		".article-image img",
		".post-thumbnail img",
		"article img",
	}

	for _, selector := range imageSelectors {
		if image := doc.Find(selector).First(); image.Length() > 0 {
			if src, exists := image.Attr("src"); exists {
				return src
			}
		}
	}

	return ""
}

func detectLanguage(doc *goquery.Document) string {
	// Try HTML lang attribute
	if htmlLang, exists := doc.Find("html").Attr("lang"); exists {
		if tag, err := language.Parse(htmlLang); err == nil {
			return display.English.Languages().Name(tag)
		}
	}

	// Try meta tags
	langSelectors := []string{
		`meta[property="og:locale"]`,
		`meta[http-equiv="content-language"]`,
		`meta[name="language"]`,
	}

	for _, selector := range langSelectors {
		if lang, exists := doc.Find(selector).Attr("content"); exists {
			if tag, err := language.Parse(lang); err == nil {
				return display.English.Languages().Name(tag)
			}
		}
	}

	// Try to detect from content (basic implementation)
	content := doc.Find("body").Text()
	if len(content) > 100 {
		// Use golang.org/x/text/language's Matcher for more accurate detection
		// This is a simplified example
		commonWords := map[string]string{
			"the|and|in|of|to": "English",
			"el|la|en|de|los":  "Spanish",
			"le|la|et|les|en":  "French",
			"der|die|und|in":   "German",
		}

		for pattern, lang := range commonWords {
			if regexp.MustCompile(`\b(`+pattern+`)\b`).MatchString(strings.ToLower(content)) {
				return lang
			}
		}
	}

	return ""
}

func extractCategory(doc *goquery.Document) string {
	for _, selector := range categorySelectors {
		if category := doc.Find(selector).First(); category.Length() > 0 {
			if content, exists := category.Attr("content"); exists {
				return cleanText(content)
			}
			return cleanText(category.Text())
		}
	}

	// Try extracting from URL breadcrumb or path
	if urlPath := regexp.MustCompile(`/([^/]+)/[^/]+/?$`).FindStringSubmatch(doc.Url.Path); len(urlPath) > 1 {
		return strings.Title(strings.ReplaceAll(urlPath[1], "-", " "))
	}

	return ""
}

func extractContent(doc *goquery.Document) string {
	var content strings.Builder
	
	doc.Find(strings.Join(excludeSelectors, ", ")).Remove()

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

	if content.Len() == 0 {
		doc.Find("p").Each(func(i int, s *goquery.Selection) {
			text := cleanText(s.Text())
			if len(text) > 50 {
				content.WriteString(text)
				content.WriteString("\n\n")
			}
		})
	}

	return strings.TrimSpace(content.String())
}

func GetArticle(url string) (ArticleMetadata, error) {
	client := createHTTPClient()
	
	req, err := buildRequest(url)
	if err != nil {
		return ArticleMetadata{}, fmt.Errorf("failed to create request: %v", err)
	}

	resp, err := client.Do(req)
	if err != nil {
		return ArticleMetadata{}, fmt.Errorf("failed to fetch URL: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return ArticleMetadata{}, fmt.Errorf("received non-200 status code: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return ArticleMetadata{}, fmt.Errorf("failed to read response body: %v", err)
	}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(string(body)))
	if err != nil {
		return ArticleMetadata{}, fmt.Errorf("failed to parse HTML: %v", err)
	}

	article := ArticleMetadata{
		URL:       url,
		ScrapedAt: time.Now(),
	}

	// Extract all metadata
	article.Title = cleanText(doc.Find("h1").First().Text())
	if article.Title == "" {
		article.Title = cleanText(doc.Find("title").Text())
	}

	article.SiteTitle = extractSiteName(doc, url)
	article.Description = cleanText(doc.Find(`meta[name="description"]`).AttrOr("content", 
		doc.Find(`meta[property="og:description"]`).AttrOr("content", "")))
	article.Image = extractMainImage(doc)
	article.Language = detectLanguage(doc)
	article.Category = extractCategory(doc)

	// Author extraction
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
				article.Author = cleanText(content)
				break
			}
			article.Author = cleanText(author.Text())
			if article.Author != "" {
				break
			}
		}
	}

	// Date extraction
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

	article.Content = extractContent(doc)
	if article.Content == "" {
		log.Printf("Warning: No content extracted for URL: %s", url)
		return article, fmt.Errorf("no content found in article")
	}

	article.ReadingTime = len(strings.Fields(article.Content)) / 200

	return article, nil
}