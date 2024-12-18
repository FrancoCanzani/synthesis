package models

type Message struct {
    ID      string
    Role    string
    Content string
}

type ChatContent struct {
    Prompt   string   `json:"prompt"`
    Messages []Message `json:"messages"`
}