package completion

import (
	"context"
	"fmt"
	"strings"
	"synthesis/internal/models"

	"github.com/openai/openai-go"
)

func GenerateTextCompletion(chatContent models.ChatContent) (chan string, error) {
	client := openai.NewClient()
	ctx := context.Background()

	var messageParams []openai.ChatCompletionMessageParamUnion

	messageParams = append(messageParams, openai.SystemMessage(
		"You are a text editor assistant. Keep responses clear, concise, and ready to insert into documents. Format text appropriately with paragraphs and lists when needed. Avoid meta-commentary, special characters, or explanations about your role. Focus on delivering publication-ready content that fits naturally into documents. Your reply has to be in plain text, do not use markdown or other formatting.",
	))

	for _, msg := range chatContent.Messages {
		switch msg.Role {
		case "user":
			messageParams = append(messageParams, openai.UserMessage(msg.Content))
		case "assistant":
			messageParams = append(messageParams, openai.AssistantMessage(msg.Content))
		case "system":
			messageParams = append(messageParams, openai.SystemMessage(msg.Content))
		}
	}

	messageParams = append(messageParams, openai.UserMessage(chatContent.Prompt))

	stream := client.Chat.Completions.NewStreaming(ctx, openai.ChatCompletionNewParams{
		Messages: openai.F(messageParams),
		Seed:     openai.Int(1),
		Model:    openai.F(openai.ChatModelGPT4oMini),
	})

	messages := make(chan string)

	go func() {
		defer close(messages)

		buffer := make([]byte, 0, 1024)
		for stream.Next() {
			evt := stream.Current()

			if len(evt.Choices) > 0 {
				chunk := evt.Choices[0].Delta.Content
				buffer = append(buffer, chunk...)

				// Send if we hit sentence end markers or buffer is getting large
				if strings.ContainsAny(chunk, ".!?\n") || len(buffer) > 25 {
					messages <- string(buffer)
					buffer = buffer[:0]
				}
			}
		}

		// Send any remaining text
		if len(buffer) > 0 {
			messages <- string(buffer)
		}

		if err := stream.Err(); err != nil {
			fmt.Printf("Stream error: %v\n", err)
			messages <- fmt.Sprintf("Error: %v", err)
		}
	}()

	return messages, nil
}
