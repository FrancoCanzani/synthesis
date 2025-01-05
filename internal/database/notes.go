package database

import (
	"context"
	"database/sql"
	"fmt"
	"synthesis/internal/models"
	"time"

	_ "github.com/joho/godotenv/autoload"
	_ "github.com/mattn/go-sqlite3"
)

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