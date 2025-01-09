package database

import (
	"context"
	"database/sql"
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

func (s *service) CreateFeed(ctx context.Context, source models.FeedSource, feed models.Feed, items []models.FeedItem) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	sourceQuery := `
        INSERT INTO feeds_sources (
            feed_link, link, user_id, update_frequency, active, failure_count, 
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`

	_, err = tx.ExecContext(ctx, sourceQuery,
		source.FeedLink,
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
        WITH user_feeds AS (
            SELECT 
                f.feed_link,
                f.title,
                f.link,
                f.description,
                f.image_url,
                f.image_title,
                f.updated_parsed
            FROM feeds f
            WHERE f.user_id = ?
        )
        SELECT 
            uf.feed_link,
            uf.title,
            uf.link,
            uf.description,
            uf.image_url,
            uf.image_title,
            uf.updated_parsed,
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
        FROM user_feeds uf
        LEFT JOIN feeds_items fi 
        ON fi.feed_link = uf.feed_link AND fi.user_id = ?
        ORDER BY uf.feed_link, fi.published_parsed DESC`

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
			Title         sql.NullString
			Link          sql.NullString
			Description   sql.NullString
			ImageUrl      sql.NullString
			ImageTitle    sql.NullString
			UpdatedParsed *time.Time
			ItemID        sql.NullInt64
			ItemTitle     sql.NullString
			ItemDesc      sql.NullString
			ItemLink      sql.NullString
			ItemImageUrl  sql.NullString
			ItemImageTitle sql.NullString
			ItemPublished *time.Time
			ItemGUID      sql.NullString
			ItemRead      sql.NullBool
			ItemStarred   sql.NullBool
		}

		err := rows.Scan(
			&feed.FeedLink,
			&feed.Title,
			&feed.Link,
			&feed.Description,
			&feed.ImageUrl,
			&feed.ImageTitle,
			&feed.UpdatedParsed,
			&feed.ItemID,
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
				ImageUrl:      feed.ImageUrl.String,
				ImageTitle:    feed.ImageTitle.String,
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
				ImageUrl:        feed.ItemImageUrl.String,
				ImageTitle:      feed.ItemImageTitle.String,
				PublishedParsed: feed.ItemPublished,
				GUID:            feed.ItemGUID.String,
				Read:            feed.ItemRead.Bool,
				Starred:         feed.ItemStarred.Bool,
			}
			feedsMap[feed.FeedLink].Items = append(feedsMap[feed.FeedLink].Items, item)
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


func (s *service) DeleteFeed(ctx context.Context, feedLink string, userId string) error {
	query := `
	DELETE FROM feeds_sources
	WHERE feed_link = ? AND user_id = ?
`

	result, err := s.db.ExecContext(ctx, query, feedLink, userId)
	fmt.Println(result)
	
	if err != nil {
		fmt.Println(err)
		return fmt.Errorf("failed to delete feed: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		fmt.Println(err)
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