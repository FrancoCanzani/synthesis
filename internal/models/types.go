package models

import (
	"encoding/json"
	"time"
)

type Role string

const (
    RoleUser      Role = "user"
    RoleAssistant Role = "assistant"
    RoleSystem    Role = "system"
)

type Message struct {
    ID      string `json:"id"`
    Role    Role   `json:"role"`
    Content string `json:"content"`
}

type CompletionRequest struct {
    Prompt   string    `json:"prompt"`
    Messages []Message `json:"messages"`
    Content   string    `json:"content"`
}

type Note struct {
    ID        string     `json:"id"`
    UserID    string     `json:"user_id"`
    Title     string    `json:"title"`
    Content   json.RawMessage `json:"content"`  
    Public    bool      `json:"public"`
    PublicURL *string    `json:"public_url"`  // Can be null
    Deleted   bool      `json:"deleted"`
    DeletedAt *time.Time `json:"deleted_at"`  // Can be null    
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}