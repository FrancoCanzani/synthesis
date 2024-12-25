import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

import { LoaderCircle, MoreHorizontal, SendHorizonal } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAiChat } from '@/lib/hooks/use-ai-chat';
import { copyToClipboard } from '@/lib/helpers';
import { Editor } from '@tiptap/core';

export default function AiAssistant({ editor }: { editor: Editor }) {
  const { messages, handleInputChange, handleSubmit, inputPrompt, isLoading } =
    useAiChat(editor.getText());

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className='pb-2 flex flex-col w-full mx-auto text-sm h-full'>
      <div className='flex-1 overflow-hidden'>
        <div className='h-full overflow-y-auto p-2 rounded-sm bg-muted/20'>
          {messages.length > 0 ? (
            <div className='space-y-2'>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg px-3 py-1.5',
                      message.role === 'user'
                        ? 'bg-primary/90 dark:bg-primary/30 text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <div className='flex items-start justify-between'>
                      <p className='text-sm whitespace-pre-wrap'>
                        {message.content}
                      </p>
                      {message.role === 'assistant' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-auto p-0 ml-2'
                            >
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem
                              onClick={() => copyToClipboard(message.content)}
                            >
                              Copy
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                editor.commands.insertContent(message.content)
                              }
                            >
                              Insert in editor
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const { view } = editor;
                                const { from, to } = view.state.selection;
                                editor.commands.command(({ tr }) => {
                                  tr.replaceWith(
                                    from,
                                    to,
                                    editor.schema.text(message.content)
                                  );
                                  return true;
                                });
                              }}
                            >
                              Replace selection
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center h-full space-y-4'>
              <p className='text-sm text-center text-muted-foreground'>
                No AI-generated content yet. Enter a prompt below.
              </p>
            </div>
          )}
        </div>
      </div>
      <div className='flex items-center space-x-3 border-t pt-4 pb-2'>
        <input
          value={inputPrompt}
          onChange={handleInputChange}
          placeholder='Ask the AI assistant...'
          className='flex-1 outline-none px-2 bg-transparent'
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <button
          disabled={inputPrompt.length === 0}
          onClick={() => handleSubmit()}
          className={cn(
            'pr-2',

            { 'opacity-70': inputPrompt.length === 0 }
          )}
        >
          {isLoading ? (
            <LoaderCircle className='animate-spin' size={20} />
          ) : (
            <SendHorizonal size={20} />
          )}
        </button>
      </div>
    </div>
  );
}
