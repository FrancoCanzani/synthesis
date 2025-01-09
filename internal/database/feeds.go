package database

import (
	"context"
	"fmt"
	"synthesis/internal/models"
	"time"
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
            feed_link, user_id, title, description, link, image_url, image_title, published,
            published_parsed, updated, updated_parsed, guid, read,
            starred, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	for _, item := range items {
		_, err = tx.ExecContext(ctx, itemQuery,
			item.FeedLink,
			item.UserId,
			item.Title,
			item.Description,
			item.Link,
			feed.ImageUrl,
			feed.ImageTitle,
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
	FeedLink      string            `json:"feedLink"`
	Link          *string            `json:"link,omitempty"`
	Title         *string            `json:"title,omitempty"`
	Description   *string            `json:"description,omitempty"`
	ImageUrl      *string            `json:"imageUrl,omitempty"`
	ImageTitle    *string            `json:"imageTitle,omitempty"`
	UpdatedParsed *time.Time        `json:"updatedParsed,omitempty"`
	Items         []models.FeedItem `json:"items"`
}

func (s *service) GetFeeds(ctx context.Context, userId string) ([]FeedWithItems, error) {
	query := `
        SELECT 
            f.feed_link,
            f.title,
            f.link,
            f.description,
            f.image_url,
            f.image_title,
            f.updated_parsed,
            fi.id,
            fi.title AS item_title,
            fi.description AS item_description,
            fi.link AS item_link,
            fi.image_url AS item_image_url,
            fi.image_title AS item_image_title,
            fi.published_parsed,
            fi.guid,
            fi.read,
            fi.starred
        FROM feeds f
        LEFT JOIN feeds_items fi ON (
            fi.feed_link = f.feed_link 
            AND fi.user_id = ?
        )
        WHERE f.user_id = ?
        ORDER BY f.feed_link, fi.published_parsed DESC`

	rows, err := s.db.QueryContext(ctx, query, userId, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	feedsMap := make(map[string]*FeedWithItems)
	var feeds []FeedWithItems

	for rows.Next() {
		var feed struct {
			FeedLink      string
			Title         *string
			Link          *string
			Description   *string
			ImageUrl      *string
			ImageTitle    *string
			UpdatedParsed *time.Time
			ItemId        int64
			ItemTitle     *string
			ItemDesc      *string
			ItemLink      *string
			ItemImageUrl  *string
			ItemImageTitle *string
			ItemPublished *time.Time
			ItemGUID      *string
			ItemRead      bool
			ItemStarred   bool
		}

		err := rows.Scan(
			&feed.FeedLink,
			&feed.Title,
			&feed.Link,
			&feed.Description,
			&feed.ImageUrl,
			&feed.ImageTitle,
			&feed.UpdatedParsed,
			&feed.ItemId,
			&feed.ItemTitle,
			&feed.ItemDesc,
			&feed.ItemLink,
			&feed.ItemImageUrl,
			&feed.ItemImageTitle,
			&feed.ItemPublished,
			&feed.ItemGUID,
			&feed.ItemRead,
			&feed.ItemStarred,
		)
		if err != nil {
			return nil, err
		}

		if feedsMap[feed.FeedLink] == nil {
			feedsMap[feed.FeedLink] = &FeedWithItems{
				FeedLink:      feed.FeedLink,
				Title:         feed.Title,
				Link:          feed.Link,
				Description:   feed.Description,
				ImageUrl:      feed.ImageUrl,
				ImageTitle:    feed.ImageTitle,
				UpdatedParsed: feed.UpdatedParsed,
				Items:         make([]models.FeedItem, 0),
			}
		}

		item := models.FeedItem{
			Id:              feed.ItemId,
			Title:           feed.ItemTitle,
			Description:     feed.ItemDesc,
			Link:            feed.ItemLink,
			ImageUrl:        feed.ItemImageUrl,
			ImageTitle:      feed.ItemImageTitle,
			PublishedParsed: feed.ItemPublished,
			GUID:            feed.ItemGUID,
			Read:            feed.ItemRead,
			Starred:         feed.ItemStarred,
		}
			feedsMap[feed.FeedLink].Items = append(feedsMap[feed.FeedLink].Items, item)
		}
	

	if err = rows.Err(); err != nil {
		return nil, err
	}

	for _, feed := range feedsMap {
		feeds = append(feeds, *feed)
	}

	return feeds, nil
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

func (s *service) UpdateFeedItem(ctx context.Context, link string, userId string, attribute string, value any) error {
	query := fmt.Sprintf(`
		UPDATE feeds_items
		SET %s = ?
		WHERE link = ? AND user_id = ?
	`, attribute)

	_, err := s.db.ExecContext(ctx, query, value, link, userId)
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