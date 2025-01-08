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
	UserId    string     `json:"userId"`
	Title     string     `json:"title"`
	Content   string     `json:"content"`
	Public    bool       `json:"public"`
	PublicId  *string    `json:"publicId"`
	Deleted   bool       `json:"deleted"`
	DeletedAt *time.Time `json:"deletedAt"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
}

type Article struct {
	Id            *string    `json:"id"`
	UserId        *string    `json:"userId"`
	Title         *string    `json:"title"`
	SiteName      *string    `json:"siteName"`
	URL           string     `json:"url"`
	Author        *string    `json:"author"`
	Excerpt       *string    `json:"excerpt"`
	Image         *string    `json:"image"`
	Favicon       *string    `json:"favicon"`
	Content       *string    `json:"content"`
	TextContent   *string    `json:"textContent"`
	PublishedTime *time.Time `json:"publishedTime"`
	ModifiedTime  *time.Time `json:"modifiedTime"`
	Language      *string    `json:"language"`
	Length        *int       `json:"length"`
	ScrapedAt     time.Time  `json:"scrapedAt"`
}

type FeedSource struct {
	FeedLink        string     `json:"feedLink"`
	Link            string     `json:"link"`
	UserId          string     `json:"userId"`
	UpdateFrequency string     `json:"updateFrequency"`
	LastFetch       *time.Time `json:"lastFetch"`
	Active          bool       `json:"active"`
	FailureCount    int        `json:"failureCount"`
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt"`
}

type Feed struct {
	FeedLink      string     `json:"feedLink"`
	Link          string     `json:"link"`
	UserId        string     `json:"userId"`
	Title         string     `json:"title"`
	Description   string     `json:"description"`
	ImageUrl      *string    `json:"imageUrl"`
	ImageTitle    *string    `json:"imageTitle"`
	Updated       string     `json:"updated"`
	UpdatedParsed *time.Time `json:"updatedParsed"`
	FeedType      string     `json:"feedType"`
	CreatedAt     time.Time  `json:"createdAt"`
	UpdatedAt     time.Time  `json:"updatedAt"`
}

type FeedItem struct {
	Id              int64      `json:"id"`
	UserId          string     `json:"userId"`
	Title           string     `json:"title"`
	Description     string     `json:"description"`
	FeedLink        string     `json:"feedLink"`
	Link            string     `json:"link"`
	ImageUrl        string     `json:"imageUrl"`
	ImageTitle      string     `json:"imageTitle"`
	Published       string     `json:"published"`
	PublishedParsed *time.Time `json:"publishedParsed"`
	Updated         string     `json:"updated"`
	UpdatedParsed   *time.Time `json:"updatedParsed"`
	GUID            string     `json:"guid"`
	Read            bool       `json:"read"`
	Starred         bool       `json:"starred"`
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt"`
}
