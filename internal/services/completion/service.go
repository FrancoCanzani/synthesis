package completion

import (
	"context"
	"fmt"
	"strings"

	"github.com/openai/openai-go"
)


func GenerateTextCompletion(text string) (chan string, error) {
    client := openai.NewClient()
    ctx := context.Background()

    stream := client.Chat.Completions.NewStreaming(ctx, openai.ChatCompletionNewParams{
        Messages: openai.F([]openai.ChatCompletionMessageParamUnion{
            openai.UserMessage(text),
        }),
        Seed:  openai.Int(1),
        Model: openai.F(openai.ChatModelGPT4o),
    })

    messages := make(chan string)

    go func() {
        defer close(messages)

        buffer := make([]byte, 0, 1024)
        for stream.Next() {
            evt := stream.Current()
            if len(evt.Choices) > 0 {
                chunk := evt.Choices[0].Delta.Content
                if chunk == "" {
                    continue
                }

                // Accumulate in buffer
                buffer = append(buffer, chunk...)

                // Send if we hit sentence end markers or buffer is getting large
                if strings.ContainsAny(chunk, ".!?\n") || len(buffer) > 100 {
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


