package server

import (
	"html"
	"net/http"
	"regexp"
	"strings"
	"synthesis/internal/database"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gocolly/colly"
)


type Note struct {
    ID        string    `json:"id"`
    UserID    string     `json:"user_id"`
    Title     string    `json:"title"`
    Content   string    `json:"content"`
    CreatedAt string    `json:"created_at"`
    UpdatedAt string    `json:"updated_at"`
}

func (s *Server) HelloWorldHandler(c *gin.Context) {
    resp := make(map[string]string)
    resp["message"] = "Hello World"

    c.JSON(http.StatusOK, resp)
}

func (s *Server) HealthHandler(c *gin.Context) {
    c.JSON(http.StatusOK, s.db.Health())
}

func (s *Server) UpsertNoteHandler(c *gin.Context) {
    var note *Note
    
    if err := c.BindJSON(&note); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json structure"})
        return
    }

    userIdValue, exists := c.Get("userId")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
        return
    }

    userId, ok := userIdValue.(string)
    if !ok {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID type"})
        return
    }

    note.UserID = userId

    // Check if note exists
    existing, err := s.db.GetNote(c.Request.Context(), note.ID, userId)
    if err != nil {
        // Note doesn't exist, create it
        dbNote := &database.Note{
            ID:      note.ID,     
            UserID:  userId,  
            Title:   note.Title,
            Content: note.Content,
        }

        result, err := s.db.CreateNote(c.Request.Context(), dbNote)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }

        note.CreatedAt = result.CreatedAt.Format(time.RFC3339)
        note.UpdatedAt = result.UpdatedAt.Format(time.RFC3339)
        note.ID = result.ID
        note.UserID = userId  

        c.JSON(http.StatusCreated, note)
        return
    }

    // Update existing note
    dbNote := &database.Note{
        ID:      existing.ID,
        UserID:  userId,  
        Title:   note.Title,
        Content: note.Content,
    }

    result, err := s.db.UpdateNote(c.Request.Context(), dbNote, userId)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    note.CreatedAt = result.CreatedAt.Format(time.RFC3339)
    note.UpdatedAt = result.UpdatedAt.Format(time.RFC3339)
    note.ID = result.ID
    note.UserID = userId  

    c.JSON(http.StatusOK, note)
}

func (s * Server) DeleteNoteHandler(c *gin.Context) {
    id := c.Param("id")

    userIdValue, exists := c.Get("userId")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
        return
    }

    userId, ok := userIdValue.(string)
    if !ok {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID type"})
        return
    }

    err := s.db.DeleteNote(c.Request.Context(), id, userId)

    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Note deleted successfully"})
}

func (s *Server) GetNoteHandler(c *gin.Context) {
    id := c.Param("id")
    
    userIdValue, exists := c.Get("userId")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
        return
    }

    userId, ok := userIdValue.(string)
    if !ok {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID type"})
        return
    }

    note, err := s.db.GetNote(c.Request.Context(), id, userId)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, note)
}

func (s * Server) GetNotesHandler(c *gin.Context) {
    userIdValue, exists := c.Get("userId")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
        return
    }

    userId, ok := userIdValue.(string)
    if !ok {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID type"})
        return
    }

    notes, err := s.db.GetNotes(c.Request.Context(), userId)

    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, notes)
}

type ArticleMetadata struct {
    Title       string    `json:"title"`
    SiteTitle   string    `json:"site_title"`
    URL         string    `json:"url"`
    Author      string    `json:"author"`
    Description string    `json:"description"`
    Image       string    `json:"image"`
    Headings    []string  `json:"headings"`
    Content     string    `json:"content"`
    PublishDate string    `json:"publish_date"`
    Category    string    `json:"category"`
    Language    string    `json:"language"`
    ReadingTime int       `json:"reading_time"`
    ScrapedAt   time.Time `json:"scraped_at"`
}

func cleanText(input string) string {
    if input == "" {
        return ""
    }

    decoded := html.UnescapeString(input)

    cleaned := regexp.MustCompile(`\s+`).ReplaceAllString(decoded, " ")
    cleaned = regexp.MustCompile(`[\x00-\x1F\x7F]`).ReplaceAllString(cleaned, "")
    cleaned = regexp.MustCompile(`<[^>]*>`).ReplaceAllString(cleaned, "")

    // Handle quotes
    cleaned = regexp.MustCompile(`["""]`).ReplaceAllString(cleaned, `"`)
    cleaned = regexp.MustCompile(`['']`).ReplaceAllString(cleaned, `'`)
    
    // Remove any remaining HTML entities
    cleaned = regexp.MustCompile(`&[a-zA-Z]+;`).ReplaceAllString(cleaned, " ")
    
    // Clean spaces around punctuation
    cleaned = regexp.MustCompile(`\s+([.,!?])`).ReplaceAllString(cleaned, "$1")
    
    return strings.TrimSpace(cleaned)
}

func (s *Server) GetArticleContent(c *gin.Context) {
    websiteUrl := c.Query("url")
    
    if !strings.HasPrefix(websiteUrl, "http") {
        c.JSON(400, gin.H{"error": "Invalid URL format"})
        return
    }

    collector := colly.NewCollector(
        colly.UserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"),
    )

    metadata := ArticleMetadata{
        URL:       websiteUrl,
        ScrapedAt: time.Now(),
    }

    var contentBuilder strings.Builder

    collector.OnHTML("meta[property='og:site_name']", func(e *colly.HTMLElement) {
        metadata.SiteTitle = cleanText(e.Attr("content"))
    })

    collector.OnHTML(`meta[name="author"], meta[property="article:author"], .author, [rel="author"]`, func(e *colly.HTMLElement) {
        if metadata.Author == "" {
            metadata.Author = cleanText(e.Text)
            if metadata.Author == "" {
                metadata.Author = cleanText(e.Attr("content"))
            }
        }
    })

    collector.OnHTML(`meta[property="article:published_time"], meta[name="publish-date"]`, func(e *colly.HTMLElement) {
        metadata.PublishDate = e.Attr("content")
    })

    collector.OnHTML(`html`, func(e *colly.HTMLElement) {
        metadata.Language = e.Attr("lang")
    })

    collector.OnHTML(`meta[property="article:section"], meta[name="category"]`, func(e *colly.HTMLElement) {
        metadata.Category = cleanText(e.Attr("content"))
    })

    collector.OnHTML("article, .article-content, .post-content, main", func(e *colly.HTMLElement) {
        e.ForEach("p", func(_ int, el *colly.HTMLElement) {
            text := cleanText(el.Text)
            if text != "" {
                contentBuilder.WriteString(text)
                contentBuilder.WriteString(" ")
            }
        })
    })

    collector.OnHTML("body", func(e *colly.HTMLElement) {
        if contentBuilder.Len() == 0 {
            e.ForEach("p", func(_ int, el *colly.HTMLElement) {
                text := cleanText(el.Text)
                if text != "" {
                    contentBuilder.WriteString(text)
                    contentBuilder.WriteString(" ")
                }
            })
        }
    })

    collector.OnHTML(`meta[property="og:title"], meta[name="twitter:title"], title`, func(e *colly.HTMLElement) {
        if metadata.Title == "" {
            metadata.Title = cleanText(e.Attr("content"))
            if metadata.Title == "" {
                metadata.Title = cleanText(e.Text)
            }
        }
    })

    collector.OnHTML(`meta[name="description"], meta[property="og:description"]`, func(e *colly.HTMLElement) {
        if metadata.Description == "" {
            metadata.Description = cleanText(e.Attr("content"))
        }
    })

    collector.OnHTML(`meta[property="og:image"], meta[name="twitter:image"]`, func(e *colly.HTMLElement) {
        if metadata.Image == "" {
            metadata.Image = e.Attr("content")
        }
    })

    collector.OnHTML("h1, h2, h3", func(e *colly.HTMLElement) {
        text := cleanText(e.Text)
        if text != "" {
            metadata.Headings = append(metadata.Headings, text)
        }
    })

    err := collector.Visit(websiteUrl)
    if err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    metadata.Content = cleanText(contentBuilder.String())
    
    wordCount := len(strings.Fields(metadata.Content))
    metadata.ReadingTime = (wordCount + 199) / 200

    

    c.Header("Content-Type", "application/json")
    c.JSON(http.StatusOK, metadata)
}
