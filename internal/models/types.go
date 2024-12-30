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
    Content   string    `json:"content"`
}

type Note struct {
    Id        string     `json:"id"`
    UserId    string     `json:"user_id"`
    Title     string    `json:"title"`
    Content   string `json:"content"`  
    Public    bool      `json:"public"`
    PublicId  *string    `json:"public_id"`  // Can be null
    Deleted   bool      `json:"deleted"`
    DeletedAt *time.Time `json:"deleted_at"`  // Can be null    
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}