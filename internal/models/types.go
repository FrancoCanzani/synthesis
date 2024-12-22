package models

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