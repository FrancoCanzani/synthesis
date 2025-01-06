package database

import (
	"context"
	"database/sql"
	"fmt"
	"synthesis/internal/models"
	"time"
)

func (s *service) FeedExists(ctx context.Context, link string, userId string) (bool, error) {
	var exists bool
	query := "SELECT EXISTS(SELECT 1 FROM feeds_sources WHERE link = ? AND user_id = ?)"
	err := s.db.QueryRowContext(ctx, query, link, userId).Scan(&exists)
	return exists, err
}

func (s *service) CreateFeed(ctx context.Context, source *models.FeedSource, feed *models.Feed, items []*models.FeedItem) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	sourceQuery := `
        INSERT INTO feeds_sources (
            link, user_id, update_frequency, active, failure_count, 
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`

	_, err = tx.ExecContext(ctx, sourceQuery,
		source.Link,
		source.UserId,
		source.UpdateFrequency,
		source.Active,
		source.FailureCount,
		source.CreatedAt,
		source.UpdatedAt,
	)
	if err != nil {
		return err
	}

	feedQuery := `
        INSERT INTO feeds (
            link, user_id, title, description, updated, 
            updated_parsed, feed_type, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`

	_, err = tx.ExecContext(ctx, feedQuery,
		feed.Link,
		feed.UserId,
		feed.Title,
		feed.Description,
		feed.Updated,
		feed.UpdatedParsed,
		feed.FeedType,
		feed.CreatedAt,
		feed.UpdatedAt,
	)
	if err != nil {
		return err
	}

	itemQuery := `
        INSERT INTO feeds_items (
            source_link, user_id, title, description, link, published,
            published_parsed, updated, updated_parsed, guid, read,
            starred, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	for _, item := range items {
		_, err = tx.ExecContext(ctx, itemQuery,
			item.SourceLink,
			item.UserId,
			item.Title,
			item.Description,
			item.Link,
			item.Published,
			item.PublishedParsed,
			item.Updated,
			item.UpdatedParsed,
			item.GUID,
			item.Read,
			item.Starred,
			item.CreatedAt,
			item.UpdatedAt,
		)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

type FeedWithItems struct {
	Link          string            `json:"link"`
	Title         string            `json:"title"`
	Description   string            `json:"description"`
	UpdatedParsed *time.Time        `json:"updated_parsed"`
	Items         []models.FeedItem `json:"items"`
}

func (s *service) GetFeeds(ctx context.Context, userId string) ([]FeedWithItems, error) {
	query := `
        WITH user_feeds AS (
            SELECT 
                f.link,
                f.title,
                f.description,
                f.updated_parsed
            FROM feeds f
            WHERE f.user_id = ?
        )
        SELECT 
            uf.*,
            fi.id,
            fi.title as item_title,
            fi.description as item_description,
            fi.link as item_link,
            fi.published_parsed,
            fi.guid,
            fi.read,
            fi.starred
        FROM user_feeds uf
        LEFT JOIN feeds_items fi ON fi.source_link = uf.link AND fi.user_id = ?
        ORDER BY uf.link, fi.published_parsed DESC`

	rows, err := s.db.QueryContext(ctx, query, userId, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	feedsMap := make(map[string]*FeedWithItems)
	var feeds []FeedWithItems

	for rows.Next() {
		var feed struct {
			Link          string
			Title         string
			Description   string
			UpdatedParsed *time.Time
			ItemID        sql.NullInt64
			ItemTitle     sql.NullString
			ItemDesc      sql.NullString
			ItemLink      sql.NullString
			ItemPublished *time.Time
			ItemGUID      sql.NullString
			ItemRead      sql.NullBool
			ItemStarred   sql.NullBool
		}

		err := rows.Scan(
			&feed.Link,
			&feed.Title,
			&feed.Description,
			&feed.UpdatedParsed,
			&feed.ItemID,
			&feed.ItemTitle,
			&feed.ItemDesc,
			&feed.ItemLink,
			&feed.ItemPublished,
			&feed.ItemGUID,
			&feed.ItemRead,
			&feed.ItemStarred,
		)
		if err != nil {
			return nil, err
		}

		if feedsMap[feed.Link] == nil {
			feedsMap[feed.Link] = &FeedWithItems{
				Link:          feed.Link,
				Title:         feed.Title,
				Description:   feed.Description,
				UpdatedParsed: feed.UpdatedParsed,
				Items:         make([]models.FeedItem, 0),
			}
		}

		if feed.ItemID.Valid {
			item := models.FeedItem{
				Id:              feed.ItemID.Int64,
				Title:           feed.ItemTitle.String,
				Description:     feed.ItemDesc.String,
				Link:            feed.ItemLink.String,
				PublishedParsed: feed.ItemPublished,
				GUID:            feed.ItemGUID.String,
				Read:            feed.ItemRead.Bool,
				Starred:         feed.ItemStarred.Bool,
			}
			feedsMap[feed.Link].Items = append(feedsMap[feed.Link].Items, item)
		}
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	for _, feed := range feedsMap {
		feeds = append(feeds, *feed)
	}

	return feeds, nil
}

func (s *service) DeleteFeed(ctx context.Context, link string, userId string) error {
	query := `
	DELETE FROM feeds_sources
	WHERE link = ? AND user_id = ?
`

	result, err := s.db.ExecContext(ctx, query, link, userId)
	if err != nil {
		return fmt.Errorf("failed to delete feed: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rows == 0 {
		return fmt.Errorf("feed not found: %v", link)
	}

	return nil
}
