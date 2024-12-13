package scraper

import (
	"errors"
	"fmt"
	"net/url"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/gocolly/colly"
)

type ArticleMetadata struct {
	Title       string    `json:"title"`
	SiteTitle   string    `json:"site_name"`
	URL         string    `json:"url"`
	Author      string    `json:"author"`
	Description string    `json:"description"`
	Image       string    `json:"image"`
	Content     string    `json:"content"`
	HTMLContent string    `json:"html_content"`
	PublishDate string    `json:"publish_date"`
	Category    string    `json:"category"`
	Language    string    `json:"language"`
	ReadingTime int       `json:"reading_time"`
	ScrapedAt   time.Time `json:"scraped_at"`
}

func cleanContent(doc *goquery.Document) (string, string) {
	htmlDoc := goquery.CloneDocument(doc)
	textDoc := goquery.CloneDocument(doc)

	// Only remove non-content structural elements
	unwantedSelectors := []string{
		// Interactive elements
		"script", "style", "iframe", "form", "button", "input",
		
		// Navigation elements
		"nav", "header", "footer", "aside", "noscript",
		
		// Common non-content areas
		"[role='complementary']", "[role='navigation']",
		"[role='banner']", "[role='contentinfo']",
		
		// Generic ads and widgets
		"[class*='ad']", "[id*='ad']",
		"[class*='social']", "[class*='share']",
		"[class*='comment']", "[id*='comment']",
		"[class*='popup']",
		
		// Generic supplementary content
		"aside", ".sidebar", "[role='complementary']",
	}

	for _, selector := range unwantedSelectors {
		textDoc.Find(selector).Remove()
		htmlDoc.Find(selector).Remove()
	}

	// Only keep semantic HTML attributes
	elemAttrs := map[string][]string{
		"a":       {"href", "title"},
		"img":     {"src", "alt", "title"},
		"table":   {"summary"},
		"th":      {"scope"},
		"td":      {"colspan", "rowspan"},
		"figure":  {"role"},
		"article": {"role"},
		"main":    {"role"},
	}

	htmlDoc.Find("*").Each(func(_ int, s *goquery.Selection) {
		tag := goquery.NodeName(s)
		
		// Keep only allowed attributes for each element type
		if allowedAttrs, ok := elemAttrs[tag]; ok {
			attrValues := make(map[string]string)
			for _, attr := range allowedAttrs {
				if val, exists := s.Attr(attr); exists {
					attrValues[attr] = val
				}
			}
			html, _ := s.Html()
			s.SetHtml(html)
			for attr, val := range attrValues {
				s.SetAttr(attr, val)
			}
		} else {
			// Remove all attributes for other elements
			html, _ := s.Html()
			s.SetHtml(html)
		}
	})

	// Focus on semantic content containers
	selectors := []string{
		"article",
		"[role='article']",
		"[itemprop='articleBody']",
		"main",
		"[role='main']",
	}

	var htmlContent string
	for _, selector := range selectors {
		if content := htmlDoc.Find(selector).First(); content.Length() > 0 {
			html, err := content.Html()
			if err == nil {
				htmlContent = html
				break
			}
		}
	}

	// Fallback to body if no semantic containers found
	if htmlContent == "" {
		if body := htmlDoc.Find("body"); body.Length() > 0 {
			html, err := body.Html()
			if err == nil {
				htmlContent = html
			}
		}
	}

	return strings.TrimSpace(textDoc.Text()), strings.TrimSpace(htmlContent)
}

func GetArticleContent(websiteURL string) (*ArticleMetadata, error) {
	parsedURL, err := url.Parse(websiteURL)
	if err != nil || (!strings.HasPrefix(parsedURL.Scheme, "http") && !strings.HasPrefix(parsedURL.Scheme, "https")) {
		return nil, errors.New("invalid URL format")
	}

	collector := colly.NewCollector(
		colly.UserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"),
		colly.AllowURLRevisit(),
		colly.MaxDepth(1),
		colly.Async(true),
	)

	collector.SetRequestTimeout(15 * time.Second)

	metadata := &ArticleMetadata{
		URL:       websiteURL,
		ScrapedAt: time.Now(),
	}

	var doc *goquery.Document
	collector.OnHTML("html", func(e *colly.HTMLElement) {
		html, err := e.DOM.Html()
		if err != nil {
			return
		}
		doc, err = goquery.NewDocumentFromReader(strings.NewReader(html))
		if err != nil {
			return
		}
	})

	collector.OnHTML("head", func(e *colly.HTMLElement) {
		if title := e.ChildAttr("meta[property='og:title']", "content"); title != "" {
			metadata.Title = title
		} else if title := e.ChildAttr("meta[name='twitter:title']", "content"); title != "" {
			metadata.Title = title
		} else {
			metadata.Title = e.ChildText("title")
		}

		if author := e.ChildAttr("meta[name='author']", "content"); author != "" {
			metadata.Author = author
		} else if author := e.ChildAttr("meta[property='article:author']", "content"); author != "" {
			metadata.Author = author
		}

		if date := e.ChildAttr("meta[property='article:published_time']", "content"); date != "" {
			metadata.PublishDate = date
		} else if date := e.ChildAttr("meta[name='published_date']", "content"); date != "" {
			metadata.PublishDate = date
		}

		if desc := e.ChildAttr("meta[property='og:description']", "content"); desc != "" {
			metadata.Description = desc
		} else if desc := e.ChildAttr("meta[name='description']", "content"); desc != "" {
			metadata.Description = desc
		}

		if img := e.ChildAttr("meta[property='og:image']", "content"); img != "" {
			metadata.Image = img
		} else if img := e.ChildAttr("meta[name='twitter:image']", "content"); img != "" {
			metadata.Image = img
		}

		if lang := e.ChildAttr("html", "lang"); lang != "" {
			metadata.Language = lang
		}
	})

	err = collector.Visit(websiteURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch content: %w", err)
	}

	collector.Wait()

	if doc == nil {
		return nil, errors.New("no content found")
	}

	plainText, htmlContent := cleanContent(doc)
	if plainText == "" {
		return nil, errors.New("no content found after cleaning")
	}

	metadata.Content = plainText
	metadata.HTMLContent = htmlContent

	wordCount := len(strings.Fields(plainText))
	metadata.ReadingTime = (wordCount + 199) / 200

	return metadata, nil
}