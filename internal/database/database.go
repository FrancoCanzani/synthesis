package database

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"synthesis/internal/models"
	"time"

	_ "github.com/joho/godotenv/autoload"
	_ "github.com/mattn/go-sqlite3"
)

type Service interface {
	Health() map[string]string

	CreateNote(ctx context.Context, note *models.Note) (*models.Note, error)
	GetNote(ctx context.Context, id string, userId string) (*models.Note, error)
	GetPublicNote(ctx context.Context, id string) (*models.Note, error)
	GetNotes(ctx context.Context, userId string) ([]*models.Note, error)
	UpdateNote(ctx context.Context, note *models.Note, userId string) (*models.Note, error)
	DeleteNote(ctx context.Context, id string, userId string) error
	GetArticle(ctx context.Context, userId string, articleId string) (*models.Article, error)
	GetArticles(ctx context.Context, user_id string) ([]*models.Article, error)
	CreateArticle(ctx context.Context, article *models.Article) (*models.Article, error)
	DeleteArticle(ctx context.Context, id string, user_id string) error

	Close() error
}

type service struct {
	db *sql.DB
}

var (
	dbPath     = "./internal/database/dev.synthesis.db"
	dbInstance *service
)

func init() {
	// Check environment
	env := os.Getenv("APP_ENV")

	switch env {
	case "production":
		// In production, use the fly.io volume path
		dbPath = "./internal/database/prod.synthesis.db"
	case "test":
		dbPath = "./internal/database/test.synthesis.db"
	}

	// Ensure database directory exists
	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		log.Fatalf("failed to create database directory: %v", err)
	}
}

func New() Service {
	// Reuse Connection
	if dbInstance != nil {
		return dbInstance
	}

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatal(err)
	}

	// Enable Write-Ahead Logging for better concurrent access
	if _, err := db.Exec("PRAGMA journal_mode=WAL"); err != nil {
		log.Fatal(err)
	}

	dbInstance = &service{
		db: db,
	}

	err = dbInstance.initTables()

	if err != nil {
		log.Fatal(err)
	}

	return dbInstance
}

// Health checks the health of the database connection by pinging the database.
func (s *service) Health() map[string]string {
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	stats := make(map[string]string)

	// Ping the database
	err := s.db.PingContext(ctx)
	if err != nil {
		stats["status"] = "down"
		stats["error"] = fmt.Sprintf("db down: %v", err)
		log.Fatalf("db down: %v", err)
		return stats
	}

	// Database is up, add more statistics
	stats["status"] = "up"
	stats["message"] = "It's healthy"

	// Get database stats (like open connections, in use, idle, etc.)
	dbStats := s.db.Stats()
	stats["open_connections"] = strconv.Itoa(dbStats.OpenConnections)
	stats["in_use"] = strconv.Itoa(dbStats.InUse)
	stats["idle"] = strconv.Itoa(dbStats.Idle)
	stats["wait_count"] = strconv.FormatInt(dbStats.WaitCount, 10)
	stats["wait_duration"] = dbStats.WaitDuration.String()
	stats["max_idle_closed"] = strconv.FormatInt(dbStats.MaxIdleClosed, 10)
	stats["max_lifetime_closed"] = strconv.FormatInt(dbStats.MaxLifetimeClosed, 10)

	// Evaluate stats to provide a health message
	if dbStats.OpenConnections > 40 { // Assuming 50 is the max for this example
		stats["message"] = "The database is experiencing heavy load."
	}

	if dbStats.WaitCount > 1000 {
		stats["message"] = "The database has a high number of wait events, indicating potential bottlenecks."
	}

	if dbStats.MaxIdleClosed > int64(dbStats.OpenConnections)/2 {
		stats["message"] = "Many idle connections are being closed, consider revising the connection pool settings."
	}

	if dbStats.MaxLifetimeClosed > int64(dbStats.OpenConnections)/2 {
		stats["message"] = "Many connections are being closed due to max lifetime, consider increasing max lifetime or revising the connection usage pattern."
	}

	return stats
}

func (s *service) initTables() error {
	queryNotes := `
    CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        public BOOLEAN NOT NULL DEFAULT FALSE,
        public_id TEXT,
        deleted BOOLEAN NOT NULL DEFAULT FALSE,
        deleted_at DATETIME,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
    )`

	_, err := s.db.Exec(queryNotes)
	if err != nil {
		return err
	}

	queryArticles := `
    CREATE TABLE IF NOT EXISTS articles (
        id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL,
        title TEXT,
        site_name TEXT,
        url TEXT NOT NULL,
        author TEXT,
		excerpt TEXT,
		image TEXT,
		favicon TEXT,
		content TEXT,
		text_content TEXT,
		published_time DATETIME,
		modified_time DATETIME,
		language TEXT,
		length INTEGER,
		scraped_at DATETIME NOT NULL
    )`

	_, err = s.db.Exec(queryArticles)
	if err != nil {
		return err
	}

	queryFeedsSources := `
    CREATE TABLE IF NOT EXISTS feeds_sources (
        link TEXT PRIMARY KEY,
        source_link TEXT NOT NULL,
        update_frequency TEXT NOT NULL,
        last_fetch DATETIME,
        active BOOLEAN,
        failure_count INTEGER,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
    )`

	_, err = s.db.Exec(queryFeedsSources)
	if err != nil {
		return err
	}

	queryFeeds := `
    CREATE TABLE IF NOT EXISTS feeds (
        link TEXT PRIMARY KEY,
        source_link TEXT NOT NULL,
        title TEXT,
        description TEXT,
        updated DATETIME,
        updated_parsed DATETIME,
        feed_type TEXT,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (source_link) REFERENCES feeds_sources(source_link) ON DELETE CASCADE
    )`

	_, err = s.db.Exec(queryFeeds)
	if err != nil {
		return err
	}

	queryFeedsItems := `
    CREATE TABLE IF NOT EXISTS feeds_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_link TEXT NOT NULL,
        title TEXT,
        description TEXT,
        link TEXT,
        links TEXT,
        published DATETIME,
        published_parsed DATETIME,
        updated DATETIME,
        updated_parsed DATETIME,
        guid TEXT UNIQUE,
        read BOOLEAN DEFAULT FALSE,
        starred BOOLEAN DEFAULT FALSE,
        primary_author_id INTEGER,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (source_link) REFERENCES feeds(source_link) ON DELETE CASCADE
    )`

	_, err = s.db.Exec(queryFeedsItems)
	if err != nil {
		return err
	}

	return nil
}

func (s *service) CreateNote(ctx context.Context, note *models.Note) (*models.Note, error) {
	query := `
        INSERT INTO notes (id, user_id, title, content, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
    `
	now := time.Now()
	note.CreatedAt = now
	note.UpdatedAt = now

	_, err := s.db.ExecContext(ctx, query,
		note.Id,
		note.UserId,
		note.Title,
		note.Content,
		note.CreatedAt,
		note.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create note: %w", err)
	}

	return note, nil
}

func (s *service) GetNote(ctx context.Context, id string, userId string) (*models.Note, error) {
	query := `
        SELECT *
        FROM notes
        WHERE id = ? AND user_id = ?
    `

	note := &models.Note{}
	err := s.db.QueryRowContext(ctx, query, id, userId).Scan(
		&note.Id,
		&note.UserId,
		&note.Title,
		&note.Content,
		&note.Public,
		&note.PublicId,
		&note.Deleted,
		&note.DeletedAt,
		&note.CreatedAt,
		&note.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("note not found or is no public: %v", id)
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get note: %w", err)
	}

	return note, nil
}

func (s *service) GetPublicNote(ctx context.Context, publicId string) (*models.Note, error) {
	query := `
        SELECT *
        FROM notes
        WHERE public_id = ? AND public = TRUE
    `

	note := &models.Note{}
	err := s.db.QueryRowContext(ctx, query, publicId).Scan(
		&note.Id,
		&note.UserId,
		&note.Title,
		&note.Content,
		&note.Public,
		&note.PublicId,
		&note.Deleted,
		&note.DeletedAt,
		&note.CreatedAt,
		&note.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("note not found: %v", publicId)
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get note: %w", err)
	}

	return note, nil
}

func (s *service) GetNotes(ctx context.Context, userId string) ([]*models.Note, error) {
	query := `
        SELECT *
        FROM notes
        WHERE user_id = ?
    `

	rows, err := s.db.QueryContext(ctx, query, userId)
	if err != nil {
		return nil, fmt.Errorf("failed to query notes: %w", err)
	}
	defer rows.Close()

	var notes []*models.Note
	for rows.Next() {
		note := &models.Note{}
		err := rows.Scan(
			&note.Id,
			&note.UserId,
			&note.Title,
			&note.Content,
			&note.Public,
			&note.PublicId,
			&note.Deleted,
			&note.DeletedAt,
			&note.CreatedAt,
			&note.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan note: %w", err)
		}
		notes = append(notes, note)
	}

	return notes, nil
}

func (s *service) DeleteNote(ctx context.Context, id string, userId string) error {
	query := `
        DELETE FROM notes
        WHERE id = ? AND user_id = ?
    `

	result, err := s.db.ExecContext(ctx, query, id, userId)
	if err != nil {
		return fmt.Errorf("failed to delete note: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rows == 0 {
		return fmt.Errorf("note not found: %v", id)
	}

	return nil
}

func (s *service) UpdateNote(ctx context.Context, note *models.Note, userId string) (*models.Note, error) {
	query := `
        UPDATE notes 
        SET title = ?, content = ?, updated_at = ?, public = ?, public_id = ?, deleted = ?, deleted_at = ?
        WHERE id = ? AND user_id = ?
    `

	now := time.Now()

	// Handle nullable PublicId
	var publicId interface{}
	if note.PublicId != nil {
		publicId = *note.PublicId
	} else {
		publicId = nil
	}

	result, err := s.db.ExecContext(ctx, query,
		note.Title,
		note.Content,
		now,
		note.Public,
		publicId,
		note.Deleted,
		note.DeletedAt,
		note.Id,
		userId,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to update note: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return nil, fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rows == 0 {
		return nil, fmt.Errorf("note not found: %v", note.Id)
	}

	note.UpdatedAt = now
	return note, nil
}

func (s *service) GetArticles(ctx context.Context, userId string) ([]*models.Article, error) {
	query := `
        SELECT *
        FROM articles
        WHERE user_id = ?
    `

	rows, err := s.db.QueryContext(ctx, query, userId)
	if err != nil {
		return nil, fmt.Errorf("failed to query notes: %w", err)
	}
	defer rows.Close()

	var articles []*models.Article
	for rows.Next() {
		article := &models.Article{}

		err := rows.Scan(
			&article.Id,
			&article.UserId,
			&article.Title,
			&article.SiteName,
			&article.URL,
			&article.Author,
			&article.Excerpt,
			&article.Image,
			&article.Favicon,
			&article.Content,
			&article.TextContent,
			&article.PublishedTime,
			&article.ModifiedTime,
			&article.Language,
			&article.Length,
			&article.ScrapedAt,
		)

		if err != nil {
			return nil, fmt.Errorf("failed to scan note: %w", err)
		}
		articles = append(articles, article)
	}

	return articles, nil
}

func (s *service) GetArticle(ctx context.Context, userId string, articleId string) (*models.Article, error) {
	query := `
        SELECT *
        FROM articles
        WHERE user_id = ? AND id = ?
    `

	article := &models.Article{}
	err := s.db.QueryRowContext(ctx, query, userId, articleId).Scan(
		&article.Id,
		&article.UserId,
		&article.Title,
		&article.SiteName,
		&article.URL,
		&article.Author,
		&article.Excerpt,
		&article.Image,
		&article.Favicon,
		&article.Content,
		&article.TextContent,
		&article.PublishedTime,
		&article.ModifiedTime,
		&article.Language,
		&article.Length,
		&article.ScrapedAt,
	)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("article not found: %v", articleId)
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get article: %w", err)
	}

	return article, nil
}

func (s *service) CreateArticle(ctx context.Context, article *models.Article) (*models.Article, error) {
	query := `INSERT INTO articles (id, user_id, title, site_name, url, author, excerpt, image, favicon, content, text_content, published_time, modified_time, language, length, scraped_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	_, err := s.db.ExecContext(ctx, query,
		article.Id,
		article.UserId,
		article.Title,
		article.SiteName,
		article.URL,
		article.Author,
		article.Excerpt,
		article.Image,
		article.Favicon,
		article.Content,
		article.TextContent,
		article.PublishedTime,
		article.ModifiedTime,
		article.Language,
		article.Length,
		article.ScrapedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create article: %w", err)
	}

	return article, nil
}

func (s *service) DeleteArticle(ctx context.Context, id string, userId string) error {
	query := `
        DELETE FROM articles
        WHERE id = ? AND user_id = ?
    `

	result, err := s.db.ExecContext(ctx, query, id, userId)
	if err != nil {
		return fmt.Errorf("failed to delete article: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rows == 0 {
		return fmt.Errorf("note not found: %v", id)
	}

	return nil
}

func (s *service) Close() error {
	log.Printf("Disconnected from database: %s", dbPath)
	return s.db.Close()
}
