package database

import (
	"context"
	"fmt"
	"synthesis/internal/models"
)

func (s *service) FeedExists(ctx context.Context, feedLink string, userId string) (bool, error) {
	var exists bool
	query := "SELECT EXISTS(SELECT 1 FROM feeds_sources WHERE feed_link = ? AND user_id = ?)"
	err := s.db.QueryRowContext(ctx, query, feedLink, userId).Scan(&exists)
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
            feed_link, link, user_id, update_frequency, active, last_fetch, failure_count, 
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`

	_, err = tx.ExecContext(ctx, sourceQuery,
		source.FeedLink,
		source.Link,
		source.UserId,
		source.UpdateFrequency,
		source.Active,
		source.LastFetch,
		source.FailureCount,
		source.CreatedAt,
		source.UpdatedAt,
	)
	if err != nil {
		return err
	}

	feedQuery := `
        INSERT INTO feeds (
            feed_link, link, user_id, title, description, image_url, image_title, updated, 
            updated_parsed, feed_type, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	_, err = tx.ExecContext(ctx, feedQuery,
		feed.FeedLink,
		feed.Link,
		feed.UserId,
		feed.Title,
		feed.Description,
		feed.ImageUrl,
		feed.ImageTitle,
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
            feed_link, user_id, title, description, content, link, image_url, image_title, published,
            published_parsed, updated, updated_parsed, guid, read,
            starred, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	for _, item := range items {
		_, err = tx.ExecContext(ctx, itemQuery,
			item.FeedLink,
			item.UserId,
			item.Title,
			item.Description,
			item.Content,
			item.Link,
			item.ImageUrl,
			item.ImageTitle,
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


func (s *service) GetFeedItems(ctx context.Context, userId string, order string, limit int, offset int) ([]*models.FeedItemWithFeed, error) {
    query := fmt.Sprintf(`
        SELECT 
            fi.id, fi.user_id, fi.title, fi.description, fi.content, fi.feed_link, fi.link, 
            fi.image_url, fi.image_title, fi.published, fi.published_parsed, 
            fi.updated, fi.updated_parsed, fi.guid, fi.read, fi.starred, 
            fi.created_at, fi.updated_at,
            f.title as feed_title, f.description as feed_description, 
            f.image_url as feed_image_url, f.feed_type
        FROM feeds_items fi
        JOIN feeds f ON fi.feed_link = f.feed_link AND fi.user_id = f.user_id
        WHERE fi.user_id = ?
        ORDER BY fi.published_parsed %s
        LIMIT ? OFFSET ?`, order)

    rows, err := s.db.QueryContext(ctx, query, userId, limit, offset)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var items []*models.FeedItemWithFeed
    for rows.Next() {
        item := &models.FeedItemWithFeed{}
        err := rows.Scan(
            &item.Id, &item.UserId, &item.Title, &item.Description, &item.Content, &item.FeedLink, &item.Link,
            &item.ImageUrl, &item.ImageTitle, &item.Published, &item.PublishedParsed,
            &item.Updated, &item.UpdatedParsed, &item.GUID, &item.Read, &item.Starred,
            &item.CreatedAt, &item.UpdatedAt,
            &item.Feed.Title, &item.Feed.Description, &item.Feed.ImageUrl, &item.Feed.FeedType,
        )
        if err != nil {
            return nil, err
        }
        items = append(items, item)
    }

    return items, rows.Err()
}

func (s *service) DeleteFeed(ctx context.Context, feedLink string, userId string) error {
	query := `
	DELETE FROM feeds_sources
	WHERE feed_link = ? AND user_id = ?
`

	result, err := s.db.ExecContext(ctx, query, feedLink, userId)

	if err != nil {
		return fmt.Errorf("failed to delete feed: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rows == 0 {
		return fmt.Errorf("feed not found: %v", feedLink)
	}

	return nil
}

func (s *service) UpdateFeedItem(ctx context.Context, id int64, userId string, attribute string, value any) error {
	query := fmt.Sprintf(`
		UPDATE feeds_items
		SET %s = ?
		WHERE id = ? AND user_id = ?
	`, attribute)

	_, err := s.db.ExecContext(ctx, query, value, id, userId)
	if err != nil {
		return fmt.Errorf("failed to update post: %w", err)
	}

	return nil
}

func (s *service) MarkAllFeedItemsAsRead(ctx context.Context, userId string) error {
	query := `
		UPDATE feeds_items
		SET read = TRUE
		WHERE user_id = ?`

	result, err := s.db.ExecContext(ctx, query, userId)
	if err != nil {
		return fmt.Errorf("failed to update feeds: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rows == 0 {
		return fmt.Errorf("feeds not found")
	}

	return nil
}
