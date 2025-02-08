package database

import (
	"context"
	"fmt"
	"log"
	"synthesis/internal/models"
	"time"

	"github.com/mmcdole/gofeed"
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
            feed_link, link, user_id, title, description, label, image_url, image_title, updated, 
            updated_parsed, feed_type, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	_, err = tx.ExecContext(ctx, feedQuery,
		feed.FeedLink,
		feed.Link,
		feed.UserId,
		feed.Title,
		feed.Description,
		feed.Label,
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
            f.label as feed_label, f.image_url as feed_image_url, f.feed_type  -- Added f.label
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
            &item.Feed.Title, &item.Feed.Description, &item.Feed.Label, &item.Feed.ImageUrl, &item.Feed.FeedType, // Added &item.Feed.Label
        )
        if err != nil {
            return nil, err
        }
        items = append(items, item)
    }

    return items, rows.Err()
}

func (s *service) DeleteFeed(ctx context.Context, feedLink string, userId string) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("starting transaction: %w", err)
	}
	defer func() {
		if r := recover(); r != nil || err != nil {
			tx.Rollback()
			log.Printf("Transaction rolled back: %v", r)
		}
	}()

	// 1. Delete Feed Items:
	_, err = tx.ExecContext(ctx, "DELETE FROM feeds_items WHERE feed_link = ? AND user_id = ?", feedLink, userId)
	if err != nil {
		tx.Rollback() // Rollback on error
		return fmt.Errorf("deleting feed items: %w", err)
	}

	// 2. Delete Feeds:
	_, err = tx.ExecContext(ctx, "DELETE FROM feeds WHERE feed_link = ? AND user_id = ?", feedLink, userId)
	if err != nil {
		tx.Rollback() // Rollback on error
		return fmt.Errorf("deleting feeds: %w", err)
	}

	// 3. Delete Feed Source:
	result, err := tx.ExecContext(ctx, "DELETE FROM feeds_sources WHERE feed_link = ? AND user_id = ?", feedLink, userId)
	if err != nil {
		tx.Rollback() // Rollback on error
		return fmt.Errorf("deleting feed source: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		tx.Rollback() // Rollback on error
		return fmt.Errorf("getting affected rows: %w", err)
	}
	if rows == 0 {
		tx.Rollback() // Rollback if feed source not found
		return fmt.Errorf("feed source not found: %s", feedLink)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("committing transaction: %w", err)
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

func (s *service) UpdateAllFeeds(ctx context.Context) error {
	sources, err := s.getAllActiveFeedSources(ctx)
	if err != nil {
		return fmt.Errorf("getting active feed sources: %w", err)
	}

	for _, source := range sources {
		err := s.updateFeed(ctx, source)
		if err != nil {
			log.Printf("Error updating feed %s: %v", source.FeedLink, err)
		}
	}
	return nil
}

func (s *service) getAllActiveFeedSources(ctx context.Context) ([]*models.FeedSource, error) {
	query := `SELECT feed_link, link, user_id, update_frequency, last_fetch, active, failure_count, created_at, updated_at FROM feeds_sources WHERE active = TRUE`
	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sources []*models.FeedSource
	for rows.Next() {
		source := &models.FeedSource{}
		err := rows.Scan(&source.FeedLink, &source.Link, &source.UserId, &source.UpdateFrequency, &source.LastFetch, &source.Active, &source.FailureCount, &source.CreatedAt, &source.UpdatedAt)
		if err != nil {
			return nil, err
		}
		sources = append(sources, source)
	}
	return sources, rows.Err()
}

func (s *service) updateFeed(ctx context.Context, source *models.FeedSource) error {
    fp := gofeed.NewParser()
    feed, err := fp.ParseURLWithContext(source.FeedLink, ctx)
    if err != nil {
        _, errUpdate := s.db.ExecContext(ctx, "UPDATE feeds_sources SET failure_count = failure_count + 1, updated_at = ? WHERE feed_link = ?", time.Now(), source.FeedLink)
        if errUpdate != nil {
            return fmt.Errorf("parsing feed %w, updating failure count %w", err, errUpdate)
        }
        return fmt.Errorf("parsing feed: %w", err)
    }

    tx, err := s.db.BeginTx(ctx, nil)
    if err != nil {
        return fmt.Errorf("starting transaction: %w", err)
    }
    defer tx.Rollback()

    _, err = tx.ExecContext(ctx, "UPDATE feeds_sources SET last_fetch = ?, updated_at = ?, failure_count = 0 WHERE feed_link = ?", time.Now(), time.Now(), source.FeedLink)
    if err != nil {
        return fmt.Errorf("updating feed source: %w", err)
    }

    if feed != nil && feed.Image != nil && feed.Image.URL != "" {
        _, err = tx.ExecContext(ctx, "UPDATE feeds SET title = ?, description = ?, updated = ?, updated_parsed = ?, image_url = ?, image_title = ?, updated_at = ? WHERE feed_link = ?",
            feed.Title, feed.Description, feed.Updated, feed.UpdatedParsed, feed.Image.URL, feed.Image.Title, time.Now(), source.FeedLink)
        if err != nil {
            return fmt.Errorf("updating feed: %w", err)
        }
    } else if feed != nil {
         _, err = tx.ExecContext(ctx, "UPDATE feeds SET title = ?, description = ?, updated = ?, updated_parsed = ?, updated_at = ? WHERE feed_link = ?",
            feed.Title, feed.Description, feed.Updated, feed.UpdatedParsed, time.Now(), source.FeedLink)
        if err != nil {
            return fmt.Errorf("updating feed: %w", err)
        }
    }


    if feed != nil {
        for _, item := range feed.Items {
            exists, err := s.feedItemExists(ctx, &item.GUID, source.FeedLink)
            if err != nil {
                return fmt.Errorf("checking if feed item exists: %w", err)
            }
            if !exists {
                feedItem := &models.FeedItem{
                    UserId:          source.UserId,
                    Title:           &item.Title,
                    Description:     &item.Description,
                    Content:         &item.Content,
                    FeedLink:        source.FeedLink,
                    Link:            &item.Link,
                    Published:       &item.Published,
                    PublishedParsed: item.PublishedParsed,
                    Updated:         &item.Updated,
                    UpdatedParsed:   item.UpdatedParsed,
                    GUID:            &item.GUID,
                    Read:            false,
                    Starred:         false,
                    CreatedAt:       time.Now(),
                    UpdatedAt:       time.Now(),
                }

                if item.Image != nil && item.Image.URL != "" {
                    feedItem.ImageUrl = &item.Image.URL
                    if item.Image.Title != "" {
                        feedItem.ImageTitle = &item.Image.Title
                    }
                }

                itemQuery := `
                    INSERT INTO feeds_items (
                        feed_link, user_id, title, description, content, link, image_url, image_title, published,
                        published_parsed, updated, updated_parsed, guid, read,
                        starred, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

                _, err = tx.ExecContext(ctx, itemQuery,
                    feedItem.FeedLink,
                    feedItem.UserId,
                    feedItem.Title,
                    feedItem.Description,
                    feedItem.Content,
                    feedItem.Link,
                    feedItem.ImageUrl,
                    feedItem.ImageTitle,
                    feedItem.Published,
                    feedItem.PublishedParsed,
                    feedItem.Updated,
                    feedItem.UpdatedParsed,
                    feedItem.GUID,
                    feedItem.Read,
                    feedItem.Starred,
                    feedItem.CreatedAt,
                    feedItem.UpdatedAt,
                )
                if err != nil {
                    return fmt.Errorf("inserting feed item: %w", err)
                }
            }
        }
    }

    return tx.Commit()
}

func (s *service) feedItemExists(ctx context.Context, guid *string, feedLink string) (bool, error) {
	if guid == nil {
		return false, nil
	}
	var exists bool

	query := "SELECT EXISTS(SELECT 1 FROM feeds_items WHERE guid = ? AND feed_link = ?)"
	err := s.db.QueryRowContext(ctx, query, *guid, feedLink).Scan(&exists)

	return exists, err
}
