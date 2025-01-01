package models

import (
	"time"
)

type Role string

const (
	RoleUser      Role = "user"
	RoleAssistant Role = "assistant"
	RoleSystem    Role = "system"
)

type Message struct {
	Id      string `json:"id"`
	Role    Role   `json:"role"`
	Content string `json:"content"`
}

type CompletionRequest struct {
	Prompt   string    `json:"prompt"`
	Messages []Message `json:"messages"`
	Content  string    `json:"content"`
}

type Note struct {
	Id        string     `json:"id"`
	UserId    string     `json:"user_id"`
	Title     string     `json:"title"`
	Content   string     `json:"content"`
	Public    bool       `json:"public"`
	PublicId  *string    `json:"public_id"`
	Deleted   bool       `json:"deleted"`
	DeletedAt *time.Time `json:"deleted_at"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

type Article struct {
	Id            *string    `json:"id"`
	UserId        *string    `json:"user_id"`
	Title         *string    `json:"title"`
	SiteName      *string    `json:"site_name"`
	URL           string     `json:"url"`
	Author        *string    `json:"author"`
	Excerpt       *string    `json:"excerpt"`
	Image         *string    `json:"image"`
	Favicon       *string    `json:"favicon"`
	Content       *string    `json:"content"`
	TextContent   *string    `json:"text_content"`
	PublishedTime *time.Time `json:"published_time"`
	ModifiedTime  *time.Time `json:"modified_time"`
	Language      *string    `json:"language"`
	Length        *int       `json:"length"`
	ScrapedAt     time.Time  `json:"scraped_at"`
}
