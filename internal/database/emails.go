package database

import (
	"context"
	"fmt"
	"strings"
	"synthesis/internal/models"
	"time"
)

func (s *service) SaveEmail(ctx context.Context, receivedEmail models.ReceivedEmail) (models.ReceivedEmail, error) {
	query := `INSERT INTO emails (
        recipient, recipient_alias, sender, from_name, subject, 
        body_plain, stripped_text, stripped_html, attachment_count, 
        timestamp, token, signature, starred, read, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	recipientAlias := ""
	if strings.Contains(receivedEmail.Recipient, "@") {
		recipientAlias = strings.Split(receivedEmail.Recipient, "@")[0]
	}

	now := time.Now()

	_, err := s.db.ExecContext(ctx, query,
		receivedEmail.Recipient,
		recipientAlias,
		receivedEmail.Sender,
		receivedEmail.From,
		receivedEmail.Subject,
		receivedEmail.BodyPlain,
		receivedEmail.StrippedText,
		receivedEmail.StrippedHTML,
		receivedEmail.AttachmentCount,
		receivedEmail.Timestamp,
		receivedEmail.Token,
		receivedEmail.Signature,
		false,
		false,
		now,
		now,
	)

	if err != nil {
		return receivedEmail, fmt.Errorf("saving email: %w", err)
	}

	return receivedEmail, nil
}

func (s *service) GetEmails(ctx context.Context, recipientAlias string) ([]*models.Email, error) {
	query := `SELECT * FROM emails WHERE recipient_alias = ? ORDER BY timestamp DESC`

	rows, err := s.db.QueryContext(ctx, query,
		recipientAlias,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to query emails: %w", err)
	}

	defer rows.Close()

	var emails []*models.Email

	for rows.Next() {
		email := &models.Email{}
		err := rows.Scan(
			&email.ID,
			&email.Recipient,
			&email.RecipientAlias,
			&email.Sender,
			&email.FromName,
			&email.Subject,
			&email.BodyPlain,
			&email.StrippedText,
			&email.StrippedHTML,
			&email.AttachmentCount,
			&email.Timestamp,
			&email.Token,
			&email.Signature,
			&email.Starred,
			&email.Read,
			&email.CreatedAt,
			&email.UpdatedAt,
		)

		if err != nil {
			return nil, fmt.Errorf("failed to scan email: %w", err)
		}

		emails = append(emails, email)
	}

	return emails, nil
}

func (s *service) UpdateEmailItem(ctx context.Context, id int64, recipientAlias string, attribute string, value any) error {
	query := fmt.Sprintf(`
		UPDATE emails
		SET %s = ?
		WHERE id = ? AND recipient_alias = ?
	`, attribute)

	_, err := s.db.ExecContext(ctx, query, value, id, recipientAlias)

	if err != nil {
		return fmt.Errorf("failed to update post: %w", err)
	}

	return nil
}
