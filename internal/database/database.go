package database

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	_ "github.com/joho/godotenv/autoload"
	_ "github.com/mattn/go-sqlite3"
)

type Note struct {
    ID        string     `json:"id"`
    UserID    string     `json:"user_id"`
    Title     string    `json:"title"`
    Content   string    `json:"content"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}


type Service interface {
	Health() map[string]string

    CreateNote(ctx context.Context, note *Note) (*Note, error)
	GetNote(ctx context.Context, id string) (*Note, error)
	UpdateNote(ctx context.Context, note *Note) (*Note, error) 
    DeleteNote(ctx context.Context, id string) error

	Close() error
}

type service struct {
	db *sql.DB
}

var (
	dburl      = os.Getenv("BLUEPRINT_DB_URL")
	dbInstance *service
)

func New() Service {
    // Reuse Connection
    if dbInstance != nil {
        return dbInstance
    }

    db, err := sql.Open("sqlite3", dburl)
    if err != nil {
        // This will not be a connection error, but a DSN parse error or
        log.Fatal(err)
    }

    dbInstance = &service{
        db: db,
    }

    // Call initTables as a method on dbInstance
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
    query := `
    CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME NOT NULL,
		updated_at DATETIME NOT NULL
    )`
    
    _, err := s.db.Exec(query)
    return err
}

func (s *service) CreateNote(ctx context.Context, note *Note) (*Note, error)  {    
    query := `
        INSERT INTO notes (id, user_id, title, content, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
    `
    now := time.Now()
    note.CreatedAt = now
    note.UpdatedAt = now

    _, err := s.db.ExecContext(ctx, query,
        note.ID,     
        note.UserID,
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

func (s *service) GetNote(ctx context.Context, id string) (*Note, error) {
    query := `
        SELECT id, user_id, title, content, created_at, updated_at
        FROM notes
        WHERE id = ?
    `
    
    note := &Note{}
    err := s.db.QueryRowContext(ctx, query, id).Scan(
        &note.ID,
        &note.UserID,
        &note.Title,
        &note.Content,
        &note.CreatedAt,
        &note.UpdatedAt,
    )
    if err == sql.ErrNoRows {
        return nil, fmt.Errorf("note not found: %v", id)
    }
    if err != nil {
        return nil, fmt.Errorf("failed to get note: %w", err)
    }

    return note, nil
}

func (s *service) DeleteNote(ctx context.Context, id string) error {
    query := `
        DELETE FROM notes
        WHERE id = ?
    `
    
    result, err := s.db.ExecContext(ctx, query, id)
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

func (s *service) UpdateNote(ctx context.Context, note *Note) (*Note, error)  {
    query := `
        UPDATE notes 
        SET title = ?, content = ?, user_id = ?, updated_at = ?
        WHERE id = ?
    `
    
    now := time.Now()
    result, err := s.db.ExecContext(ctx, query,
        note.Title,
        note.Content,
        note.UserID,
        now,         
        note.ID,     
    )
    if err != nil {
        return nil, fmt.Errorf("failed to update note: %w", err)
    }

    rows, err := result.RowsAffected()
    if err != nil {
        return nil, fmt.Errorf("failed to get rows affected: %w", err)
    }
    if rows == 0 {
        return nil, fmt.Errorf("note not found: %v", note.ID)
    }

    note.UpdatedAt = now
    return note, nil
}

// Close closes the database connection.
func (s *service) Close() error {
	log.Printf("Disconnected from database: %s", dburl)
	return s.db.Close()
}

