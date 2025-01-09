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
	Link            *string     `json:"link,omitempty"`
	UserId          string     `json:"userId"`
	UpdateFrequency string     `json:"updateFrequency"`
	LastFetch       *time.Time `json:"lastFetch,omitempty"`
	Active          bool       `json:"active"`
	FailureCount    int        `json:"failureCount"`
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt"`
}

type Feed struct {
	FeedLink      string     `json:"feedLink"`               
	Link          *string     `json:"link,omitempty"`                 
	UserId        string     `json:"userId"`                
	Title         *string    `json:"title,omitempty"`       
	Description   *string    `json:"description,omitempty"` 
	ImageUrl      *string    `json:"imageUrl,omitempty"`    
	ImageTitle    *string    `json:"imageTitle,omitempty"` 
	Updated       *string     `json:"updated,omitempty"`     
	UpdatedParsed *time.Time `json:"updatedParsed,omitempty"` 
	FeedType      *string     `json:"feedType,omitempty"`             
	CreatedAt     time.Time  `json:"createdAt"`            
	UpdatedAt     time.Time  `json:"updatedAt"`            
}


type FeedItem struct {
	Id              int64      `json:"id"`
	UserId          string     `json:"userId"`
	Title           *string     `json:"title,omitempty"`
	Description     *string     `json:"description,omitempty"`
	FeedLink        string     `json:"feedLink"`
	Link            string     `json:"link"`
	ImageUrl        *string     `json:"imageUrl,omitempty"`
	ImageTitle      *string     `json:"imageTitle,omitempty"`
	Published       *string     `json:"published,omitempty"`
	PublishedParsed *time.Time `json:"publishedParsed,omitempty"`
	Updated         *string     `json:"updated,omitempty"`
	UpdatedParsed   *time.Time `json:"updatedParsed,omitempty"`
	GUID            *string     `json:"guid,omitempty"`
	Read            bool       `json:"read"`
	Starred         bool       `json:"starred"`
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt"`
}
