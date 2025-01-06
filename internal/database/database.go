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
	CreateFeed(ctx context.Context, source *models.FeedSource, feed *models.Feed, items []*models.FeedItem) error
	FeedExists(ctx context.Context, link string, userId string) (bool, error)
	GetFeeds(ctx context.Context, userId string) ([]FeedWithItems, error)
	DeleteFeed(ctx context.Context, link string, userId string) error

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

	if _, err := db.Exec("PRAGMA foreign_keys = ON"); err != nil {
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
		user_id TEXT NOT NULL,
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
		user_id TEXT NOT NULL,
        title TEXT,
        description TEXT,
        updated DATETIME,
        updated_parsed DATETIME,
        feed_type TEXT,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (link) REFERENCES feeds_sources(link) ON DELETE CASCADE
    )`

	_, err = s.db.Exec(queryFeeds)
	if err != nil {
		return err
	}

	queryFeedsItems := `
    CREATE TABLE IF NOT EXISTS feeds_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id TEXT NOT NULL,
        title TEXT,
        description TEXT,
        link TEXT,
        source_link TEXT NOT NULL,
        published DATETIME,
        published_parsed DATETIME,
        updated DATETIME,
        updated_parsed DATETIME,
        guid TEXT UNIQUE,
        read BOOLEAN DEFAULT FALSE,
        starred BOOLEAN DEFAULT FALSE,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (source_link) REFERENCES feeds(link) ON DELETE CASCADE
    )`

	_, err = s.db.Exec(queryFeedsItems)
	if err != nil {
		return err
	}

	return nil
}

func (s *service) Close() error {
	log.Printf("Disconnected from database: %s", dbPath)
	return s.db.Close()
}
