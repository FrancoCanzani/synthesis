import { useState } from "react";
import { Message } from "../types";
import useLocalStorage from "./use-local-storage";

const API_URL = import.meta.env.VITE_API_URL;

export function useAiChat(chatId: string, editorContent: string) {
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages, clearMessages] = useLocalStorage<Message[]>(
    chatId,
    [],
  );

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputPrompt(e.target.value);
  }

  const handleSubmit = async (prompt?: string) => {
    const messageContent = prompt ?? inputPrompt;
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
    };

    setMessages((prev: Message[]) => {
      const updatedMessages = [...prev, newUserMessage];

      setIsLoading(true);
      fetch(`${API_URL}/ai/assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: messageContent,
          messages: updatedMessages,
          content: editorContent,
        }),
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (reader) {
            let done = false;
            let accumulatedContent = "";

            while (!done) {
              const { value, done: readerDone } = await reader.read();
              done = readerDone;
              const chunk = decoder.decode(value, { stream: true });
              accumulatedContent += chunk;

              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now().toString(),
                  role: "assistant",
                  content: accumulatedContent,
                },
              ]);
            }
          }
          setInputPrompt("");
        })
        .catch((error) => {
          console.error("Error fetching completion:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });

      return updatedMessages;
    });
  };

  return {
    inputPrompt,
    setInputPrompt,
    handleInputChange,
    messages,
    setMessages,
    isLoading,
    handleSubmit,
    clearMessages,
  };
}
