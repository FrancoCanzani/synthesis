import { useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export function useAiChat() {
  const [inputPrompt, setInputPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputPrompt(e.target.value);
  }

  const handleSubmit = async () => {
    setIsLoading(true);
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputPrompt,
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    try {
      const response = await fetch(`${API_URL}/ai/assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: inputPrompt, messages: messages }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let done = false;
        let accumulatedContent = '';

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          const chunk = decoder.decode(value, { stream: true });
          accumulatedContent += chunk;

          setMessages((prevMessages) => {
            const lastMessage = prevMessages[prevMessages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              return [
                ...prevMessages.slice(0, -1),
                { ...lastMessage, content: accumulatedContent },
              ];
            } else {
              return [
                ...prevMessages,
                {
                  id: Date.now().toString(),
                  role: 'assistant',
                  content: accumulatedContent,
                },
              ];
            }
          });
        }
      }
      setInputPrompt('');
    } catch (error) {
      console.error('Error fetching completion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { inputPrompt, handleInputChange, messages, isLoading, handleSubmit };
}
