package database

import (
	"context"
	"database/sql"
	"fmt"
	"synthesis/internal/models"

	_ "github.com/joho/godotenv/autoload"
	_ "github.com/mattn/go-sqlite3"
)

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
